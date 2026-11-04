# Architecture analysis

## Scope and evidence

**Verified repository fact:** requirements, specification, constitution, and two analysis packages exist; no application implementation, Maven project, API, database, or deployment environment is evidenced by the inspected file inventory. **Required:** Java 21, Maven, Swing, JUnit 5, GUI-independent domain logic, `BigDecimal`, and PlantUML apply to the MVP. **Required:** the complete customer product is web, Android, and iOS with shared authorized data. **Proposed:** architecture below; it is not an implementation claim.

## Context and architecture

For the **Swing MVP**, use Swing presentation -> GUI-independent application use cases -> domain rules -> replaceable ports/adapters. Presentation does not calculate shares or balances. JUnit 5 can test domain/application behavior without constructing Swing. Whether this MVP is local-only or collaborative is open; local persistence does not imply cross-device sharing.

For the **complete product**, web, Android, and iOS clients call a shared authenticated service. That service is the authority for validation, authorization, approval, shares, payment limits, balances, and reports. A transactional durable store holds authoritative records; private receipt storage and asynchronous notification delivery are adapters. No backend, API, database, cloud, or client stack is selected or verified. Avoid premature microservices; a modular service is a proposal until workload and operational needs justify another topology.

## Logical responsibilities

| Responsibility | Proposed component boundary |
|---|---|
| Identity | Registration, unique email, verification, authentication, recovery, session lifecycle; provider open |
| Group and policy | Membership and role checks; versioned review-policy snapshot for each submission |
| Expense | Input validation, participant/payer membership checks, split calculation and pending record |
| Approval | Authorized decisions; atomic final transition plus ledger posting |
| Ledger/balance | Immutable financial facts and rebuildable group/currency-scoped balance projection |
| Payment | Transaction-scoped due check, idempotent payment and ledger effect |
| Receipt | Private content storage, metadata, authorization on every access, cleanup/compensation |
| Notification | Transactional notice intent; asynchronous deduplicated delivery and retry |
| Reporting | Authorized source queries, inclusive agreed date range, reproducible aggregation |

## Transaction and reliability design

Expense submission commits expense, exact shares, policy snapshot, and initial review state together. Approval commits a unique decision; the final required decision and all expense ledger entries commit atomically. Payment checks current outstanding debt inside the same transaction as the payment and its ledger effect. Use row/resource locking, serializable/appropriate isolation, or optimistic version checking with conflict retry; exact strategy depends on the unselected persistence technology. A stale attempt must re-read the due amount and reject if it would overpay.

Mutations accept a scoped idempotency key or enforce an equivalent durable uniqueness key. Repeating a key with identical request returns the original result; key reuse with different content is rejected. Proposed uniqueness: (actor, operation, key); one approval per policy step/reviewer; one ledger posting per source and posting role; one notice per event/recipient/channel. Persist an outbox intent in the business transaction, dispatch after commit, retry with deduplication, and expose delivery state. Notification failure does not roll back finance. Receipt bytes and metadata may not share a transaction; stage uploads, commit references only after durable storage, and clean or reconcile orphaned staged objects.

Record audit evidence for actor, decision, source, timestamp, and correlation/idempotency identity without logging credentials, tokens, receipt contents, or excess personal data. Recovery includes retrying idempotent work, reconciling ledger against projections, detecting missing receipt objects/outbox backlog, restoring backups, and preserving auditable correction entries. These are proposed controls.

## Security and privacy

Authenticate before protected operations. Verify email and recover accounts as FR-001 requires. Protect password credentials with a reviewed one-way password verifier or an approved identity service; never store plaintext. Expire and invalidate sessions by a policy still to be approved. Every group/resource request is authorized server-side against actor, current membership, role, and resource scope; never trust client-supplied identity/group claims. Apply checks to reports, notifications, approvals, balance details, and receipt fetches. Deny nonmember and cross-group reads. Membership removal behavior for historical access remains open; preserving history does not imply continued authorization.

Use encrypted client-service transport in the proposed complete-product boundary. Keep receipt storage private and issue access only after authorization; avoid public URLs. Keep notifications minimal so lock-screen/email content does not disclose amounts, receipt data, or sensitive descriptions unnecessarily. Restrict and retain audit history under an approved schedule. Define account deletion, data retention, recovery abuse controls, receipt type/size/scanning, and breach response before production. Identity provider, cryptographic products, and vendors are not selected.

## Quality attributes and trade-offs

NFR-003's 95th-percentile-under-two-seconds target for ordinary actions at up to 100 group members is a required acceptance target, not a measured result; workload and environment need definition. NFR-004 requires keyboard use and understandable validation/denial messages on applicable interfaces. NFR-001 requires authorization isolation; NFR-002 requires exact value conservation. A canonical service improves consistency across clients but adds operating responsibility. A derived balance projection improves read performance but must be rebuildable and reconciled. Async notices improve transaction reliability but may be delayed; delivery status and retry are necessary.

See [design](design-analysis.md), [deployment](deployment-analysis.md), [decisions](decision-register.md), [traceability](requirements-traceability.md), and [diagrams](README.md#diagrams).
