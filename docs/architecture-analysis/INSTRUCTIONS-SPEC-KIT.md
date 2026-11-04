# SplitSmart Architecture, Design, and Deployment Analysis — Spec Kit

## Objective

Produce a complete, evidence-based architecture, design, and deployment analysis for SplitSmart. This is a documentation and analysis effort only. Do not implement application features or modify application source code. This independent proposal will later be compared with a separate Codex-generated proposal.

## 1. Required Repository Context

Read and understand:
1. `UserRequirement.md` — authoritative customer requirements.
2. `specs/001-expense-sharing/spec.md` — feature specification, functional and non-functional requirements, acceptance criteria, user stories, entities, and open questions.
3. `.specify/memory/constitution.md` — mandatory project principles and technical constraints.
4. Existing `.specify` templates, scripts, and Spec Kit skills relevant to planning and design.
5. Existing source code and project configuration, if present.

Do not edit `UserRequirement.md`, the constitution, or the feature specification.

Treat the constitution as binding:
- Use Java 21, Maven, Java Swing, and JUnit 5 when describing the current desktop MVP.
- Separate presentation from business logic; GUI-independent services own business rules.
- Use `BigDecimal` for money; never use floating-point types for monetary calculations.
- Define explicit monetary rounding behavior and test split/balance rounding.
- Use PlantUML source for diagrams.
- Preserve requirement traceability and require human review of AI-generated work.

## 2. Scope and Architecture Boundaries

Analyze two distinct scopes.

### A. Java Swing MVP
Describe an architecture appropriate to the current implementation decision:
- Java 21 desktop application, Maven build, Swing presentation, GUI-independent domain and business-service layers, persistence/data-access responsibilities, and JUnit 5 testing.
- Cover expense, approval, group, balance, payment, notification, and reporting responsibilities.
- Do not invent an existing database, framework, persistence mechanism, or implementation detail. Label unknowns as recommendations or unresolved decisions.

### B. Complete Customer Product
Separately analyze the customer-required product:
- Primarily web-based application, Android application, and iOS application.
- Shared identity, group, expense, approval, balance, payment, and reporting capabilities.
- Consistent authorized data across supported platforms.
- Explain shared services and domain capabilities versus platform-specific presentation and deployment components.

Do not claim the Swing MVP fulfills web/mobile requirements. Identify architectural work and delivery decisions needed to meet them.

## 3. Spec Kit Workflow

1. Run applicable prerequisite/setup checks.
2. Review the feature specification and constitution.
3. Use `/speckit-plan` to develop technical research, design decisions, and data model.
4. Create the architecture, design, deployment, and diagram documentation below.
5. Use `/speckit-analyze` only when its prerequisites are satisfied. It is a read-only consistency check across spec, plan, and tasks; do not create artificial tasks just to satisfy it.
6. Do not run `/speckit-implement` for this documentation-only assignment.
7. Do not commit, push, or merge changes.

If a Spec Kit command cannot run because prerequisites are missing, document the limitation and continue with the available workflow. Do not fabricate command results.

## 4. Required Deliverables

Create the package under `docs/architecture-analysis/spec-kit/`.

### README.md
Explain purpose and scope, package contents, PlantUML viewing/rendering, assumptions, limitations, unresolved decisions, and which architecture applies to the Swing MVP versus the complete product.

### architecture-analysis.md
Include:
- Executive summary, system context/boundaries, stakeholders, actors, and external systems.
- Architectural drivers and quality attributes.
- Functional and non-functional requirements influencing architecture.
- Proposed logical architecture, layer responsibilities, component responsibilities, and interactions.
- Key architectural decisions, rationale, and alternatives.
- Security, privacy, authorization, and data ownership.
- Error handling, logging, auditability, and observability.
- Scalability, maintainability, testability, reliability, risks, trade-offs, and open questions.

### design-analysis.md
Include:
- Domain model, entity responsibilities, and relationships for users, groups, memberships, expenses, expense shares, approvals, balances, payments, notifications, and reports.
- Important service and interface responsibilities.
- Expense submission and approval behavior.
- Equal and percentage split behavior.
- Monetary precision and rounding, including largest-fractional-share remainder allocation and participant-selection-order tie-break.
- Balance calculation and payment settlement behavior.
- Validation, authorization, persistence, transaction, and test considerations.
- Design patterns only when they solve an identified problem.

Do not invent detailed class implementations or claim proposed classes already exist.

### deployment-analysis.md
Provide separate deployment analyses for (1) Java Swing desktop MVP and (2) complete web, Android, and iOS product. Cover runtime environments, deployment units, client/server boundaries, services, data and receipt-image storage, authentication/authorization, notifications, network/trust boundaries, configuration, build/packaging/release/update strategy, backup/recovery, monitoring, operations, security controls, and risks. Label all proposed infrastructure and technology choices; do not present recommendations as existing infrastructure.

### requirements-traceability.md
Map relevant customer requirements and FR/NFR/AC IDs to architecture decisions, design elements, components/services, relevant diagrams, and verification/test approaches. Explicitly identify requirements not fulfilled by the Swing MVP, especially web, Android, and iOS.

## 5. UML and Architecture Diagrams

Create editable PlantUML source files under `diagrams/`. At minimum:
1. `use-case.puml` — actors and system interactions.
2. `activity-expense-approval.puml` — submission, validation, approval/rejection, and balance effects.
3. `sequence-expense-submission.puml` — presentation, services, domain logic, and persistence interaction.
4. `state-expense-lifecycle.puml` — expense lifecycle and valid transitions.
5. `domain-class.puml` — principal domain entities, relationships, and service boundaries.
6. `data-model.puml` — proposed data entities, keys where proposed, cardinalities, and constraints.
7. `component-architecture.puml` — major components and dependencies.
8. `deployment.puml` — distinct MVP and complete-product views; use separate diagrams if clearer.

Add diagrams when they materially clarify the design, such as package, system-context, trust-boundary, or payment-settlement diagrams.

Every diagram must:
- Use valid PlantUML syntax and have a descriptive title.
- Identify whether it represents the current MVP, proposed future product, or both.
- Use terminology consistent with the documents.
- Avoid implying proposed components already exist.
- Be referenced from at least one document and checked against related diagrams.

Retain editable `.puml` sources. Render diagrams when tools are available; report rendering limitations honestly.

## 6. Evidence, Assumptions, and Decisions

For every significant recommendation, state whether it is:
- Verified from repository evidence.
- Derived from a requirement.
- Proposed.
- An assumption.
- An unresolved decision.

Explain rationale and alternatives where appropriate. Reference repository paths and requirement IDs wherever practical.

Do not fabricate existing source files/classes, database schemas, infrastructure, API endpoints, performance measurements, security certifications, or completed implementation/test results.

## 7. Quality Review

Before reporting completion:
- Verify required documents and diagram sources exist.
- Check PlantUML syntax and render where tooling permits.
- Check diagram/document consistency, requirement references, and traceability.
- Confirm monetary handling follows the constitution and specification.
- Keep Swing MVP and complete customer product distinct.
- Identify unresolved questions and architecture risks.
- Run available non-destructive Spec Kit checks when prerequisites are met.
- Do not modify application code, customer requirements, or constitution.
- Do not commit or push.

## 8. Completion Report

Report files created; diagrams created, rendered, and validated; important decisions; assumptions and open questions; requirement coverage and platform gaps; validation performed and checks not run.

The output is a proposed architecture/design/deployment analysis, not implementation approval or proof of requirement fulfillment.
