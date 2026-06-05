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
}

interface ProductDoc {
   _id: string;
   name: string;
   price: number;
   image: string;
   status: boolean;
}

/** 生成订单号：OD + 时间戳base36 + 6位随机base36 */
function generateOrderId(): string {
   const timestamp = Date.now().toString(36).toUpperCase();
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return `OD${timestamp}${random}`;
}

/** 管理员代客下单（无折扣、无支付） */
export async function main(
   event: CreateOrderParams,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   const { items } = event;

   if (!items || items.length === 0) {
      return { success: false, message: '订单商品不能为空' };
   }

   // M2: 校验 quantity 必须为正整数
   for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
         return { success: false, message: '商品数量必须为正整数' };
      }
   }

   try {
      const orderId = generateOrderId();
      const now = new Date().toISOString();

      // 查询所有商品信息
      const productIds = items.map(item => item.product_id);
      const productRes = await db
         .collection('products')
         .where({
            _id: db.command.in(productIds),
         })
         .get();

      const productMap = new Map<string, ProductDoc>();
      for (const p of productRes.data as unknown as ProductDoc[]) {
         productMap.set(p._id, p);
      }

      // 构建订单商品详情
      let totalAmount = 0;
      const orderDetails = items.map(item => {
         const product = productMap.get(item.product_id);
         if (!product) {
            throw new Error(`商品 ${item.product_id} 不存在`);
         }
         // M3: 校验商品必须为上架状态
         if (!product.status) {
            throw new Error(`商品「${product.name}」已下架`);
         }
         const lineTotal = product.price * item.quantity;
         totalAmount += lineTotal;

         return {
            product_id: item.product_id,
            product_name: product.name,
            product_image: product.image || '',
            specs: item.specs || {},
            price: product.price,
            discount: 0,
            quantity: item.quantity,
         };
      });

      const orderData = {
         order_id: orderId,
         user_id: 'admin',
         order_status: 'pending',
         total_amount: totalAmount,
         discount_amount: 0,
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
