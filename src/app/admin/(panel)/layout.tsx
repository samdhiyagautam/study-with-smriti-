import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminOrRedirect } from "@/lib/supabase/server";

/**
 * Admin shell — always server-rendered per request:
 *  1. middleware blocks unauthenticated visitors,
 *  2. requireAdminOrRedirect verifies session + database role,
 *  3. RLS enforces permissions on every query.
 */
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminOrRedirect();

  return (
    <div className="min-h-screen bg-surface">
      <AdminNav email={admin.email} role={admin.role} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
