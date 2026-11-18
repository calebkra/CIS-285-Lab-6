import { describe, expect, it } from "vitest";
import { allocateCents, parseAmountToCents } from "./splitsmart";

describe("SplitSmart cent calculations", () => {
  it("splits $60 evenly among three members", () => {
    const amount = parseAmountToCents("60.00");
    expect(amount).toBe(6000);
    expect(allocateCents(amount, 3)).toEqual([2000, 2000, 2000]);
  });

  it("allocates a $10 remainder to the cent deterministically", () => {
    const shares = allocateCents(parseAmountToCents("10"), 3);
    expect(shares).toEqual([334, 333, 333]);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBe(1000);
  });

  it("rejects invalid and nonpositive amounts", () => {
    expect(() => parseAmountToCents("0")).toThrow("greater than $0.00");
    expect(() => parseAmountToCents("-1.00")).toThrow("valid positive amount");
    expect(() => parseAmountToCents("1.234")).toThrow("valid positive amount");
  });

  it("produces balances that sum to zero", () => {
    const members = ["Alice", "Bob", "Charlie"];
    const shares = allocateCents(6000, 3);
    const balances = new Map(members.map((name) => [name, 0]));
    balances.set("Alice", 6000);
    members.forEach((name, index) => balances.set(name, (balances.get(name) ?? 0) - shares[index]));
    expect([...balances.values()].reduce((sum, balance) => sum + balance, 0)).toBe(0);
    expect([...balances.entries()]).toEqual([["Alice", 4000], ["Bob", -2000], ["Charlie", -2000]]);
  });
});
