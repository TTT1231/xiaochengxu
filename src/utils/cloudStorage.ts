/** WeChat Cloud fileID → temporary URL resolver with 2-hour cache */

import { useEnvConfig } from '@/hooks/useEnvConfig';

const { cloudStoragePrefix } = useEnvConfig();

function normalizeStoragePath(path: string, defaultDir: string): string {
   if (!path || path.startsWith('cloud://')) return path;
   if (path.startsWith('http')) {
      const filename = path.split('/').pop() || path;
      return defaultDir + filename;
   }
   return path.includes('/') ? path : defaultDir + path;
}

/** Convert a product image path or bare filename to a full cloud fileID. */
export function toProductFileID(filename: string): string {
   if (!filename || filename.startsWith('cloud://')) return filename;
   return cloudStoragePrefix + normalizeStoragePath(filename, 'product-imgs/');
}

/** Convert an icon path, URL or bare filename to a cloud fileID. */
export function toIconFileID(url: string): string {
   if (!url || url.startsWith('cloud://')) return url;
   return cloudStoragePrefix + normalizeStoragePath(url, 'project-icons/');
}

/** Convert a product image URL/path to a cloud fileID. */
export function toProductImageFileID(url: string): string {
   if (!url || url.startsWith('cloud://')) return url;
   return cloudStoragePrefix + normalizeStoragePath(url, 'product-imgs/');
}

interface CacheEntry {
   url: string;
   expiresAt: number;
}

const urlCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const BATCH_SIZE = 50;

async function batchResolve(fileIDs: string[]): Promise<Map<string, string>> {
   const result = new Map<string, string>();
   const toFetch: string[] = [];

   for (const id of fileIDs) {
      const cached = urlCache.get(id);
      if (cached && Date.now() < cached.expiresAt) {
         result.set(id, cached.url);
      } else if (id.startsWith('cloud://')) {
         toFetch.push(id);
      } else {
         result.set(id, id);
      }
   }

   if (toFetch.length === 0) return result;

   for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
      const batch = toFetch.slice(i, i + BATCH_SIZE);
      try {
         const res = await wx.cloud.getTempFileURL({ fileList: batch });
         for (const item of res.fileList) {
            if (item.status === 0 && item.tempFileURL) {
               result.set(item.fileID, item.tempFileURL);
               urlCache.set(item.fileID, {
                  url: item.tempFileURL,
                  expiresAt: Date.now() + CACHE_TTL_MS,
               });
            } else {
               result.set(item.fileID, item.fileID);
            }
         }
      } catch {
         for (const id of batch) {
            result.set(id, id);
         }
      }
   }

   return result;
}

/** Resolve an array of fileIDs to temp URLs. Deduplicates and batches automatically. */
export async function resolveFileIDs(fileIDs: string[]): Promise<Map<string, string>> {
   return batchResolve([...new Set(fileIDs)]);
}

/** Resolve a single fileID to a displayable URL. */
export async function resolveFileID(fileID: string): Promise<string> {
   if (!fileID || !fileID.startsWith('cloud://')) return fileID;
   const map = await batchResolve([fileID]);
   return map.get(fileID) || fileID;
}

