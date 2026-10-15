import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { LoginNotice } from "@/components/admin/login-notice";
import { supabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Owner login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-md">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex rounded-md bg-logo-bg px-1 py-0.5">
            <Image
              src="/logo/logo-letterhead.png"
              alt="Study with Smriti"
              width={2450}
              height={407}
              className="h-10 w-auto"
            />
          </span>
        </div>

        <h1 className="text-center text-2xl font-bold">Admin panel</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Restricted to the website owner and authorized administrators.
        </p>

        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginNotice />
          </Suspense>
          <LoginForm configured={supabaseConfig.configured} />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Sessions are protected by middleware, server-side role checks and
        database row-level security.
      </p>
    </div>
  );
}
