export type ExpenseInput = { amountCents: number; payerId: number; participantIds: number[] };

/**
 * Split cents equally among participants. The remainder (amount mod n) is given,
 * one cent each, to the participants with the lowest member IDs (deterministic).
 */
export function splitShares(amountCents: number, participantIds: number[]): Map<number, number> {
  const ids = [...new Set(participantIds)].sort((a, b) => a - b);
  const base = Math.floor(amountCents / ids.length);
  const rem = amountCents - base * ids.length;
  return new Map(ids.map((id, i) => [id, base + (i < rem ? 1 : 0)]));
}

/** Net balance per member in cents: positive = should receive, negative = owes. */
export function computeBalances(memberIds: number[], expenses: ExpenseInput[]): Map<number, number> {
  const bal = new Map(memberIds.map((id) => [id, 0]));
  for (const e of expenses) {
    bal.set(e.payerId, (bal.get(e.payerId) ?? 0) + e.amountCents);
    for (const [id, share] of splitShares(e.amountCents, e.participantIds)) {
      bal.set(id, (bal.get(id) ?? 0) - share);
    }
  }
  return bal;
}
