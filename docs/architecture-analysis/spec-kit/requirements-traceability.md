# Requirements Traceability

## Traceability approach

`UserRequirement.md` is authoritative. The feature specification maps its customer-feature inventory to FR-001–FR-015 and adds FR-016 for durable records. The mapping below does not change those sources. The **coverage** column describes a proposal or platform gap, not implemented fulfillment.

Diagram key: **UC** `use-case.puml`; **ACT** `activity-expense-approval.puml`; **SEQ** `sequence-expense-submission.puml`; **STATE** `state-expense-lifecycle.puml`; **DOM** `domain-class.puml`; **DATA** `data-model.puml`; **COMP** `component-architecture.puml`; **DEP** `deployment.puml`; **CTX** `system-context.puml`; **BAL** `balance-settlement.puml`.

## Customer requirement inventory

| Customer feature from `UserRequirement.md` | Specification mapping | Architecture/design and components | Verification proposal | Swing MVP status |
|---|---|---|---|---|
| Individual accounts, sign-in, and personal expense/balance access | FR-001–FR-002; NFR-001; AC-001, AC-013 | Identity/session and authorization boundary; UserAccount/GroupMembership; UC, DOM, DATA, COMP, DEP | Register/verify/login/recover; unrelated account denied; inspect privacy and auth logs | Functional subset in spec; not implemented or verified. |
| Groups and membership | FR-003; NFR-001; AC-002, AC-013 | Group/membership service; Group/GroupMembership; UC, DOM, DATA, COMP | Create/add/remove; member reads allowed; non-member denied; lifecycle/retention tests | Functional subset in spec; not implemented or verified. |
| Create expenses, including amount/date/description/split/receipt/participants | FR-004–FR-007; NFR-002; AC-003–AC-005 | Expense service, split policy, receipt adapter; Expense/ExpenseShare; UC, ACT, SEQ, STATE, DOM, DATA | Valid/invalid inputs; payer/member rules; split sum and deterministic remainder tests; receipt access tests | Functional subset in spec; not implemented or verified. |
| Notify other group users of new expenses | FR-010; AC-007; SC-004 | Notification inbox/outbox; Notification; ACT, SEQ, DOM, DATA, COMP, DEP | Correct recipients, no submitter duplicate/non-member access, retries, agreed 95% within 60 seconds | In-app MVP subset; no implementation or delivery measurement. |
| Review and approve before history/balance changes | FR-008–FR-009; AC-006; SC-003 | Approval service and transaction; Expense/Approval/LedgerEntry; ACT, SEQ, STATE, DOM, DATA | Partial approval/pending/rejected balance invariance; final approval once; unauthorized reviewer denied | Functional subset in spec; not implemented or verified. |
| Track amount owed by each user to others | FR-011; AC-008; SC-002 | Ledger/balance service and projection; ExpenseShare/LedgerEntry/Balance; BAL, DOM, DATA | Payer included/excluded, exact balances, recomputation/reconciliation | Functional subset in spec; not implemented or verified. |
| Record payments and update balances | FR-012; AC-009; SC-006 | Payment service/ledger; Payment/LedgerEntry/Balance; UC, BAL, DOM, DATA | Partial/full payment, overpayment rejected with due, duplicate/concurrent payment tests | Functional subset in spec; not implemented or verified. |
| Summaries and custom reports/date ranges | FR-013–FR-014; AC-010; SC-006 | Authorized report service; Report as query/result; UC, COMP, DATA | Inclusive range, supported filters, empty/invalid range, authorization and reconciled totals | Functional subset in spec; not implemented or verified. |
| Primarily web plus Android and iOS | FR-015; NFR-005; AC-011; SC-007 | Shared API/data authority and platform-specific clients; CTX, COMP, DEP | Platform-specific acceptance on web, Android, iOS; same authorized data after cross-platform change | **Not fulfilled by Swing**; requires separate delivery and verification. |

## Functional requirements

