# SplitSmart architecture analysis

## Executive summary

**Verified:** The inspected repository has customer requirements, a feature specification, and a constitution, but no application source, Maven project, database, API, tests, or deployment configuration. The constitution mandates Java 21, Maven, Swing, JUnit 5, GUI-independent business logic, and exact `BigDecimal` money handling for implementation.

**Required:** The complete product is primarily web-based and also supports Android and iOS with shared accounts and authorized records (FR-001–FR-016, NFR-001–NFR-005). The Swing MVP is a desktop slice only. It cannot be reported as meeting cross-platform coverage.

**Proposed:** Keep a layered desktop architecture with business rules independent from Swing, then evolve those domain rules into a versioned shared service for the complete product. A transactional authoritative store should govern expenses, approvals, shares, payments, and balances; clients should not independently determine canonical balances. No specific technology provider is selected.

## Context, boundaries, stakeholders

Stakeholders include individual users, group organizers, expense submitters, approvers, notification recipients, product owner, developers, operations, and reviewers. External dependencies may eventually include email verification/recovery, notification delivery, and private receipt-image storage; none is present or selected in the repository.

The desktop boundary contains Swing presentation, application coordination, domain rules, and replaceable adapters. Persistence may be local or remote only after the MVP collaboration requirement is decided. The future-product boundary contains web/mobile clients and shared identity, application services, durable records, receipt storage, notification delivery, and operations. [System context](diagrams/system-context.puml), [component architecture](diagrams/component-architecture.puml), and [deployment](diagrams/deployment.puml) show the proposed boundaries.

## Architectural drivers

### Functional

Accounts and group membership (FR-001–003), expense capture and splits (FR-004–007), configurable approvals (FR-008–009), notices (FR-010), balances/payments (FR-011–012), reports (FR-013–014), cross-platform use (FR-015), and persistence across sessions (FR-016).

### Quality and constraints

Authorization and private data (NFR-001), exact currency-unit conservation (NFR-002), 95th percentile ordinary-action latency under two seconds for groups up to 100 members excluding notification delivery (NFR-003), keyboard usability and clear errors (NFR-004), and platform verification (NFR-005). The constitution additionally requires cohesive object design, a GUI/business boundary, `BigDecimal`, JUnit 5, Java 21/Maven/Swing for MVP, PlantUML, traceability, and human review.

## Proposed logical architecture

### A. Java Swing MVP

1. **Presentation:** Swing views and view models collect input and render results. They perform format-level feedback only; they do not calculate splits or balances.
2. **Application:** GUI-independent use-case services coordinate submission, approval, group management, payments, and reports; enforce transaction boundaries and authorization context.
3. **Domain:** cohesive account, group, membership, expense, share, approval policy, payment, and balance concepts enforce invariants. Monetary calculations use `BigDecimal` and currency-aware explicit rounding.
4. **Ports/adapters:** repository, receipt, notification, identity, and clock interfaces isolate persistence and external effects. Adapter implementations remain unselected because none exist.

The GUI invokes application services; services invoke domain behavior and ports. JUnit 5 tests can exercise services/domain without constructing Swing components. This is a proposed structure, not a description of current code. MVP data-sharing across devices is an open decision: local persistence may support a demonstration but cannot deliver shared account data or synchronization.

### B. Complete customer product

Web, Android, and iOS clients use a shared authenticated service boundary. The service authorizes every operation against account and current group membership, validates command data, applies domain rules once, and commits expense/approval/payment changes atomically to durable storage. Receipt bytes belong in access-controlled object storage; metadata and authorization references belong in transactional records. Notifications are asynchronous effects after committed submission. Reports read authorized canonical data. Clients cache only as approved, display server state, and reconcile after connectivity returns; conflict/offline semantics remain open.

**Proposed evolution:** preserve domain rules and test cases while moving canonical use cases behind a service API; replace desktop-only adapters with shared persistence, identity, receipt, and notification adapters; build each client against the shared contracts. API style, languages, hosting, and deployment platform require approval. [Data flow](diagrams/data-flow.puml) and [trust boundaries](diagrams/trust-boundaries.puml) illustrate this proposal.

## Responsibilities and interfaces

Proposed boundaries: `ExpenseSubmissionService` validates and orchestrates submission; `SplitCalculator` computes exact shares; `ApprovalService` records authorized decisions and activates an expense only when policy is satisfied; `BalanceCalculator` derives net obligations from approved expense allocations and payments; `PaymentService` rejects excess payment; `ReportService` applies authorized filters. Proposed ports include `ExpenseRepository`, `GroupRepository`, `PaymentRepository`, `ReceiptStore`, `NotificationPublisher`, and `IdentityProvider`.

