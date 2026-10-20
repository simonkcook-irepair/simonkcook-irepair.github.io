# core-api staging integration patch

Apply these changes to the existing Supabase Edge Function `core-api/index.ts` in a **separate staging project**. Do not deploy over the existing production function until the new customer and technician clients are ready.

1. Add import at top:

```ts
import { requireTechnician, AccessDenied } from "../_shared/require-technician.ts";
```

2. Immediately after the existing `seg` route segments are parsed, insert:

```ts
// Deny all non-public API operations unless the caller is an authorised technician.
// Existing public demo creation is retained for staging compatibility ONLY.
const publicHealth = req.method === "GET" && seg[0] === "health";
const publicDemoCreate =
  req.method === "POST" && seg[0] === "jobs" && seg.length === 1;
if (!publicHealth && !publicDemoCreate) {
  await requireTechnician(req);
}
```

3. At the beginning of the existing outer catch handler, before generic 500 handling:

```ts
if (e instanceof AccessDenied) {
  return json({ error: e.message }, e.status, req.headers.get("origin"));
}
```

4. **Client compatibility:** the current prototype-db.js uses a public anonymous key for all calls. The technician dashboard will receive 401/403 after this gate is enabled until technician OTP login and bearer-token propagation are implemented. Customer job polling will also be blocked; move it to customer-owned authenticated endpoints. This is why this change MUST NOT be deployed in isolation.

5. **Important:** public demo creation still accepts untrusted fields and lacks idempotency. Disable it before a production release and replace it with a rate-limited, validated, transactional booking endpoint.

Test: unauthenticated GET /jobs => 401; anonymous-key GET /jobs => 401; valid non-technician JWT => 403; valid allowlisted technician JWT => 200; customer GET /jobs/{id} => denied; health => 200. Verify CORS and browser behavior separately.

This patch is a source-controlled integration guide, not an applied API change.
