# SplitSmart Architecture Analysis

## Executive summary

This is a proposed architecture, not a description of implemented software. Repository inspection found the authoritative requirements, specification, constitution, and Spec Kit material, but no Java source, Maven project, database configuration, application API, or deployment assets.

For the **Java Swing MVP**, keep Swing presentation separate from GUI-independent application/domain services; put exact split, approval, payment, and balance rules in the domain/service boundary; and isolate persistence and notifications behind adapters. To support multiple accounts and group members across machines, a shared service and central persistence are likely necessary. Whether that service belongs in the MVP is an explicit human decision: local-only desktop storage would not provide shared remote collaboration or notification to remote members.

For the **complete customer product**, provide web, Android, and iOS presentation clients over shared, server-authoritative identity, group, expense, approval, balance, payment, and report capabilities. Shared data and authorization should not be independently implemented in each client. The Swing app is not a substitute for any of the three customer-required platforms.

The primary architecture drivers are exact monetary correctness, private group data, auditable approval/payment effects, keyboard-accessible flows, durable records, cross-platform consistency, and NFR-003's requirement that at least 95% of ordinary actions complete within two seconds for groups of up to 100 members, excluding notification delivery. NFR-003's measurement scope and environment still need stakeholder definition.

## Evidence and boundaries

### Verified repository evidence

- `UserRequirement.md` asks for individual accounts, groups, shared expenses, receipts, notices, review/approval, balances, payments, reports, and a primarily web product with Android and iOS apps.
- `specs/001-expense-sharing/spec.md` defines FR-001–FR-016, NFR-001–NFR-005, AC-001–AC-015, and the initial Java Swing MVP subset.
- `.specify/memory/constitution.md` binds the desktop implementation to Java 21, Maven, Swing, JUnit 5, GUI-independent business rules, `BigDecimal`, explicit rounding, PlantUML, traceability, and human review.
- No application classes, source tree, Maven descriptor/wrapper, or infrastructure configuration were found in this worktree.

### System context

```text
Swing MVP (implementation slice)
  Swing desktop client -> proposed shared application boundary -> proposed persistent store
                                             |-> in-app notification inbox

Complete customer product (separate delivery scope)
  Web client ---------\
  Android client ------+-> shared authenticated API/domain services -> shared records
  iOS client ----------/                                  |-> receipt object/file store
                                                         |-> notification delivery
```

These are logical proposals. No API, database, network service, notification provider, or image store currently exists in repository evidence. See [system-context.puml](./diagrams/system-context.puml), [component-architecture.puml](./diagrams/component-architecture.puml), and [deployment.puml](./diagrams/deployment.puml).

### Stakeholders and actors

| Stakeholder/actor | Interest and authority |
|---|---|
| Individual user | Own account, groups, expenses, balances, payments, reports, and permitted receipts. |
| Group organizer | Group membership and review-policy configuration; exact powers require approval. |
| Expense submitter | Creates and tracks an expense; must not receive the "another member" notice for their own submission. |
| Expense approver | Reviews and approves/rejects according to group policy. Self-approval policy is unresolved. |
| Notification recipient | Current group member receiving the allowed submission/review notice. |
| Product owner/customer | Confirms platform scope, approval rules, reports, retention, and delivery sequence. |
| Engineering/operations/security reviewers | Choose implementation, hosting, access, recovery, and release controls; substantively review AI-generated artifacts. |
| External identity/email/push/payment services | Optional future boundaries only. No such provider is selected. Payment tracking records settlement; it does not imply the product initiates money transfers. |

## Architectural drivers and quality attributes

