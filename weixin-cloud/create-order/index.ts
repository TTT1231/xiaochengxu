import { db, getOpenId } from '../utils/database';
import { deductWallet, findWalletByUserId } from '../utils/wallet';

const MAX_CART_ITEMS = 20;
const EPSILON = 0.01;
const VIP_DISCOUNT_CATEGORY_ID = '5';
const VIP_DISCOUNT_RATE = 0.2;

interface CartItem {
   product_id: string;
   specs?: Record<string, string>;
   quantity: number;
}

interface OrderDetailItem {
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
   deliveryType: 'pickup' | 'delivery';
   deliveryFee: number;
   remark?: string;
   deliveryAddress?: string;
   deliveryPhone?: string;
}

interface ProductSpecOption {
   value: string;
   isSoldOut?: boolean;
}

interface ProductSpecGroup {
   name: string;
   required?: boolean;
   options?: ProductSpecOption[];
}

type ProductSpecs = Record<string, ProductSpecGroup>;

function generateOrderId(): string {
   const timestamp = Date.now().toString(36).toUpperCase();
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return 'OD' + timestamp + random;
}

function isFiniteAmount(value: unknown): value is number {
   return typeof value === 'number' && Number.isFinite(value);
}

function hasAtMostTwoDecimals(amount: number): boolean {
   return Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-8;
}

function normalizeAmount(amount: number): number {
   return Math.round(amount * 100) / 100;
}

function computeServerDiscount(price: number, categoriedId: unknown, isVip: boolean): number {
   if (!isVip) return 0;
   if (String(categoriedId) !== VIP_DISCOUNT_CATEGORY_ID) return 0;
   return Math.round(price * VIP_DISCOUNT_RATE * 100) / 100;
}

function parseSpecs(rawSpecs: unknown): ProductSpecs {
   if (!rawSpecs) return {};
   if (typeof rawSpecs === 'string') {
      const parsed = JSON.parse(rawSpecs);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
         ? (parsed as ProductSpecs)
         : {};
   }
   return typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)
      ? (rawSpecs as ProductSpecs)
      : {};
}

function validateSelectedSpecs(
   productName: string,
   rawSpecs: unknown,
   selectedSpecs: unknown,
): string | null {
   if (!selectedSpecs || typeof selectedSpecs !== 'object' || Array.isArray(selectedSpecs)) {
      selectedSpecs = {};
   }

   let specs: ProductSpecs;
   try {
      specs = parseSpecs(rawSpecs);
   } catch {
      return 'Invalid product specs: ' + productName;
   }

   const selected = selectedSpecs as Record<string, string>;
   const groups = Object.values(specs);
   const allowedNames = new Set(groups.map(group => group.name).filter(Boolean));

   for (const specName of Object.keys(selected)) {
      if (!allowedNames.has(specName)) {
         return 'Invalid specs for product: ' + productName;
      }
   }

   for (const group of groups) {
      if (!group.name || !Array.isArray(group.options)) {
         return 'Invalid product specs: ' + productName;
      }

      const selectedValue = selected[group.name];
      if (group.required && !selectedValue) {
         return 'Required spec missing for product: ' + productName;
      }

      if (!selectedValue) continue;

      const option = group.options.find(item => item.value === selectedValue);
      if (!option) {
         return 'Invalid spec option for product: ' + productName;
      }
      if (option.isSoldOut) {
         return 'Selected spec is sold out for product: ' + productName;
      }
   }

   return null;
}

