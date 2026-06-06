declare module 'wx-server-sdk' {
   // ── Query Command ──────────────────────────────────
   interface DatabaseCommand {
      eq(value: unknown): unknown;
      neq(value: unknown): unknown;
      gt(value: unknown): unknown;
      gte(value: unknown): unknown;
      lt(value: unknown): unknown;
      lte(value: unknown): unknown;
      in(values: unknown[]): unknown;
      nin(values: unknown[]): unknown;
      and(...commands: unknown[]): unknown;
      or(...commands: unknown[]): unknown;
      remove(): unknown;
   }

   // ── Result Types ───────────────────────────────────
   interface GetResult {
      data: Record<string, unknown>[];
   }

   interface DocumentGetResult {
      data: Record<string, unknown>;
   }

   interface AddResult {
      _id: string;
   }

   interface CountResult {
      total: number;
   }

   interface UpdateResult {
      stats: { updated: number };
   }

   interface RemoveResult {
      stats: { removed: number };
   }

   interface SetResult {
      _id: string;
   }

   // ── Query & Collection ─────────────────────────────
   interface Query {
      get(): Promise<GetResult>;
      count(): Promise<CountResult>;
      update(data: Record<string, unknown>): Promise<UpdateResult>;
      remove(): Promise<RemoveResult>;
      skip(n: number): Query;
      limit(n: number): Query;
      orderBy(field: string, order: string): Query;
      field(projection: Record<string, boolean>): Query;
   }

   interface CollectionReference extends Query {
      doc(id: string): DocumentReference;
      where(condition: Record<string, unknown>): Query;
      add(data: Record<string, unknown> | { data: Record<string, unknown> }): Promise<AddResult>;
   }

   interface DocumentReference {
      get(): Promise<DocumentGetResult>;
      update(data: Record<string, unknown>): Promise<UpdateResult>;
      remove(): Promise<RemoveResult>;
      set(data: Record<string, unknown>): Promise<SetResult>;
   }

   // ── Transaction ────────────────────────────────────
   interface Transaction {
      collection(name: string): TransactionCollectionRef;
   }

   interface TransactionCollectionRef {
      doc(id: string): TransactionDocumentRef;
      add(data: { data: Record<string, unknown> }): Promise<AddResult>;
   }

   interface TransactionDocumentRef {
      get(): Promise<DocumentGetResult>;
      update(data: { data: Record<string, unknown> }): Promise<UpdateResult>;
   }

   // ── Database ───────────────────────────────────────
   interface Database {
      collection(name: string): CollectionReference;
      readonly command: DatabaseCommand;
      runTransaction(callback: (transaction: Transaction) => Promise<unknown>): Promise<unknown>;
   }

   // ── Cloud ──────────────────────────────────────────
   interface GetTempFileURLResult {
      fileList: Array<{
         fileID: string;
         tempFileURL: string;
         status: number;
      }>;
   }

   interface WXContext {
      OPENID: string;
      APPID: string;
      UNIONID: string;
      ENV: string;
   }

   interface Cloud {
      DYNAMIC_CURRENT_ENV: string;
      init(options?: { env?: string }): void;
      database(): Database;
      getWXContext(): WXContext;
      callFunction(options: { name: string; data?: Record<string, unknown> }): Promise<{
         result: unknown;
      }>;
      getTempFileURL(options: { fileList: string[] }): Promise<GetTempFileURLResult>;
   }

   const cloud: Cloud;
   export default cloud;
}
