# Feature Specification: SplitSmart Expense Sharing

**Feature Branch**: `not-created (no branch hook configured)`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Read UserRequirement.md in this workspace as the authoritative customer requirements. Write a testable SplitSmart feature specification: actors, user scenarios, functional and non-functional requirements, acceptance criteria, requirement IDs (FR-001, etc.), and open questions. Preserve all original customer features in the requirements inventory; label the Java Swing MVP subset separately. Do not write Java code. Do not edit UserRequirement.md."

## Actors

- **Individual user**: Creates an account, joins groups, records expenses and payments,
  and reviews personal expenses and balances.
- **Group organizer**: Creates and manages a group and its membership.
- **Expense submitter**: A group member who records and submits an expense.
- **Expense approver**: A group member authorized by the group to review an expense.
  An organizer may also be an approver.
- **Notification recipient**: A group member who receives notice of a submitted expense.

## Clarifications

### Session 2026-10-29

- Q: Can the person who paid for an expense be different from the people sharing it? → A: Record one payer separately from participants; the payer may or may not be a participant.
- Q: Must an expense's payer and every participant be members of the group when it is submitted? → A: The payer and all participants must be current group members.
- Q: How should SplitSmart validate expense amounts and percentage splits, and allocate rounding differences? → A: Reject nonpositive amounts and percentage totals other than exactly 100%; allocate leftover smallest currency units by largest fractional share, breaking ties by participant selection order.
- Q: What should SplitSmart do when a user tries to pay more than they currently owe another group member? → A: Allow partial payments up to the outstanding amount; reject any excess with the remaining amount due.
- Q: How should a person create and sign in to a SplitSmart account? → A: Use a unique email address and password, require email verification, and provide password recovery.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record and approve a shared expense (Priority: P1)

A group member records an expense with its amount, date, description, split method,
participants, payer, and optional receipt. The configured reviewer or reviewers decide
whether it can affect group balances.

**Why this priority**: Expense entry and approval provide the source data for accurate
shared balances.

**Independent Test**: Submit an expense for a test group, verify it awaits review and does
not change balances, then approve it and verify its shares and balances.

**Acceptance Scenarios**:

1. **Given** a member of a group, **When** they submit a complete expense split equally
   among selected participants, **Then** it is recorded as pending review and balances
   remain unchanged.
2. **Given** an expense awaiting approval, **When** all required approvers approve it,
   **Then** it becomes part of the group's expense history and its shares update balances.
3. **Given** an expense awaiting approval, **When** an authorized reviewer rejects it,
   **Then** it does not affect balances and the submitter can see the decision.

### User Story 2 - Manage an account and group (Priority: P1)

A person creates and uses their own account, creates or joins a group, and manages group
membership to keep shared activity organized.

**Why this priority**: Users and groups establish who can participate in shared expenses.

**Independent Test**: Create two accounts, create a group with one account, add the other,
and verify both group members can access the group's shared view while unrelated accounts
cannot.

**Acceptance Scenarios**:

1. **Given** a person without an account, **When** they create an account and sign in,
   **Then** they can access their own expense and balance information.
2. **Given** a signed-in user, **When** they create a group and add another user,
   **Then** both users are listed as group members.
3. **Given** a user who is not a member of a group, **When** they attempt to view that
   group's records, **Then** access is denied.

### User Story 3 - Settle and review balances (Priority: P1)

A member reviews who owes whom, records a payment, and sees the remaining balance
accurately reflected.

**Why this priority**: Settlement is the practical outcome of tracking shared expenses.

**Independent Test**: Approve an expense that creates an amount owed, record a partial
payment, and verify the remaining amount; then record the remainder and verify settlement.

**Acceptance Scenarios**:

1. **Given** approved expenses between group members, **When** a member opens the balance
   view, **Then** it shows the net amount owed by each user to each other user.
2. **Given** an outstanding balance, **When** the owing user records a payment to the
   receiving user, **Then** the payment is recorded and the remaining balance is reduced
   by that amount.
3. **Given** a payment greater than the outstanding amount, **When** the user attempts to
   record it, **Then** the system rejects it or explicitly records an overpayment without
   silently showing the debt as settled. The selected behavior is an open question.

### User Story 4 - Receive expense notices (Priority: P2)

A group member is notified when another group member submits an expense, so they can
review the activity and respond when required.

**Why this priority**: Timely awareness helps groups review expenses and maintain trust.

**Independent Test**: Submit an expense as one group member and verify other group members
receive a notice identifying the new expense and its review status.

**Acceptance Scenarios**:

1. **Given** a group with multiple members, **When** one member submits an expense,
   **Then** other group members receive a notification that a new expense awaits review.
