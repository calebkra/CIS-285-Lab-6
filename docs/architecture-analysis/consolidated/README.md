# SplitSmart consolidated architecture and design

**Status:** recommended reference package; proposal only. It does not record an implementation, stakeholder approval, or completed verification.

This documentation consolidates the independent Spec Kit and Codex analyses against [`UserRequirement.md`](../../../UserRequirement.md), the [feature specification](../../../specs/001-expense-sharing/spec.md), and the [project constitution](../../../.specify/memory/constitution.md). The original analysis packages remain unchanged.

## Evidence labels

- **Required:** stated by customer source or binding constitution.
- **Verified:** directly observed in this repository or environment.
- **Proposed:** recommended design, not selected or implemented.
- **Assumption:** temporary premise needing confirmation.
- **Open:** stakeholder decision outstanding.

The Java 21/Maven/Swing/JUnit 5 desktop MVP is a project implementation direction. The complete customer product additionally requires web, Android, and iOS clients with shared authorized data. The MVP does not meet that platform requirement. A shared service/API, database, cloud, identity provider, or application is not verified as implemented or selected.

## Documents

- [Architecture analysis](architecture-analysis.md): boundaries, components, transaction and security approach.
- [Design analysis](design-analysis.md): domain behavior, financial rules, reliability, and invariants.
- [Deployment analysis](deployment-analysis.md): distinct proposed release/operations models for desktop and complete product.
- [Requirements traceability](requirements-traceability.md): all FR, NFR, AC, SC, customer inventory mapping, diagrams, and validation scenarios.
- [Data model](data-model.md): conceptual records, relationships, constraints, and transaction scopes.
- [Decision register](decision-register.md): recommendations and unresolved decisions; no approvals are fabricated.
- [Validation plan](validation-plan.md): future test scenarios and current evidence status.
- [Source comparison](source-comparison.md): contributions retained and reconciled.
- [Product contract](contracts/product-api.md): proposed logical capabilities, not a selected wire protocol.

## Diagrams

All diagrams use PlantUML source. Every proposed component is labeled as such in context.

- [System context](diagrams/system-context.puml) — actors, product boundary, external dependencies.
- [Use cases](diagrams/use-case.puml) — user goals across the product.
- [Component architecture](diagrams/component-architecture.puml) — desktop layers and proposed shared-service logical components.
- [Expense submission activity](diagrams/activity-expense-approval.puml) — validation, pending review, and approval decision flow.
- [Expense submission sequence](diagrams/sequence-expense-submission.puml) — command, transaction, and post-commit notice intent.
- [Expense lifecycle](diagrams/state-expense-lifecycle.puml) — required pending/approved/rejected lifecycle.
- [Domain classes](diagrams/domain-class.puml) — core financial and membership concepts.
- [Logical data model](diagrams/data-model.puml) — proposed durable records and cardinalities.
- [Balance and settlement](diagrams/balance-settlement.puml) — expense postings, payer credit, shares, payments, and due amount.
- [Deployment topology](diagrams/deployment.puml) — separate MVP and complete-product deployment proposals.
- [Trust boundaries](diagrams/trust-boundaries.puml) — client, service, identity, persistence, receipt and notification boundaries.
- [Expense and receipt data flow](diagrams/data-flow.puml) — submission, transactional commit, private receipt, and asynchronous notification paths.

## Validation status

The Markdown local-link check passed. PlantUML rendering and visual inspection remain mandatory and outstanding: Java, Maven, PlantUML, and Graphviz were not found on PATH, and a local PlantUML JAR was not found in the checked locations. Sources received only a framing check; no parser or rendered output was available. Therefore this package is not fully validated. See [validation plan](validation-plan.md). No tests are claimed as run.
