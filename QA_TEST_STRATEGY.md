# SaudiNA QA Test Strategy

## Scope

This strategy covers the governed Events domain and its Zoom-enabled booking lifecycle, alongside the existing public site and portal surfaces.

Events QA must prove:
- event creation works for public and private records
- public events are visible on public pages and public APIs only
- private events are hidden from public browsing, search, chatbot, caches, and APIs
- Zoom slot validation prevents conflicts
- tentative holds expire and block double booking while active
- Zoom booking is idempotent and confirmed only after backend success
- confirmation email is sent only after durable confirmation
- cancellation, rescheduling, and audit logging remain consistent

## Test Pyramid

### Unit tests
Fast tests for:
- event validation and state transitions
- visibility guards and scope checks
- public DTO shaping
- booking and hold helpers
- frontend event directory and detail rendering

### Integration tests
Module-level tests for:
- Events controller/service/repository wiring
- Zoom integration adapter behavior
- notification dispatch ordering
- visibility filtering for public and admin event APIs

### E2E tests
Browser and API journeys for:
- public Events page
- creator Events portal flow
- admin Events governance flow
- private event non-disclosure

## Determinism Rules

- Do not depend on live Zoom, Sanity, email, or third-party auth in tests
- Use fixed fixtures for event ids, slot ids, and users
- Freeze or avoid time-sensitive assertions where possible
- Mock network calls and external providers
- Avoid assertions on full timestamps unless the test controls them

## Functional Test Matrix

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| EVT-F-001 | Creation | Authorized user creates public Zoom-enabled event | Event is created in draft/pending state with public visibility and Zoom enabled |
| EVT-F-002 | Creation | Authorized user creates private Zoom-enabled event | Event is created and hidden from public projections |
| EVT-F-003 | Public listing | Public event appears on website Events page | Public listing shows only published public events |
| EVT-F-004 | Private visibility | Private event does not appear publicly | Event is excluded from public pages and public APIs |
| EVT-F-005 | Availability | Free slot check | Availability returns available |
| EVT-F-006 | Availability | Conflicting slot check | Availability returns conflict |
| EVT-F-007 | Hold | Create tentative hold | Hold is stored and slot becomes temporarily reserved |
| EVT-F-008 | Hold expiry | Expired hold cannot be confirmed | Confirmation fails and the hold becomes expired |
| EVT-F-009 | Booking | Zoom booking succeeds | Event becomes confirmed and Zoom details are stored |
| EVT-F-010 | Booking | Zoom API failure | Booking fails cleanly and email is not sent |
| EVT-F-011 | Email | Confirmation email ordering | Email is sent only after successful booking commit |
| EVT-F-012 | Access | Unauthorized access to private event | Access is denied or filtered safely |
| EVT-F-013 | Audit | Audit trail completeness | Critical state changes are logged with actor and before/after state |
| EVT-F-014 | Leakage | Search/cache/chatbot safety | Private events never appear in public search, cache, chatbot, or SEO data |

## Integration and E2E Scenarios

### Integration
1. Create a public event and assert it is stored with a publication row.
2. Create a private event and assert public projection lookup does not return it.
3. Check slot availability and verify overlapping events are reported.
4. Create a tentative hold and verify the slot is reserved until expiry.
5. Confirm a booking with mocked Zoom success and assert email dispatch happens after the database commit.
6. Cancel a confirmed event and assert the Zoom record is marked cancelled and the publication state is removed.

### E2E
1. Creator opens the portal Events area and creates a public event.
2. Creator creates a private event and confirms it never appears on the public site.
3. Public visitor sees only public published events on `/ar/events` and `/en/events`.
4. Admin user opens an event detail page and sees audit history plus action buttons.
5. Public API requests for private events return a safe not found or forbidden response.

## Negative Tests

- missing title, date, time, mode, or visibility
- zoom-enabled physical-only event
- end time before start time
- slot conflict while a hold exists
- duplicate booking submit with the same idempotency key
- confirm booking without a valid hold
- confirm booking after hold expiry
- publish private event
- unauthorized user attempts to manage an event outside scope
- Zoom or email provider failure does not leak or duplicate state

## Security and Privacy Leakage Tests

- Private events are absent from `/api/v1/public/events`
- Private events are absent from public site pages and sitemap output
- Private events are absent from chatbot answers for public users
- Private event data is not stored in shared cache namespaces
- Zoom host URLs are never exposed in public DTOs
- Audit logs are accessible only to authorized admin roles

## Performance and Concurrency Tests

- two concurrent booking attempts on the same slot produce one hold and one conflict
- repeated confirm requests with the same idempotency key return the same booking outcome
- slot availability remains responsive under moderate load
- public Events page renders without waiting on live CMS during build

## Automation Recommendations

- Backend unit tests for EventsService and authorization rules
- Backend integration tests for controller/service boundary behavior
- Frontend component tests for event directory and detail rendering
- Playwright smoke tests for public and portal event flows
- Contract tests for Zoom and email adapters
- CI gates for public/private leakage checks and booking idempotency

## Required Scripts

- `npm run test`
- `npm run test:watch`
- `npm run test:cov`
- `npm run test:e2e`

## Ownership Rule

Every Events workflow change must include:
- unit coverage for state and policy logic
- integration coverage for controller/service behavior
- at least one user-facing test for the public site or portal

