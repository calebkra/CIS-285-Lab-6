# Proposed product service contract

**Not an existing API, endpoint specification, or selected protocol.** A shared service is proposed for the complete web/Android/iOS product and only if collaborative behavior is chosen for Swing.

## Contract principles

- Authenticated clients share one account namespace and authorized canonical records.
- Service checks actor, resource, group membership, and role on every operation; clients never access authoritative storage directly.
- Money is represented across any eventual boundary as exact decimal text or an explicitly specified integer minor-unit value plus currency, never binary floating point.
- Mutations are retry-safe using scoped idempotency identity or equivalent uniqueness constraints.
- Outcomes distinguish validation, denial, conflict, unavailable, and success. Submission returns pending status; clients do not infer balance effects before approval.
- Date/time wire semantics, versioning, pagination, error format, protocol and routes remain undecided.

| Capability | Logical operations | Essential rules |
|---|---|---|
| Identity | Register, verify, authenticate, recover, sign out/invalidate | Unique email; protected credentials; verified account before protected access |
| Groups | Create, list, view, membership/policy management | Role-checked; no disclosure of inaccessible groups |
| Expenses | Submit and list/view; receipt access | Positive amount, current member payer and participants, exact shares, private receipt |
| Approvals | Queue, approve/reject, decision history | Authorized reviewer; pending state/policy check; final posting atomic |
| Balances | Read due and explanation/history | Group/currency scoped, derived/reconciled; no cross-currency arithmetic |
| Payments | Record partial/full settlement, view history | Positive; due rechecked in transaction; no overpay; idempotent |
| Notifications | Inbox/read and delivery status | Eligible recipients only; deduplicated; submitter excluded from submit notice |
| Reports | Summary and selected inclusive date range/filters | Authorize all source records and validate range/time semantics |

Overpayment response must reject and show amount due under FR-012 and AC-009; the story-level ambiguity is recorded in traceability and the decision register. Contract tests should cover all clients, exact money round-trip, unauthorized resource IDs, retries/conflicts, and compatibility. No actual contract implementation is present.