2. **Given** a group member who submitted the expense, **When** the expense is submitted,
   **Then** that submitter is not sent a duplicate "another member" notification.

### User Story 5 - Review expense, balance, and payment reports (Priority: P2)

A member reviews summaries of expenses, balances, and payments and can request a report
for a selected date range and other available filters.

**Why this priority**: Reports help users understand shared spending and settlement history.

**Independent Test**: Create expenses and payments with different dates and participants,
then verify summary totals and a report constrained to a chosen date range.

**Acceptance Scenarios**:

1. **Given** a user with expense, balance, and payment activity, **When** they request a
   summary, **Then** it reports those categories using the user's authorized data.
2. **Given** a custom report request with a date range, **When** the report is generated,
   **Then** only records in the inclusive selected range are included.

### User Story 6 - Use SplitSmart on the required platforms (Priority: P3)

A user accesses SplitSmart through its primary web experience or a supported Android or
iOS app and can use the product's supported account and expense features.

**Why this priority**: The customer requires a primarily web-based product as well as
Android and iOS apps; the initial Java Swing MVP does not fulfill these platforms.

**Independent Test**: Verify the agreed production feature set on the web, Android, and
iOS target platforms, including access to the same user's authorized records.

**Acceptance Scenarios**:

1. **Given** a user with an account, **When** they sign in through each supported target
   platform, **Then** they can access the account's authorized SplitSmart information.
2. **Given** an expense change made on one supported platform, **When** the user accesses
   the account on another supported platform, **Then** the change is reflected there.

### Edge Cases

- Reject an expense with a zero or negative amount, missing required description or date,
  no participants, or a payer or participant who is not a current group member.
- Reject percentage splits that do not total exactly 100%. For equal and percentage splits,
  allocate leftover smallest currency units to the largest fractional shares, breaking ties
  by participant selection order; shares must total the expense amount.
- Do not notify non-members or expose a receipt to a person without group access.
- Do not apply a pending or rejected expense to balances; require all configured approvals
  before applying an expense.
- Reject duplicate, zero, negative, or otherwise invalid payment entries and reject any
  payment exceeding the outstanding amount between the two users.
- Handle an empty report period, invalid date range, and filters that match no records.
- Preserve access restrictions when a user leaves a group or is removed from it; retention
  and post-removal access are open questions.

## Requirements *(mandatory)*

### Customer Requirements Inventory

The following inventory preserves the customer-requested scope from `UserRequirement.md`.
These are customer requirements, not implementation decisions.

| Customer feature | Requirement coverage |
|---|---|
| Individual user accounts, login, and access to own expense and balance information | FR-001, FR-002 |
| Create and manage groups of people | FR-003 |
| Create expenses with amount, date, description, equal or percentage splits, optional receipt, and involved users | FR-004 through FR-007 |
| Notify users when another group member creates an expense | FR-010 |
| Review and approve expenses before they are included and change balances; support group needs for one or more review levels | FR-008, FR-009 |
| Track amounts owed by each user to every other user from entered expenses | FR-011 |
| Record payments and update balances | FR-012 |
| Summaries and reports of expenses, balances, and payments; custom date ranges and parameters | FR-013, FR-014 |
| Primarily web-based product and apps for Android and iOS | FR-015 |

### Functional Requirements

- **FR-001**: The system MUST allow each person to create an individual account and
  authenticate to it using a unique email address and password. The system MUST require
  email verification and provide a password recovery process.
- **FR-002**: After authentication, the system MUST provide each user access to their own
  expense and balance information and prevent access by unrelated accounts.
- **FR-003**: The system MUST allow authorized users to create and manage groups and their
  membership.
- **FR-004**: The system MUST allow a group member to record an expense with an amount,
  date, description, payer, and optional receipt image. Each expense MUST have exactly
  one payer, recorded separately from its participants; the payer MUST be a current
  member of the group.
- **FR-005**: The system MUST allow an expense submitter to select the group members who
  participated in an expense. The payer MUST be allowed to be either included in or
  excluded from the participant list.
- **FR-006**: The system MUST support equal and percentage-based expense splits and show
  each participant's share.
- **FR-007**: The system MUST validate that an expense has a positive amount, required
  details, valid group participants, and a valid split; zero and negative amounts MUST be
  rejected, and percentage shares MUST total exactly 100%.
- **FR-008**: The system MUST keep submitted expenses out of approved expense history and
  balance calculations until approval requirements are met.
- **FR-009**: The system MUST allow a group to use a single approval step or multiple
  approval steps before an expense changes group balances. An authorized reviewer MUST
  be able to approve or reject a pending expense, and the submitter MUST be able to see
  its decision.