export async function main(event: Partial<CreateOrderParams> = {}) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const {
      items,
      totalAmount,
      discountAmount,
      walletDeduct = 0,
      deliveryType = 'pickup',
      deliveryFee = 0,
      remark,
      deliveryAddress,
      deliveryPhone,
   } = event;

   if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: 'Cart is empty' };
   }
   if (items.length > MAX_CART_ITEMS) {
      return { success: false, message: 'Too many items (max ' + MAX_CART_ITEMS + ')' };
   }
   if (
      !isFiniteAmount(totalAmount) ||
      !isFiniteAmount(discountAmount) ||
      !isFiniteAmount(walletDeduct) ||
      totalAmount < 0 ||
      discountAmount < 0 ||
      walletDeduct < 0 ||
      !hasAtMostTwoDecimals(totalAmount) ||
      !hasAtMostTwoDecimals(discountAmount) ||
      !hasAtMostTwoDecimals(walletDeduct)
   ) {
      return { success: false, message: 'Invalid amount' };
   }

   // Step 1: Check VIP status
   let isVip = false;
   try {
      const wallet = await findWalletByUserId(openid);
      isVip = Number(wallet?.total_recharged) > 0;
   } catch {
      isVip = false;
   }

   // Step 2: Validate products OUTSIDE transaction (read-only)
   const validatedItems: OrderDetailItem[] = [];
   for (const item of items) {
      if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
         return { success: false, message: 'Invalid item data' };
      }
      const selectedSpecs =
         item.specs && typeof item.specs === 'object' && !Array.isArray(item.specs)
            ? item.specs
            : {};
      try {
         const { data: product } = await db.collection('products').doc(item.product_id).get();
         if (!product) {
            return { success: false, message: 'Product not found: ' + item.product_id };
         }
         if (product.status !== true) {
            return { success: false, message: 'Product is not available: ' + product.name };
         }
         if (!isFiniteAmount(product.price) || product.price < 0) {
            return { success: false, message: 'Invalid product pricing: ' + product.name };
         }
         const specError = validateSelectedSpecs(
            product.name as string,
            product.specs,
            selectedSpecs,
         );
         if (specError) {
            return { success: false, message: specError };
         }
         const itemDiscount = computeServerDiscount(product.price, product.categoried_id, isVip);
         validatedItems.push({
            product_id: item.product_id,
            product_name: product.name as string,
            product_image: typeof product.image === 'string' ? product.image : '',
            specs: selectedSpecs,
            price: normalizeAmount(product.price),
            discount: itemDiscount,
            quantity: item.quantity,
         });
      } catch {
         return { success: false, message: 'Product not found: ' + item.product_id };
      }
   }

   // Step 2: Validate totals using SERVER-SIDE prices
   const expectedTotal = normalizeAmount(
      validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
   );
   const expectedDiscount = normalizeAmount(
      validatedItems.reduce((sum, item) => sum + item.discount * item.quantity, 0),
   );

   if (Math.abs(normalizeAmount(totalAmount) - expectedTotal) > EPSILON) {
      return { success: false, message: 'Total amount mismatch' };
   }
   if (Math.abs(normalizeAmount(discountAmount) - expectedDiscount) > EPSILON) {
      return { success: false, message: 'Discount amount mismatch' };
   }
   const payableAmount = Math.max(expectedTotal - expectedDiscount, 0);
   const normalizedWalletDeduct = normalizeAmount(walletDeduct);
   if (normalizedWalletDeduct - payableAmount > EPSILON) {
      return { success: false, message: 'Wallet deduction exceeds payable amount' };
   }

   // 配送费校验（服务端重新计算，防止前端篡改）
   if (deliveryType !== 'pickup' && deliveryType !== 'delivery') {
      return { success: false, message: 'Invalid delivery type' };
   }
   if (deliveryType === 'delivery') {
      try {
         const { data: configDoc } = await db.collection('delivery_config').doc('config').get();
         const freeThreshold = (configDoc?.free_threshold ?? 30) as number;
         const configFee = (configDoc?.delivery_fee ?? 8) as number;
         const expectedFee = expectedTotal >= freeThreshold ? 0 : configFee;
         if (Math.abs(deliveryFee - expectedFee) > EPSILON) {
            return { success: false, message: '配送费异常' };
         }
      } catch {
         return { success: false, message: '配送费配置读取失败' };
      }
   }

   let walletId: string | null = null;
   try {
      if (normalizedWalletDeduct > 0) {
         const wallet = await findWalletByUserId(openid);
         if (!wallet?._id) {
            return { success: false, message: 'Wallet not found' };
         }
         walletId = wallet._id as string;
      }
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order creation failed: ' + msg };
   }

   const orderId = generateOrderId();
   const now = new Date().toISOString();

   // Step 3: Create order and deduct wallet balance atomically.
   try {
      await db.runTransaction(async transaction => {
         if (normalizedWalletDeduct > 0) {
            const { data: wallet } = await transaction
               .collection('wallets')
               .doc(walletId as string)
               .get();
            if (!wallet || wallet.user_id !== openid) {
               throw new Error('Wallet not found');
            }
            if (
               !isFiniteAmount(wallet.balance) ||
               !isFiniteAmount(wallet.total_recharged) ||
               normalizedWalletDeduct - (wallet.balance as number) > EPSILON
            ) {
               throw new Error('Insufficient balance');
            }
            const updated = deductWallet(
               {
                  balance: wallet.balance as number,
                  total_recharged: wallet.total_recharged as number,
               },
               normalizedWalletDeduct,
            );
            await transaction
               .collection('wallets')
               .doc(walletId as string)
               .update({ data: { ...updated, updated_at: now } });
         }

         await transaction.collection('orders').add({
            data: {
               _id: orderId,
               order_id: orderId,
               user_id: openid,
               order_status: 'pending',
               total_amount: expectedTotal,
               discount_amount: expectedDiscount,
               wallet_deduct: normalizedWalletDeduct,
               created_at: now,
               oder_details: validatedItems,
               delivery_type: deliveryType,
               delivery_fee: deliveryType === 'pickup' ? 0 : deliveryFee,
               ...(remark ? { remark } : {}),
               ...(deliveryAddress ? { delivery_address: deliveryAddress } : {}),
               ...(deliveryPhone ? { delivery_phone: deliveryPhone } : {}),
            },
         });
      });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order creation failed: ' + msg };
   }

   return { success: true, data: { order_id: orderId }, message: 'Order created' };
}