| Driver | Requirement | Architectural response |
|---|---|---|
| Correct shared expense behavior | FR-004–FR-009, AC-003–AC-007 | Domain validation and approval state machine; posting only after all configured approvals. |
| Exactness and explainability | Constitution III, NFR-002, AC-005, AC-008–AC-009, SC-002 | `BigDecimal`, explicit currency scale/rounding boundary, deterministic largest-remainder allocation, ledger-derived/reconcilable balances. |
| Privacy and authorization | FR-002, NFR-001, AC-001–AC-002, AC-013 | Authenticate each principal; enforce group/record authorization at service boundary; restrict receipt access and logs. |
| Durable multi-user data | FR-016, AC-012 | Shared persistence for the complete product; transactional use cases and tested backup/restore. Local MVP persistence choice is unresolved. |
| Cross-platform consistency | FR-015, NFR-005, AC-011, SC-007 | Common server API/domain policy and a common source of truth; platform-specific clients remain separate. |
| Usability/accessibility | NFR-004, AC-015, SC-001, SC-008 | Keyboard-first interactions, actionable validation/denial messages, platform accessibility testing. |
| Performance | NFR-003, AC-014, SC-005 | Measure user-visible response times against a defined 100-member group workload; exclude delivery latency as NFR states. |
| Notice timeliness | FR-010, AC-007, SC-004 | Commit notification intent with submission; asynchronous delivery and observable retry/latency. |
| Maintainability/testability | Constitution I, II, V | Cohesive domain/application/presentation boundaries, persistence adapters, unit/integration/contract tests, human review. |

No availability, throughput, data volume, recovery time, or recovery point objectives are specified. Do not infer them from the two-second action target.

## Proposed logical architecture

### Java Swing MVP

1. **Swing presentation**: account, group, expense entry, approval queue, balance/payment, notification inbox, and reporting views. Collect input, show results/errors, and delegate all business decisions. Event handlers must not compute shares or balances.
2. **Application services**: use-case orchestration such as account/group operations, expense submission/review, payment recording, and reports. Establish a principal/authorization context, coordinate transaction boundaries, and return view-ready results.
3. **Domain model/policies**: user/group membership rules, expense validation, exact split allocation, approval progression, ledger effects, and payment limit rules. Independent of Swing and persistence technology.
4. **Persistence ports/adapters**: durable account, group, expense, approval, payment, notification, and ledger persistence. Use transactions for final approval plus posting and payment recording. The repository does not establish a selected database or schema.
5. **Notification adapter**: MVP requirement is in-app notice; use a persisted inbox and ensure no duplicate notice to the submitter. External channels are not assumed.
6. **Receipt storage adapter**: store metadata with the expense and image bytes in access-controlled storage; validate file type/size and access on retrieval. File limits and storage technology need approval.
7. **Tests**: JUnit 5 domain tests for split/approval/balance/payment behavior, persistence integration tests, authorization tests, and Swing interaction/accessibility tests.

**MVP deployment boundary decision**: a local-only Swing process can demonstrate local workflows and persistence, but cannot by itself deliver shared remote membership, cross-device records, or notifications to other users. A minimal collaborative MVP therefore needs a shared authenticated service and store (or a deliberately approved narrower demo scope). This is a recommendation, not an existing architecture. See [deployment-analysis.md](./deployment-analysis.md).

### Complete web, Android, and iOS product

- **Platform clients**: web, Android, and iOS presentation, each implementing platform-native navigation/accessibility while consuming the same authenticated domain capabilities.
- **Service/API boundary**: stable, versioned contract for identity, groups/membership, expenses/shares, approvals, balances, payments, notices, receipts, and reports. Clients never connect directly to the primary database.
- **Domain/application services**: authoritative validation, authorization, approval, posting, payment, and report semantics. Prefer shared policy and contracts over duplicating rules in three clients.
- **Transactional data**: relational persistence is a proposed fit for ownership, membership, approval, and payment consistency; exact engine/vendor remains unselected.
- **Receipt bytes**: separate private object/file store with metadata, content validation, encryption, and authorization-controlled retrieval.
- **Notification delivery**: in-app inbox plus optional email/push adapters after stakeholder decision; delivery does not block or roll back a committed expense.
- **Operations**: environment-managed secrets, migrations, audit events, metrics, traceable errors, encrypted backups, restore drills, and release gates.

The complete product may reuse domain rules across implementations if language/platform choices permit, but no shared source-code strategy is selected. API behavior and data authority are the required shared elements.

## Component responsibilities and interactions

