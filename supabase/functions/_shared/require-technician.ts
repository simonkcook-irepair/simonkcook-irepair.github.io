// iRepair Core: authenticated technician gate, staging source only.
// Not deployed. Import into every technician endpoint before accessing service-role data.
// Configure IREPAIR_TECHNICIAN_USER_IDS as comma-separated Supabase auth UUIDs.
// The allowlist is server-side; no client-supplied role or email is trusted.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

export class AccessDenied extends Error {
  constructor(public status: 401 | 403, message: string) { super(message); }
}
export async function requireTechnician(req: Request): Promise<string> {
  const header = req.headers.get("authorization") ?? "";
  const token = /^Bearer\s+(.+)$/i.exec(header)?.[1]?.trim();
  if (!token) throw new AccessDenied(401, "Authentication required");
  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !publishable) throw new Error("Authentication configuration missing");
  const authClient = createClient(url, publishable, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) {
    throw new AccessDenied(401, "Invalid or anonymous session");
  }
  const allowed = new Set(
    (Deno.env.get("IREPAIR_TECHNICIAN_USER_IDS") ?? "")
      .split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  );
  if (!allowed.has(data.user.id.toLowerCase())) {
    throw new AccessDenied(403, "Technician access denied");
  }
  return data.user.id;
}
