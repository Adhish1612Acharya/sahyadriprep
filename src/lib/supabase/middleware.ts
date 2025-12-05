import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ OPTIMIZATION 1: Check public paths FIRST (before any async calls)
  const publicPaths = [
    "/",
    "/auth/callback",
    "/auth/forgot-password",
    "/auth/confirm",
    "/auth/reset-password",
    "/error",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/interview-experiences/sahyadri/send"
  ];

  const publicApiPaths = ["/api/auth"];

  const isPublicPage = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

  // ✅ OPTIMIZATION 2: Skip auth check for public API routes entirely
  if (isPublicApi) {
    return NextResponse.next();
  }

  // ✅ Now create Supabase client (only if needed)
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ✅ OPTIMIZATION 3: For public pages, just refresh session and return
  if (isPublicPage) {
    // Still call getUser() to refresh session cookies
    await supabase.auth.getUser();
    return supabaseResponse;
  }

  // ✅ Now check user (only for protected routes)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Redirect to login if not authenticated
  if (!user) {
    if (pathname !== "/auth/login" && pathname !== "/auth/sign-up") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set(
        "redirect",
        request.nextUrl.pathname + request.nextUrl.search
      );
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/sign-up")) {
    const url = request.nextUrl.clone();
    if (
      user.user_metadata?.role === "college_admin" ||
      user.user_metadata?.role === "super_admin"
    ) {
      url.pathname = "/admin/dashboard";
    } else {
      url.pathname = "/interview-experiences";
    }
    return NextResponse.redirect(url);
  }

  // ✅ OPTIMIZATION 4: Skip profile check for API routes (authenticated)
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // ✅ OPTIMIZATION 5: Use user_metadata instead of DB query when possible
  const roleFromMetadata = user.user_metadata?.role;
  const profileCompleted = user.user_metadata?.profile_completed;

  // Only fetch from DB if metadata is missing
  let profile = null;

  if (!roleFromMetadata || profileCompleted === undefined) {
    console.warn(`⚠️ Missing metadata for user ${user.id}, fetching from DB`);

    const { data } = await supabase
      .from("profiles")
      .select("role, profile_completed")
      .eq("id", user.id)
      .single();

    profile = data;
  } else {
    // ✅ Use cached metadata (no DB query!)
    profile = {
      role: roleFromMetadata,
      profile_completed: profileCompleted,
    };
  }

  if (!profile) {
    // Profile doesn't exist, redirect to complete profile
    if (pathname !== "/auth/complete-profile") {
      const next_url = request.nextUrl.clone();

      const url = next_url.clone();
      url.pathname = "/auth/complete-profile";
      url.searchParams.set("redirect", next_url.pathname + next_url.search);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ✅ Profile completion check
  if (!profile.profile_completed) {
    if (pathname !== "/auth/complete-profile") {
      const next_url = request.nextUrl.clone();

      const url = next_url.clone();
      url.pathname = "/auth/complete-profile";
      url.searchParams.set("redirect", next_url.pathname + next_url.search);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ✅ Redirect away from complete-profile if already completed
  if (pathname === "/auth/complete-profile") {
    const url = request.nextUrl.clone();
    url.pathname =
      profile.role === "college_admin" || profile.role === "super_admin"
        ? "/admin/dashboard"
        : "/";
    return NextResponse.redirect(url);
  }

  // ✅ Role-based access control for admin routes
  if (pathname.startsWith("/admin")) {
    if (profile.role !== "college_admin" && profile.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
