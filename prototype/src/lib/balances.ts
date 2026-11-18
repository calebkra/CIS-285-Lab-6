// Pairwise balance calculation from approved expenses and payments (pure).

export type ApprovedExpense = {
  payerId: string;
  shares: { userId: string; shareCents: number }[];
};
export type PaymentLike = { fromUserId: string; toUserId: string; amountCents: number };
export type Debt = { fromId: string; toId: string; cents: number }; // fromId owes toId

export function computeDebts(expenses: ApprovedExpense[], payments: PaymentLike[]): Debt[] {
  const owe = new Map<string, number>(); // "a>b" -> cents a owes b (gross)
  const add = (a: string, b: string, c: number) => {
    if (a === b) return;
    owe.set(`${a}>${b}`, (owe.get(`${a}>${b}`) ?? 0) + c);
  };
  for (const e of expenses) for (const s of e.shares) add(s.userId, e.payerId, s.shareCents);
  for (const p of payments) add(p.fromUserId, p.toUserId, -p.amountCents);

  const debts: Debt[] = [];
  const seen = new Set<string>();
  for (const key of owe.keys()) {
    const [a, b] = key.split(">");
    const pair = [a, b].sort().join(">");
    if (seen.has(pair)) continue;
    seen.add(pair);
    const net = (owe.get(`${a}>${b}`) ?? 0) - (owe.get(`${b}>${a}`) ?? 0);
    if (net > 0) debts.push({ fromId: a, toId: b, cents: net });
    else if (net < 0) debts.push({ fromId: b, toId: a, cents: -net });
  }
  return debts.sort((x, y) => y.cents - x.cents);
}

/** Positive = others owe this user; negative = this user owes others. */
export function netFor(userId: string, debts: Debt[]): number {
  return debts.reduce(
    (n, d) => n + (d.toId === userId ? d.cents : 0) - (d.fromId === userId ? d.cents : 0),
    0,
  );
}

export function outstanding(debts: Debt[], fromId: string, toId: string): number {
  return debts.find((d) => d.fromId === fromId && d.toId === toId)?.cents ?? 0;
}
