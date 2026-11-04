# SplitSmart independent architecture analysis

This package is an independent, documentation-only proposal based on `UserRequirement.md`, `specs/001-expense-sharing/spec.md`, and `.specify/memory/constitution.md`. It describes a Java Swing desktop MVP separately from the complete, customer-required web, Android, and iOS product. No component described here is verified as implemented unless explicitly labeled **Verified**.

## Package contents

- [Architecture analysis](architecture-analysis.md)
- [Design analysis](design-analysis.md)
- [Deployment analysis](deployment-analysis.md)
- [Requirements traceability](requirements-traceability.md)
- [PlantUML diagrams](diagrams/)

Diagrams are editable PlantUML sources. If PlantUML is installed, render an individual diagram with `plantuml diagrams/component-architecture.puml`; render all with `plantuml diagrams/*.puml`. Rendering was not available in the inspected environment, so no rendered images are included.

## Scope and evidence labels

**Verified** means directly supported by the inspected repository. **Required** means stated by a customer requirement, feature specification, or constitution. **Proposed** is a recommendation needing review. **Assumption** is a temporary design premise. **Open decision** needs stakeholder or developer input.

The Swing MVP is a desktop implementation decision and does not fulfill FR-015/NFR-005. The complete product requires shared authorized records across primarily web, Android, and iOS clients. The repository contains requirements and specifications but no application source, Maven descriptor, tests, database, API, or deployment configuration. The only confirmed implementation constraints are the constitution's Java 21, Maven, Swing, JUnit 5, and PlantUML requirements for applicable work.

## Assumptions and approvals

This proposal assumes expenses are single-currency records and balances are computed from approved expenses and payments. It does not assume a particular cloud, identity vendor, database, API protocol, notification provider, currency set, retention policy, or mobile/web stack. MVP persistence mode, review policy, payment evidence semantics, currency scale, service topology, data retention, recovery targets, and platform rollout require human decisions. See the analysis documents for the full register.
