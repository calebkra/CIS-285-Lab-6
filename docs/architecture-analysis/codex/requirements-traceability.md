# Requirements traceability

The requirement IDs below come from `specs/001-expense-sharing/spec.md`, whose customer inventory traces to `UserRequirement.md`. Requirements are not fulfilled by this proposal. No application implementation or verification evidence exists in the repository.

| Requirement | Architecture/design decision | Components / design | Diagram | Verification approach | Swing MVP status |
|---|---|---|---|---|---|
| FR-001 account, unique email, verification, recovery | Identity boundary; no provider selected | Account, identity adapter | context, deployment | registration, duplicate, unverified, recovery acceptance tests | Proposed subset; unverified |
| FR-002 authorized personal data | Per-request authorization | service authorization, report/read use cases | trust-boundaries | unrelated account denial tests | Proposed subset; unverified |
| FR-003 groups/membership | Group-scoped membership and roles | Group, Membership | domain-class, data-model | create/add/remove and non-member denial | Proposed subset; unverified |
| FR-004 expense facts, one current-member payer, optional receipt | Payer separate from participants; private receipt adapter | Expense, ReceiptStore | domain-class, data-model, sequence | payer/member validation, optional receipt access | Proposed subset; unverified |
| FR-005 participants; payer may be excluded | Explicit payer relation plus ordered participant set | Expense, ExpenseShare | domain-class, data-model | payer-included/excluded cases | Proposed subset; unverified |
| FR-006 equal and percentage splits | GUI-independent deterministic calculator | SplitCalculator | domain-class, sequence | split examples and conservation tests | Proposed subset; unverified |
| FR-007 positive amount/details/members/100% | Validate boundary and domain invariants | submission service | activity, sequence | invalid input tests | Proposed subset; unverified |
| FR-008 pending excluded from balance | Activate only after policy completion | expense lifecycle, BalanceCalculator | state, activity | pending/rejected zero balance effect | Proposed subset; unverified |
| FR-009 one/multi-step approval, decisions visible | Configurable approval policy and audited decisions | ApprovalService, Approval | activity, state, domain-class | eligible/ordered approver and rejection tests | Proposed subset; unverified |
| FR-010 notify other group members | Post-commit recipient selection; external delivery open | NotificationPublisher | activity, data-flow | recipient exclusion and delivery tests | In-app notice subset proposed; unverified |
| FR-011 balances account for payer vs participants | Ledger-style payer credits and participant debits | BalanceCalculator | payment-settlement, data-model | payer included/excluded and payment reconciliation | Proposed subset; unverified |
| FR-012 partial/full, reject excess | Transactional payment validation with remaining due | PaymentService | payment-settlement, sequence | partial/full/excess/concurrent payment tests | Proposed subset; unverified |
| FR-013 authorized summaries | Scope reads by authorized account/group | ReportService | component, trust-boundaries | totals reconcile and unauthorized denial | Proposed subset; unverified |
| FR-014 date range and parameters | Inclusive filters, supported parameter decision | ReportService | component | boundary/empty/invalid range tests | Date-range subset proposed; unverified |
| FR-015 web, Android, iOS | Shared service and separate clients | web/mobile clients, services | context, deployment | platform acceptance and cross-client data tests | **Not met by Swing MVP** |
| FR-016 records across sign-out/sign-in | Durable persistence required | repositories/storage | deployment, data-model | persistence and re-login acceptance tests | Unverified; local/shared mode undecided |
| NFR-001 privacy/authorization | Service-side least privilege; private receipt access | auth and adapters | trust-boundaries | group/non-member access tests | Proposed; unverified |
| NFR-002 monetary conservation | BigDecimal, explicit scale, largest remainder/tie order | Money, SplitCalculator | domain-class | property/boundary tests for exact totals | Required design; unverified |
| NFR-003 p95 under 2 seconds, group size up to 100 | Measure defined workload; optimize after baseline | service/store/report | deployment, component | agreed load test environment/profile | Unverified; target definition incomplete |
| NFR-004 keyboard/understandable errors | Keyboard-accessible UI and mapped domain errors | Swing presentation and future clients | component-architecture | accessibility and usability acceptance | Unverified |
| NFR-005 platform availability | Per-platform release and acceptance gates | web, Android, iOS | deployment | AC-011 platform test suite | **Not met by Swing MVP** |

Customer feature coverage: user accounts, groups, expense capture, notices, approvals, balances, payments, reporting, and cross-platform access are all represented as requirements. The desktop subset is only an implementation decision; every row remains unverified without code and evidence. The complete product's web/mobile requirement is explicitly unmet by a Swing-only deliverable.

## Verification evidence and gaps

Repository checks found no source tree, `pom.xml`, JUnit test files, schema, API contract, or deployment configuration. Therefore no acceptance tests, performance measurements, platform checks, security claims, or implementation completion can be reported. Human review must resolve open design choices and then establish executable verification evidence for each requirement.
