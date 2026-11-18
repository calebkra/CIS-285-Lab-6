export function splitCents(amountCents: number, percentages: number[]) {
  const raw = percentages.map((percentage) => (amountCents * percentage) / 100);
  const shares = raw.map(Math.floor);
  let remainder = amountCents - shares.reduce((total, share) => total + share, 0);
  const order = raw.map((value, index) => ({ index, fraction: value - Math.floor(value) })).sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const item of order) { if (remainder-- <= 0) break; shares[item.index]++; }
  return shares;
}

export function balancesForGroup(group: { expenses: { status: string; payerId: number; shares: { userId: number; amountCents: number }[] }[]; payments: { fromUserId: number; toUserId: number; amountCents: number }[] }) {
  const directed = new Map<string, number>();
  const add = (from: number, to: number, amount: number) => { if (from !== to) { const key = `${from}:${to}`; directed.set(key, (directed.get(key) ?? 0) + amount); } };
  group.expenses.filter((expense) => expense.status === "APPROVED").forEach((expense) => expense.shares.forEach((share) => add(share.userId, expense.payerId, share.amountCents)));
  group.payments.forEach((payment) => add(payment.toUserId, payment.fromUserId, payment.amountCents));
  const result: { fromUserId: number; toUserId: number; amountCents: number }[] = []; const seen = new Set<string>();
  directed.forEach((_, key) => { const [a, b] = key.split(":").map(Number); const pair = a < b ? `${a}:${b}` : `${b}:${a}`; if (seen.has(pair)) return; seen.add(pair); const forward = directed.get(`${a}:${b}`) ?? 0; const reverse = directed.get(`${b}:${a}`) ?? 0; if (forward > reverse) result.push({ fromUserId: a, toUserId: b, amountCents: forward - reverse }); if (reverse > forward) result.push({ fromUserId: b, toUserId: a, amountCents: reverse - forward }); });
  return result;
}
