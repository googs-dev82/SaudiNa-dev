# SaudiNA — Business Requirements Document (BRD v1.1)

**Version:** 1.1  
**Date:** 2026-04-05

---

## Table of Contents

1. Executive Summary
2. Public Website Pages
3. CMS-Managed Content
4. Meeting Types & Lifecycle
4.5 Events
5. Meeting Discovery & Filters
6. Map-Based Discovery
7. Near-Me Search
8. Regions & Areas (Internal Only)  
   8.5 Committees
9. Downloadable Resources
10. Contact Form
11. Chatbot
12. Internal User Roles
13. Role-Based & Scope-Based Access
14. Maker-Checker Governance
15. Reports Workflow & Ownership
16. Audit Requirements
17. Permissions Matrix
18. Domain Decomposition
19. API Architecture & Boundaries
20. Authentication & Identity Providers
21. User Assignment Model
22. Chatbot Architecture & Boundaries
23. Observability, System Logging & Health
24. Deployment Environments & Configuration
25. Caching & Performance
26. Rate Limiting & Abuse Protection
27. Data Retention & Archival
28. Eventing & Notifications
29. File Storage Strategy
30. Notifications
31. API Versioning & Standards

---

## 1. Executive Summary

SaudiNA is a governed digital platform replacing a legacy public website. It serves:

- **Public users**: discover meetings, browse content, download resources, contact support, use chatbot.
- **Internal users**: manage meetings and reports with RBAC, scoped access, maker-checker governance, and audit logging.

---

## 2. Public Website Pages

| ID         | Requirement                                                    | Acceptance Criteria                                                    |
| ---------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| BRD-PW-001 | Provide homepage with mission, search entry, featured content. | Loads ≤2s; CMS content renders; search visible above the fold.         |
| BRD-PW-002 | Support Arabic (RTL) and English (LTR).                        | Locale switch updates content and layout; URL reflects `/ar` or `/en`. |
| BRD-PW-003 | SEO-optimized pages.                                           | Unique title/meta/OG per page from CMS.                                |
| BRD-PW-004 | Responsive design.                                             | Pass checks at 375px, 768px, 1440px.                                   |
| BRD-PW-005 | Site-wide navigation.                                          | Links functional; active state; mobile menu works.                     |

---

## 3. CMS-Managed Content

| ID          | Requirement                                            | Acceptance Criteria                                                                                                                                        |
| ----------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BRD-CMS-001 | Content managed via Sanity.                            | Editors update without dev; changes visible ≤5 min.                                                                                                        |
| BRD-CMS-002 | Bilingual fields.                                      | AR/EN fields exist per content type.                                                                                                                       |
| BRD-CMS-003 | Media management.                                      | Upload/replace assets; embeds supported.                                                                                                                   |
| BRD-CMS-004 | Draft/publish workflow.                                | Only published content is public.                                                                                                                          |
| BRD-CMS-005 | Webhooks on publish.                                   | Backend receives webhook ≤10s; cache invalidated.                                                                                                          |
| BRD-CMS-006 | Sanity is editorial-only.                              | No operational workflows, assignments, reports, meetings lifecycle, or audit records are authored in Sanity.                                               |
| BRD-CMS-007 | Studio access restricted to editorial roles.           | Only `CONTENT_EDITOR` and `SUPER_ADMIN` may access the content studio or perform content changes.                                                          |
| BRD-CMS-008 | Content studio is behind secured application access.   | Studio route is not publicly editable; unauthorised users are redirected or shown 403.                                                                     |
| BRD-CMS-009 | Editorial desk scope is role-aligned.                  | `CONTENT_EDITOR` and `SUPER_ADMIN` can manage pages, navigation, footer, SEO, FAQs, articles, and resource editorial metadata only.                        |
| BRD-CMS-010 | Sanity write permissions are independently restricted. | Frontend never exposes write-capable credentials to public users; Sanity project permissions allow content changes only for approved editorial identities. |

### 3.1 CMS Access & Governance

#### Editorial Access Matrix

| Entity                                | Role / Assignment     | Scope Rule                        | Allowed Actions                                                                     |
| ------------------------------------- | --------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| Sanity Studio / CMS Editorial Content | `SUPER_ADMIN`         | Global                            | Access Studio, Create, Edit, Publish, Unpublish, Manage all editorial content types |
| Sanity Studio / CMS Editorial Content | `CONTENT_EDITOR`      | Global or assigned editorial user | Access Studio, Create, Edit, Publish, Unpublish editorial content types             |
| Sanity Studio / CMS Editorial Content | All other roles/users | N/A                               | No access                                                                           |

