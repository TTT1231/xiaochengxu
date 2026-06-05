import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

const VALID_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

interface OrderDetailItem {
   product_image: string;
   [key: string]: unknown;
}

interface OrderDoc {
   oder_details: OrderDetailItem[];
   [key: string]: unknown;
}

/**
 * 批量解析订单商品图片：将普通文件名/cloud:// 转为 HTTPS 临时 URL
 */
async function resolveOrderImages(
   orders: OrderDoc[],
   storagePrefix?: string,
): Promise<void> {
   // Step 1: 收集所有需要解析的图片路径，统一转为 cloud:// fileID
   const fileIDs = new Set<string>();

   for (const order of orders) {
      if (!Array.isArray(order.oder_details)) continue;
      for (const item of order.oder_details) {
         if (!item.product_image) continue;
         if (item.product_image.startsWith('http')) continue;
         if (item.product_image.startsWith('cloud://')) {
            fileIDs.add(item.product_image);
         } else if (storagePrefix) {
            const dir = item.product_image.includes('/') ? '' : 'product-imgs/';
            const fullID = storagePrefix + dir + item.product_image;
            item.product_image = fullID;
            fileIDs.add(fullID);
         }
      }
   }

   if (fileIDs.size === 0) return;

   // Step 2: 批量转为 HTTPS 临时 URL
   try {
      const urlResult = await cloud.getTempFileURL({ fileList: [...fileIDs] });
      const urlMap = new Map<string, string>();
      for (const entry of urlResult.fileList) {
         if (entry.status === 0 && entry.tempFileURL) {
            urlMap.set(entry.fileID, entry.tempFileURL);
         }
      }

      for (const order of orders) {
         if (!Array.isArray(order.oder_details)) continue;
         for (const item of order.oder_details) {
            if (item.product_image && urlMap.has(item.product_image)) {
               item.product_image = urlMap.get(item.product_image)!;
            }
         }
      }
   } catch (error) {
      console.error('resolveOrderImages error:', error);
   }
}

/** 获取所有订单（管理员视角） */
export async function main(event: {
   status?: string;
   orderId?: string;
   pageSize?: number;
   page?: number;
   storagePrefix?: string;
}): Promise<{
   success: boolean;
   data?: { orders?: unknown[]; order?: unknown; total?: number };
   message: string;
}> {
   const { status, orderId, storagePrefix } = event;

   // M4: 校验并钳制分页参数
   const pageSize = Math.min(100, Math.max(1, Math.floor(event.pageSize ?? 50)));
   const page = Math.max(1, Math.floor(event.page ?? 1));

   try {
      // 单笔订单查询
      if (orderId) {
         const res = await db.collection('orders').where({ order_id: orderId }).limit(1).get();
         if (res.data.length === 0) {
            return { success: false, message: '订单不存在' };
         }
         const order = res.data[0] as OrderDoc;
         await resolveOrderImages([order], storagePrefix);
         return { success: true, data: { order }, message: 'Success' };
      }

      // 列表查询
      const ordersRef = db.collection('orders');
      const cmd = db.command;
      let baseQuery;
      if (status === 'active') {
         // 虚拟状态：进行中 = pending + preparing + ready
         baseQuery = ordersRef.where({ order_status: cmd.in(['pending', 'preparing', 'ready']) });
      } else if (status && VALID_STATUSES.includes(status)) {
         baseQuery = ordersRef.where({ order_status: status });
      } else {
         baseQuery = ordersRef;
      }

      // M5: 先获取数据（快照），再 count（可能有微小偏差但可接受）
      const res = await baseQuery
         .orderBy('created_at', 'desc')
         .skip((page - 1) * pageSize)
         .limit(pageSize)
         .get();

      const countRes = await baseQuery.count();
      const total = countRes.total;

      const orders = res.data as OrderDoc[];
      await resolveOrderImages(orders, storagePrefix);

      return {
         success: true,
         data: { orders, total },
         message: 'Success',
      };
   } catch (error) {
      console.error('get-all-orders error:', error);
      return { success: false, message: '获取订单列表失败' };
   }
}
