// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // Do not run code between createServerClient and
//   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
//   // issues with users being randomly logged out.

//   // IMPORTANT: DO NOT REMOVE auth.getUser()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith("/login") &&
//     !request.nextUrl.pathname.startsWith("/signup") &&
//     !request.nextUrl.pathname.startsWith("/auth") &&
//     !request.nextUrl.pathname.startsWith("/error") &&
//     !request.nextUrl.pathname.startsWith("/")
//   ) {
//     // no user, potentially respond by redirecting the user to the login page
//     const url = request.nextUrl.clone();
//     url.pathname = "/auth/login";
//     return NextResponse.redirect(url);
//   }

//   // IMPORTANT: You *must* return the supabaseResponse object as it is.
//   // If you're creating a new response object with NextResponse.next() make sure to:
//   // 1. Pass the request in it, like so:
//   //    const myNewResponse = NextResponse.next({ request })
//   // 2. Copy over the cookies, like so:
//   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
//   // 3. Change the myNewResponse object to fit your needs, but avoid changing
//   //    the cookies!
//   // 4. Finally:
//   //    return myNewResponse
//   // If this is not done, you may be causing the browser and server to go out
//   // of sync and terminate the user's session prematurely!

//   return supabaseResponse;
// }

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const { pathname } = request.nextUrl;

//   // ✅ Define public routes (pages that don't require login)
//   const publicPaths = [
//     "/", // Home page
//     "/auth/login", // Login page
//     "/auth/sign-up", // Signup page
//     "/auth/callback", // OAuth callback
//     "/error", // Error page
//     "/api/auth/sign-up"
//   ];

//   // ✅ Check if current path is public
//   const isPublicPath = publicPaths.some(
//     (path) => pathname === path || pathname.startsWith(`${path}/`)
//   );

//   // ✅ Allow access to public paths without authentication
//   if (isPublicPath) {
//     return supabaseResponse;
//   }

//   // ✅ Redirect to login if not authenticated on protected routes
//   if (!user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/auth/login";
//     return NextResponse.redirect(url);
//   }

//   // ✅ For authenticated users, check profile completion
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role, profile_completed")
//     .eq("id", user.id)
//     .single();

//   // If profile not completed, redirect to complete profile
//   if (profile && !profile.profile_completed) {
//     if (pathname !== "/auth/complete-profile") {
//       const url = request.nextUrl.clone();
//       url.pathname = "/auth/complete-profile";
//       return NextResponse.redirect(url);
//     }
//     return supabaseResponse;
//   }

//   // If profile is completed but user is on complete-profile page, redirect based on role
//   if (profile?.profile_completed && pathname === "/auth/complete-profile") {
//     const url = request.nextUrl.clone();
//     url.pathname =
//       profile.role === "college_admin"
//         ? "/admin/dashboard"
//         : "/interview-experiences";
//     return NextResponse.redirect(url);
//   }

//   // ✅ Role-based access control for admin routes
//   if (pathname.startsWith("/admin")) {
//     if (profile?.role !== "college_admin" && profile?.role !== "super_admin") {
//       const url = request.nextUrl.clone();
//       url.pathname = "/interview-experiences"; // Redirect non-admins
//       return NextResponse.redirect(url);
//     }
//   }

//   return supabaseResponse;
// }

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ OPTIMIZATION 1: Check public paths FIRST (before any async calls)
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/forgot-password",
    "/auth/confirm",
    "/auth/reset-password",
    "/error",
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
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
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
      const url = request.nextUrl.clone();
      url.pathname = "/auth/complete-profile";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ✅ Profile completion check
  if (!profile.profile_completed) {
    if (pathname !== "/auth/complete-profile") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/complete-profile";
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
