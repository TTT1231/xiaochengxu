import { db } from '../utils/database';
import { authorizeAdmin, AuthorizationError } from '../utils/admin-auth';
import {
   generateUniqueCardNos,
   validateDisableTransition,
   validateIssuance,
   type CardNoExistsFn,
} from '../utils/vip-card-helpers';

// ── Types ─────────────────────────────────────────────

interface ListParams {
   action: 'list';
   status?: string;
   pageSize?: number;
   page?: number;
}

interface IssueParams {
   action: 'issue';
   amount: number;
   quantity?: number;
}

interface DisableParams {
   action: 'disable';
   _id: string;
}

type AdminVipCardsEvent = ListParams | IssueParams | DisableParams;

interface CardDoc {
   _id: string;
   card_no: string;
   amount: number;
   status: string;
   created_at: string;
   used_by?: string;
   used_at?: string;
   [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────

function isAuthorizationError(error: unknown): error is AuthorizationError {
   return error instanceof AuthorizationError;
}

// ── Actions ───────────────────────────────────────────

async function listCards(params: ListParams) {
   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 50)));
   const page = Math.max(1, Math.floor(params.page ?? 1));

   const ref = db.collection('vip_cards');
   let query;

   if (params.status && ['active', 'used', 'disabled'].includes(params.status)) {
      query = ref.where({ status: params.status });
   } else {
      query = ref;
   }

   const { data } = await query
      .orderBy('created_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

   const countRes = await (params.status && ['active', 'used', 'disabled'].includes(params.status)
      ? ref.where({ status: params.status }).count()
      : ref.count());

   return {
      success: true,
      data: { cards: data, total: countRes.total },
      message: 'Success',
   };
}

async function issueCards(params: IssueParams) {
   const validation = validateIssuance(params);
   if (!validation.valid) {
      return { success: false, message: validation.message };
   }

   const quantity = validation.quantity!;
   const amount = validation.amount!;

   // Database collision checker
   const existsInDb: CardNoExistsFn = async (cardNo: string) => {
      const { total } = await db.collection('vip_cards').where({ card_no: cardNo }).count();
      return total > 0;
   };

   // Generate unique card numbers
   const cardNos = await generateUniqueCardNos(quantity, existsInDb);

   // All-or-nothing batch insert
   const now = new Date().toISOString();
   const cards = cardNos.map(card_no => ({
      card_no,
      amount,
      status: 'active',
      created_at: now,
   }));

   // Pre-check + transactional batch insert.
   // Collision check happens before the transaction because the WeChat SDK
   // TransactionCollectionRef does not expose .where() queries.  The 12-char
   // alphanumeric space (36^10 ≈ 3.6×10^15) makes practical collisions
   // astronomically unlikely even under concurrent requests.
   let insertedCards: Array<Record<string, unknown>> = [];

   try {
      await db.runTransaction(async transaction => {
         const results: Array<Record<string, unknown>> = [];
         for (const card of cards) {
            const addResult = await transaction.collection('vip_cards').add({ data: card });
            results.push({ ...card, _id: (addResult as { _id: string })._id });
         }
         insertedCards = results;
      });
   } catch (error) {
      console.error('admin-vip-cards batch insert error:', error);
      return { success: false, message: '批量发卡失败，请稍后重试' };
   }

   return {
      success: true,
      data: {
         cards: insertedCards,
         quantity: insertedCards.length,
         amount,
      },
      message: `成功发行${insertedCards.length}张VIP卡`,
   };
}

async function disableCard(params: DisableParams) {
   if (!params._id || typeof params._id !== 'string') {
      return { success: false, message: '卡ID不能为空' };
   }

   // Fetch the card
   const { data: existing } = await db.collection('vip_cards').doc(params._id).get();

   if (!existing) {
      return { success: false, message: '卡不存在' };
   }

   const card = existing as CardDoc;

   // Validate lifecycle transition
   const transition = validateDisableTransition(card.status);
   if (!transition.allowed) {
      return { success: false, message: transition.message };
   }

   const now = new Date().toISOString();

   await db
      .collection('vip_cards')
      .doc(params._id)
      .update({
         data: {
            status: 'disabled',
            disabled_at: now,
         },
      });

   return { success: true, message: '卡已禁用' };
}

// ── Main entry ────────────────────────────────────────

export async function main(
   event: AdminVipCardsEvent,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   try {
      await authorizeAdmin((event as { adminOpenId?: string }).adminOpenId);
   } catch (error) {
      if (isAuthorizationError(error)) {
         return { success: false, message: error.message };
      }
      return { success: false, message: '管理员身份验证失败' };
   }

   try {
      switch (event.action) {
         case 'list':
            return await listCards(event);

         case 'issue':
            return await issueCards(event);

         case 'disable':
            return await disableCard(event);

         default:
            return { success: false, message: `未知操作: ${(event as { action: string }).action}` };
      }
   } catch (error) {
      console.error('admin-vip-cards error:', error);
      return { success: false, message: '操作失败，请稍后重试' };
   }
}
