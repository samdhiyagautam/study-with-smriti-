import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

/**
 * Session refresh + hard gate for the admin area.
 * Real authorization still happens in requireAdmin() and in database RLS —
 * middleware is only the first of three checks.
 */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;

  const forward = NextResponse.next({ request });

  // No credentials yet: keep the login page reachable so it can explain the
  // missing setup, but never expose other admin pages.
  if (!supabaseUrl || !anonKey) {
    if (isLogin) return forward;
    return NextResponse.redirect(
      new URL(`${LOGIN_PATH}?reason=not-configured`, request.url),
    );
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          forward.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectWithCookies = (target: string) => {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    request.cookies.getAll().forEach(({ name, value }) => {
      redirect.cookies.set(name, value);
    });
    forward.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie;
      redirect.cookies.set(name, value, options);
    });
    return redirect;
  };

  if (!user && !isLogin) {
    return redirectWithCookies(`${LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}`);
  }

  if (user && isLogin && !request.nextUrl.searchParams.has("denied")) {
    return redirectWithCookies("/admin");
  }

  return forward;
}

export const config = {
  matcher: ["/admin/:path*"],
};
