import { db, getOpenId } from '../utils/database';
import { deductWallet, findWalletByUserId } from '../utils/wallet';

const MAX_CART_ITEMS = 20;

interface CartItem {
   product_id: string;
   product_name: string;
   product_image: string;
   specs: Record<string, string>;
   price: number;
   discount: number;
   quantity: number;
}

interface CreateOrderParams {
   items: CartItem[];
   totalAmount: number;
   discountAmount: number;
   walletDeduct?: number;
}

function generateOrderId(): string {
   const timestamp = Date.now().toString(36).toUpperCase();
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return 'OD' + timestamp + random;
}

export async function main(event: CreateOrderParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { items, totalAmount, discountAmount, walletDeduct = 0 } = event;

   if (!items || items.length === 0) {
      return { success: false, message: 'Cart is empty' };
   }
   if (items.length > MAX_CART_ITEMS) {
      return { success: false, message: 'Too many items (max ' + MAX_CART_ITEMS + ')' };
   }
   if (walletDeduct < 0) {
      return { success: false, message: 'Invalid wallet deduction' };
   }

   // Step 1: Validate products OUTSIDE transaction (read-only)
   const validatedItems: CartItem[] = [];
   for (const item of items) {
      if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
         return { success: false, message: 'Invalid item data' };
      }
      try {
         const { data: product } = await db.collection('products').doc(item.product_id).get();
         if (!product) {
            return { success: false, message: 'Product not found: ' + item.product_id };
         }
         validatedItems.push({
            product_id: item.product_id,
            product_name: product.name,
            product_image: item.product_image,
            specs: item.specs,
            price: product.price,
            discount: product.discount,
            quantity: item.quantity,
         });
      } catch {
         return { success: false, message: 'Product not found: ' + item.product_id };
      }
   }

   // Step 2: Validate totals using SERVER-SIDE prices
   const expectedTotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
   const expectedDiscount = validatedItems.reduce((sum, item) => sum + item.discount * item.quantity, 0);

   const EPSILON = 0.01;
   if (Math.abs(totalAmount - expectedTotal) > EPSILON) {
      return { success: false, message: 'Total amount mismatch' };
   }
   if (Math.abs(discountAmount - expectedDiscount) > EPSILON) {
      return { success: false, message: 'Discount amount mismatch' };
   }

   // Step 3: Validate wallet deduction if provided
   if (walletDeduct > 0) {
      const wallet = await findWalletByUserId(openid);
      if (!wallet) {
         return { success: false, message: 'Wallet not found' };
      }
      if (walletDeduct > (wallet.balance as number)) {
         return { success: false, message: 'Insufficient balance' };
      }
   }

   const orderId = generateOrderId();
   const now = new Date().toISOString();

   // Step 4: Create order (standalone, no transaction)
   try {
      await db
         .collection('orders')
         .add({
            data: {
               _id: orderId,
               order_id: orderId,
               user_id: openid,
               order_status: 'pending',
               total_amount: totalAmount,
               discount_amount: discountAmount,
               wallet_deduct: walletDeduct,
               created_at: now,
               oder_details: validatedItems,
            },
         });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order creation failed: ' + msg };
   }

   // Step 5: Deduct wallet balance (best-effort, must NOT roll back the order)
   if (walletDeduct > 0) {
      try {
         const wallet = await findWalletByUserId(openid);
         if (wallet) {
            const updated = deductWallet(
               { balance: wallet.balance as number, total_recharged: wallet.total_recharged as number },
               walletDeduct,
            );
            await db
               .collection('wallets')
               .doc(wallet._id as string)
               .update({ data: { ...updated, updated_at: new Date().toISOString() } });
         }
      } catch {
         // Wallet deduction failed — order is still valid, ignore
      }
   }

   return { success: true, data: { order_id: orderId }, message: 'Order created' };
}
