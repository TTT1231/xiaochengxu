import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCallFunction = vi.fn();

beforeEach(() => {
   mockCallFunction.mockReset();
   (globalThis as Record<string, unknown>).wx = { cloud: { callFunction: mockCallFunction } };
});

// Dynamic import so wx is set before module evaluation
const { cloudLogin, getCloudProfile } = await import('../../src/api/userApi');

describe('cloudLogin', () => {
   it('calls user-login and returns success result', async () => {
      mockCallFunction.mockResolvedValue({
         result: {
            success: true,
            message: 'ok',
            data: { user: { _id: 'openid123' }, wallet: { balance: 0 }, isNewUser: true },
         },
      });

      const result = await cloudLogin();
      expect(result.success).toBe(true);
      expect(mockCallFunction).toHaveBeenCalledWith({ name: 'user-login', timeout: 10000 });
   });

   it('returns failure on cloud function error', async () => {
      mockCallFunction.mockRejectedValue(new Error('network error'));

      const result = await cloudLogin();
      expect(result.success).toBe(false);
      expect(result.message).toBe('network error');
   });
});

describe('getCloudProfile', () => {
   it('calls get-profile and returns user profile', async () => {
      const mockData = { user: { _id: 'openid123' }, wallet: { balance: 100 } };
      mockCallFunction.mockResolvedValue({ result: { success: true, data: mockData } });

      const result = await getCloudProfile();
      expect(result).toEqual({ user: mockData.user, wallet: mockData.wallet });
      expect(mockCallFunction).toHaveBeenCalledWith({ name: 'get-profile' });
   });

   it('returns null on success:false', async () => {
      mockCallFunction.mockResolvedValue({ result: { success: false, message: 'not found' } });
      expect(await getCloudProfile()).toBeNull();
   });

   it('returns null on exception', async () => {
      mockCallFunction.mockRejectedValue(new Error('fail'));
      expect(await getCloudProfile()).toBeNull();
   });
});