- **FR-010**: When a group member submits an expense, the system MUST notify other members
  of that group of the new expense and its review status.
- **FR-011**: The system MUST calculate and display amounts owed by each user to every
  other user using approved expenses and recorded payments. For an approved expense, the
  payer is credited for the amount paid and participants are assigned their shares;
  resulting balances MUST account for whether the payer is also a participant.
- **FR-012**: The system MUST allow a user to record a partial or full payment between
  group members up to the outstanding amount and update the corresponding balance. The
  system MUST reject a payment greater than the amount currently owed between those users
  and show the remaining amount due.
- **FR-013**: The system MUST provide summaries of a user's authorized expenses, balances,
  and payments.
- **FR-014**: The system MUST allow users to generate reports with a selected date range
  and other available parameters.
- **FR-015**: The complete customer product MUST be primarily web-based and MUST also
  provide apps that run on Android and iOS. The Java Swing MVP described below does not
  satisfy this cross-platform requirement.
- **FR-016**: The system MUST retain account, group, expense, approval, balance, and payment
  records across sign-out and subsequent sign-in.

### Non-Functional Requirements

- **NFR-001**: The system MUST restrict personal and group information to authenticated
  users authorized to access it; a non-member MUST NOT view a group's private expenses,
  balances, payments, or receipts.
- **NFR-002**: Expense shares and balances MUST preserve the full expense amount to the
  smallest supported currency unit; rounding MUST NOT silently create or lose value.
- **NFR-003**: For the agreed target workload of up to 100 members in a group, at least
  95% of ordinary account, group, expense, balance, and report-view actions MUST complete
  within 2 seconds, excluding external notification delivery.
- **NFR-004**: The product's account, group, and expense flows MUST be usable with keyboard
  navigation and provide an understandable message when an action is invalid or denied.
- **NFR-005**: The complete product MUST provide access on each customer-required platform
  listed in FR-015; platform availability MUST be verified separately for web, Android,
  and iOS.

### Java Swing MVP Subset (Implementation Decision)

The first implementation slice is a Java Swing desktop MVP. This is an implementation
decision, not a customer requirement and not evidence that the customer-requested web,
Android, or iOS platforms have been delivered.

The MVP subset covers individual accounts and sign-in; group creation and membership;
expense entry with equal or percentage splits and optional receipts; a single or
configurable multi-step approval workflow; in-app notices for submitted expenses;
approved-expense balance tracking; payment recording; and expense, balance, and payment
summaries with date-range filtering. It excludes delivery of the web product and Android
and iOS apps. Each excluded platform remains in the customer requirements inventory and
must be addressed by a separately planned product increment.

### Acceptance Criteria

- **AC-001 (FR-001, FR-002)**: Creating two accounts and signing in to each shows each
  account's own information; an account cannot open another unrelated account's records.
  An unverified email cannot access account information, duplicate email addresses are
  rejected, and a user can recover access through the password recovery process.
- **AC-002 (FR-003)**: An authorized user can create a group, add and remove members, and
  see the resulting membership; a non-member cannot view the group's records.
- **AC-003 (FR-004)**: A submitted expense displays its entered amount, date, description,
  payer, and receipt when one is attached; an expense without a receipt can still be
  submitted. Submission is rejected if the payer is not a current group member.
- **AC-004 (FR-005, FR-007)**: An expense can include only current members of its group;
  its payer may or may not be among its participants but must also be a current group
  member. Submission is rejected with a clear message when required details or valid
  group members are missing.
- **AC-005 (FR-006, NFR-002)**: For equal and percentage splits, displayed participant
  shares add to the original amount at the smallest supported currency unit. Any leftover
  smallest units go to participants by descending fractional share, with participant
  selection order breaking ties; zero or negative amounts and percentages not totaling
  exactly 100% are rejected.
- **AC-006 (FR-008, FR-009)**: Before all required approvals, an expense is pending and
  changes no balance. Approval adds it to approved history and updates balances; rejection
  leaves balances unchanged and the submitter can see the result.
- **AC-007 (FR-010)**: After submission, every other member of the group receives an
  in-app notice with enough information to identify the new expense and its review state;
  non-members and the submitter receive no such notice.
- **AC-008 (FR-011)**: After approval, the balance view credits the payer for the amount
  paid, assigns each participant their share, and shows the resulting net amount owed
  between users, including when the payer is or is not a participant. Recorded payments
  are reflected in those balances.
- **AC-009 (FR-012)**: Recording a partial or full payment no greater than the outstanding
  amount adds a payment record and reduces that balance by the payment amount. A payment
  greater than the outstanding amount is rejected with a clear message showing the amount
  due; a full payment sets the balance to zero.
