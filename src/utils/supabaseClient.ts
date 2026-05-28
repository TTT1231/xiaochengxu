// Temporary stub — will be removed in G7 Cleanup after G3/G4 rewrite all consumers
export const supabaseClient = {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   getClient: (): any => ({
      from: () => ({
         select: () => Promise.resolve({ data: null, error: null }),
         insert: () => Promise.resolve({ data: null, error: null }),
         update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
         }),
         delete: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
         }),
      }),
   }),
   setAccessToken: (_token: string) => {},
   clearAccessToken: () => {},
};
