# SplitSmart Deployment Analysis

## Status

This is a deployment proposal, not an inventory of deployed infrastructure. The inspected repository contains no application, Maven build, service configuration, cloud account configuration, database, image store, or release automation. All hosting and packaging options below are recommendations subject to human approval.

The Java Swing MVP and the complete web/Android/iOS product are separate deployments. The MVP cannot be reported as satisfying FR-015, NFR-005, AC-011, or SC-007.

## 1. Java Swing desktop MVP

### Runtime and deployment units

| Unit | Proposed runtime | Notes |
|---|---|---|
| Swing desktop client | Java 21 desktop runtime; Maven build; signed, platform-specific package or a packaged runtime. | Constitution mandates Java 21/Maven/Swing. Exact packaging and supported desktop OS list need approval. Consider `jpackage` only after distribution requirements are confirmed. |
| Domain/application modules | Java 21 modules within the desktop process or shared library. | Keep UI-independent services and calculations testable without Swing. No actual module layout exists yet. |
| Shared application service (conditional recommendation) | Server process/API with authenticated clients, deployed under an approved managed runtime. | Required if the MVP must support multiple remote users/groups with a shared record and notification inbox. Server implementation technology and ownership are not specified. |
| Persistent data | Durable transactional store behind persistence adapters. | Local-only persistence is possible for a single-machine demonstration but does not support shared remote access. No engine is selected. |
| Receipt storage | Private file/object storage or protected local storage, with metadata in the domain store. | Access must be checked on every retrieval. Define size/type limits, encryption, retention, and backup separately. |
| In-app notices | Notification records in the same authoritative store as group state. | Avoid dependence on an email/push provider for MVP unless approved. |

### Client/server boundary

Two MVP options require a product decision:

1. **Collaborative MVP (recommended if it must satisfy the account/group workflows for multiple people)**: Swing desktop clients authenticate to a shared application service; all authorization and writes are server-authoritative. The service persists data centrally and returns user-scoped views. The client never connects directly to the database.
2. **Local demonstration**: one local application and persistent store. This can demonstrate domain flows but has no reliable cross-machine group synchronization or remote notifications; it must be explicitly labeled a limited prototype and must not claim shared multi-user coverage.

Do not silently conflate these options. A local database shared through a network drive is not recommended as a substitute for an authenticated service.

### Authentication, authorization, network, and configuration

- For collaborative operation, use authenticated encrypted transport between client and service. Do not embed service credentials or privileged database credentials in the client.
- Verify email and support recovery as required by FR-001. Choose approved session/token lifecycle and credential storage practices before implementation.
- Enforce membership and resource access in the service for every action. Client-side checks are usability aids only.
- Local credentials, if offline/local mode is approved, require protected OS storage and explicit privacy policy; offline writes/sync conflict behavior is not specified.
- Separate development/test/production configuration. Inject secrets through the runtime's approved secret mechanism; do not package server secrets with desktop clients.
- Log diagnostic events without passwords, tokens, full receipt data, or unnecessary personal data. Keep audit events for approvals, membership changes, and payments subject to an approved retention policy.

### Build, packaging, release, update

- Build/test with the required Java 21 and Maven toolchain; use JUnit 5 as required by the constitution.
- Build distributables per approved desktop OS. Decide installer format, code signing, packaged vs system Java runtime, supported upgrade path, and end-of-support policy before external release.
- Separate application version from service/API version. A collaborative client must detect incompatible service versions and report an explicit recoverable error.
- Use signed releases and an approved update channel; automatic update behavior and signing-key custody require human approval.
- No Maven files, package definitions, release pipeline, update mechanism, or supported desktop OS list were found.

### Persistence, backup, recovery, monitoring, and operations

- Prefer central durable transactional storage if collaborating; use atomic transactions for submission/share creation/outbox, final approval/posting, and payments.
- Back up structured data and receipt files under one retention/recovery plan; encrypt backups and test restores. Exact backup schedule, retention, RPO/RTO, and data residency are open.
- Monitor service health, request/error rates, transaction conflicts, notification queue age, storage capacity, and backup/restore success. For an offline/local demonstration, document that centralized monitoring and remote support do not exist.
- Define migration/rollback strategy and data export/deletion procedures before release.

### MVP risks and controls

| Risk | Control / decision |
|---|---|
| Local-only persistence cannot synchronize group members on other devices. | Select collaborative service or formally approve a demo-only scope. |
| Client package is tampered with or leaks shared credentials. | No privileged secrets in client; server authorization, signed package, TLS, per-user identity. |
| Approval/payment races corrupt balances. | Server transaction, unique source effect/idempotency key, concurrency tests. |
| Receipt exposure through copied file path or URL. | Opaque reference is not authorization; check membership on every fetch and keep storage private. |
| Desktop update/support matrix is unknown. | Approve OS/runtime/support policy before packaging. |
| Local offline behavior conflicts with shared truth. | Do not imply offline write/sync support until conflict policy is specified. |

## 2. Complete web, Android, and iOS product

### Deployment topology and trust boundaries

```text
Untrusted client networks
  Browser (web) | Android app | iOS app
          \        |         /
        encrypted authenticated API boundary
                       |
           application/domain service tier
             |          |             |
        identity     transactional   notification
        integration  data store      dispatcher
                        |
               private receipt store
```

See [deployment.puml](./diagrams/deployment.puml). This is a proposed logical topology; no cloud, network, provider, or deployed service is verified.

### Runtime and deployment units