#### Additional Rules

- Sanity remains a content-management surface only and must not become a system of record for operational workflows.
- Editorial content types include site settings, core pages, generic pages, articles, FAQs, SEO metadata, navigation, footer, hero/content/media/CTA blocks, and resource editorial metadata.
- The preferred access model is through the secured portal entry point, for example `/portal/studio`, or an equivalently protected Studio route.
- If embedded Studio remains mounted at `/studio`, that route must still enforce the same application-level role gate.
- Frontend role checks are required for user experience, but Sanity-side write permissions must also be restricted so route protection is not the only control.
- Denied Studio access attempts should be treated as protected-area authorization failures and logged consistently with portal access controls.

---

## 4. Meeting Types & Lifecycle

### 4.1 Types

- **RECOVERY**: public, no approval, area-scoped, published directly.
- **IN_SERVICE**: internal, committee-scoped, requires approval (Secretary → Committee Manager).
- **EVENTS**: separate from recovery meetings; may be public or private; may be physical, online, hybrid, or Zoom-enabled; booking and visibility are governed independently from recovery meetings.

### 4.2 Recovery Lifecycle

Draft → Published → (Unpublish to Draft) → Archived

### 4.3 In-Service Lifecycle

Draft → Pending → Approved → (Reject → Draft) → Archived

### 4.4 Functional Requirements

| ID          | Requirement                                      | Acceptance Criteria                             |
| ----------- | ------------------------------------------------ | ----------------------------------------------- |
| BRD-MTG-001 | Support two types with separate schemas.         | Distinct tables; lifecycle/visibility enforced. |
| BRD-MTG-002 | Create Recovery (Draft).                         | Persisted with status=DRAFT.                    |
| BRD-MTG-003 | Publish Recovery without approval.               | Status=PUBLISHED; visible publicly.             |
| BRD-MTG-004 | Unpublish Recovery.                              | Removed from public results.                    |
| BRD-MTG-005 | Create In-Service (Draft) with MOM & activities. | Persisted with committee_id; never public.      |
| BRD-MTG-006 | Submit In-Service (Pending).                     | Manager notified.                               |
| BRD-MTG-007 | Approve In-Service.                              | Creator ≠ approver; status=APPROVED.            |
| BRD-MTG-008 | Reject In-Service with comments.                 | Back to DRAFT; audit logged.                    |
| BRD-MTG-009 | In-Service never public.                         | Public APIs exclude In-Service.                 |
| BRD-MTG-010 | Soft delete/archival.                            | Excluded from queries; retained for audit.      |
| BRD-MTG-014 | Audit on transitions.                            | userId, action, prev/new status, timestamp.     |

## 4.5 Events

| ID          | Requirement                                       | Acceptance Criteria                                                                                                                                      |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BRD-EVT-001 | Model events separately from recovery meetings.   | Events have their own schema, APIs, lifecycle, and publication rules.                                                                                   |
| BRD-EVT-002 | Support public and private visibility.            | Public events may be published on the website; private events remain hidden from public pages, APIs, SEO, and chatbot responses.                         |
| BRD-EVT-003 | Support online, physical, hybrid, and Zoom modes. | Event format is selectable; Zoom is only available for events, never for recovery meetings.                                                             |
| BRD-EVT-004 | Allow authorized event creation.                   | Registered event creators can create and submit events for booking.                                                                                      |
| BRD-EVT-005 | Validate booking availability.                    | Requested Zoom slots are validated before booking; tentative holds prevent double-booking.                                                               |
| BRD-EVT-006 | Confirm Zoom-enabled bookings.                    | Zoom API booking succeeds before event is confirmed; creator receives confirmation email only after success.                                            |
| BRD-EVT-007 | Support tentative holds with expiry.              | Holds expire automatically if booking does not complete.                                                                                                 |
| BRD-EVT-008 | Support idempotent Zoom booking.                  | Duplicate booking requests do not create duplicate Zoom meetings.                                                                                        |
| BRD-EVT-009 | Enforce public publication eligibility.            | Only public, confirmed events may become eligible for the public Events page.                                                                            |
| BRD-EVT-010 | Keep private events private.                       | Private events never appear in public website pages, public APIs, SEO output, or chatbot answers for unauthorized users.                                |
| BRD-EVT-011 | Support email confirmation.                        | Creator receives booking confirmation and Zoom instructions after successful booking.                                                                    |
| BRD-EVT-012 | Support audit logging.                             | Event create, hold, booking, publish, unpublish, cancel, and failure transitions are audit-logged.                                                      |