| Component | Responsibility | Must not do |
|---|---|---|
| Platform UI | Capture input, invoke use cases, render authorized results and clear errors. | Decide approvals, calculate money, or authorize solely by hiding controls. |
| Identity/session boundary | Authenticate verified account and issue/validate session credentials; support recovery. | Store plaintext passwords or expose credentials in logs. |
| Authorization policy | Check account/group/resource access for every request, including receipts and reports. | Trust client-supplied membership or role claims without server validation. |
| Expense service/domain | Validate membership, payer, participants, amount, split, and receipt reference; create pending review state. | Post a pending/rejected expense to balances. |
| Approval service | Validate reviewer authority and record one decision per required step; enforce completion policy. | Let a partial approval alter balances. |
| Ledger/balance service | Post payer credit and participant debits once after final approval; apply payments and produce net balances. | Use floating point or allow a payment to exceed current outstanding debt. |
| Persistence adapter | Atomically save use-case state and enforce uniqueness/concurrency constraints. | Leak storage concerns into Swing/domain decisions. |
| Notification/outbox adapter | Deliver permitted notices after commit, retry safely, and record delivery state. | Disclose records to non-members or duplicate submitter notices. |
| Report service | Query authorized expense, balance, and payment data with validated inclusive ranges/filters. | Return cross-group data based only on client filters. |
| Receipt adapter | Store and retrieve private image content under current authorization. | Treat an opaque URL as authorization or log receipt content. |

Interactions and lifecycle are illustrated in [sequence-expense-submission.puml](./diagrams/sequence-expense-submission.puml), [activity-expense-approval.puml](./diagrams/activity-expense-approval.puml), and [state-expense-lifecycle.puml](./diagrams/state-expense-lifecycle.puml).

## Architectural decisions and alternatives

| ID | Decision/recommendation | Rationale | Alternative / status |
|---|---|---|---|
| AD-01 | Two distinct scopes: Swing MVP and customer-complete web/mobile product. | Avoid implying desktop satisfies FR-015. | Combining them rejected; scope split is derived and must be preserved. |
| AD-02 | UI delegates to GUI-independent services/domain. | Constitution II and business-rule testability. | Calculations in Swing handlers are nonconforming. |
| AD-03 | Shared service is required for collaborative multi-user behavior across devices. | Groups, permissions, and common records need an authoritative shared state. | Local-only MVP is possible only as a constrained demonstration; human approval required. |
| AD-04 | Use exact decimal/minor-unit arithmetic and deterministic remainder allocation. | Constitution III and AC-005. | Floating point prohibited. Currency scale remains unresolved. |
| AD-05 | Treat immutable business events/ledger effects as authoritative; balances are derived or rebuildable projections. | Reconciliation, auditability, avoiding drift after payment/approval. | Mutable balance as sole record rejected. |
| AD-06 | Use atomic persistence for final approval/posting and payment acceptance. | Prevent partial approval or concurrent overpayment from changing balances incorrectly. | Storage engine and transaction/isolation configuration are open. |
| AD-07 | Persist notification intent and deliver after commit. | Reliability and privacy while separating optional channels. | Synchronous external sending is not recommended. |
| AD-08 | Use a shared API/data authority for web/mobile; keep client presentation platform-specific. | Same authorized data across required platforms. | Three independently authoritative clients rejected. Framework/vendor choices open. |
| AD-09 | Keep receipt bytes separate from structured domain records. | Independent access, retention, size, backup, and encryption controls. | Database BLOB remains an alternative after scale/operations review. |

## Security, privacy, authorization, and data ownership

- **Identity**: unique email/password, email verification, and password recovery are required (FR-001). Use a well-maintained password hashing/identity solution or approved identity service; never store raw passwords. Provider, session lifetime, MFA, lockout, and account deletion require approval.
- **Authorization**: default deny. Enforce authenticated identity and current group/resource membership server-side on every read/write. Re-check at report, receipt, notification, and approval boundaries (FR-002, NFR-001). UI hiding is not a control.
- **Ownership**: a user owns their account credentials/profile; group data is shared only under group membership and policy. Expenses and approval history should retain stable actor IDs. Whether a removed member can view historical records is unresolved.
- **Receipt safety**: validate type/size, store outside public web paths, restrict by group authorization, encrypt at rest/in transit, and avoid permanent public URLs. Exact retention/deletion policy is open.
- **Transport/secrets**: the server deployment should require authenticated encrypted network transport; secrets must be kept outside source and client packages, with least-privilege service identities. Specific controls are proposed, not verified.
- **Auditability**: record actor, action, record ID, time, and decision/reason for approval, membership changes, and payment posting. Do not log passwords, tokens, full receipt contents, or unnecessary personal data. Retention and disclosure rules need review.
- **Threat considerations**: stolen credentials, horizontal group data access, forged client roles, malicious receipt uploads, duplicate/replayed submissions, approval/payment races, notification disclosure, and backup exposure. Mitigate with server authorization, input/content validation, idempotency, transaction constraints, least privilege, secure logging, and restore controls.
- **Payment scope**: payment tracking is recordkeeping, not transfer processing. Adding payment initiation, banking credentials, or processor integration requires a separate risk, compliance, and consent decision.

