# Spec Kit Research and Decisions

**Feature**: `001-expense-sharing`
**Input**: `specs/001-expense-sharing/spec.md`
**Evidence basis**: repository review only; no external architecture or vendor claims were used.

## Repository findings

| Finding | Evidence | Consequence |
|---|---|---|
| Customer scope includes user accounts, groups, expenses, approvals, notifications, balances, payments, reporting, and web/Android/iOS. | `UserRequirement.md`; FR-001–FR-016 | The product architecture must distinguish the desktop MVP from required cross-platform delivery. |
| Java 21, Maven, Swing, JUnit 5, GUI-independent business rules, `BigDecimal`, and PlantUML are binding project constraints. | `.specify/memory/constitution.md` | Use these for the desktop MVP and its tests; do not infer a future platform stack from them. |
| Expense payer may be outside the participant list; payer and participants must be current group members. | Spec clarifications; FR-004–FR-007 | Model payer independently from participant shares and validate both against group membership. |
| Splits require positive amount; percentage total exactly 100%; rounding remainder goes by largest fractional share, then participant selection order. | Spec clarifications, Edge Cases, AC-005, SC-002; constitution III | Use exact decimal/minor-unit arithmetic and deterministic allocation. |
| Only fully approved expenses affect approved history and balances; overpayment is rejected. | FR-008–FR-012, AC-006, AC-009 | Approval completion and ledger posting must be atomic; payment validation must be authoritative. |
| No product implementation is present in the inspected worktree. | Repository file inventory: no `.java`, `pom.xml`, Maven wrapper, or deployment files | All architecture components, storage, and infrastructure in this package are recommendations, not existing assets. |
| Spec Kit setup selected feature directory `specs/001-expense-sharing` and plan path `specs/001-expense-sharing/plan.md`. | `.specify/scripts/powershell/setup-plan.ps1 -Json` output | The plan is linked from the analysis package; no task generation or implementation was performed. |

## Decisions and alternatives

### D1. Preserve two architecture scopes

- **Decision**: Describe the Java Swing MVP separately from the complete web, Android, and iOS product.
- **Rationale**: FR-015, NFR-005, AC-011, and the constitution explicitly state the Swing implementation does not satisfy the required platforms.
- **Alternatives considered**: Treating the desktop app as the complete product was rejected because it contradicts the requirements. A shared-domain evolution path is described without claiming shared code already exists.
- **Status**: Derived requirement; human review still required.

### D2. Keep desktop UI separate from business rules

- **Decision**: Swing presentation calls GUI-independent application/domain services; domain behavior does not depend on Swing.
- **Rationale**: Binding constitutional requirement II and testability of split, approval, and balance rules.
- **Alternatives considered**: Performing calculations in event handlers is prohibited by the constitution.
- **Status**: Verified project constraint.

### D3. Use a server-authoritative data boundary for the complete product

- **Decision**: Web, Android, and iOS clients communicate with shared authenticated services; shared authorization and persisted records are server-owned.
- **Rationale**: AC-011 requires cross-platform access to the same user's authorized records; NFR-001 requires access control across private group data. Independent client-local databases cannot by themselves provide that consistency.
- **Alternatives considered**: Client-specific storage and direct client-to-database access were rejected because they duplicate authority and weaken consistent authorization. A backend product/API is proposed, not verified or selected.
- **Status**: Derived architecture recommendation; backend technology, hosting, and MVP applicability require approval.

### D4. Treat money and balances as exact domain values and ledger effects

- **Decision**: Use `BigDecimal` at application boundaries and integer minor units for deterministic allocation/postings where currency scale is fixed; document supported currency scale before implementation. Record approved expense effects and payments as the source for balances; balance views may be calculated or materialized projections.
- **Rationale**: Constitution III, NFR-002, AC-005, AC-008, and AC-009. The expense and payment history must reconcile exactly.
- **Alternatives considered**: Floating point and a manually edited balance as sole source of truth are rejected. A mutable cached balance is acceptable only as a rebuildable projection.
- **Status**: BigDecimal and no floating point are binding; minor-unit ledger and projection are proposed.

### D5. Use relational transaction boundaries for shared state

- **Decision**: Prefer a transactional relational persistence adapter for accounts, membership, expenses, approval decisions, and payment/ledger posting. Keep receipt bytes in access-controlled file/object storage, referenced by metadata.
- **Rationale**: Membership authorization, approval completion, expense posting, and payment limits must remain consistent under concurrent requests. Receipt images have separate storage/lifecycle characteristics.
- **Alternatives considered**: A document-only store or receipt bytes embedded in each expense record may be viable under an approved scale, but require transaction, query, backup, and access-control evidence before selection.
- **Status**: Proposed; no database or object store exists in repository evidence. Select vendor/engine only after operational and privacy review.

### D6. Make notification delivery a post-commit side effect

- **Decision**: Persist a notification intent with the expense submission transaction, then deliver asynchronously with deduplication/retry. Exclude the submitter and recheck recipient authorization.
- **Rationale**: A committed expense must not be lost because delivery is temporarily unavailable; notifications must never disclose to non-members. SC-004 sets a 95%-within-60-seconds target under agreed test conditions.
- **Alternatives considered**: Sending before persistence risks a notice for a failed submission. Synchronous delivery couples core expense submission to an external channel.
- **Status**: Proposed. MVP channel is in-app only per the specification assumption; email/push remain open.

### D7. Do not select platform frameworks or providers without approval

- **Decision**: Keep complete-product client, API framework, identity provider, payment processor, notification vendor, cloud, and database vendor technology-neutral.
- **Rationale**: Requirements and current repository do not select them, and no existing infrastructure was found.
- **Alternatives considered**: Picking a stack now would create unsupported commitments and imply repository facts that do not exist.
- **Status**: Open decision for product/engineering/operations stakeholders.

## Clarification status and unresolved research

The feature specification has no `[NEEDS CLARIFICATION]` markers and its requirement checklist is complete. Remaining open questions are recorded, not silently resolved:

1. Does the Swing MVP need a central multi-user service, or is a local-only prototype acceptable? The stated account/group/notification behavior implies shared service if used by multiple remote users.
2. What is the approval policy: eligible approvers, required sequence/count, submitter self-approval, edits after review begins, and behavior when membership changes?
3. What identity/password recovery, email verification, session, and account deletion policy is acceptable?
4. Which deployment owner, hosting environment, data residency, backup retention, recovery objective, and monitoring requirements apply?
5. Which currencies and minor-unit scales are supported? What locale/time zone controls report date boundaries and displayed amount formatting?
6. What receipt file type/size limit, malware/content validation, retention, and deletion policy apply?
7. What report filters, exports, and authorization scopes are required?
8. What is the history-access/retention policy after departure or removal from a group?
9. Are external email/mobile push channels required, and what are the delivery/privacy expectations?
10. Which web/mobile features are release-critical, and what is their sequence and API compatibility policy?
11. What traffic, availability, recovery, offline, and concurrent-write targets supplement the 100-member group and two-second action objective?
12. Reconcile User Story 3 scenario 3 with FR-012 and AC-009: the scenario leaves overpayment behavior open, while the latter mandate rejection.

No separate tasks or code were generated to force unresolved decisions into false precision.