### 4.5.1 Event Actors and Responsibilities

| Actor                | Responsibility                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Event Creator        | Create drafts, choose visibility, request Zoom booking, submit for publication or confirmation.      |
| Event Approver       | Review events if approval is enabled by policy; approve or reject according to governance rules.      |
| Event Admin          | View and manage all events, correct failed states, and oversee publication and booking health.        |
| Public Visitor       | View only published public events and never see private records.                                      |
| Chatbot User         | Receive event answers only from allowed visibility and authorization scope.                           |
| System Services      | Validate slots, hold reservations, book Zoom, send emails, audit every lifecycle transition.         |

### 4.5.2 Event Business Rules

- Events are a separate business domain from recovery meetings and must never reuse the recovery meeting lifecycle or publication rules.
- Event visibility shall always be explicitly selected as `public` or `private`.
- Zoom booking applies only to events and must never be available for recovery meetings.
- A Zoom-enabled event must be held tentatively before a Zoom booking request is executed.
- A tentative hold shall expire automatically if the booking flow does not complete within the configured TTL.
- The booking workflow must be idempotent so repeated submissions do not create duplicate Zoom meetings.
- A public event may become visible on the public Events page only after it is confirmed and meets publication conditions.
- A private event must remain excluded from public pages, public APIs, SEO output, and chatbot answers for unauthorized users.
- Confirmation email must be sent only after the Zoom meeting is successfully created and the booking is durably stored.
- Cancellation and rescheduling must preserve auditability and must not leak private event details.
- Admin oversight must allow troubleshooting, correction, and review of booking or publication failures.

### 4.5.3 Event State Model

Recommended event states:

- `DRAFT`
- `PENDING_VALIDATION`
- `TENTATIVE`
- `CONFIRMED`
- `PENDING_PUBLICATION`
- `PUBLISHED`
- `PRIVATE`
- `CANCELLED`
- `RESCHEDULED`
- `FAILED`

Recommended state transitions:

Draft → Pending Validation → Tentative → Confirmed → Published  
Draft → Pending Validation → Tentative → Failed  
Confirmed → Pending Publication → Published  
Confirmed → Private  
Any active state → Cancelled  
Confirmed/Tentative → Rescheduled

### 4.5.4 Event Acceptance Criteria

| ID          | Requirement                            | Acceptance Criteria                                                                 |
| ----------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| BRD-EVT-013 | Support event editing.                 | Authorized users can update draft and permitted active events.                      |
| BRD-EVT-014 | Support cancellation.                  | Cancelled events are excluded from active booking and public publication.           |
| BRD-EVT-015 | Support rescheduling.                  | New slot is validated before the event is moved.                                    |
| BRD-EVT-016 | Prevent slot conflicts.                | Overlapping Zoom-enabled bookings are rejected or held exclusively.                 |
| BRD-EVT-017 | Enforce publication conditions.        | Only public confirmed events are eligible for public website publication.           |
| BRD-EVT-018 | Enforce private visibility restrictions. | Private events never appear in public website pages, APIs, search, or chatbot flow. |
| BRD-EVT-019 | Preserve auditability.                 | Every lifecycle transition stores actor, timestamp, and before/after state.         |
| BRD-EVT-020 | Provide admin oversight.               | Admin users can review booking, publication, cancellation, and failure states.      |

---

## 5. Meeting Discovery & Filters

| ID          | Requirement                       | Acceptance Criteria                    |
| ----------- | --------------------------------- | -------------------------------------- |
| BRD-DSC-001 | Only published Recovery returned. | In-Service excluded always.            |
| BRD-DSC-002 | Combined text + filters.          | Results update accordingly.            |
| BRD-DSC-003 | Filter by Area.                   | Correct subset.                        |
| BRD-DSC-004 | Filter by City.                   | Combined with others.                  |
| BRD-DSC-006 | Filter by Day.                    | Multi-select OR within day set.        |
| BRD-DSC-007 | Filter by Time range.             | Overlapping returned.                  |
| BRD-DSC-008 | Filter by Gender.                 | Male/Female/Mixed/Any.                 |
| BRD-DSC-009 | Filter by Online.                 | Online/In-person/All.                  |
| BRD-DSC-010 | Filter by Language.               | AR/EN/All.                             |
| BRD-DSC-012 | Cursor pagination.                | Default 20; load more.                 |
| BRD-DSC-014 | Dual view list/map.               | Toggle works; pins for in-person only. |
| BRD-DSC-015 | Export PDF for current filters.   | Download formatted file.               |

