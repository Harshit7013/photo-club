import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * If the signed-in user's email matches ADMIN_EMAIL, ensure they have the
 * 'admin' role. Safe to call on every login; idempotent.
 */
export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail) return { isAdmin: false };

    const userEmail = (context.claims as { email?: string } | null)?.email?.toLowerCase();
    if (!userEmail || userEmail !== adminEmail) return { isAdmin: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: context.userId, role: "admin" },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    return { isAdmin: true };
  });
