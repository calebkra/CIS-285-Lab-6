# SplitSmart Design Analysis

## Status and scope

All classes, fields, and services below are conceptual design proposals; none are claimed to exist in the repository. The model supports the Java Swing MVP domain while remaining suitable for a shared service used by web, Android, and iOS. Presentation and deployment remain separate by platform.

See [domain-class.puml](./diagrams/domain-class.puml), [data-model.puml](./diagrams/data-model.puml), and [data-model.md](./data-model.md).

## Domain model and relationships

| Entity | Responsibility and important data | Relationships / invariants |
|---|---|---|
| User account | Stable ID, unique normalized email, password credential reference/hash, verification state, lifecycle state. | May join many groups through membership. Never expose password material. |
| Group | Stable ID, name, status, review policy, configured currency policy/time zone if approved. | Has memberships and group-scoped expenses/payments. |
| Membership | User/group association, role/permissions, joined/left state and effective times. | One active membership per user/group; use for authorization. Historical policy on removal remains open. |
| Expense | Stable ID, group, submitter, payer, positive amount/currency, date, description, split method, receipt reference, status, submitted time. | Exactly one payer, independent of shares; payer and every participant are current group members at submission. |
| Expense share | Expense, participant, exact allocated amount, optional entered percentage, deterministic participant order. | One share per participant; shares sum exactly to expense amount; no floating-point arithmetic. |
| Approval | Expense, step/sequence, assigned reviewer/policy snapshot, decision, actor, time, optional reason. | Only authorized reviewers decide; final approval requires all configured approvals; a rejection ends the pending flow without posting. |
| Ledger entry | Proposed authoritative posting record: group, user, source expense/payment, signed amount, currency, event time. | Approved expense creates balanced payer credit and participant debits exactly once. Payment reduces a due pair; entries reconcile. |
| Balance | Derived net amount owed from approved expense ledger effects less recorded payments. | Projection by group/currency/debtor/creditor; rebuildable from ledger. No independent manual adjustment unless a future audited correction flow is approved. |
| Payment | Stable ID, group, payer/debtor, payee/creditor, positive amount/currency, time, actor, reference/source, idempotency key. | Must be authorized and not exceed current outstanding amount in the selected direction; transactional concurrency guard. |
| Notification | Recipient, group, associated expense, event/status, created/delivered/seen state. | Only eligible other group members; submitter excluded for submission notice. |
| Report | Query definition (date range, group and approved filters), requester, generated view/result metadata. | A report is an authorized query/result, not an alternate source of financial truth. |

The canonical relational proposal is in [data-model.md](./data-model.md). A materialized `Balance` table is optional optimization only; source entries must allow recomputation.

## Service and interface responsibilities

These are role names, not implementation class declarations.

| Service/interface boundary | Responsibilities |
|---|---|
| Account/identity operations | Registration, unique-email handling, verification, authentication, session/recovery integration. |
| Group/membership operations | Create/manage group, add/remove member, role/policy changes, authorization checks. |
| Expense operations | Validate request, snapshot review policy, calculate exact shares, persist pending expense and notification intent. |
| Approval operations | Check reviewer permission and pending state; record one decision; reject or atomically finalize when all required approvals are satisfied. |
| Ledger/balance operations | Post approved expenses idempotently; derive net balances; record payments under current balance constraints. |
| Notification operations | Query eligible recipients, persist in-app notice, dispatch optional channels, retry and deduplicate. |
| Receipt operations | Validate upload and metadata; store/retrieve/delete content only after authorization checks. |
| Reporting operations | Validate filters/date ranges, scope every query to requester authorization, aggregate expense/balance/payment totals. |
| Persistence interfaces | Load/save aggregates and ledger data; provide transaction/concurrency guarantees without leaking database details to domain logic. |

External contract roles are outlined in [contracts/product-api.md](./contracts/product-api.md). The contract is candidate-level only: no URL, wire format, authentication provider, or endpoint is approved.

## Expense submission and approval

1. **Authorize and validate**: requester is authenticated and a current member; selected group is accessible; payer and all participants are current group members; one or more participants exist; amount is positive; date/description are present; currency is allowed; split inputs are valid; optional receipt meets approved content limits.
2. **Calculate shares**: compute using exact decimal values and the specified currency scale. For equal and percentage splits, distribute leftover smallest units to descending fractional remainders; tie-break by original participant selection order. Percentage values must total exactly 100%.
3. **Snapshot approval requirements**: persist policy/approver steps that apply to this submission so later group policy edits do not silently rewrite an in-flight expense. This is a recommendation requiring stakeholder approval.
4. **Create pending state**: persist expense, shares, approval assignments, and notification intent in one transaction. Pending expenses are not included in approved history or balances.
5. **Notify after commit**: create in-app notices for other eligible current group members; do not send a duplicate submission notice to the submitter. Delivery failure is visible/retryable and does not undo the committed expense.
6. **Review**: each authorized reviewer records an approve/reject decision once for the expected step. An unauthorized user, duplicate conflicting decision, or stale expense state is rejected with a clear result.
7. **Reject**: mark the expense rejected with actor/time/reason as policy permits. Keep it out of balances. Notify the submitter of decision; exact decision-notice scope is open.
8. **Complete approval and post**: when all required approvals are present, in one transaction mark approved and create the ledger effects exactly once. If posting cannot commit, neither approved history nor balances may present a partial result. Record the event for audit.

