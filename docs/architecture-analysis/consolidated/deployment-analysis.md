# Deployment and operations analysis

All deployment elements are **proposed**; no runtime, provider, cloud, pipeline, or operational owner is verified. Keep the Java Swing MVP separate from complete customer scope.

## Java Swing MVP

Package the Java 21 desktop application with a supported runtime strategy after desktop OS/runtime support is selected. Sign and publish versioned artifacts through an approved channel; define update, rollback, configuration, and support process. If local-only, protect local records and provide user-controlled backup/restore. If collaborative, it needs a service and secure client transport. Local-only cannot deliver shared cross-device accounts. Persistence mode, desktop platforms, installer, update ownership, and data backup responsibility are open. Maven/JUnit 5 build and tests are constitution requirements for eventual implementation, not present build evidence.

## Complete web, Android, and iOS product

Proposed topology: browser/web client, signed Android app, and signed iOS app communicate with a shared authenticated service; service accesses transactional durable records, private receipt storage, identity boundary, and asynchronous notification delivery. Clients do not access data storage directly. No hosting provider, database, API technology, identity product, or notification channel is selected.

- Web releases must be compatible with supported service/API versions.
- Android release requires signing, supported OS policy, distribution channel, and update plan.
- iOS release requires signing/provisioning, supported OS policy, distribution channel, and update plan.
- Publish API compatibility/deprecation policy; mobile versions can lag web/service updates.
- Migrations should be backward-compatible where practical, tested before production, and have a recovery/rollback strategy. Back up records and receipt objects consistently; encrypt and restrict backups; regularly test restoration and reconciliation.
- Separate environment configuration from artifacts. Keep secrets out of clients and source; use an approved protected secret-management process.
- Verify each release: authorization, migration, financial reconciliation, supported-client compatibility, rollback readiness, and platform acceptance.

## Operations

Before production, assign operational ownership and define availability, support/on-call, data residency, retention, incident response, RPO/RTO, backup schedule, restore drills, and recovery communications. Monitor ordinary-action latency against NFR-003, authorization denials, authentication/recovery anomalies, stale approval queues, payment conflicts, ledger reconciliation, notification delay/retries, receipt failures, report latency, migration status, and backup health. Logs must omit secrets and receipt content while preserving controlled audit evidence. Roll back service/client versions safely and use compensating financial records rather than deleting committed ledger facts.

No environment, CI/CD, signing account, application store account, alerting stack, or support team is present or asserted. Vendor and operational ownership remain decisions; see [register](decision-register.md).
