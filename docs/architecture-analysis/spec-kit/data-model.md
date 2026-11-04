# Proposed SplitSmart Data Model

**Status**: conceptual proposal only. No schema or persistence implementation exists in the inspected repository. The structure is technology-neutral and does not prescribe a database vendor.

## Entities and fields

### UserAccount

- `user_id` — stable primary identifier.
- `normalized_email` — unique account sign-in identifier.
- `credential_reference` or protected password verifier — never plaintext.
- `email_verified_at`, `account_status`, `created_at`, `updated_at`.
- Optional profile/display fields only as approved.

### Group

- `group_id` — stable primary identifier.
- `name`, `status`, `created_by_user_id`, `created_at`, `updated_at`.
- `currency_policy` and `time_zone` only after policy decisions; do not assume multi-currency.
- Review policy changes should have version/effective time if historical interpretation requires it.

### GroupMembership

- `group_id`, `user_id` — association key.
- `role` or permission set, `membership_status`, `joined_at`, `left_at`.
- Proposed invariant: one active membership per user/group.
- Historical access after removal is unresolved; retain membership history separately from current authorization.

### ReviewPolicy / ReviewStep

- `policy_id`, `group_id`, `version`, `effective_at`, `status`.
- `step_id`, `policy_id`, ordered `step_number`, required approver rule/approver IDs, required count.
- Exact roles, self-approval, policy edits during review, and rejection/resubmission are human decisions.

### Expense

- `expense_id`, `group_id`, `submitter_user_id`, `payer_user_id`.
- `amount`, `currency_code`, `expense_date`, `description`, `split_method`.
- `status` (`PENDING_REVIEW`, `APPROVED`, or `REJECTED` in this proposal).
- `submitted_at`, `decided_at`, `receipt_id`, `review_policy_snapshot_id`, `version`.
- Invariants: positive amount; exactly one payer; payer is a current group member at submission; one or more participants; required date/description; current members as participants.

### ExpenseShare

- `expense_id`, `participant_user_id`, `selection_order`, `share_amount`.
- `percentage_input` for percentage splits; null for equal split.
- Proposed key: (`expense_id`, `participant_user_id`).
- Invariants: one row per selected participant; non-negative share; sum of shares equals expense amount exactly; allocation follows largest-fractional-share then selection-order tie-break.

### ExpenseApproval

- `approval_id`, `expense_id`, `step_number`, `reviewer_user_id`, `decision`, `decision_at`, `reason`.
- Proposed uniqueness: one decision per expense/step/reviewer as defined by policy; stable policy snapshot.
- Decision values and re-review history need product approval; retain audit evidence.

### LedgerEntry

- `ledger_entry_id`, `group_id`, `currency_code`, `user_id`, `signed_amount_minor_units` (or exact decimal amount with currency scale).
- `source_type`, `source_id`, `entry_type`, `created_at`, `actor_user_id`.
- Proposed unique key on source and entry role so retries cannot post the same approved expense/payment twice.
- Expense posting has payer credit and participant debits that sum to zero. Payment effects offset the debtor/creditor obligation.

### BalanceProjection (optional)

- `group_id`, `currency_code`, `debtor_user_id`, `creditor_user_id`, `amount_due`, `as_of_version`.
- Rebuildable from ledger entries and payments; never the sole financial source of truth.
- Matching/netting algorithm for multiple debtors/creditors is not defined by the spec and requires approval.

### Payment

- `payment_id`, `group_id`, `from_user_id`, `to_user_id`, `amount`, `currency_code`.
- `recorded_by_user_id`, `recorded_at`, `external_reference` (optional), `idempotency_key`.
- Invariants: positive amount; distinct valid members; amount no greater than the then-current outstanding amount; duplicate submissions do not double-post.
- A payment records settlement; it does not initiate a transfer.

### Receipt

- `receipt_id`, `expense_id`, private `storage_key`, `content_type`, `size_bytes`, integrity digest, `uploaded_by_user_id`, `created_at`.
- No public URL as authorization. Access is checked against current group/resource policy.
- Allowed file types/size, scanning, retention and deletion are unresolved.

### Notification

- `notification_id`, `group_id`, `expense_id`, `recipient_user_id`, `event_type`, `created_at`, `delivered_at`, `read_at`, `delivery_status`.
- Unique dedupe key for event/recipient/channel as appropriate.
- Recipient must be authorized; submission notice excludes submitter.

### Report

- No durable report entity is required by default. A `ReportRequest` may be logged for auditing/analytics with requester, validated date range, filters, and generated time.
- Store report snapshots only if an approved export/audit requirement needs them; apply the same access and retention controls as source data.

## Relationships and cardinalities

- UserAccount 1-to-many GroupMembership; Group 1-to-many GroupMembership.
- Group 1-to-many Expenses, ReviewPolicies, Payments, and Notifications.
- Expense 1-to-many ExpenseShare and ExpenseApproval; Expense has exactly one submitter and one payer UserAccount.
- Expense may reference zero or one Receipt; Receipt content is held outside structured domain tables.
- Approved Expense and Payment each produce one or more LedgerEntry rows through atomic transactions.
- BalanceProjection is derived from ledger entries and payments, scoped by group and currency.
- Report requests reference the authorized caller and filters, not raw cross-group data.

## Validation and integrity rules

1. Unique normalized email; verified account required for protected use.
2. Every expense payer and participant is an eligible current group member at submission.
3. Expense amount is positive and representable at the chosen currency scale.
4. Split method is supported; equal/percentage share amounts sum exactly to total.
5. Percentage values total exactly 100% under an approved precision/normalization rule.
6. No pending, rejected, or partially approved expense contributes ledger effects.
7. Final approval transition and expense ledger posting are atomic and idempotent.
8. Payment is positive, authorized, within outstanding balance, and atomic with its ledger entry.
9. All records retain group/currency scope; no cross-currency arithmetic without an approved conversion policy.
10. Every report, receipt, approval, balance, and payment lookup enforces caller authorization.

## State and transaction boundaries

- Expense submission: expense + final shares + policy snapshot + approval rows + notification intent.
- Approval: decision row + state transition; on final approval include expense ledger entries atomically.
- Payment: payment record + ledger entries + balance projection update atomically.
- Notification delivery: asynchronous status transition after the source transaction commits.
- Receipt upload: validate and persist private content/metadata; define orphan cleanup and compensation if storage and metadata cannot commit atomically.

## Open decisions before schema implementation

Currency set/scale, report timezone/date semantics, balance netting, approval policy, soft deletion/history, group-removal access, receipt limits/retention, correction entries, idempotency scope, concurrent payment isolation, and data retention need stakeholder approval. See [design-analysis.md](./design-analysis.md).
