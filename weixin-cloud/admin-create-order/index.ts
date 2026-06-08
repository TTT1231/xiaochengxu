import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

interface CreateOrderItem {
   product_id: string;
   specs: Record<string, string>;
   quantity: number;
}

interface CreateOrderParams {
   items: CreateOrderItem[];
   purchaseMode?: 'offline' | 'vip';
   memberOpenId?: string;
   useBalance?: boolean;
}

/** VIP 折扣常量 — 与前端 cartStore 保持一致 */
const VIP_DISCOUNT_CATEGORY_ID = '2';
const VIP_DISCOUNT_RATE = 0.88;

interface ProductDoc {
   _id: string;
   name: string;
   price: number;
   image: string;
   status: boolean;
   categoried_id: string;
}

/** 生成订单号：OD + 时间戳base36 + 6位随机base36 */
function generateOrderId(): string {
   const timestamp = Date.now().toString(36).toUpperCase();
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return `OD${timestamp}${random}`;
}

export async function main(
   event: CreateOrderParams,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   const { items, purchaseMode = 'offline', memberOpenId, useBalance = false } = event;

   if (!items || items.length === 0) {
      return { success: false, message: '订单商品不能为空' };
   }

   for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
         return { success: false, message: '商品数量必须为正整数' };
      }
   }

   const isVip = purchaseMode === 'vip' && !!memberOpenId;

   try {
      const orderId = generateOrderId();
      const now = new Date().toISOString();

      // Query products
      const productIds = items.map(item => item.product_id);
      const productRes = await db
         .collection('products')
         .where({ _id: db.command.in(productIds) })
         .get();

      const productMap = new Map<string, ProductDoc>();
      for (const p of productRes.data as unknown as ProductDoc[]) {
         productMap.set(p._id, p);
      }

      // Build order details + compute amounts
      let totalAmount = 0;
      let discountAmount = 0;

      const orderDetails = items.map(item => {
         const product = productMap.get(item.product_id);
         if (!product) {
            throw new Error(`商品 ${item.product_id} 不存在`);
         }
         if (!product.status) {
            throw new Error(`商品「${product.name}」已下架`);
         }

         const lineTotal = product.price * item.quantity;
         totalAmount += lineTotal;

         // VIP discount: category 2 items get 8.8-fold (12% off)
         let discount = 0;
         if (isVip && String(product.categoried_id) === VIP_DISCOUNT_CATEGORY_ID) {
            discount = +(product.price * (1 - VIP_DISCOUNT_RATE)).toFixed(2);
            discountAmount += +(discount * item.quantity).toFixed(2);
         }

         return {
            product_id: item.product_id,
            product_name: product.name,
            product_image: product.image || '',
            specs: item.specs || {},
            price: product.price,
            discount,
            quantity: item.quantity,
         };
      });

      const discountedTotal = totalAmount - discountAmount;

      // Wallet deduction (VIP + useBalance only)
      if (isVip && useBalance) {
         const walletRes = await db
            .collection('wallets')
            .where({ user_id: memberOpenId! })
            .limit(1)
            .get();

         if (walletRes.data.length > 0) {
            const wallet = walletRes.data[0] as { _id: string; balance: number };
            const walletDeduction = +Math.min(wallet.balance, discountedTotal).toFixed(2);

            // Transaction: update wallet + create order
            await db.runTransaction(async transaction => {
               const latestWallet = await transaction.collection('wallets').doc(wallet._id).get();

               const currentBalance = (latestWallet.data as { balance: number }).balance;
               const actualDeduction = +Math.min(currentBalance, discountedTotal).toFixed(2);

               await transaction
                  .collection('wallets')
                  .doc(wallet._id)
                  .update({
                     data: {
                        balance: currentBalance - actualDeduction,
                        updated_at: now,
                     },
                  });

               await transaction.collection('orders').add({
                  data: {
                     order_id: orderId,
                     user_id: memberOpenId!,
                     order_status: 'pending',
                     total_amount: totalAmount,
                     discount_amount: discountAmount,
                     wallet_deduct: actualDeduction,
                     created_at: now,
                     oder_details: orderDetails,
                  },
               });
            });

            return {
               success: true,
               data: {
                  order: {
                     order_id: orderId,
                     user_id: memberOpenId!,
                     order_status: 'pending',
                     total_amount: totalAmount,
                     discount_amount: discountAmount,
                     wallet_deduct: walletDeduction,
                     created_at: now,
                     oder_details: orderDetails,
                  },
               },
               message: 'Order created',
            };
         }
      }

      // No wallet deduction: create order directly
      const orderData = {
         order_id: orderId,
         user_id: isVip ? memberOpenId! : 'admin',
         order_status: 'pending',
         total_amount: totalAmount,
         discount_amount: discountAmount,
         wallet_deduct: 0,
         created_at: now,
         oder_details: orderDetails,
      };

      await db.collection('orders').add({ data: orderData });

      return {
         success: true,
         data: { order: orderData },
         message: 'Order created',
      };
   } catch (error) {
      console.error('admin-create-order error:', error);
      const message = error instanceof Error ? error.message : '创建订单失败';
      return { success: false, message };
   }
}
