export function parseAmountToCents(value: string): number {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Enter a valid positive amount with no more than two decimal places.");
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error("Amount must be greater than $0.00.");
  }
  return cents;
}

export function allocateCents(amountCents: number, participantCount: number): number[] {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error("Expense amount must be a positive number of cents.");
  }
  if (!Number.isInteger(participantCount) || participantCount <= 0) {
    throw new Error("Select at least one participant.");
  }

  const base = Math.floor(amountCents / participantCount);
  const remainder = amountCents % participantCount;
  return Array.from({ length: participantCount }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  return `${sign}$${Math.floor(absolute / 100).toLocaleString("en-US")}.${String(
    absolute % 100,
  ).padStart(2, "0")}`;
}
