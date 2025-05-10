// Create a new middleware.ts file in the root of your project
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll: (cookies) => {
          cookies.forEach(({ name, value, ...options }) => {
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the current path
  const path = request.nextUrl.pathname;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/userlogin",
    "/adminlogin",
    "/about",
    "/contacts",
    "/language-select",
    "/form",
  ];
  const isStaticFile = pathname.match(/\.(.*)$/);

  // If it's a public route, allow access
  if (!user && (isStaticFile || publicRoutes.includes(path))) {
    return response;
  }

  // If user is not authenticated and trying to access protected routes
  if (!user) {
    if (!publicRoutes.includes(path)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("redirectedFrom", path);
      return NextResponse.redirect(redirectUrl);
    }
    return response; // Allow access to public routes
  }

  // If user is authenticated, always redirect them away from public routes
  if (user && publicRoutes.includes(path)) {
    const userType = user.user_metadata?.user_type;

    if (userType === "doctor") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admindash"; // Redirect doctors to admin dashboard
      return NextResponse.redirect(redirectUrl);
    } else if (userType === "patient") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard"; // Redirect patients to user dashboard
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Add headers to prevent caching of responses
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
