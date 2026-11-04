# SplitSmart design analysis

All classes/entities below are **proposed**, not verified source code. The repository has no application implementation. Requirements are drawn from `UserRequirement.md` and `specs/001-expense-sharing/spec.md`.

## Domain concepts and relationships

An `Account` may hold many `Membership`s; each `Group` has members and an approval policy. A `Group` owns `Expense`s. An expense has one `Submitter`, exactly one separate `Payer`, one or more `Participants`, a split method, allocated `Shares`, optional receipt metadata, and ordered approval decisions. The payer and participants must each be current group members at submission; payer need not be a participant. Approved expenses contribute payer credit and participant debits. `Payment`s record a sender and receiver and reduce an outstanding obligation. Notifications and reports are derived/recipient-scoped concepts. See [domain-class](diagrams/domain-class.puml) and [data-model](diagrams/data-model.puml).

## Responsibilities

- **Account:** identity reference, unique email, verification state; credential management belongs at the identity boundary.
- **Group/Membership:** group settings and membership status/role; only authorized members may read private data.
- **Expense:** submitted facts, payer, participant selection order, split method, status, and immutable approved snapshot or controlled revision history.
- **Share:** exact assigned amount for one participant; shares sum exactly to expense amount.
- **Approval:** reviewer, sequence/step, decision, timestamp, and optional reason; no balance effect until policy is met.
- **Balance:** derived net position, not a free-form source of truth; payment application and group scope policy need agreement.
- **Payment:** sender, receiver, amount, time, group context, and record status; a record does not prove external money transfer unless product defines evidence.
- **Notification:** recipient-specific notice of submitted expense and review status; excludes submitter and non-members per AC-007.
- **Report:** authorized query over expense, balance, and payment facts with inclusive date filters.

## Proposed classes, services, and boundaries

Conceptual domain types: `AccountId`, `GroupId`, `Expense`, `ExpenseShare`, `ApprovalPolicy`, `ApprovalDecision`, `Payment`, `Money`, and `BalanceSnapshot`. Services: `ExpenseSubmissionService`, `SplitCalculator`, `ApprovalService`, `BalanceCalculator`, `PaymentService`, and `ReportService`. Ports: repositories and receipt/notification adapters. Swing presentation invokes application interfaces only. The future service exposes equivalent use cases to web/mobile clients. These names define responsibilities, not a committed package structure.

## Submission and approval workflow

Submission validates authenticated submitter membership, group state, positive amount, required date/description, current payer and participants, valid split, and receipt authorization/size/type policy. It atomically records a pending expense with shares and its approval plan. Pending expenses do not affect balances. After commit, notices go to eligible other group members. Approvers act only if authorized and decision is valid for the current step. A rejection records the decision and leaves balances unchanged. Approval activates the expense only when all required approvals are complete. [Activity](diagrams/activity-expense-approval.puml), [sequence](diagrams/sequence-expense-submission.puml), and [state](diagrams/state-expense-lifecycle.puml).

An expense should not be silently edited after review begins. Proposed policy is to reject edits or create a superseding revision that restarts approval; stakeholders must decide. Rejection reason visibility and resubmission rules are open.

## Splitting and money

Represent monetary values with `BigDecimal`; never binary floating-point. `Money` should bind amount to a currency and enforce currency scale at explicit boundaries. Currency and scale are unresolved, so examples assume a two-decimal currency only illustratively.

For amount `A`, participants in selection order, and currency unit `u`, compute exact unrounded quota `qᵢ` (equal: `A/n`; percentage: `A × pᵢ/100`). Floor each quota to whole units of `u`; distribute remaining units by descending fractional remainder, with original participant selection order breaking ties. This conserves the total exactly. Percentage values must sum exactly to 100%; reject otherwise. Positive amount, at least one participant, and valid percentages are required.

Example in a two-decimal currency: 10.00 split equally among three yields quotas 3.333…, base shares 3.33 each, and one remaining cent; it goes to the first participant by selection order, yielding 3.34, 3.33, 3.33. For percentages, calculate quota directly from the exact percentage value; do not round percentages before allocation.

## Balances and settlement

For each approved expense, credit the payer by the full amount and debit each participant by their allocated share. Net per-account position is payer credits minus participant debits, with the same account's credit/debit naturally canceling if payer participates. If payer is not a participant, payer has a credit and participants have debts. Pairwise debt derivation from net positions is a policy choice: preserve per-expense payer obligations or simplify/net obligations within group. Payment records reduce only the agreed outstanding direction. Do not mix groups unless explicitly approved. [Payment settlement](diagrams/payment-settlement.puml).

Before recording payment, re-read or lock the relevant obligation in a transaction, validate positive amount and membership/authorization, and ensure amount does not exceed current due. Concurrent payments need serialization or optimistic concurrency so combined payments cannot over-settle. Persist the payment and derived balance effect atomically. Invalid, duplicate, zero/negative, unauthorized, stale, or excess payments return a clear domain error including remaining due when applicable. A duplicate request identifier can make retries idempotent.

## Validation, authorization, transactions, consistency

Authorize every operation against current server-side membership and role, including receipt reads. Validate on the application boundary and preserve domain invariants at construction/state transitions. Submission writes expense, participants/shares, approval requirements, and outbox notices as one transaction where feasible. An approval transition and balance-visible status change are atomic. Reports should read a consistent snapshot or clearly indicate as-of time. Derived balance caches require deterministic rebuild and reconciliation against ledger facts.

## Errors and exceptions

Use typed outcomes for validation failure, forbidden operation, missing entity, invalid lifecycle transition, conflict, excess payment, and infrastructure unavailability. UI displays actionable messages without stack traces or sensitive identifiers. Do not convert external notification failure into expense rollback after commit; retry delivery and expose operational failure separately.

## Test strategy and representative scenarios

The constitution requires JUnit 5 for Java tests; no tests or build exist yet. Proposed tests:

- Equal and percentage allocations at currency boundaries; largest remainder and participant-order ties; percentages exactly, below, and above 100%; high precision; shares sum exactly.
- Payer included/excluded; payer not participant; participant also payer; membership removal between draft and submit.
- Pending and rejected expenses never alter balances; multiple approvals activate exactly once; duplicate/reordered decisions rejected safely.
- Partial/full payment; excess, zero, negative, duplicate retry, concurrent payments, and due changing between view and submit.
- Unauthorized group/receipt/report access; removed member historical access according to approved policy.
- Inclusive date filters, empty ranges, invalid ranges, no-match filters, and report totals reconciled to source records.
- Persistence failure atomicity; notification retry after commit; recovery and idempotency.

Representative scenario: A member pays 30.00 for three participants, payer excluded; equal shares assign 10.00 each. After all approvals, payer is owed 10.00 by each participant. A 4.00 payment from one participant leaves 6.00 due; a 7.00 attempt is rejected with 6.00 remaining. Exact pairwise vs netted settlement is still an open policy.
