import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCallFunction = vi.fn();

beforeEach(() => {
   mockCallFunction.mockReset();
   (globalThis as Record<string, unknown>).wx = { cloud: { callFunction: mockCallFunction } };
});

vi.mock('../../src/utils/cloudStorage', () => ({
   toProductImageFileID: vi.fn((url: string) => url),
}));

const { createOrder, getOrdersByUser, getOrderDetail, cancelOrder } = await import(
   '../../src/api/orderApi'
);

describe('createOrder', () => {
   it('calls create-order with correct params', async () => {
      const items = [
         {
            product: { _id: '1', name: 'Cake', images: 'img1.png', price: 10, categoried_id: '1' },
            selectedSpecs: { Size: 'Large' },
            quantity: 2,
         },
      ];

      mockCallFunction.mockResolvedValue({
         result: { success: true, data: { order_id: 'ORD123' }, message: 'ok' },
      });

      const result = await createOrder({ items, totalAmount: 20, discountAmount: 5 });
      expect(result.order_id).toBe('ORD123');
      expect(mockCallFunction).toHaveBeenCalledWith({
         name: 'create-order',
         data: {
            items: [{ product_id: '1', specs: { Size: 'Large' }, quantity: 2 }],
            totalAmount: 20,
            discountAmount: 5,
            walletDeduct: 0,
         },
      });
   });

   it('throws on failure', async () => {
      mockCallFunction.mockResolvedValue({
         result: { success: false, message: 'out of stock' },
      });
      await expect(createOrder({ items: [], totalAmount: 0 })).rejects.toThrow('out of stock');
   });
});

describe('getOrdersByUser', () => {
   it('calls get-orders and returns mapped orders', async () => {
      const orders = [{ order_id: '1', oder_details: [{ product_image: 'img.png' }] }];
      mockCallFunction.mockResolvedValue({
         result: { success: true, data: { orders }, message: 'ok' },
      });

      const result = await getOrdersByUser();
      expect(mockCallFunction).toHaveBeenCalledWith({ name: 'get-orders', data: {} });
      expect(result).toHaveLength(1);
   });

   it('throws on failure', async () => {
      mockCallFunction.mockResolvedValue({
         result: { success: false, message: 'auth error' },
      });
      await expect(getOrdersByUser()).rejects.toThrow('auth error');
   });
});

describe('getOrderDetail', () => {
   it('calls get-orders with orderId', async () => {
      const order = { order_id: '1', oder_details: [] };
      mockCallFunction.mockResolvedValue({
         result: { success: true, data: { order }, message: 'ok' },
      });

      const result = await getOrderDetail('1');
      expect(mockCallFunction).toHaveBeenCalledWith({ name: 'get-orders', data: { orderId: '1' } });
      expect(result?.order_id).toBe('1');
   });

   it('returns null on failure', async () => {
      mockCallFunction.mockResolvedValue({
         result: { success: false, message: 'not found' },
      });
      expect(await getOrderDetail('missing')).toBeNull();
   });
});

describe('cancelOrder', () => {
   it('calls cancel-order with orderId', async () => {
      mockCallFunction.mockResolvedValue({ result: { success: true, message: 'ok' } });

      await cancelOrder('ORD123');
      expect(mockCallFunction).toHaveBeenCalledWith({
         name: 'cancel-order',
         data: { orderId: 'ORD123' },
      });
   });

   it('throws on failure', async () => {
      mockCallFunction.mockResolvedValue({
         result: { success: false, message: 'cannot cancel' },
      });
      await expect(cancelOrder('ORD123')).rejects.toThrow('cannot cancel');
   });
});
