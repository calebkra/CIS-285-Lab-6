// Money helpers. All amounts are integer cents; percentages are integer
// basis points (hundredths of a percent, 10000 = 100%). Pure + browser-safe.

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

/** "12", "12.5", "$1,234.56" -> cents. Returns null when invalid. */
export function parseAmountToCents(input: string): number | null {
  const s = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [d, c = ""] = s.split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents <= 10_000_000_00 ? cents : null;
}

/** "33.33" -> 3333 basis points. Returns null when invalid. */
export function parsePercentToBp(input: string): number | null {
  const s = input.trim().replace(/%$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [d, c = ""] = s.split(".");
  const bp = Number(d) * 100 + Number(c.padEnd(2, "0"));
  return bp <= 10000 ? bp : null;
}

export function formatBp(bp: number): string {
  return `${(bp / 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

/**
 * Split `total` cents across weights (basis points). Each share is the floor
 * of its exact amount; leftover cents go to the largest fractional remainders,
 * ties broken by selection order. Shares always sum to `total` when the
 * weights sum to 10000.
 */
export function splitByBasisPoints(total: number, bps: number[]): number[] {
  const exact = bps.map((bp) => total * bp);
  const shares = exact.map((e) => Math.floor(e / 10000));
  let leftover = total - shares.reduce((a, b) => a + b, 0);
  const order = bps
    .map((_, i) => ({ i, rem: exact[i] % 10000 }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; leftover > 0 && k < order.length; k++, leftover--) {
    shares[order[k].i] += 1;
  }
  return shares;
}

export function splitEqual(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const extra = total - base * count; // first `extra` participants get +1 cent
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0));
}
