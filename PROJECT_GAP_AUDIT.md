## Car Service Booking System Gap Audit

This audit maps the current codebase to the 15 user stories from the shared project description.

### Status legend

- Implemented: end-to-end code exists and has already been exercised in the current project.
- Partial: some backend/frontend pieces exist, but the story is not complete or still has hardcoded or weak behavior.
- Missing: no meaningful end-to-end implementation found yet.

### US01 Secure Login Access

Status: Partial

- Present:
  - `AuthController` exposes register/login.
  - `AuthServiceImpl` encodes passwords with bcrypt and returns JWT-like token payload.
- Gaps:
  - `SecurityConfig` currently uses `anyRequest().permitAll()`.
  - No request authentication filter is wired into Spring Security.
  - No real session timeout, failed-attempt lockout, logout invalidation, or login audit trail.

### US02 Role Based Access Control

Status: Partial

- Present:
  - `UserType` roles exist.
  - Frontend has some route separation by role.
- Gaps:
  - Backend RBAC is not enforced because security permits all requests.
  - Permission checks are not centralized.
  - Access-violation audit logging is not implemented end to end.

### US03 Customer Profile And Vehicles

Status: Partial

- Present:
  - Customer profile pages exist.
  - Vehicle add/list backend exists.
  - Vehicle entity and document linkage exist.
- Gaps:
  - Vehicle deactivation flow is commented out in backend.
  - Unique VIN is enforced, but per-customer default vehicle, export/delete, and stronger validation are incomplete.
  - Document upload is still URL-based rather than a real upload flow.
  - Customer history view is not fully connected through the UI.

### US04 Workshop Capacity Configuration

Status: Partial to Implemented

- Present:
  - Workshop, blackout, shift, heatmap, slot capacity controllers exist.
  - Manager capacity frontend exists with workshop, bays, roster, blackout, and rules pages.
  - Booking capacity calculation already considers workshop hours, blackout dates, rule capacity, and physical capacity.
- Gaps:
  - Export and audit coverage appear limited.
  - Need end-to-end verification that all manager screens are backend-driven and not only static shells.

### US05 Service Catalog And Pricing

Status: Partial

- Present:
  - Service, package, add-on schema exists.
  - Extended catalog tables exist in SQL.
- Gaps:
  - Service-manager frontend has no clear full CRUD surface for services/packages/add-ons.
  - Backend catalog versioning/history is limited.
  - Filtering, printable export, dependency/exclusion management need stronger end-to-end implementation.

### US06 Slot Search And Booking

Status: Partial

- Present:
  - `BookingService` supports slot search, booking creation, cancellation, rescheduling, pickup/drop scheduling, reference numbers, and conflict checks.
  - `CustomerSchedulingController` exposes slot lookup.
- Gaps:
  - Customer dashboard/booking UI is incomplete.
  - `MyBookings.tsx` is currently hardcoded.
  - Booking route coverage in frontend is incomplete and needs consolidation into a real end-to-end customer flow.

### US07 Work Order Lifecycle

Status: Implemented to Partial

- Present:
  - Booking auto-creates work orders.
  - Technician list/details for work orders are working.
  - Status updates, assignment, and lifecycle endpoints exist.
  - Technician-visible work-order board is functional.
- Gaps:
  - Attachments per stage and stronger transition validation need verification.
  - SLA/TAT indicators are only partly represented.
  - Customer read-only tracking of lifecycle needs broader UI verification.

### US08 Diagnosis And Estimate Approval

Status: Implemented

- Present:
  - Findings/checklist/notes flow.
  - Estimate draft/save/send/approve/convert endpoints.
  - Estimate status/version columns and approval tracking in DB.
  - Technician estimate UI and customer approval path are already working.
- Gaps:
  - Dedicated PDF generation is currently browser-print style rather than server-generated.

### US09 Parts Consumption

Status: Implemented to Partial

- Present:
  - Parts catalog/list/search.
  - Add/remove parts from work order.
  - Stock decrement and backorder handling.
  - Invoice item sync from part usage.
  - Technician parts list is working.
- Gaps:
  - Substitute suggestions are still minimal/manual.
  - Stock adjustment permissions and audit trail need hardening.
  - Usage export is not yet verified end to end.

### US10 Invoices And Payments

Status: Implemented to Partial

- Present:
  - Customer invoice list and detail.
  - Line items, subtotal/tax/discount/paid/balance.
  - Payment recording with pending/partial/paid statuses.
  - Receipt metadata generation.
  - Customer invoice UI is now backend-driven.
- Gaps:
  - Refund/waiver flow is not implemented.
  - Locked-after-payment enforcement needs review across all edit paths.
  - PDF/email actions are still lightweight.

### US11 Pickup And Drop

Status: Partial

- Present:
  - Pickup/drop request creation during booking.
  - Pickup status DTO/service methods.
  - Pickup controller exists.
  - Fees/config tables exist in SQL.
- Gaps:
  - Driver/partner assignment workflow is thin.
  - Proof upload and customer-facing tracking UI are incomplete.
  - Cancellation and delivery progression need broader frontend support.

### US12 Notification Templates

Status: Partial to Missing

- Present:
  - Notifications table exists.
  - Project description expects templates/logging.
- Gaps:
  - No confirmed template editor, retry policy, consent, or delivery-log UI.
  - No verified backend template engine or placeholder rendering flow.

### US13 Feedback And Reviews

Status: Partial

- Present:
  - Feedback schema exists and has already been extended with tags/manager response timestamps.
  - Customer feedback page exists.
- Gaps:
  - End-to-end request-after-closure flow is not verified.
  - Manager response, moderation, export, and analytics are incomplete.

### US14 Dashboards And Reports

Status: Partial

- Present:
  - `ReportController` and `ReportService` expose summary, top services, technician productivity, work-order status, and workshop revenue.
- Gaps:
  - Current reporting is basic and mostly aggregate-only.
  - No evidence yet of full date-range drilldown, prior-period comparison, or capacity/TAT chart UI.
  - Manager dashboard coverage is still narrower than the story requires.

### US15 Auditability And System Settings

Status: Partial to Missing

- Present:
  - `audit_logs` table exists.
  - Base security/config classes exist.
- Gaps:
  - Append-only audited operations are not consistently enforced.
  - No admin-only audit UI found.
  - Branding, maintenance mode, backup/restore settings, and system info page are not yet complete.

## Major hardcoded or structurally weak areas found

- `frontend/src/pages/Customer/MyBookings/MyBookings.tsx` uses hardcoded booking cards.
- `frontend/src/routes/AppRoutes.tsx` still has placeholder technician routes and shallow manager coverage.
- `common/config/SecurityConfig.java` currently permits all requests.
- Vehicle flow is only basic add/list; deactivate/update/default/export behaviors are incomplete.
- Reporting is backend-light and not yet reflected as a full manager reporting module.

## Strongest working slice today

The most complete live slice in the current project is:

- customer/technician authentication basics
- booking creation with capacity checks
- work-order auto generation
- technician work-order board/details
- diagnosis and estimate flow
- parts consumption
- customer invoice viewing and payment recording

## Recommended implementation order

1. Fix US01 and US02 foundations: real Spring Security enforcement, JWT request auth, route guards cleanup.
2. Remove hardcoded customer flow: real bookings list, real booking screen, real profile/vehicle management.
3. Finish service-manager catalog and reporting surfaces.
4. Complete pickup/drop, notifications, feedback, and audit/settings modules.

