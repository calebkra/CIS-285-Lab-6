# Decision register

Status **Proposed** means recommendation for review; **Open** means no stakeholder decision recorded. Owner is **Unassigned** unless explicitly identified. No approval is fabricated.

| ID / topic | Context and options | Recommendation and rationale | References | Status / owner / consequences |
|---|---|---|---|---|
| D-01 Swing collaboration | Local-only demo vs collaborative service | Decide before persistence design; local-only cannot support shared account data | FR-015/016, NFR-001 | Open / product owner; changes scope and deployment |
| D-02 Currency precision | Supported currencies and minor-unit scales unknown | Choose currency set, scale, accepted input precision and rounding boundary before persistence | FR-006/007, NFR-002, AC-005 | Open / product owner; affects domain and schema |
| D-03 Balance netting | Pairwise obligations vs minimized transfers | Display required pairwise due; approve any netting algorithm separately | FR-011, AC-008 | Open / product owner; changes settlement presentation |
| D-04 Approval policy | Eligible reviewers, count/order | Configure one or more steps; define eligible reviewer rules | FR-009 | Open / group/product owner; policy drives authorization |
| D-05 Self-approval | Submitter may also be reviewer | Decide prohibit/allow and conditions | FR-009 | Open / product owner; affects workflow tests |
| D-06 Policy changes in review | Policy may change while expense pending | Snapshot policy on submission; confirm grandfathering/change behavior | FR-009 | Proposed + confirmation open / product owner |
| D-07 Correction/resubmission | Rejected/approved expense edits unspecified | Preserve decision history; define correction and compensating-record process | FR-008/009 | Open / product owner; avoid silent posted-history mutation |
| D-08 Payment concurrency | Concurrent attempts can race | Recheck authoritative due transactionally using locking/version/isolation strategy | FR-012, AC-009 | Proposed; persistence-specific choice open / engineering owner |
| D-09 Account recovery/session | Email/password, verification, recovery required; session policy unspecified | Approve recovery controls, expiration, invalidation, and provider | FR-001, AC-001 | Open / security/product owner |
| D-10 Receipt rules | Optional images; privacy/limits/retention unspecified | Private storage, authorization on every access, define type/size/scan/retention | FR-004, NFR-001 | Proposed + policy open / product owner |
| D-11 Membership removal | Current-member authorization vs historical access | Retain audit/history; define departed user's access and record retention | FR-003, NFR-001 | Open / product owner |
| D-12 Report time semantics | Inclusive dates required; timezone undefined | Define timezone and date-to-timestamp boundary behavior | FR-014, AC-010 | Open / product owner |
| D-13 Backend/API technology | Shared service proposed, no implementation selected | Evaluate only after collaboration and platform needs confirmed | FR-015, NFR-005 | Open / architecture owner |
| D-14 Hosting/operations | No hosting or ownership specified | Select provider/topology, environments, support, RPO/RTO, incident ownership | FR-015, NFR-003 | Open / sponsor/operations owner |
| D-15 Offline behavior | Customer does not define offline support | Do not treat local mutation as canonical; specify sync/conflict policy first | FR-015/016 | Open / product owner |
| D-16 Web/mobile sequence | All three required for complete product | Plan releases and feature parity per platform; desktop does not count | FR-015, NFR-005, AC-011, SC-007 | Open / product owner |
| D-17 Overpayment conflict | Story 3 scenario leaves choice open; FR-012/AC-009 require reject | Reject excess and show due; reconcile story wording with product owner | FR-012, AC-009, User Story 3 Scenario 3 | Proposed behavior; confirmation required / product owner |
| D-18 Notification channels | In-app specified in AC; email/push not settled | Commit notice intent transactionally, deliver async; choose channels later | FR-010, AC-007, SC-004 | Pattern proposed; channels open / product owner |
| D-19 Idempotency policy | Retries may duplicate financial effects | Scoped idempotency keys plus durable uniqueness for decisions/postings | FR-004, FR-009, FR-012 | Proposed; key scope/retention open / engineering owner |
| D-20 Ledger and projection | Mutable balances hard to audit/rebuild | Authoritative ledger facts; projection optional and rebuildable | FR-011/012, NFR-002 | Proposed / architecture owner |
| D-21 Data retention/deletion | Retention and account deletion unspecified | Define lifecycle, legal constraints, exports, deletion/anonymization before production | FR-016, NFR-001 | Open / product owner |
