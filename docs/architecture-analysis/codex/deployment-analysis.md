# SplitSmart deployment analysis

No deployment environment, build descriptor, application artifact, database, cloud account, or operational tooling is verified in the repository. Infrastructure below is recommended or undecided, not existing state.

## A. Java Swing MVP

### Runtime and topology

Run a Java 21 desktop client on an OS set still to be chosen. Maven is the required build tool; Swing is the required UI. The topology depends on whether MVP records are local or shared. A local demonstration can persist to a local store, but that does not establish shared cross-device data or fulfill the complete product. If multiple users must share records, the MVP needs a remotely reachable service and durable shared storage; that raises identity, hosting, security, and operational scope.

### Packaging and distribution

**Proposed:** create a versioned, signed platform-appropriate package or installer with a bundled runtime where permitted, publish checksums/signatures, and document supported OS and update/rollback process. Maven artifact and package formats, code signing, distribution channel, auto-update behavior, and supported OS remain open. Do not assume a JAR alone provides a usable end-user install experience.

### Configuration, release, and operations

Separate development, test, and release configuration; keep secrets out of packaged clients. Use reproducible Maven builds, JUnit 5, dependency review, versioned releases, and human approval. If local persistence is used, define backup/export, migration, and data-loss expectations. No CI, test environment, release pipeline, monitoring, or backup system currently exists.

## B. Complete customer product

### Recommended topology

Web browser, Android app, and iOS app communicate over authenticated encrypted connections with shared application services. Services enforce authorization and business rules and access transactional data storage. Private receipt images use access-controlled object storage. Identity handles registration, verification, authentication, and recovery. Notification workers deliver approved channels asynchronously. Monitoring, secret management, backups, and recovery processes are operational components. Provider and topology remain to be selected.

### Clients and distribution

Host the primary web experience on an approved web hosting/CDN arrangement and route API calls to service boundaries; web hosting provider and deployment model require decision. Distribute Android through the selected Android app channel and iOS through Apple's distribution mechanisms after signing, review, and release preparation. Supported OS versions, app identifiers, signing owners, store accounts, staged rollout, and update support require approval. Each platform must pass AC-011 and NFR-005; the Swing MVP does not count.

### Storage, identity, notifications

Use transactional durable storage for accounts references, groups, memberships, expenses, shares, approvals, and payments. Store receipt binaries separately with private access; validate file types/size and scan according to approved policy. Identity must support unique email, verification, and recovery. In-app notices are required by the specification; email/push channels are open decisions. External calls must not hold core financial transactions open; use durable post-commit delivery and retries.

### Security boundaries

Treat public clients and networks as untrusted. Terminate TLS at a controlled edge, authenticate each request, enforce authorization in services, restrict service-to-store and service-to-object-storage access, isolate environments and secrets, and audit sensitive actions. Avoid client-side authorization as a security control. Data residency, encryption/key ownership, abuse controls, receipt malware scanning, and security review scope need approval. No certification/compliance is claimed.

### Build, release, recovery, operations

Proposed pipeline: build/test/lint and dependency/security checks, produce immutable versioned artifacts, deploy to isolated test environment, execute acceptance/platform checks, require human release review, and promote with rollback capability. Mobile releases require signed artifacts and staged publication; web/service release compatibility requires versioned contracts and migration strategy. Define backup frequency, point-in-time recovery, retention, RPO/RTO, restore drills, service SLOs, incident ownership, and monitoring alerts before production. None is currently specified or configured.

## Configuration and environment separation

Use distinct development, test, staging, and production identities/data and secrets. Do not copy production receipts or personal data into lower environments without approved controls. External credentials should be injected through managed secret/configuration facilities selected with the hosting decision. Client configuration must not contain privileged service credentials.

## Deployment risks and decisions requiring approval

1. Whether MVP is local-only or collaborative, and resulting service/hosting scope.
2. Desktop OS support, signing, packaging, distribution, and update ownership.
3. Web/mobile implementation stacks, supported OS/browser versions, release channels, and sequencing.
4. Hosting region/provider, service topology, database, receipt store, identity, notification providers, and cost ownership.
5. Availability, backup, recovery, retention, and operational support targets.
6. Security threat model, privacy jurisdiction, receipt handling/retention, and audit policy.
7. CI/CD, environment ownership, migrations, rollback, and release approval.
8. NFR-003 load profile and representative acceptance environment.

See [deployment topology](diagrams/deployment.puml) and [trust boundaries](diagrams/trust-boundaries.puml). All depicted deployment components are proposals.
