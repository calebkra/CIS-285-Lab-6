# SplitSmart Architecture Validation Quickstart

This is a future validation guide, not a runnable application quickstart. No application source or Maven project currently exists, so commands and scenarios below are proposals for the implementation phase. Do not interpret them as test results.

## Prerequisites for a future Swing MVP

- Java 21 JDK.
- Maven and a project `pom.xml` once the implementation is created.
- JUnit 5 configured by the Maven project as required by the constitution.
- An approved persistence test environment and test data setup.
- PlantUML locally only when rendering diagrams.

## Proposed automated checks

From the future repository root:

```powershell
mvn test
mvn package
```

The first command should execute JUnit 5 unit and integration tests; the second should produce the approved desktop package after tests pass. Neither command can run in the current repository because no `pom.xml`, source, or test suite exists.

## Core scenario validation

1. **Account and access**: create two verified test accounts, create a group with one, add the second, and verify an unrelated account cannot view its expenses, balances, payments, reports, or receipts.
2. **Expense submission**: submit an equal split with payer among participants and another with payer outside participants. Confirm a pending expense, exact displayed shares, and no balance effect before all approvals.
3. **Percentage rounding**: test a currency amount producing fractional minor units; confirm largest remainder allocation, selection-order tie-break, and exact total preservation.
4. **Approval**: approve each configured step and confirm one posting only after all required approvals. Reject a separate expense and confirm it never affects balance. Test unauthorized and duplicate reviewer actions.
5. **Payment**: record partial then full settlement. Confirm remaining due and zero settlement; try an amount over the current due and verify rejection plus amount due.
6. **Notifications**: submit an expense and verify eligible other members receive the notice, the submitter does not receive a duplicate notice, and non-members cannot enumerate or open it.
7. **Reports and durability**: generate inclusive date-bound reports, compare totals to authorized source records, sign out/restart/sign back in, and verify records persist.
8. **Platform acceptance**: for the complete product, run the agreed scenario on web, Android, and iOS; change an expense on one platform and verify it becomes visible to the same authorized account on each other platform.

## Quality and acceptance checks

- Verify all split and balance tests use exact decimal/minor-unit logic, never floating point.
- Verify pending/rejected expenses have no ledger effects; inject persistence failures at final approval/payment and verify transaction rollback.
- Verify authorization at service boundaries rather than relying on client controls.
- Test keyboard-only account/group/expense flows and human-readable invalid/denied messages.
- Define the NFR-003 workload and environment before measuring whether at least 95% of actions complete within two seconds for groups of up to 100 members.
- Define the notification test conditions and measure the SC-004 95%-within-60-seconds target separately from ordinary actions.
- Record results and unresolved gaps; AI-generated implementation and test evidence require substantive human review.

## Not validated here

No Maven/JUnit test, app launch, persistence test, load test, security test, platform test, or PlantUML rendering was performed. No build/toolchain or application project was found. Diagram source checks and repository/worktree checks are reported separately in the completion summary.
