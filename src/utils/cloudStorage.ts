/** WeChat Cloud fileID → temporary URL resolver with 2-hour cache */

import { useEnvConfig } from '@/hooks/useEnvConfig';

const { cloudStoragePrefix } = useEnvConfig();

/** Convert a bare filename to a full cloud fileID. */
export function toProductFileID(filename: string): string {
   if (!filename || filename.startsWith('cloud://')) return filename;
   return cloudStoragePrefix + 'products-img/' + filename;
}

/** Convert a Supabase icon URL or bare filename to a cloud fileID. */
export function toIconFileID(url: string): string {
   if (!url || url.startsWith('cloud://')) return url;
   const filename = url.startsWith('http') ? url.split('/').pop() || url : url;
   return cloudStoragePrefix + 'project-icons/' + filename;
}

/** Convert a Supabase product image URL to a cloud fileID. */
export function toProductImageFileID(url: string): string {
   if (!url || url.startsWith('cloud://')) return url;
   const filename = url.startsWith('http') ? url.split('/').pop() || url : url;
   return cloudStoragePrefix + 'products-img/' + filename;
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
               result.set(item.fileID, '');
            }
         }
      } catch {
         for (const id of batch) {
            result.set(id, '');
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

/** Resolve a '&' separated multi-fileID string (product images). */
export async function resolveImageString(images: string): Promise<string> {
   if (!images) return '';
   const parts = images.split('&');
   const map = await batchResolve(parts);
   return parts.map(id => map.get(id) || '').join('&');
}
