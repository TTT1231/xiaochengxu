import { db } from './database';

const MAX_RETRIES = 100;
const DISPLAY_ID_LENGTH = 7;

function generate7DigitId(): string {
   const min = 10 ** (DISPLAY_ID_LENGTH - 1);
   const max = 10 ** DISPLAY_ID_LENGTH - 1;
   return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function generateUniqueDisplayId(): Promise<string> {
   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const candidate = generate7DigitId();
      const { total } = await db.collection('users').where({ id: candidate }).count();
      if (total === 0) return candidate;
   }
   throw new Error('Failed to generate unique display ID after ' + MAX_RETRIES + ' attempts');
}