| ID | Architecture/design decision and components | Diagram(s) | Verification approach | Swing MVP vs complete product |
|---|---|---|---|---|
| FR-001 | Identity boundary; unique normalized email, verification and recovery; credential provider unresolved. | UC, DOM, DATA, COMP, DEP | AC-001 account, duplicate, verification, recovery tests; credential storage/security review. | MVP subset / shared identity across web+mobile still required. |
| FR-002 | Server/service authorization for personal and group resources; user-scoped reads. | UC, COMP, DEP | AC-001, AC-013 cross-account denial tests. | MVP functional subset proposed; future clients share authorization. |
| FR-003 | Membership service and durable membership records with roles/policy. | UC, DOM, DATA | AC-002 create/add/remove and denied access tests. | MVP functional subset proposed; not implemented. |
| FR-004 | Expense stores one payer independently from participant list; payer must be current member. | UC, ACT, SEQ, DOM, DATA | AC-003 payer/receipt display; reject non-member payer. | MVP functional subset proposed. |
| FR-005 | Shares are selected separately; payer may also participate. | ACT, SEQ, DOM, DATA, BAL | AC-004; test payer included/excluded. | MVP functional subset proposed. |
| FR-006 | Split policy produces exact share values and persists final allocations. | SEQ, DOM, DATA, BAL | AC-005 and SC-002; equal/percentage deterministic cases. | MVP functional subset; exact implementation absent. |
| FR-007 | Service validates positive amount, required fields, membership, and split total. | ACT, SEQ, DOM, DATA | AC-004/AC-005 error-path tests. | MVP functional subset proposed. |
| FR-008 | Pending/rejected records do not post; final approval and ledger effects are atomic. | ACT, STATE, SEQ, DOM, DATA | AC-006/SC-003 state and rollback tests. | MVP functional subset proposed. |
| FR-009 | Group-configured single/multi-step approval; authorized decisions and visible outcome. | ACT, STATE, DOM, DATA | AC-006 reviewer permissions, ordering/count and decision visibility. | MVP functional subset; policy details need approval. |
| FR-010 | Post-commit notice intent, authorized recipients, excluding submitter; channels unresolved. | ACT, SEQ, DOM, DATA, COMP, DEP | AC-007 recipient/privacy/retry test; SC-004 measured under agreed conditions. | In-app subset proposed; external channels open. |
| FR-011 | Ledger effects credit payer and debit participants; balance derived from approved expense and payments. | BAL, DOM, DATA | AC-008 and reconciliation tests for payer membership in/out of shares. | MVP functional subset; pair matching policy open. |
| FR-012 | Payment record limited to outstanding amount, atomically written and reflected in balance. | BAL, DOM, DATA | AC-009 partial/full/excess/duplicate/concurrency tests. | MVP functional subset proposed. |
| FR-013 | Reports/summaries query only authorized expenses, balances, and payments. | UC, COMP, DATA | AC-010 and aggregation/privacy tests. | MVP functional subset proposed. |
| FR-014 | Inclusive date range and approved filters validated at service boundary. | UC, COMP, DATA | AC-010 boundary, empty range and invalid filters tests. | MVP functional subset; parameters open. |
| FR-015 | Complete product is primarily web-based and includes Android and iOS apps. | CTX, COMP, DEP | AC-011 and SC-007 tested independently on all required clients. | **Explicitly unmet by Swing MVP**. |
| FR-016 | Durable records across sign-out/sign-in in persistent storage. | DOM, DATA, DEP | AC-012 restart/sign-out/re-sign-in integration tests. | MVP functional subset requires selected persistence; no implementation exists. |

## Non-functional requirements and acceptance criteria

| Requirement | Architectural response | Verification |
|---|---|---|
| NFR-001; AC-013: authorized access only; no non-member access to group expenses, balances, payments, receipts. | Default-deny service checks for every resource/action; authorization-aware receipt and report operations. | Negative tests across accounts/groups and after membership removal; attempt direct object access. |
| NFR-002; AC-005; SC-002: exact smallest-unit totals, no silent rounding loss. | `BigDecimal`, explicit currency scale, deterministic largest-remainder policy and persisted shares. | Exhaustive/property-style amount/participant cases; every share sum exactly equals total; compare tie rules. |
| NFR-003; AC-014; SC-005: at least 95% of ordinary actions within 2 seconds at 100 members/group, excluding notification delivery. | Group-scoped indexed queries, bounded filtering, measurable client/service spans; avoid premature distribution. | Define workload, environment, request set and percentile method with stakeholders; run representative performance test. No result exists. |
| NFR-004; AC-015; SC-001/SC-008: keyboard usability and understandable validation/denial; usability outcomes. | Platform-specific accessible controls and clear error mapping; Swing UI delegates to services. | Keyboard-only flow; screen/accessibility review; moderated usability test (9/10 within 10 minutes; 8/10 clarity rating 4–5). |
| NFR-005; FR-015; AC-011; SC-007: required platforms separately verified. | Independent web, Android, iOS client release/acceptance tracks against shared API. | Sign-in and authorized-data cross-platform acceptance on each platform; Swing result does not count. |
| AC-006; SC-003: no pending/rejected balance effects. | State machine and atomic approval/posting boundary. | Assert unchanged ledger/balance for pending/rejected/partial approvals. |
| AC-007; SC-004: notices to other group users, not submitter; 95% within 60 seconds under test conditions. | Persisted outbox/inbox, recipient authorization, dedupe, retry. | Recipient matrix + timed delivery run under agreed workload/channel. |
| AC-008/009; SC-006: balances and payment updates correct; report totals match records. | Ledger-derived balances and payment constraints; report sums from authorized source entries. | Reconcile per group/currency and verify after partial/full settlement and report filters. |
| AC-012: records survive subsequent sign-in. | Durable store; no transient in-memory-only source for customer records. | Restart/service recovery and reauthentication test. |

## Platform coverage statement

The Java Swing architecture addresses a proposed desktop implementation slice only. The specification itself lists it as excluding web, Android, and iOS. The complete product needs separate clients, common account/data services, API compatibility, and acceptance runs for each target. None of those platforms or customer behaviors is implemented or verified in this repository.

## Specification quality issue for owner review

User Story 3, Acceptance Scenario 3 permits either rejection of overpayment or an explicitly recorded overpayment and labels the choice open. Clarifications, FR-012, Edge Cases, and AC-009 select rejection and returning the amount due. This analysis uses rejection as the operative rule and does not edit the source spec. The spec owner should remove or update the stale open question.
