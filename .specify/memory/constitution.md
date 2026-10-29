<!--
Sync Impact Report
Version change: 1.0.0 -> 1.0.1
Modified principles: None; corrected the ratification date as requested.
Added sections: None.
Removed sections: None.
Follow-up TODOs: None.
-->

# SplitSmart Constitution

## Core Principles

### I. Object-Oriented Design
Production code MUST use cohesive classes with clear responsibilities, encapsulated state,
and explicit contracts. Prefer composition and focused interfaces over duplicated behavior
or classes that accumulate unrelated responsibilities. This keeps the expense, group, and
balance domain understandable and maintainable.

### II. Separation of GUI and Business Logic
Java Swing presentation code MUST delegate business rules and state changes to GUI-independent
domain or service code. Business logic MUST be testable without constructing or displaying Swing
components. GUI code MUST NOT independently calculate expense shares, balances, or settlements.
This boundary enables reliable testing and keeps behavior consistent across user interactions.

### III. Exact Monetary Arithmetic
All monetary values and calculations MUST use `BigDecimal`; `float` and `double` MUST NOT be
used for money. Rounding MUST occur only at documented business boundaries under an explicit
rounding policy. Tests MUST cover relevant split and balance calculations, including rounding
cases, because small precision errors can make shared balances incorrect.

### IV. Customer Requirements and Traceability
`UserRequirement.md` is the source of customer requirements and MUST NOT be silently rewritten
as an implementation decision. Specifications and design records MUST distinguish customer
requirements from implementation decisions, identify the source of each requirement, and link
requirements to acceptance criteria, implementation, and verification evidence. An implementation
decision MUST NOT be reported as satisfying a customer requirement without evidence. In
particular, the requested web, Android, and iOS platforms remain customer requirements; Java
Swing is an implementation choice and MUST NOT be represented as fulfilling those platform
requirements without documented stakeholder approval or evidence of coverage.

### V. Human Review of AI Output
AI-generated code, tests, documentation, and design artifacts MUST receive substantive human
review before they are accepted, submitted, or merged. Reviewers MUST verify correctness,
requirement alignment, and relevant test results; AI-generated output or its test results alone
are not approval.

## Technical Constraints

The application MUST target Java 21, use Maven as its build and dependency-management tool,
and use Java Swing for its graphical user interface. Automated tests MUST use JUnit 5.
Architecture or design diagrams maintained by the project MUST use PlantUML source, and
affected diagrams MUST be updated when the documented design changes. These choices constrain
implementation; they do not amend customer requirements or by themselves establish that a
customer requirement is met.

## Requirements and Quality Workflow

Each feature MUST be traceable from its customer requirement or explicitly labeled as an
implementation decision, through acceptance criteria, to implementation and verification
evidence. Before a change is accepted, the author MUST run the relevant Maven/JUnit 5 tests and
record any unmet requirement, platform gap, or unresolved decision instead of implying
completion. Reviews MUST check this traceability, the GUI/business-logic boundary, monetary
arithmetic, and human review of AI-generated contributions.

## Governance

This constitution governs project specifications, design, implementation, and review. Amendments
MUST document their rationale and impact, preserve the distinction between customer requirements
and implementation decisions, and receive human review before acceptance.

Constitution versions use MAJOR.MINOR.PATCH semantics: MAJOR for backward-incompatible
governance changes, MINOR for new or materially expanded principles or sections, and PATCH for
clarifications and non-semantic refinements. Every amendment MUST update the last-amended date
and version.

Contributors and reviewers MUST check changes for compliance with these principles and record
any approved exception with its rationale and scope. Compliance review MUST include requirement
traceability, relevant tests, and review of AI-generated output. Exceptions do not change
customer requirements unless stakeholders explicitly approve that change.

**Version**: 1.0.1 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
