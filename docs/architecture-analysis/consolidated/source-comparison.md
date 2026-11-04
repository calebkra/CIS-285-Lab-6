# Source comparison and consolidation record

## Authority and method

Customer meaning comes from `UserRequirement.md`; the feature specification supplies IDs and testable elaboration, while the constitution binds Java 21, Maven, Swing, JUnit 5, GUI-independent business logic, exact `BigDecimal` money, PlantUML, traceability, and human review. Neither analysis package overrides those sources. All content here is a proposal.

## Retained and reconciled contributions

| Topic | Spec Kit foundation retained | Codex contribution incorporated | Consolidated treatment |
|---|---|---|---|
| Traceability | Requirement inventory, FR/NFR/AC/SC mapping | Security and operational concerns mapped to verification | Full mapping in requirements-traceability.md, with architecture and diagram references |
| Architecture | Layered Swing, GUI-independent domain/services, shared-service evolution | Explicit trust boundaries and security controls | Separate MVP and full-product designs; all service/backend elements proposed |
| Domain and data | Expense, payer, participant shares, approval, ledger, payment, reports | Idempotency and concurrency constraints | Conceptual model, invariants, transaction boundaries in data-model.md/design-analysis.md |
| Financial behavior | BigDecimal, deterministic largest-remainder allocation, pending/rejected exclusion | Atomic posting, concurrent payment prevention, reconciliation | One canonical set of rules repeated consistently across all artifacts |
| Contract | Logical service capability contract | Retry/conflict and reliability semantics | No invented endpoints, protocol, provider, or payload wire format |
| Security | Authorization requirements and private receipts | Trust-boundary diagram, session and recovery, audit/privacy, cross-group controls | Default-deny service-side authorization; identity and tooling remain open |
| Operations | Distinct desktop and multi-client deployment discussion | Release, rollback, backups, monitoring, incident response | Deployment proposal with explicit ownership/provider decisions open |
| Lifecycle | Spec Kit pending/approved/rejected baseline | Reliability-oriented decision history | Only required lifecycle states shown; Draft/Withdrawn/Superseded remain open possibilities, not approved states |
| Financial diagrams | Balance-settlement foundation | Payment-settlement safeguards | Single combined settlement flow |
| Data flow | Expense submit and notification interactions | Receipt and asynchronous failure boundaries | Transactional commit precedes notification; receipt storage compensation is explicit |

## Source conflicts and limits

The specification's User Story 3, Acceptance Scenario 3 leaves excess-payment behavior open, while clarification, FR-012, Edge Cases, and AC-009 require rejection and display of amount due. The proposed behavior follows the explicit rule; reconcile the scenario with the product owner. The customer source says web plus Android/iOS; Swing is a separate MVP and cannot satisfy that scope.

Neither generated analysis is treated as proof of implementation. Repository observations are documented in the README and deployment analysis. No provider, database, API technology, currency set, or production infrastructure has been selected here.
