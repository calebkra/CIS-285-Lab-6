# Candidate Product Service Contract

**Status**: proposed logical contract, not an existing API or approved wire protocol. It describes capabilities the complete web, Android, and iOS clients need. It may also be used by a collaborative Swing MVP if that option is approved.

## Contract principles

- One authenticated account identity and authoritative data set across supported clients.
- Every operation is server-authorized against current account, group, resource, and role policy.
- Clients do not access the primary data store directly.
- Monetary values cross a future wire boundary as exact decimal strings or an explicitly defined integer minor-unit representation plus currency; never as binary floating-point money.
- All timestamps include an agreed timezone/offset representation. Report date boundaries use the approved group/user timezone and inclusive calendar-date semantics.
- Mutating operations return explicit validation, authorization, conflict, unavailable, and success outcomes; no success-shaped fallback for failed persistence or dispatch.
- Mutations that may be retried accept an idempotency identity or have an equivalent uniqueness rule.
- API versioning and error schema are implementation decisions. This document does not invent paths, HTTP verbs, payload schemas, or status codes.

## Logical capability groups

| Capability | Operations (conceptual) | Required authorization/invariants |
|---|---|---|
| Identity | Register account, verify email, authenticate, recover access, sign out/session invalidation. | Unique normalized email; verified email before protected use; credentials never returned. |
| Groups | Create group, view authorized groups, manage membership and approved roles/policy. | Only authorized organizer/administrator actions; do not disclose inaccessible groups. |
| Expenses | Submit, view/list authorized, retrieve receipt metadata/content. | Current group membership; one current member payer; valid participants, positive amount, split and required details. |
| Approvals | List review work, approve or reject a pending expense, view decision/history. | Reviewer policy, pending state, one valid decision per configured step, no balance effect before completion. |
| Balances | Read group-scoped outstanding obligations and explanation/source history. | Current authorized membership; currency and group scope; results derived/reconciled from approved expenses and payments. |
| Payments | Record a partial/full settlement and view authorized payment history. | Positive amount; debtor/creditor and group authorization; amount cannot exceed current due; idempotent transaction. |
| Notifications | List/read authorized in-app notices and delivery state. | Only eligible recipients; submitter excluded from duplicate new-expense notice. |
| Reports | Request summaries for inclusive date range and supported filters. | Validate range/filter and authorize every source record; never trust client-supplied group scope. |

## Resource and error semantics

The eventual API should define stable resource IDs, pagination/sorting, validation error field references, authentication expiry behavior, retry rules, and conflict semantics. Unauthorized resource behavior should avoid confirming sensitive record existence. For payment overage, response must clearly indicate rejection and amount due per FR-012/AC-009. For expense submission, response should distinguish accepted-pending from approved; clients must not infer that submission changed balances.

## Contract verification

- Consumer/producer contract tests for all three customer clients.
- Negative authorization tests for every resource type and cross-group identifier.
- Compatibility tests across supported mobile client versions.
- Monetary serialization/round-trip tests that preserve exact values and currency scale.
- Idempotency, stale approval, duplicate payment, and concurrent balance conflict tests.
- Cross-platform acceptance proving a change committed on one client is visible to the same authorized account on the others.

## Human decisions required

Select protocol and wire format, authentication/session strategy, API version support, error format, pagination, rate limits, offline behavior, report timezone, receipt upload/download mechanism, idempotency key format, and platform release policy. No endpoint, provider, URL, or implementation is asserted here.
