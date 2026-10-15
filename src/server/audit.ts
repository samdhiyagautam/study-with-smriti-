import "server-only";

import { createAdminSupabase } from "@/lib/supabase/server";

/**
 * Best-effort audit logging for admin operations. Never throws — logging
 * must not break the actual operation. Written with the service role.
 */
export async function logAudit(params: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminSupabase();
  if (!admin) return;

  try {
    await admin.from("admin_audit_logs").insert({
      actor_id: params.actorId,
      action: params.action.slice(0, 60),
      entity: params.entity.slice(0, 60),
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (error) {
    console.warn(
      "[audit] failed:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}