State transitions are specified in [state-expense-lifecycle.puml](./diagrams/state-expense-lifecycle.puml). Editing/resubmission after review begins and cancellation are not specified and must not be inferred.

## Equal and percentage split behavior

- Use `BigDecimal` for monetary and percentage values. Never use `float` or `double` for amounts/shares.
- Define the currency's smallest supported unit and scale before implementation. Convert the expense amount into exact minor units for allocation only after validating that it has no unsupported fractional precision.
- Equal split: divide total minor units by participant count; allocate remaining units in participant selection order when equal fractional remainders tie.
- Percentage split: validate the entered values sum exactly to 100%; calculate exact proportional shares, floor to whole minor units, then distribute remaining units by largest fractional remainder. Ties resolve by participant selection order.
- Preserve participant selection order as submitted, not database retrieval order. Reject invalid/negative percentages and amounts; no participant may receive an allocation different from the deterministic policy.
- In every path, the integer sum of shares must equal the expense total exactly. Record the final shares so later display/reporting does not need to reproduce a potentially different calculation.
- Tests must cover tie cases, many participants, one participant, smallest supported amount, percentage precision, unsupported amount scale, and payer included/excluded.

An exact interpretation of "percentage total exactly 100%" needs an approved input precision and decimal normalization policy; do not silently accept a tolerance.

## Balance calculation and payment settlement

For an approved expense of amount `A`, record a payer credit of `A` and participant debits equal to their shares. If payer is also a participant, that person's credit and debit offset in the group's net positions. Net positions are then converted to amounts owed between members under a deterministic matching policy. The chosen policy for matching multiple debtors/creditors is not defined by the spec and needs approval; avoid asserting a unique pairwise result before that decision.

Payments are records, not bank transfers. For a payment of `P` from debtor `D` to creditor `C`:

1. Authenticate and authorize the actor and group members; validate positive amount, currency, direction, duplicate/idempotency key, and current outstanding `D -> C`.
2. Re-read or lock the relevant balance in the same transaction used to record the payment. Reject if `P` exceeds the outstanding amount; return the remaining due as required by FR-012/AC-009.
3. Persist payment and corresponding ledger effect atomically. Repeated submission must not double-settle.
4. Derive or update the rebuildable balance projection. Full payment produces zero due; a partial payment reduces it by exactly `P`.

The spec leaves the netting algorithm, treatment of credits across groups/currencies, and concurrent payment semantics unspecified. A simple project policy is to keep obligations group- and currency-scoped, but this requires approval. Never sum balances across currencies without an approved conversion policy.

## Validation, authorization, persistence, transactions

- Validate at the service boundary even when UI inputs are constrained. Reject missing/invalid data with field/action-level messages.
- Enforce tenant/group membership in every object read/write. Receipt downloads and reports need independent authorization checks.
- Use uniqueness constraints for normalized account email and relevant idempotency/source keys. Prevent duplicate shares/approval records through stable keys and domain checks.
- Transaction boundaries: submission plus shares/policy snapshot/outbox; final approval plus approved state and ledger effects; payment plus payment ledger effect and balance projection. Define concurrency control and isolation with selected storage.
- Persist actor, timestamps, status transitions, amounts, currency, approval decision, and source references needed to explain and audit derived balances. Define time source and timezone policy.
- Do not introduce manual balance edits as a shortcut. If corrections are required, design an explicit authorized adjustment with reason and audit trail.
- Data retention, user deletion/anonymization, group removal history, receipt deletion, and legal requirements are open decisions.

## Design patterns

Use only patterns serving explicit requirements:

- **Ports/adapters (proposed)** to isolate persistence, receipt storage, and notification providers and keep domain tests independent of Swing.
- **Unit of work/transaction boundary (conceptual)** to make approval posting and payment recording atomic.
- **Outbox (proposed)** to avoid losing notice intent after committing expense submission.
- **Rebuildable projection (proposed)** for query-efficient balances while retaining ledger evidence.

No pattern implies a particular framework or existing class structure. Avoid adopting microservices, event sourcing infrastructure, or repository abstractions solely by fashion; first validate the workload and operating need.

## Verification design

JUnit 5 unit tests should prove:

- `BigDecimal` scale handling and exact sum invariants for equal/percentage splits, including largest remainder and tie ordering.
- Invalid amounts, percentage totals, memberships, missing required fields, and receipt authorization are rejected.
- Pending/rejected/partially approved expenses do not change balances; final approval posts once.
- Payer-is-participant and payer-not-participant balance results are correct.
- Partial/full payment balances, overpayment rejection, duplicate request idempotency, and concurrent payment limits.
- Authorization isolation for account, group, report, notification, approval, and receipt access.
- Inclusive date-range/report totals and empty/invalid range behavior.

Integration/contract tests should cover transaction failure rollback, concurrent reviewers/payments, persistence migration, API compatibility, and client access controls. Platform-specific keyboard/accessibility and AC-011 cross-platform data consistency require acceptance testing on web, Android, and iOS. No tests were run because no application or build is present.
