import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();

function createDbMock() {
   const mockWhere = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ get: mockGet }) });
   const mockCollection = vi.fn().mockReturnValue({ where: mockWhere, limit: vi.fn().mockReturnValue({ get: mockGet }) });
   return {
      mockCollection,
      database: vi.fn().mockReturnValue({ collection: mockCollection }),
   };
}

let dbMock: ReturnType<typeof createDbMock>;

beforeEach(() => {
   mockGet.mockReset();
   dbMock = createDbMock();
   (globalThis as Record<string, unknown>).wx = {
      cloud: { database: dbMock.database, getTempFileURL: vi.fn() },
   };
});

vi.mock('../../src/utils/cloudStorage', () => ({
   resolveFileIDs: vi.fn(async (ids: string[]) => {
      const map = new Map<string, string>();
      for (const id of ids) map.set(id, 'https://temp.url/' + id.split('/').pop());
      return map;
   }),
   toProductFileID: vi.fn((s: string) => 'cloud://' + s),
   toIconFileID: vi.fn((s: string) => 'cloud://' + s),
}));

const { getLeftMenuData, getRightProductData } = await import('../../src/api/homeDataApi');

describe('getLeftMenuData', () => {
   it('queries categoried collection with status filter', async () => {
      mockGet.mockResolvedValue({
         data: [{ icon: 'icon1.png', active_icon: 'icon2.png', name: 'Cake' }],
      });

      const result = await getLeftMenuData();
      expect(dbMock.mockCollection).toHaveBeenCalledWith('categoried');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cake');
   });
});

describe('getRightProductData', () => {
   it('queries products collection with status filter', async () => {
      mockGet.mockResolvedValue({
         data: [{ images: 'img1.png&img2.png', name: 'Cookie', price: 10 }],
      });

      const result = await getRightProductData();
      expect(dbMock.mockCollection).toHaveBeenCalledWith('products');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cookie');
   });
});
