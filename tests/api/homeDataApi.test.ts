import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();

function createDbMock() {
   // Mock chain: .collection(x).where(y).skip(n).limit(n).get()
   const mockChain = {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: mockGet,
   };
   const mockWhere = vi.fn().mockReturnValue(mockChain);
   const mockCollection = vi.fn().mockReturnValue({ where: mockWhere });
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

   it('maps dessert category names to local project icons', async () => {
      mockGet.mockResolvedValue({
         data: [
            { icon: 'old-icon', active_icon: 'old-icon', name: '饮料咖啡' },
            { icon: 'old-icon', active_icon: 'old-icon', name: '生日蛋糕' },
         ],
      });

      const result = await getLeftMenuData();
      expect(result[0].icon).toBe('/static/icons/project/drinks-coffee.svg');
      expect(result[0].active_icon).toBe('/static/icons/project/drinks-coffee-active.svg');
      expect(result[1].icon).toBe('/static/icons/project/birthday-cake.svg');
      expect(result[1].active_icon).toBe('/static/icons/project/birthday-cake-active.svg');
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

   it('ignores old specifications when specs is missing', async () => {
      mockGet.mockResolvedValue({
         data: [
            {
               _id: 'p1',
               name: 'Legacy product',
               image: '',
               specifications: [{ name: '包装', required: false, options: [{ name: '普通包装' }] }],
            },
         ],
      });

      const result = await getRightProductData();
      expect(result[0].specs).toBeUndefined();
      expect(result[0]).not.toHaveProperty('specifications');
   });

   it('keeps canonical specs when both fields exist', async () => {
      const specs = { packaging: { name: '包装', required: false, options: [] } };
      mockGet.mockResolvedValue({
         data: [{ _id: 'p1', name: 'Mixed product', image: '', specs, specifications: [] }],
      });

      const result = await getRightProductData();
      expect(result[0].specs).toEqual(specs);
      expect(result[0]).not.toHaveProperty('specifications');
   });
});
