/** WeChat Cloud API type declarations (not included in @dcloudio/types) */

interface CloudDatabaseCollection {
   get(): Promise<{ data: Record<string, unknown>[] }>;
   limit(n: number): CloudDatabaseCollection;
   where(condition: Record<string, unknown>): CloudDatabaseCollection;
   orderBy(field: string, order: string): CloudDatabaseCollection;
   doc(id: string): {
      get(): Promise<{ data: Record<string, unknown> | null }>;
      update(data: { data: Record<string, unknown> }): Promise<{ stats: { updated: number } }>;
   };
   add(data: { data: Record<string, unknown> }): Promise<{ _id: string }>;
}

interface CloudDatabase {
   collection(name: string): CloudDatabaseCollection;
}

interface CallFunctionResult {
   result: unknown;
   requestID: string;
}

interface TempFileURLItem {
   fileID: string;
   tempFileURL: string;
   status: number;
   errMsg: string;
}

interface WxCloud {
   init(options?: { env?: string }): void;
   callFunction(options: {
      name: string;
      data?: Record<string, unknown>;
   }): Promise<CallFunctionResult>;
   database(): CloudDatabase;
   getTempFileURL(options: { fileList: string[] }): Promise<{ fileList: TempFileURLItem[] }>;
   DYNAMIC_CURRENT_ENV: string;
}

declare const wx: {
   cloud: WxCloud;
} & Record<string, unknown>;
