import { describe, expect, it } from "vitest";
import { computeBalances, splitShares } from "./balances";
import { parseDollarsToCents } from "./money";

const sum = (m: Map<number, number>) => [...m.values()].reduce((a, b) => a + b, 0);

describe("balances", () => {
  it("$60 paid by Alice split 3 ways", () => {
    const b = computeBalances([1, 2, 3], [{ amountCents: 6000, payerId: 1, participantIds: [1, 2, 3] }]);
    expect([b.get(1), b.get(2), b.get(3)]).toEqual([4000, -2000, -2000]);
    expect(sum(b)).toBe(0);
  });
  it("$10 split 3 ways is exact to the cent", () => {
    const s = splitShares(1000, [3, 1, 2]);
    expect([s.get(1), s.get(2), s.get(3)]).toEqual([334, 333, 333]);
    const b = computeBalances([1, 2, 3], [{ amountCents: 1000, payerId: 2, participantIds: [1, 2, 3] }]);
    expect(sum(b)).toBe(0);
  });
  it("multiple expenses sum to zero", () => {
    const b = computeBalances([1, 2, 3], [
      { amountCents: 6000, payerId: 1, participantIds: [1, 2, 3] },
      { amountCents: 1000, payerId: 2, participantIds: [1, 2, 3] },
      { amountCents: 101, payerId: 3, participantIds: [2, 3] },
    ]);
    expect(sum(b)).toBe(0);
  });
  it("parses money", () => {
    expect(parseDollarsToCents("10.5")).toBe(1050);
    expect(parseDollarsToCents("0.01")).toBe(1);
    for (const bad of ["", "abc", "-5", "1.234", "1e3", "0x10"]) expect(parseDollarsToCents(bad)).toBeNull();
  });
});
