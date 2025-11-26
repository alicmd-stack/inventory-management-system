import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Create a Supabase client for use in Middleware
 * This handles session refresh and authentication
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not signed in and the current path is not /auth, redirect to /auth
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = new URL("/auth", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and tries to access /auth, redirect to /inventory
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = new URL("/inventory", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

