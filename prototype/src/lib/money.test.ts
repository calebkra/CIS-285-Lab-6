import { describe, expect, it } from "vitest";
import { computeDebts, outstanding } from "./balances";
import { parseAmountToCents, parsePercentToBp, splitByBasisPoints, splitEqual } from "./money";

describe("money", () => {
  it("parses amounts without floating point", () => {
    expect(parseAmountToCents("19.99")).toBe(1999);
    expect(parseAmountToCents("0.1")).toBe(10);
    expect(parseAmountToCents("$1,234.5")).toBe(123450);
    expect(parseAmountToCents("1.234")).toBeNull();
    expect(parseAmountToCents("-5")).toBeNull();
    expect(parsePercentToBp("33.33")).toBe(3333);
    expect(parsePercentToBp("101")).toBeNull();
  });
  it("equal split preserves total", () => {
    expect(splitEqual(100, 3)).toEqual([34, 33, 33]);
    expect(splitEqual(1, 3)).toEqual([1, 0, 0]);
  });
  it("percent split preserves total, largest remainder first", () => {
    const s = splitByBasisPoints(1000, [3333, 3333, 3334]);
    expect(s.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(splitByBasisPoints(101, [5000, 5000])).toEqual([51, 50]);
  });
});

describe("balances", () => {
  it("nets expenses and payments between a pair", () => {
    const debts = computeDebts(
      [
        { payerId: "a", shares: [{ userId: "a", shareCents: 500 }, { userId: "b", shareCents: 500 }] },
        { payerId: "b", shares: [{ userId: "a", shareCents: 200 }, { userId: "b", shareCents: 200 }] },
      ],
      [{ fromUserId: "b", toUserId: "a", amountCents: 100 }],
    );
    expect(debts).toEqual([{ fromId: "b", toId: "a", cents: 200 }]);
    expect(outstanding(debts, "b", "a")).toBe(200);
  });
});