These are conceptual names, not existing classes or contracts. Repositories should expose transaction-scoped operations; callers should not observe partial expense/share/approval commits. Notifications should be dispatched through an outbox or equivalent reliable post-commit mechanism if the selected store supports it.

## Decisions, alternatives, and trade-offs

| Topic | Recommendation | Alternatives and trade-off | Status |
|---|---|---|---|
| Desktop boundaries | Layered Swing, GUI-independent services/domain | Direct event-handler logic is simpler initially but violates testability and constitution | Required constraint; design proposed |
| Shared product authority | Shared service owns authorization and canonical calculations | Independent client calculations risk divergence; service adds operations | Proposed |
| Persistence | Transactional durable store for product records | Embedded-only storage cannot reliably share records across devices; provider/schema not chosen | Open decision |
| Balance | Derive from approved ledger facts; optionally cache with reconciliation | Mutable balance-only records are fast but harder to audit/rebuild | Proposed |
| Notifications | Post-commit asynchronous delivery | Synchronous delivery couples user actions to external service availability | Proposed; channels open |
| Receipts | Private object storage plus authorized metadata | Database blobs simplify transactions but can raise backup and scale costs | Proposed; provider/open retention decision |
| Client architecture | Separate web and native-capable mobile clients against shared service | Cross-platform UI frameworks reduce duplication but introduce stack/platform trade-offs | Open decision |

## Security, privacy, and identity

FR-001 requires unique email/password, verification, and recovery; NFR-001 requires least-privilege access. **Proposed:** use a mature identity service or carefully reviewed identity module; store password verifiers with a current password-hashing scheme, never plaintext. Require authentication for protected operations, authorize group-scoped reads and writes on the server/service for each request, and avoid trusting client-supplied user or membership identifiers. Protect receipts with short-lived authorized access and avoid public URLs. Encrypt network traffic and sensitive data at rest using selected platform controls. Rate-limit authentication and recovery; avoid leaking whether an email is registered.

Data minimization, retention/deletion, audit retention, consent, jurisdiction, and regulatory scope are **open decisions**. No security certification or compliance status is verified.

## Errors, audit, and observability

Return understandable validation and authorization errors (NFR-004) without exposing internal details. Distinguish invalid input, forbidden access, missing records, conflict/stale approval, persistence failure, and external delivery failure. Audit material events—membership changes, expense submission, approval/rejection, payment recording, and authorization failures—with actor, target, timestamp, and outcome while avoiding secrets and unnecessary receipt contents. Correlate service logs and notification attempts; monitor latency, error rates, queue age, and storage health. Retention and alert thresholds need approval.

## Quality attributes

- **Reliability:** atomic expense/share and payment writes; idempotency for retried submissions and payment commands; durable backup and tested recovery are proposed.
- **Performance:** establish a representative 100-member workload and measure NFR-003; indexing, pagination, and report limits depend on selected store and data volume.
- **Scalability:** the client/server model permits horizontal service scaling, but no account volume, availability, or growth target is specified.
- **Maintainability:** isolate UI, use cases, domain rules, and adapters; preserve shared behavior through contract and domain tests.
- **Testability:** JUnit 5 for Java MVP; unit tests for allocation/balances, service tests for workflows, adapter integration tests, and platform acceptance tests. No tests currently exist.

## Risks and unresolved decisions

1. Whether MVP must share records between users/devices; local-only MVP fails that interpretation of FR-016.
2. Approval eligibility, quorum, sequencing, self-approval, withdrawal, and edits after submission.
3. Currency set, scale, rounding at non-decimal-minor currencies, and mixed-currency exclusion.
4. Netting rules across multiple groups and how payer credit is assigned when participants omit the payer.
5. Payment evidence versus an in-app record; concurrency when two payments race against one debt.
6. Group removal, historical access, retention, account deletion, and receipt deletion.
7. Identity, service/API, persistence, cloud, hosting, notification channels, and receipt provider.
8. Offline/mobile synchronization, conflict resolution, supported OS versions, rollout, and service availability/recovery targets.
9. NFR-003 test environment, workload mix, and measurement boundary.

Approval gates: product owner confirms MVP collaboration, approval/payment semantics, privacy/retention, currency and reporting needs; engineering selects technology and operational targets; human reviewers accept this AI-generated proposal before implementation.

## Diagram references

See [use cases](diagrams/use-case.puml), [approval activity](diagrams/activity-expense-approval.puml), [submission sequence](diagrams/sequence-expense-submission.puml), [expense lifecycle](diagrams/state-expense-lifecycle.puml), [domain classes](diagrams/domain-class.puml), [proposed data model](diagrams/data-model.puml), [deployment](diagrams/deployment.puml), and the context, data-flow, and trust-boundary diagrams. All components and schemas shown are proposals unless labeled otherwise.
