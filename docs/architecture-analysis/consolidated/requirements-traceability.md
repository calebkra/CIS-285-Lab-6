# Requirements traceability

`UserRequirement.md` is authoritative. FR/NFR/AC/SC identifiers below are preserved from `specs/001-expense-sharing/spec.md`. Architecture coverage is a proposal only; it is not proof of implementation or test. Status abbreviations: **P** proposed architecture addresses; **Partial** incompletely specified; **Open** stakeholder decision; **MVP gap** outside Swing platform scope.

## Customer feature inventory

| Customer feature | Specification IDs | Architecture / decision / diagram | Proposed validation | Coverage |
|---|---|---|---|---|
| Accounts, login, own information | FR-001–002; NFR-001; AC-001, AC-013 | Identity/authorization; D-09; context, use-case, trust-boundaries | Verify, duplicate email, recovery, account isolation | P; provider/session open |
| Groups and membership | FR-003; AC-002, AC-013 | GroupMembership; D-11; use-case, domain, data-model | Add/remove, member access, nonmember denial | P; historical access open |
| Expense, details, payer, shares, receipt | FR-004–007; NFR-002; AC-003–005 | Expense/split/receipt; D-02, D-10; activity, sequence, lifecycle, domain, data-model | Validation, payer included/excluded, exact equal/percentage/remainder, receipt privacy | P; currency/receipt policy open |
| Expense notices | FR-010; AC-007; SC-004 | Outbox/notification; D-18; sequence, component, data-flow | Recipient/exclusion, dedupe, retry and timing | P; channel/target conditions open |
| Approval workflow | FR-008–009; AC-006; SC-003 | Approval and atomic final posting; D-04–07, D-19; activity, sequence, lifecycle | Pending/rejected no effects, authorized decisions, duplicate/concurrent final approval | P; policy choices open |
| Owed balances | FR-011; AC-008; SC-002 | Ledger/projection; D-03, D-20; balance-settlement, domain, data-model | Payer cases, exact due, rebuild/reconcile | P; netting open |
| Payments | FR-012; AC-009 | Transactional payment; D-08, D-17, D-19; balance-settlement, sequence | Partial/full, excess, duplicate/concurrent payment | P; story conflict approval required |
| Summaries and reports | FR-013–014; AC-010; SC-006 | Authorized report query; D-12; use-case, component, data-flow | Inclusive range, filters, empty range, totals/authorization | P; timezone/filter details open |
| Web, Android, iOS | FR-015; NFR-005; AC-011; SC-007 | Shared service and clients; D-13, D-16; context, component, deployment | Platform-specific parity and shared records | **MVP gap**; all three still required |

## Functional requirements

| ID | Proposed architecture mapping | Diagram(s) | Proposed validation | Status |
|---|---|---|---|---|
| FR-001 | Identity, unique normalized email, verification/recovery | use-case, domain, data-model, trust-boundaries | AC-001 account, verification, duplicate, recovery | P; provider open |
| FR-002 | Authorized user-scoped access | use-case, component, trust-boundaries | AC-001, AC-013 isolation | P |
| FR-003 | Group and membership management | use-case, domain, data-model | AC-002 membership/access | P; post-removal policy open |
| FR-004 | One payer distinct from participants; optional receipt | activity, sequence, domain, data-model | AC-003 current payer and receipt | P |
| FR-005 | Participants selected separately; payer may be included/excluded | activity, domain, balance-settlement | AC-004 cases | P |
| FR-006 | Exact equal/percentage split allocation | activity, domain, data-model, balance-settlement | AC-005, SC-002 | P; precision open |
| FR-007 | Validate positive amount, details, membership, 100% total | activity, sequence | AC-004/005 rejection cases | P |
| FR-008 | Pending/rejected excluded from ledger and balance | lifecycle, sequence, balance-settlement | AC-006, SC-003 | P |
| FR-009 | Single/multiple authorized review steps | activity, lifecycle, domain | AC-006; duplicate/concurrent decisions | Partial; D-04–07 open |
| FR-010 | Other group members notified, submitter excluded | sequence, data-flow, component | AC-007, SC-004 timing | P; channels open |
| FR-011 | Payer credit, participant share debits, payments reflected | balance-settlement, domain, data-model | AC-008 and rebuild/reconciliation | P; netting open |
| FR-012 | Partial/full payment up to due; reject excess, show due | balance-settlement, sequence | AC-009, concurrent/excess tests | P; User Story 3 conflict |
| FR-013 | Authorized expense/balance/payment summaries | use-case, component, data-flow | AC-010 totals/authorization | P |
| FR-014 | Selected date range and supported parameters | use-case, component | AC-010 boundaries/filters | Partial; D-12 open |
| FR-015 | Primarily web plus Android and iOS | context, component, deployment | AC-011, SC-007 each platform | **MVP gap; required product scope** |
| FR-016 | Durable records across sign-out/sign-in | data-model, deployment | AC-012 restart/re-authentication | P; persistence undecided |

## Non-functional requirements, acceptance and success criteria

| ID | Architecture mapping | Acceptance / outcome | Validation proposal | Coverage |
|---|---|---|---|---|
| NFR-001 | Default-deny account/group/resource authorization incl. receipts | AC-013 | Cross-account/group direct-ID denial | P; removal policy open |
| NFR-002 | Exact currency-unit conservation and explicit scale | AC-005; SC-002 | Property/boundary split calculations | P; currency decision open |
| NFR-003 | Measure ordinary actions for groups up to 100 | AC-014; SC-005 | Define workload/environment then latency run | Partial; no measurements |
| NFR-004 | Keyboard-operable flows and clear invalid/denied feedback | AC-015; SC-001, SC-008 | Accessibility and usability evaluation | Partial; no UI exists |
| NFR-005 | Verify each required platform | AC-011; SC-007 | Separate web, Android, iOS acceptance | **MVP gap** |
| SC-001 | Usability flow success | — | 9/10 new users unaided within 10 min | Not run |
| SC-002 | Split exactness | — | Exact totals and invalid rejection in all defined cases | Not run |
| SC-003 | Pending/rejected no balance effect | — | Zero changes in workflow cases | Not run |
| SC-004 | Notification delivery target | — | 95% within 60 sec under agreed conditions | Not run |
| SC-005 | Ordinary action latency | — | 95% under 2 sec under agreed workload | Not run |
| SC-006 | Report totals | — | Match authorized source records for all tested ranges/filters | Not run |
| SC-007 | Full platform release acceptance | — | Agreed feature set on web, Android, iOS | Not run; Swing does not count |
| SC-008 | Workflow clarity | — | 8/10 rate clarity 4–5/5 | Not run |

## Overpayment inconsistency

User Story 3, Acceptance Scenario 3 says excess payment may be rejected or explicitly recorded and labels the choice open. Clarification, FR-012, the edge case, and AC-009 establish rejection and display of amount due. The proposed behavior follows FR-012/AC-009; product owner confirmation and reconciliation of the story wording remain required. The authoritative source files were not changed.

## Status interpretation

Every mapping is a proposed architecture relation. No requirement is marked implemented or tested. FR-015/NFR-005 remain explicitly outside the Swing MVP scope and are required for the complete product.