---

## 6. Map-Based Discovery

| ID          | Requirement                            | Acceptance Criteria            |
| ----------- | -------------------------------------- | ------------------------------ |
| BRD-MAP-001 | Interactive map of published Recovery. | Clickable markers.             |
| BRD-MAP-003 | Viewport-based updates.                | Bounding box query.            |
| BRD-MAP-004 | Clustering.                            | Cluster badges; zoom on click. |
| BRD-MAP-005 | Respect filters.                       | Map reflects active filters.   |

---

## 7. Near-Me Search

| ID         | Requirement               | Acceptance Criteria                |
| ---------- | ------------------------- | ---------------------------------- |
| BRD-NM-001 | Use Geolocation API.      | Permission prompt; proximity sort. |
| BRD-NM-002 | Configurable radius.      | 5/10/25/50 km.                     |
| BRD-NM-003 | Fallback manual location. | Text input appears.                |
| BRD-NM-004 | Show distance.            | e.g., “2.3 km away”.               |

---

## 8. Regions & Areas (Internal Only)

| ID          | Requirement                        | Acceptance Criteria               |
| ----------- | ---------------------------------- | --------------------------------- |
| BRD-REG-001 | Maintain regions.                  | Available in filters/assignments. |
| BRD-REG-002 | Maintain areas under regions.      | Cascading selection.              |
| BRD-REG-003 | CRUD by Super Admin only.          | Restricted access.                |
| BRD-REG-004 | No public pages for regions/areas. | No public routes exist.           |

---

## 8.5 Committees

| ID          | Requirement                        | Acceptance Criteria      |
| ----------- | ---------------------------------- | ------------------------ |
| BRD-COM-001 | Manage committees (area/regional). | Name, level, parent set. |
| BRD-COM-003 | One manager per committee.         | Assigned by Super Admin. |
| BRD-COM-004 | One+ secretaries per committee.    | Many-to-many.            |
| BRD-COM-006 | In-Service tied to one committee.  | Non-null committee_id.   |

---

## 9. Downloadable Resources

| ID          | Requirement            | Acceptance Criteria |
| ----------- | ---------------------- | ------------------- |
| BRD-RES-001 | Public resources page. | Categorized list.   |
| BRD-RES-002 | Download without auth. | Immediate download. |
| BRD-RES-005 | Track downloads.       | Count increments.   |

---

## 10. Contact Form

| ID          | Requirement                        | Acceptance Criteria                                                                                                                                   |
| ----------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| BRD-CON-001 | Provide contact form.              | Validation inline.                                                                                                                                    |
| BRD-CON-002 | Rate-limit submissions.            | 3/hour/IP.                                                                                                                                            |
| BRD-CON-003 | Email notification.                | ≤60s send.                                                                                                                                            |
| BRD-CON-004 | Store submissions.                 | Visible in portal.                                                                                                                                    |
| BRD-CON-006 | Scoped contact submissions access. | `SUPER_ADMIN` has global access; active `PR Committee` assignments may view and manage submissions within that committee boundary; all others denied. |

---

## 11. Chatbot

| ID          | Requirement                   | Acceptance Criteria       |
| ----------- | ----------------------------- | ------------------------- |
| BRD-BOT-001 | Chat widget on all pages.     | Opens panel.              |
| BRD-BOT-002 | FAQ via CMS.                  | Correct answers returned. |
| BRD-BOT-003 | Meeting discovery assistance. | Returns Recovery only.    |
| BRD-BOT-004 | AR/EN support.                | Locale-aware replies.     |
| BRD-BOT-005 | Fallback to contact.          | Suggest link.             |

---

## 12. Internal User Roles

Super Admin, Regional Manager, Area Manager, Committee Manager, Committee Secretary, Meeting Editor, Content Editor.

---

## 13. Role-Based & Scope-Based Access

