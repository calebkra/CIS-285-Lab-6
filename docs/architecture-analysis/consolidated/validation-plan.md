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

At package authoring: repository branch `main`; working tree initially clean; no test suite/build found in repository inventory. A PowerShell check found no missing local Markdown link targets. All 12 new `.puml` files have one `@startuml` and one `@enduml`; this is framing only, not PlantUML parsing. `java`, `mvn`, `plantuml`, and `dot` were absent from PATH; checked local program locations did not reveal Java/PlantUML or a PlantUML JAR. No diagrams were rendered and no generated outputs were available to inspect. PlantUML syntax, rendering, readability, and visual agreement therefore remain unverified and are mandatory outstanding work. Do not interpret architecture coverage as implementation or test evidence.
