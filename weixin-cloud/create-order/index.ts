import { db, getOpenId } from '../utils/database';
import { deductWallet, findWalletByUserId } from '../utils/wallet';

const MAX_CART_ITEMS = 20;
const EPSILON = 0.01;
const VIP_DISCOUNT_CATEGORY_ID = '2';
const VIP_DISCOUNT_RATE = 0.12;
/** 生日蛋糕品类 ID（需提前 3 小时预订）—— 与前端 src/types/constants.ts 保持同步 */
const BIRTHDAY_CAKE_CATEGORY_ID = '3';
/** 生日蛋糕需提前预订的小时数 */
const BIRTHDAY_CAKE_ADVANCE_HOURS = 3;
/** 营业时间默认值（business_hours 配置缺失时兜底） */
const DEFAULT_OPEN_TIME = '09:00';
const DEFAULT_CLOSE_TIME = '22:00';

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
   expectedTime: string;
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

function parseTimeToMinutes(time: string): number {
   const match = time.match(/^(\d{2}):(\d{2})$/);
   if (!match) return Number.NaN;
   const hours = Number(match[1]);
   const minutes = Number(match[2]);
   if (hours > 23 || minutes > 59) return Number.NaN;
   return hours * 60 + minutes;
}

/**
 * 取当前北京时间（东八区）的当天分钟数。
 * 云函数运行环境默认为 UTC，而营业时间与预约时间均为北京时间；
 * 必须用 getUTCHours()+8 显式换算，否则跨时区会把未来时间误判为"已过"。
 * 此写法无论服务器处于 UTC 还是 UTC+8 都正确。
 */
function getBeijingNowMinutes(): number {
   const now = new Date();
   return (now.getUTCHours() * 60 + now.getUTCMinutes() + 8 * 60) % (24 * 60);
}

/**
 * 服务端预约时间校验（与前端 src/utils/orderTime.ts 的 validateOrderTime 保持同步）。
 * 返回错误消息字符串；合法返回 null。
 */
function validateServerOrderTime(
   expectedTime: string,
   openTime: string,
   closeTime: string,
   hasCake: boolean,
): string | null {
   const exp = parseTimeToMinutes(expectedTime);
   if (Number.isNaN(exp)) return '请选择有效的预约时间';
   const open = parseTimeToMinutes(openTime);
   const close = parseTimeToMinutes(closeTime);
   const nowM = getBeijingNowMinutes();
   if (!Number.isNaN(open) && !Number.isNaN(close) && (exp < open || exp > close)) {
      return '请在营业时间内选择预约时间';
   }
   const openFloor = Number.isNaN(open) ? 0 : open;
   const earliest = Math.max(openFloor, nowM + (hasCake ? BIRTHDAY_CAKE_ADVANCE_HOURS * 60 : 1));
   if (exp < earliest) {
      if (hasCake && exp < nowM + BIRTHDAY_CAKE_ADVANCE_HOURS * 60) {
         return '生日蛋糕需提前 3 小时预订';
      }
      return '所选时间已过，请重新选择';
   }
   return null;
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
      expectedTime,
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
   let hasCake = false;
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
         if (String(product.categoried_id) === BIRTHDAY_CAKE_CATEGORY_ID) {
            hasCake = true;
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

   // 预约时间校验（营业时间 + 蛋糕提前量，服务端复核防篡改）
   if (typeof expectedTime !== 'string' || !/^\d{2}:\d{2}$/.test(expectedTime)) {
      return { success: false, message: '请选择有效的预约时间' };
   }
   let openTime = DEFAULT_OPEN_TIME;
   let closeTime = DEFAULT_CLOSE_TIME;
   try {
      const { data: hoursDoc } = await db.collection('business_hours').doc('config').get();
      openTime = (hoursDoc?.open_time ?? DEFAULT_OPEN_TIME) as string;
      closeTime = (hoursDoc?.close_time ?? DEFAULT_CLOSE_TIME) as string;
   } catch {
      // 营业时间配置读取失败时使用默认值，不阻断下单
   }
   const timeError = validateServerOrderTime(expectedTime, openTime, closeTime, hasCake);
   if (timeError) {
      return { success: false, message: timeError };
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
               expected_time: expectedTime,
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