## Error handling, logs, audit, and observability

Return explicit validation, authorization, conflict, unavailable-service, and unexpected-error outcomes. Do not turn storage/delivery errors into success-shaped responses. Client messages should be actionable without revealing whether a private resource exists to an unauthorized user. Server logs should correlate requests using non-sensitive IDs, separate audit events from diagnostic logs, redact secrets/PII, and report notification failures distinctly from committed business actions.

Recommended signals include action latency by use case, transaction/conflict failures, approval queue age, notice delivery latency/failure/retry, receipt retrieval denials, report query latency, and backup/restore results. Define alert thresholds and service-level targets with operations before launch; NFR-003/SC-004 are test targets, not a complete SLO.

## Scalability, reliability, maintainability, and testability

- The 100-member group target suggests first proving indexed group-scoped queries and bounded report filters, not premature service decomposition.
- Start with a modular application/service deployment unless approved load or independent operating needs demonstrate a need to split services. A queue/outbox can be an internal capability before a separate broker is selected.
- Use transaction/idempotency rules for final approval, posting, and payments. A repeated request must not duplicate shares, ledger effects, or payment records.
- Keep stored monetary values unambiguous: amount plus currency, and explicit currency scale. All allocations must sum exactly to the expense total.
- JUnit 5 tests should include deterministic rounding/tie cases, payer-as-participant and payer-outside-participant cases, pending/rejected balance invariance, concurrent approval/payment attempts, authorization failures, and reporting boundaries.
- Add integration tests for persistence transactions and receipt authorization; API contract tests for all clients; accessibility and platform acceptance tests for each delivery target.
- AI-generated architecture/code/tests remain subject to substantive human review under constitution V.

## Risks, trade-offs, and open questions

| Risk / question | Impact | Required resolution |
|---|---|---|
| Local-only Swing architecture conflicts with remote group collaboration. | Core shared behavior may not work between users/devices. | Decide whether MVP includes a central service or is a constrained demo. |
| Future web/mobile stack, API, identity, hosting, storage, and delivery teams not chosen. | Cost, schedule, security, and client interoperability uncertainty. | Product/engineering architecture decision with human review. |
| Approval policy lacks exact actors, self-approval, edits, and policy-change semantics. | Unauthorized or inconsistent approval outcomes. | Approve policy, snapshot it on submission, define rejection and resubmission rules. |
| Membership removal/retention is open. | Historical privacy and audit ambiguity. | Approve data access and retention by actor/resource and jurisdiction. |
| Supported currencies/time zones/report semantics are unspecified. | Incorrect display, rounding, date filtering, or cross-currency balances. | Set currency and date/time policy; keep multi-currency out unless explicitly added. |
| Notification channel/latency depends on external delivery. | SC-004 may not be measurable or achievable without service selection. | Decide channels, recipient policy, retries, and test conditions. |
| Requirements contain stale overpayment scenario wording. | Different teams may implement contradictory behavior. | Reconcile User Story 3 scenario 3 with FR-012/AC-009. |
| No code or deployment is present. | No architecture claim can be verified against implementation or benchmarked. | Establish implementation baseline; perform tests, load/security review, and human approval later. |

See [deployment-analysis.md](./deployment-analysis.md), [design-analysis.md](./design-analysis.md), and [requirements-traceability.md](./requirements-traceability.md) for detailed design, runtime, and verification proposals.
