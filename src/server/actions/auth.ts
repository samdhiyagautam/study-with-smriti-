"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

/**
 * Owner/admin sign-in. Only provisioned accounts can authenticate (public
 * sign-ups are disabled in Supabase — see supabase/provision_owner.sql).
 * Error messages are deliberately generic to avoid account enumeration.
 */
export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { error: "Sign-in is not configured yet (missing Supabase keys)." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.warn("[auth] sign-in failed:", error.message);
    return {
      error:
        error.message.toLowerCase().includes("confirm")
          ? "Please confirm your email address first."
          : "Invalid email or password.",
    };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