| Unit | Proposed deployment | Boundary/considerations |
|---|---|---|
| Web client | Browser-delivered web application from an approved web host/CDN or equivalent. | Never connect to the database directly; secure session/token and content policy need design. |
| Android client | Signed Android package distributed through an approved channel. | Platform secure credential storage, app signing, supported OS versions, and store review require decisions. |
| iOS client | Signed iOS application through an approved channel. | Platform secure credential storage, provisioning/signing, supported OS versions, and store review require decisions. |
| API/service tier | Shared authenticated service running in an approved managed or self-operated environment. | Authoritative validation and authorization; versioned compatibility contract. No language/framework selected. |
| Identity boundary | Product-managed identity module or approved identity provider. | Email verification and recovery required. Provider, session, MFA, and account lifecycle open. |
| Primary data store | Proposed transactional relational service. | ACID boundaries, encryption, access controls, migrations, backup and recovery. No vendor chosen. |
| Receipt store | Private object/file service separated from public client assets. | Only metadata/reference stored with expense; authorization-controlled upload/download; retention and malware/content policy. |
| Notification service | In-app inbox plus adapters for approved email/push channels. | Async delivery, deduplication, retry, delivery status, and recipient authorization. Vendor/channels open. |
| Operations plane | Metrics, logs, audit, alerting, secret management, backups, deployment pipeline. | Separate production permissions and data handling; all concrete tooling requires approval. |

### Shared identity, authorization, and data

- A common identity/account namespace must serve all platforms; each request is authorized against server-side group membership and record policy.
- All clients use the same domain operations and canonical stored data. A change accepted on one platform must become visible from another under AC-011.
- The server owns validation for group, expense, approval, split, payment, receipt, and report access. Clients can validate for usability but cannot override server decisions.
- Clients must not store authoritative balances or treat offline edits as committed. Offline mode and synchronization conflict handling are not required or specified.
- Maintain a shared API contract and compatibility tests before parallel client delivery.

### Network and security controls

- Use encrypted transport and approved authentication/session controls at the public API boundary; protect service-to-data traffic with least privilege.
- Apply authorization to object identifiers, reports, notifications, and receipt content to prevent horizontal access across groups/accounts.
- Validate payload size/type and receipt content; rate-limit sensitive identity/recovery flows under approved policy.
- Store passwords only as a vetted credential representation or use an approved identity provider. Keep secrets in a managed secret store, rotate per policy, and never embed service credentials in mobile/web packages.
- Use idempotency/replay protection for expense submissions, approvals, and payment recording. Detect conflicting concurrent approval/payment changes.
- Keep audit history for financial/review/membership decisions with restricted access and approved retention. Scrub diagnostics for tokens, passwords, receipts, and unnecessary personal data.
- Threat model authorization bypass, stolen sessions, malicious uploads, notification leaks, supply-chain compromise, backup theft, and abuse of account recovery before release.

### Build, release, configuration, and upgrades

- Build each client and service independently, with reproducible versioned artifacts, dependency review, automated tests, and human approval gates.
- Web releases can be deployed separately if backward-compatible with supported API versions. Android/iOS builds require platform signing and app-store or approved distribution workflows.
- Use staged service rollout and backward-compatible database migrations; test rollback and client/API compatibility. Mobile clients may remain installed on older versions, so API deprecation needs a published policy.
- Keep configuration per environment and feature/channel policy outside client source where secrets or operational policy are involved.
- Define release sequencing and minimum supported client versions with product owners. No CI/CD, signing setup, app-store account, or deployment target is present.

### Reliability, backup, monitoring, and operations

- Set explicit availability, recovery, backup retention, RPO/RTO, data residency, incident response, and support targets before production. They are absent from current requirements.
- Back up primary records and receipt content consistently; encrypt backups; isolate backup credentials; run restore drills and verify integrity/reconciliation.
- Monitor action latency against NFR-003's agreed workload, login/recovery errors, access denials, approval queue age, transaction conflicts, notification latency against SC-004, receipt failures, report latency, and storage/backup health.
- Provide operational dashboards and alerts, a documented on-call/escalation process, audit access, data deletion/export procedures, and incident communication. Tools and support coverage remain unselected.
- Scale the modular service and storage based on measured load; the 100-member group target alone does not justify microservices.

### Complete-product risks and controls

| Risk | Control / decision |
|---|---|
| Three clients implement divergent rules or drift from data. | Shared server-authoritative services/contracts; cross-platform acceptance tests. |
| Framework/provider choices made before product/operations needs are known. | Human-approved architecture decision, privacy and cost review; do not treat recommendations as existing infrastructure. |
| Mobile app versions lag service changes. | Versioned API, backward compatibility, release support policy, staged rollouts. |
| Cloud outage or loss of receipt/ledger data. | Approved recovery objectives, encrypted backups, restore drills, reconciliation. |
| External notification delivery reveals sensitive group activity. | Minimal notice content, authorized recipient lookup, channel preferences and consent. |
| Privacy/retention duties differ by location. | Identify supported regions and legal requirements before production data. |
| Performance target is not operationally defined. | Agree workload, client/network conditions, percentile method, and measurement instrumentation. |

## Human approvals required before deployment planning is final

1. Confirm MVP is collaborative or demo-only, and choose service ownership.
2. Select desktop OS/runtime packaging and signed update policy.
3. Choose identity, API, database, receipt, notification, hosting, and monitoring technology after threat/privacy/operations review.
4. Approve supported currencies, timezone/date semantics, receipt limits/retention, group-removal policy, and account deletion.
5. Set environments, data residency, availability, incident response, backup/restore RPO/RTO, and operational ownership.
6. Confirm web/mobile sequencing, release feature set, client support policy, and required app distribution channels.

These are not implementation approvals and do not imply that any required platform has been delivered.
