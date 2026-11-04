# Domain and design analysis

## Core concepts

The proposed domain includes UserAccount, Group, GroupMembership, Expense, ExpenseShare, ReviewPolicy/Step, ExpenseApproval, LedgerEntry, Payment, Receipt, Notification, and a rebuildable BalanceProjection. Reports are authorized queries; durable report snapshots are unnecessary unless approved. See [data model](data-model.md).

An expense has one submitter and exactly one payer, independently of one or more participants. Payer and participants must be current group members at submission. The payer may be outside the participant list. Expense carries positive amount, date, description, currency, split method, submitted state, and optional private receipt reference. Approval records retain actor and decision history. Proposed lifecycle states are PENDING_REVIEW, APPROVED, REJECTED; no Draft, Withdrawn, or Superseded state is approved.

## Financial rules (canonical)

1. Never calculate money with `float` or `double`; use Java `BigDecimal` in the domain/application layer.
2. Currency set, minor-unit scale, and rounding mode/boundary are **open**. Reject values not representable under the approved currency policy; never silently round an input amount.
3. Equal and percentage splits must conserve the expense exactly. Percentage totals must equal exactly 100%. Allocate remaining smallest currency units by descending fractional remainder; participant selection order breaks ties. Persist allocated shares so later behavior is reproducible.
4. An approved expense debits each participant's share and credits the payer for the amount paid. If payer participates, their own debit offsets that credit. Pending or rejected expenses have no ledger effect.
5. Final approval decision and all associated ledger postings are one atomic, idempotent transaction.
6. Payments are positive, group/currency scoped settlements between members, limited to current outstanding debt, and recorded atomically with ledger effects. Payment recording represents a settlement record; it does not imply money movement by the application.
7. Check due amount within the payment transaction and prevent concurrent attempts collectively exceeding it. Return conflict/rejection with current amount due when necessary.
8. Balance is derived from approved expense and payment facts. A cached projection is optional and rebuildable/reconcilable. Netting multiple obligations and display strategy remain open.
9. Never perform cross-currency arithmetic without an approved conversion policy.

## Idempotency, concurrency, failure

Expense, approval, and payment retries must not create duplicate entities, decisions, or ledger records. Use scoped idempotency keys and durable uniqueness constraints as proposed; define retention and scope before implementation. Approval requests re-check pending state and policy version under concurrency control. Payment requests lock/version the balance scope or use an equivalent transaction isolation strategy; stale callers retry against current due, not an earlier client balance.

Persist notification intent with the source transaction and deliver afterward. Delivery retries are deduplicated; notification outages do not invalidate committed expense/payment data. Receipt storage may fail independently: do not expose an expense with a broken receipt reference; use staged upload/commit and orphan reconciliation. Rebuild projections from immutable authoritative financial entries and retain reconciliation/audit evidence. Correction and resubmission semantics are open; avoid mutating posted history without an auditable compensating record.

## Approval and other unresolved behavior

Groups may require one or more approval steps (FR-009). Eligible reviewers, approval count/order, submitter self-approval, policy edits while an expense is pending, rejection reason, and correction/resubmission are not settled. Proposed submission snapshots applicable policy so an in-flight expense has deterministic requirements; policy-change treatment still needs owner confirmation. Final approval alone activates financial effects.

## Interaction and accessibility

The Swing UI delegates to GUI-independent services. All platforms display authoritative service results and explain validation, denied access, conflicts, and remaining due. Reports use inclusive selected date ranges (AC-010); timezone, timestamp interpretation, and boundary conversion remain open. The complete product must keep behavior consistent across web, Android, and iOS; the Swing MVP is not that product.
