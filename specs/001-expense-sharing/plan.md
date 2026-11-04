# Implementation Plan: SplitSmart Architecture Analysis

**Branch**: `[001-expense-sharing]` (Spec Kit feature identifier; Git branch remains `main`) | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: `specs/001-expense-sharing/spec.md`, with `UserRequirement.md` authoritative for customer scope.

## Summary

Produce a documentation-only architecture, design, and deployment proposal. Preserve the Java 21/Maven/Swing/JUnit 5 MVP as a distinct implementation slice, and separately describe the customer-required shared web, Android, and iOS product. Apply GUI-independent business rules, exact money arithmetic, traceability, PlantUML, and explicit human-review gates. No application source changes, task generation, implementation, commit, or push are in scope.

## Technical Context

**Language/Version**: Java 21 is the binding desktop MVP constraint. Future shared service and web/mobile client languages/versions: NEEDS CLARIFICATION.

**Primary Dependencies**: Maven, Java Swing, and JUnit 5 are binding for the Swing MVP. Persistence, API, identity, receipt, and notification technologies: NEEDS CLARIFICATION.

**Storage**: No implementation exists. Recommend transactional shared persistence for collaborative behavior and separate private receipt storage; engine/provider and local-only-vs-service MVP decision: NEEDS CLARIFICATION.

**Testing**: JUnit 5 for Java MVP. Persistence/API/platform test frameworks and approved test environment: NEEDS CLARIFICATION.

**Target Platform**: MVP is a Java 21 Swing desktop application; supported desktop OS and packaging: NEEDS CLARIFICATION. Complete product must include web, Android, and iOS; versions/rollout: NEEDS CLARIFICATION.

**Project Type**: Documentation proposal for a desktop MVP plus a separately planned multi-client product. No source project is currently present.

**Performance Goals**: NFR-003 requires at least 95% of ordinary actions within 2 seconds for groups up to 100 members, excluding notification delivery. Workload, environment, and measurement method: NEEDS CLARIFICATION.

**Constraints**: Keep Swing presentation separate from business rules; use `BigDecimal`, explicit rounding and JUnit 5; no unsupported infrastructure claims. Currency set/scale, time zone, data retention, service availability, recovery targets, and offline behavior: NEEDS CLARIFICATION.

**Scale/Scope**: Feature spec targets groups up to 100 members for a latency test. Total accounts, groups, volume, availability, and growth: NEEDS CLARIFICATION.

## Constitution Check

*Gate before Phase 0 and re-check after Phase 1 design.*

| Principle/constraint | Gate result | Evidence / response |
|---|---|---|
| Object-oriented, cohesive responsibilities | PASS for proposal | Domain, application, UI, and adapters are kept separate; no classes are claimed to exist. |
| GUI/business logic separation | PASS | Swing is presentation only; GUI-independent services own rules. |
| Exact money and explicit rounding | PASS | `BigDecimal`, defined largest-remainder policy, explicit currency-scale decision, required tests. |
| Requirements traceability and platform distinction | PASS | FR/NFR/AC mapping included; Swing explicitly does not satisfy FR-015/NFR-005. |
| Human review of AI output | PASS as a required gate | Package is proposed and requires substantive human review before acceptance. |
| Java 21/Maven/Swing/JUnit 5/PlantUML | PASS for applicable scope | Desktop MVP respects constraints; diagrams are PlantUML source. Future product stack is not inferred. |

No constitutional violation is proposed. Unresolved product decisions remain approval gates, not silently chosen implementation details.

## Project Structure

### Documentation

```text
specs/001-expense-sharing/
  spec.md
  plan.md

docs/architecture-analysis/spec-kit/
  README.md
  research.md
  architecture-analysis.md
  design-analysis.md
  deployment-analysis.md
  requirements-traceability.md
  data-model.md
  quickstart.md
  contracts/product-api.md
  diagrams/*.puml
```

### Source code

No application source tree exists in the inspected repository. Do not create source code for this analysis. The logical future Swing MVP structure is presentation -> GUI-independent application/domain -> persistence/receipt/notification adapters, with JUnit 5 tests. A shared service is recommended only if collaborative behavior is confirmed for MVP. Future web, Android, and iOS source/deployment topology is separately proposed and not selected.

**Structure Decision**: Preserve the existing feature-spec directory and put the requested analysis/support artifacts under `docs/architecture-analysis/spec-kit/`. See the documentation tree above; it is not an implemented source layout.

## Phase 0: Research

Repository evidence and design decisions are recorded in [research.md](../../docs/architecture-analysis/spec-kit/research.md). The spec has no `[NEEDS CLARIFICATION]` markers, but unresolved architecture/product decisions are retained explicitly. No external technology/provider was selected and no Codex-generated analysis was read or used.

## Phase 1: Design

- Proposed entities, fields, invariants, relationships, and transaction boundaries: [data-model.md](../../docs/architecture-analysis/spec-kit/data-model.md).
- Candidate cross-platform service capabilities and contract concerns: [contracts/product-api.md](../../docs/architecture-analysis/spec-kit/contracts/product-api.md). This is not an implemented or approved wire contract.
- Future validation scenarios and Maven/JUnit commands: [quickstart.md](../../docs/architecture-analysis/spec-kit/quickstart.md). They are not runnable until an application and Maven project exist.
- Architecture, design, deployment, traceability, and diagrams: [docs/architecture-analysis/spec-kit/](../../docs/architecture-analysis/spec-kit/README.md).

## Post-design Constitution Check

PASS: the proposed design retains Java 21/Maven/Swing/JUnit 5 for the MVP, keeps UI and business logic separate, uses exact arithmetic and deterministic rounding, maps requirements to verification, uses PlantUML, and explicitly requires human review. The complete web/mobile architecture is separate and does not claim delivery by Swing. No implementation or tasks were generated.

## Limitations and open decisions

There is no source, build, database, API, deployment, or test evidence to validate implementation behavior. The most significant human decisions are whether the MVP is collaborative, approval policy, identity/provider, persistence/hosting, data and receipt retention, currency/timezone/netting semantics, notification channels, and web/mobile sequencing. See the analysis package for the full list.

No complexity exception is claimed.