- **AC-010 (FR-013, FR-014)**: A user can view expense, balance, and payment summaries and
  generate a report for a selected inclusive date range and supported parameters; records
  outside the range are excluded.
- **AC-011 (FR-015, NFR-005)**: The agreed production feature set can be used on web,
  Android, and iOS, with a user's authorized expense changes visible across those
  platforms. The Swing MVP alone does not pass this criterion.
- **AC-012 (FR-016)**: After signing out and signing back in, a user can still retrieve
  previously saved authorized account, group, expense, approval, balance, and payment data.
- **AC-013 (NFR-001)**: A non-member attempting to access group expenses, balances,
  payments, or receipts is denied access.
- **AC-014 (NFR-003)**: Under the agreed 100-member-group test workload, at least 95 of
  every 100 measured ordinary supported actions complete within 2 seconds.
- **AC-015 (NFR-004)**: A user can complete account, group, and expense flows using
  keyboard navigation, and invalid or denied actions produce an understandable message.

### Key Entities

- **User account**: An individual identity with a unique email address, password,
  verification status, and access to authorized personal and group information.
- **Group**: A named collection of users with membership and expense-review settings.
- **Expense**: A group's submitted record containing an amount, date, description,
  submitter, one payer, participants, split method, optional receipt, and review status.
- **Expense share**: The portion of an expense assigned to a participant.
- **Approval**: A reviewer's decision on a submitted expense and its place in the group's
  configured review sequence.
- **Balance**: The net amount one user owes another based on approved shares and payments.
- **Payment**: A record of a transfer between group members that settles an outstanding
  balance.
- **Notification**: A notice to group members about an expense submitted by another member.
- **Report**: A summary or filtered view of authorized expense, balance, and payment data.

### Open Questions

These questions do not prevent planning the Java Swing MVP; their proposed defaults are
recorded as assumptions until stakeholders decide otherwise.

1. Which delivery channels are required for notices beyond in-app notifications
   (email, push, or both)?
2. Who may approve expenses, and how should a group configure multiple approval levels?
   Proposed default: the group organizer selects eligible reviewers and the required
   approval count before expenses are submitted.
3. Which additional report parameters are required beyond inclusive date range?
   Proposed default: group, participant, expense category if introduced, and payment status.
4. What access and retention rules apply to records after a user leaves or is removed from
   a group? Proposed default: preserve historical records for remaining authorized group
   members and deny future group access to the departed member.
5. How will the primarily web-based product and Android/iOS apps be sequenced and share
   account data after the Swing MVP? This remains a product-planning decision.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability testing, at least 9 of 10 new users create an account, join or
  create a group, and submit a valid shared expense without assistance within 10 minutes.
- **SC-002**: In all valid equal and percentage split test cases, participant shares total
  the original expense amount exactly to the smallest supported currency unit, using the
  specified remainder rule; nonpositive amounts and invalid percentage splits are rejected
  in every test case.
- **SC-003**: Zero pending or rejected expenses change a group's displayed balances in
  approval workflow tests.
- **SC-004**: At least 95% of notices for submitted expenses reach other group members
  within 60 seconds under the agreed test conditions.
- **SC-005**: At least 95% of ordinary supported user actions complete within 2 seconds
  under the 100-member-group workload defined by NFR-003.
- **SC-006**: In acceptance tests, expense, balance, and payment totals in a report match
  the underlying authorized records for every tested date range and filter.
- **SC-007**: Before release of the complete product, the agreed production feature set
  passes platform acceptance tests on web, Android, and iOS; desktop MVP results do not
  count as platform coverage.
- **SC-008**: At least 8 of 10 usability-test participants rate the clarity of expense,
  approval, and balance workflows 4 or 5 on a 5-point scale.

## Assumptions

- The original customer request in `UserRequirement.md` is authoritative; this
  specification does not amend it.
- A user may belong to multiple groups, and group records are visible only to authorized
  members.
- A group organizer can configure the group's review policy; a submitted expense is not
  included in balances until all configured approvals are complete.
- Each expense records exactly one payer independently of the participant list; the payer
  may be included in or excluded from the participants, but must be a current group member.
- Expense amounts are positive values in one currency per expense. Multi-currency
  conversion is not in the original request and is outside this specification.
- Equal and percentage splits allocate leftover smallest currency units by largest
  fractional share, with participant selection order breaking ties.
- The Java Swing MVP is a desktop implementation slice only. The customer-requested
  primarily web-based product and Android/iOS apps remain unfulfilled until separately
  delivered and verified.
- The 100-member workload and response-time targets are initial measurable defaults and
  may be revised by stakeholders before planning.
- The MVP includes in-app notices; external email or mobile push delivery is not assumed.