| ID          | Requirement                                  | Acceptance Criteria                                                                               |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| BRD-ACC-001 | Multi-role users.                            | Many-to-many roles.                                                                               |
| BRD-ACC-004 | Scope filtering.                             | Data limited by assignment.                                                                       |
| BRD-ACC-005 | Super Admin bypass.                          | Full access.                                                                                      |
| BRD-ACC-008 | Deny out-of-scope.                           | 403 + audit log.                                                                                  |
| BRD-ACC-009 | CMS editorial access by role only.           | `CONTENT_EDITOR` and `SUPER_ADMIN` can access protected editorial tooling; all others are denied. |
| BRD-ACC-010 | Editorial routing aligned with secured area. | Protected content-management routes require authenticated session plus allowed role.              |

---

## 14. Maker-Checker Governance

Applies to In-Service and selected reports. Creator cannot approve.

---

## 15. Reports Workflow & Ownership

| ID          | Requirement                    | Acceptance Criteria    |
| ----------- | ------------------------------ | ---------------------- |
| BRD-RPT-001 | Scoped report generation.      | Data limited by scope. |
| BRD-RPT-003 | Export PDF/CSV.                | Correct formatting.    |
| BRD-RPT-006 | Async generation.              | Status tracked.        |
| BRD-RPT-012 | Some reports require approval. | Configurable flag.     |
| BRD-RPT-013 | Maker-checker on reports.      | Creator ≠ approver.    |

---

## 16. Audit Requirements

Immutable logs for all state changes and approvals.

---

## 17. Permissions Matrix

### Authorization Evaluation Rule

For every protected request, the system shall evaluate access in the following order:

1. Authentication validity
2. Active role assignment
3. Matching scope
4. Allowed action on target resource
5. Governance constraints (for example, maker-checker and approval restrictions)

If any check fails, access shall be denied with either:

- `401 Unauthorized` for invalid or missing authentication
- `403 Forbidden` for authenticated but unauthorized or out-of-scope requests

### Contact Submissions Access Matrix

| Entity              | Role / Assignment                       | Scope Rule                     | Allowed Actions                                 |
| ------------------- | --------------------------------------- | ------------------------------ | ----------------------------------------------- |
| Contact Submissions | `SUPER_ADMIN`                           | Global                         | View, Update Status, Add Internal Notes, Export |
| Contact Submissions | Any user assigned to the `PR Committee` | Committee scope = PR Committee | View, Update Status, Add Internal Notes         |
| Contact Submissions | All other roles/users                   | N/A                            | No access                                       |

### Additional Rules

- PR Committee access is role-agnostic within that committee. Any active role assignment inside the PR Committee grants access to contact submissions.
- Contact submission access for PR Committee users is limited to committee-based access granted through active assignment.
- Out-of-scope or inactive committee assignments shall not grant access.
- All view and update actions on contact submissions shall be audit-logged.

---

## 18. Domain Decomposition

Identity, Assignments, Meetings, Committees, Reports, Resources, Contact, Chatbot, Audit, CMS.

---

## 19. API Architecture & Boundaries

Public vs protected APIs under `/api/v1/*`. Backend-only business logic.

---

## 20. Authentication & Identity Providers

Zoho + Google OAuth; token-based access.

### 20.1 Editorial Authentication Boundary

- SaudiNA authenticated session is the gate for entering the content studio from the application.
- A user may enter Studio only if the authenticated SaudiNA account has role `CONTENT_EDITOR` or `SUPER_ADMIN`.
- Sanity authentication/authorization remains separately restricted for content writes, so application login alone is not sufficient to grant edit rights.
- No public or anonymous editing path is permitted.

---

## 21. User Assignment Model

user_id, role_code, scope_type, scope_id, dates; multi-role supported.

---

## 22. Chatbot Architecture & Boundaries

FAQ via CMS; discovery via APIs; backend orchestrated; logs retained per environment.

---

## 23. Observability, System Logging & Health

System vs audit logs; `/health`; correlation IDs.

---

## 24. Deployment Environments & Configuration

Local/Dev/Staging/Prod; env-based config; secrets external.

---

## 25. Caching & Performance

CMS caching + invalidation; indexed queries; async reports.

---

## 26. Rate Limiting & Abuse Protection

Search 60/min; chatbot 20/min; contact 3/hour; 429 on breach.

---

## 27. Data Retention & Archival

Configurable retention; audit long-term.

---

## 28. Eventing & Notifications

Events for publish/approval/report/contact; async handling.

---

## 29. File Storage Strategy

Supabase Storage; public/private control; organized paths.

---

## 30. Notifications

Email + in-app; async.

---

## 31. API Versioning & Standards

`/api/v1/`; standard error model; pagination rules.

---
