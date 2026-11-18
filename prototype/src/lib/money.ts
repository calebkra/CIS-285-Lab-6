/** Parse a dollar string like "12.34" into integer cents. Returns null if invalid. */
export function parseDollarsToCents(input: unknown): number | null {
  const s = typeof input === "number" ? String(input) : typeof input === "string" ? input.trim() : "";
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [d, c = ""] = s.split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents <= 100_000_000_00 ? cents : null;
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`;
}
