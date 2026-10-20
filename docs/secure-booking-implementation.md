# Secure booking implementation — development branch

Status: implementation preparation; not deployed.

## Confirmed existing architecture
- Customer entry: index.html -> core.html, scripts through build37 and customer-account49.
- Technician entry: tech.html (Build 46).
- Shared prototype adapter: prototype-db.js.
- Supabase core-api currently writes is_demo=true and uses a service-role database client.
- Customer account Build 49 uses Supabase email OTP.
- Existing repair_jobs has customer_id, device_id, public_ref, service, date, slot, status, price, is_demo.

## Release blockers and implementation sequence
1. **Authentication and authorisation:** require a verified Supabase JWT and server-side technician role on every technician list/update route. Never accept a browser public/anon key as technician identity. Deny by default. Customer job reads must check ownership, or use narrowly scoped expiring repair tokens.
2. **Guest bookings:** create a dedicated narrowly privileged booking endpoint. Validate customer name, contact channel, model, repair, service, price provenance, date and slot server-side. Apply abuse controls. No client-supplied role, job status, payment state, or is_demo flag.
3. **Atomicity and idempotency:** use a transaction/RPC for customer, device, job and initial event. Require a unique idempotency key per submission, handle retry safely, and return one public reference. Existing core-api multi-step inserts can leave orphan rows.
4. **Technician sync:** list only authorised tenant jobs; separate draft/demo records from real jobs; verify cross-device visibility and status propagation.
5. **Customer confirmation:** display success only after committed server response. On timeout, reconcile by idempotency key before retry. Confirm notification delivery independently.
6. **Pricing and stock:** validate against authoritative price/version and availability; never imply a supplier stock check was made if not checked.
7. **Multi-tenancy:** design tenant_id and membership checks before white-label rollout. Current schema is single-business; do not infer isolation from RLS enabled alone.
8. **Deployment:** staging project and secrets, migration review, negative permission tests, browser/device tests, rollback plan, then separately approved release.

## Read-only test gates before any production deployment
- Anonymous user cannot list jobs or change status.
- Customer A cannot view Customer B job.
- Technician with valid role can list and update only authorised jobs.
- Repeated POST with same idempotency key creates exactly one booking.
- Simulated failures leave no orphaned customers/devices.
- New booking appears on technician device; status changes appear for the correct customer.
- No demo records in live technician job list; no live records in demos.
- Security policies and function JWT handling independently reviewed.

**Do not deploy this document as an implementation.** This is the engineering safety baseline; code and database changes remain to be built and tested.
