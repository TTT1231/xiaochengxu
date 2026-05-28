import { db, getOpenId } from '../utils/database';
import { addPoints, calculateCreditsEarned, getUpdatedLevel } from '../utils/credits';

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

   const { items, totalAmount, discountAmount } = event;

   if (!items || items.length === 0) {
      return { success: false, message: 'Cart is empty' };
   }
   if (items.length > MAX_CART_ITEMS) {
      return { success: false, message: 'Too many items (max ' + MAX_CART_ITEMS + ')' };
   }

   // Step 1: Validate products OUTSIDE transaction (read-only)
   // Use SERVER-SIDE prices from the database — never trust client-sent prices
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

   if (totalAmount !== expectedTotal) {
      return { success: false, message: 'Total amount mismatch' };
   }
   if (discountAmount !== expectedDiscount) {
      return { success: false, message: 'Discount amount mismatch' };
   }

   const creditsEarned = calculateCreditsEarned(totalAmount, discountAmount);
   const orderId = generateOrderId();
   const now = new Date().toISOString();

   // Step 3: Run transaction for writes only
   try {
      await db.runTransaction(async (transaction) => {
         await transaction.collection('orders').add({
            data: {
               _id: orderId,
               order_id: orderId,
               user_id: openid,
               order_status: 'pending',
               total_amount: totalAmount,
               discount_amount: discountAmount,
               created_at: now,
               oder_details: validatedItems,
            },
         });

         // Update credits
         const { data: creditsList } = await transaction
            .collection('credits')
            .where({ users_id: openid })
            .get();

         if (creditsList.length > 0) {
            const credits = creditsList[0];
            const updated = addPoints(
               { total_scores: credits.total_scores, available_scores: credits.available_scores },
               creditsEarned,
            );
            await transaction
               .collection('credits')
               .doc(credits._id as string)
               .update({ data: updated });

            // Check level update
            const { data: user } = await transaction.collection('users').doc(openid).get();
            if (user) {
               const newLevel = getUpdatedLevel(user.level as string, updated.total_scores);
               if (newLevel) {
                  await transaction
                     .collection('users')
                     .doc(openid)
                     .update({ data: { level: newLevel } });
               }
            }
         }
      });

      return { success: true, data: { order_id: orderId }, message: 'Order created' };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order creation failed: ' + msg };
   }
}
