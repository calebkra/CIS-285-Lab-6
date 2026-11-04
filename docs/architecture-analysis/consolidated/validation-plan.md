# Validation plan

This plan describes future validation. **No application tests were run and no test has passed.** The current repository has no application/build artifacts verified. When implemented, use JUnit 5 for Java domain/application tests as required by the constitution, plus integration, security, accessibility, and platform acceptance environments selected by the project.

| Area | Proposed scenarios / expected evidence |
|---|---|
| Exact money | Verify currency scale, no float/double path, positive amount validation, exact sum conservation at approved precision |
| Equal/percentage splits | Equal shares; percentages totaling exactly 100%; reject other totals; payer included and excluded from participants |
| Largest remainder | Fractional ties follow participant selection order; persisted shares sum exactly to amount |
| Approval/rejection | Pending, partial approval and rejected expenses leave ledger/balances unchanged; final approval posts once atomically |
| Duplicate/concurrent approval | Same key returns same result; different conflicting decision rejected; competing final decisions cannot double-post |
| Duplicate payment | Retry key cannot add duplicate payment or ledger effects; key reused with different body rejected |
| Concurrent payment | Two simultaneous attempts against one due amount cannot collectively exceed it; stale attempt receives current remaining due |
| Overpayment | Above-due request rejected, no payment/ledger record, current amount due displayed; track product-owner resolution of story conflict |
| Ledger reconciliation | Expense entries balance; projection rebuild equals displayed due after approvals/payments; detect missing/duplicate entries |
| Authorization | Nonmember, unrelated account, unauthorized reviewer, removed member, forged group/resource ID denied under approved removal policy |
| Receipt privacy | Authorized member can access permitted receipt; nonmember cannot; malformed/oversized file and storage failure handled; orphan cleanup verified |
| Notifications | Correct group recipients, submitter excluded, no nonmember leak; retry/dedupe; committed finance remains valid if delivery fails |
| Reports/date | Inclusive endpoints, timezone boundaries, empty/invalid periods, filters, authorization, totals reconcile to source records |
| Persistence/recovery | Sign out/in and restart retain authorized records; backup restore and ledger/receipt consistency demonstrated |
| Cross-platform | Same account sees committed changes across web, Android, iOS; parity acceptance per platform; Swing not counted |
| Performance | Define workload and environment; measure 100-member groups; verify at least 95% ordinary actions under 2 seconds excluding notification delivery |
| Accessibility/usability | Keyboard-only account/group/expense flow, understandable errors; evaluate AC-015 and SC-001/SC-008 with participants |

## Execution record

At package authoring, the repository was on `main` with a clean working tree. For the targeted correction on 2026-11-04, the consolidated package and all 12 `.puml` files were reviewed against `UserRequirement.md`, `specs/001-expense-sharing/spec.md`, `.specify/memory/constitution.md`, and the consolidated data model, design analysis, decision register, and traceability. The original Spec Kit and Codex directories were confirmed present. No authoritative source, original analysis, or application source was edited.

Changed for this correction: `activity-expense-approval.puml`, `balance-settlement.puml`, `data-model.puml`, and `domain-class.puml`; `sequence-expense-submission.puml` and `data-flow.puml` were aligned on post-commit, deduplicated delivery to eligible members excluding the submitter. `data-model.md` now states the versioned policy relationships and authoritative transactional payment validation. This plan and `README.md` record the evidence limits.

Static source review confirmed 12 diagram files, each with one `@startuml` and one `@enduml`, and checked the affected flows/relationships against the written design and requirements. This is only a framing/source-level check; it is not PlantUML parsing. No actual renderer or parser was available on PATH (`plantuml`, `java`, `mvn`, and `dot` were not found), and no rendered output exists. Consequently none of the 12 diagrams is reported as having rendered successfully or failed. Clipping, label readability, overlap, and visual layout have not been inspected. PlantUML syntax/rendering and visual inspection remain outstanding.

To perform actual rendering later, install/use PlantUML and its required Java runtime plus Graphviz if required by the chosen diagram syntax, then from the repository root run `plantuml -checkonly docs/architecture-analysis/consolidated/diagrams/*.puml` followed by `plantuml -tpng docs/architecture-analysis/consolidated/diagrams/*.puml`; inspect each generated PNG for layout and compare it with the written model. No software was installed for this correction. No application tests were run or claimed.

The requested branch `documentation/diagram-quality-fixes` was absent locally and remotely. Approval to create/switch to it was rejected, so edits were made on the existing `main` branch; no commit, push, or merge was performed. Review-policy eligibility, self-approval, pending-expense policy changes, currency rules, and payment locking/isolation remain open as recorded in the decision register. The Story 3 overpayment wording still requires product-owner reconciliation; the Swing MVP remains outside complete web/Android/iOS scope.
