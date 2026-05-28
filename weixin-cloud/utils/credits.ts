import type { UserLevel } from './database';
import { getLevelForScore } from './database';

/** Add points to credits. Both total_scores and available_scores increase by `points`. */
export function addPoints(
   current: { total_scores: number; available_scores: number },
   points: number,
): { total_scores: number; available_scores: number } {
   return {
      total_scores: current.total_scores + points,
      available_scores: current.available_scores + points,
   };
}

/** Subtract points from credits. Both fields floor at 0. */
export function subtractPoints(
   current: { total_scores: number; available_scores: number },
   points: number,
): { total_scores: number; available_scores: number } {
   return {
      total_scores: Math.max(0, current.total_scores - points),
      available_scores: Math.max(0, current.available_scores - points),
   };
}

/** Determine if the level should change based on new total_scores. Returns new level or null if unchanged. */
export function getUpdatedLevel(currentLevel: UserLevel, totalScores: number): UserLevel | null {
   const newLevel = getLevelForScore(totalScores);
   return newLevel !== currentLevel ? newLevel : null;
}

/** Calculate credits earned from an order. Credits = pre-discount total - discount. */
export function calculateCreditsEarned(totalAmount: number, discountAmount: number): number {
   return totalAmount - discountAmount;
}
