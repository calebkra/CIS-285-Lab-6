# Proposed logical data model

Conceptual only: no schema, database, backend, or persistence implementation is verified or selected. Keys and constraints below are recommendations, not migrations.

| Record | Important attributes and integrity rules |
|---|---|
| UserAccount | Stable ID, unique normalized email, protected credential reference, verification/status, timestamps. No plaintext password. |
| Group | Stable ID, name/status, creator, timestamps; currency/timezone only after policy decisions. |
| GroupMembership | Group/user IDs, role/status, join/leave history; proposed one active membership per pair. Historical access after removal is open. |
| ReviewPolicy / ReviewStep | A group may have versioned policies. Each policy version contains one or more ordered steps under the approved policy rules; reviewer rule/count remains open. Policy edits create a new version rather than rewriting history. |
| Expense | Group, submitter, exactly one payer, positive amount/currency/date/description/split, state/version/times, optional receipt, and reference/snapshot of the applicable review-policy version at submission. Payer and participants current members at submission. |
| ExpenseShare | Expense, participant, selection order, final exact amount, optional percentage input. Unique expense/participant; share sum equals expense total. |
| ExpenseApproval | Expense, applicable policy version and step, reviewer, decision/time/reason. Represents a decision in that expense's review process. Proposed unique decision per expense/step/reviewer; immutable audit history. |
| LedgerEntry | Group/currency, account user, signed exact amount or minor units, source/type/actor/time. Proposed unique source+posting role; each expense/payment posting balances to zero. |
| Payment | Group, from/to users, positive amount/currency, actor/time, idempotency identity. Cannot exceed current outstanding amount. |
| BalanceProjection | Group/currency/debtor/creditor/due/as-of version. Optional cache only; rebuild from authoritative records. |
| Receipt | Expense, private storage key, type/size/digest/uploader/time. Never use possession of URL as authorization. |
| Notification | Group/event/expense/recipient/channel/status/times. Dedupe per event-recipient-channel; authorize recipients; submitter excluded from new-expense notice. |
| ReportRequest (optional) | Requester, validated date range/filters/time, for audit only if approved; reports otherwise query authorized source records. |

## Relationships

UserAccount and Group connect many-to-many through GroupMembership. Group has many Expenses, Payments, versioned ReviewPolicies, and Notifications. Each ReviewPolicy has one or more ordered ReviewSteps. Expense references the applicable policy version at submission; policy changes do not silently rewrite an already-submitted expense's review history. Expense has one submitter, one payer, many ExpenseShares and ExpenseApprovals, and zero or one Receipt. Each approval decision belongs to the expense's applicable review process. Approved Expense and Payment create ledger entries atomically. BalanceProjection is derived by group and currency. A report is scoped to its authorized requester and records.

## Invariants and transaction scopes

- Unique normalized account email; verified status required before protected access per FR-001.
- Expense submission: validate membership, inputs, exact split; atomically persist expense, shares, policy snapshot, initial state and notice intent. Receipt staging/commit requires compensation for orphan bytes.
- Approval: decision and state transition together; final approval plus all expense ledger entries atomic and idempotent.
- Payment: authenticate/authorize before mutation; begin the appropriate transaction, read authoritative outstanding due from ledger-backed financial records (or equivalent authoritative transactional records), and check the requested amount against that due inside the transaction. Reject excess with current amount due. Commit payment and ledger effect atomically, then update or invalidate the derived projection as part of the transaction where applicable. A stale projection is never the sole payment authority.
- Notification delivery occurs only after commit and is retryable/deduplicated.
- All financial entries remain group/currency scoped. No cross-currency arithmetic without approved conversion.
- Projection can always be rebuilt; pending and rejected expense rows never appear as financial postings.

Currency precision, netting, policy-change behavior for pending expenses, self-approval, reviewer eligibility, idempotency retention, correction history, receipt constraints, and historical membership access require decisions in [decision register](decision-register.md).
