# SplitSmart Architecture Analysis

## Purpose and scope

This package is an independent, documentation-only architecture and deployment proposal based on `UserRequirement.md`, `specs/001-expense-sharing/spec.md`, and `.specify/memory/constitution.md`. It does not amend those sources, implement application behavior, or constitute release approval.

The package keeps two scopes distinct:

1. **Java Swing MVP**: Java 21, Maven, Swing presentation, GUI-independent business logic, and JUnit 5. The repository currently contains no application source, Maven project, persistence adapter, or deployment configuration. Proposed elements below are not claims about existing code.
2. **Complete customer product**: a primarily web-based product plus Android and iOS apps, sharing authorized data through common services. The Swing MVP alone does not satisfy this platform requirement (FR-015, NFR-005, AC-011).

## Package contents

- [architecture-analysis.md](./architecture-analysis.md) — boundaries, architecture, decisions, quality attributes, risks, and security.
- [design-analysis.md](./design-analysis.md) — domain model and business behavior.
- [deployment-analysis.md](./deployment-analysis.md) — separate MVP and complete-product deployment proposals.
- [requirements-traceability.md](./requirements-traceability.md) — source requirements, decisions, components, diagrams, and verification.
- [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), and [contracts/product-api.md](./contracts/product-api.md) — Spec Kit research/design support artifacts.
- [diagrams/](./diagrams/) — editable PlantUML source.

The Spec Kit implementation-plan file is at `specs/001-expense-sharing/plan.md`; it points to this package. No tasks were generated because this assignment is an analysis, not an implementation request.

## PlantUML

The `.puml` files are source artifacts. With a local PlantUML installation, render from the repository root, for example:

```powershell
plantuml -tpng docs\architecture-analysis\spec-kit\diagrams\*.puml
```

Rendering was not performed for this analysis: PlantUML, Java, and Maven were not available in the environment. The diagrams were checked for source framing, titles, scope labels, references, and consistency with the text; this is not equivalent to parsing or rendering them with PlantUML.

## Evidence labels

- **Verified** means directly present in the repository or environment inspected.
- **Derived** means required by an authoritative requirement or follows from it.
- **Proposed** means a recommended design, not an existing implementation.
- **Assumption** means a working premise used to make the proposal actionable.
- **Open decision / human approval** means a stakeholder must choose or approve the behavior or investment.

Repository evidence confirms the requirement/specification/constitution files and Spec Kit templates/scripts. No Java files, `pom.xml`, source tree, or runtime/deployment configuration were found. The separate Codex analysis was not read or used.

## Assumptions, limitations, and approvals

Key working assumptions are single-currency expenses, current membership authorization at the time of each action, stable user identifiers for historical records, and a server-authoritative record for the complete multi-user product. These are not new customer requirements; see [architecture-analysis.md](./architecture-analysis.md) and [design-analysis.md](./design-analysis.md).

Important decisions requiring human approval include whether the Swing MVP needs shared server-side collaboration or is a local demonstration; storage and hosting choices; identity and recovery provider; policy for submitter self-approval and multi-step approval; data retention after group removal; report date/time semantics; receipt retention; and the sequence/budget for web, Android, and iOS delivery. No vendor, security certification, production environment, or measured performance result is asserted.

One specification inconsistency remains visible for review: User Story 3, Acceptance Scenario 3 calls overpayment behavior an open question, while FR-012, AC-009, and the clarifications require rejecting overpayment. This proposal follows the latter, explicit rule and asks the specification owner to reconcile the stale scenario.

## Status

This is a proposed architecture/design/deployment analysis. It is not proof of implementation, customer acceptance, security certification, platform coverage, or the NFR performance targets. See the completion report in the accompanying chat for checks performed and items not validated.
