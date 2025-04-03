// Create a new middleware.ts file in the root of your project
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update the session first
  const response = await updateSession(request);

  // Check if the URL contains a code parameter but is not the callback route
  const url = new URL(request.url);
  if (
    url.searchParams.has("code") &&
    !url.pathname.includes("/auth/callback")
  ) {
    // Redirect to the callback route with the code
    const code = url.searchParams.get("code");
    return NextResponse.redirect(
      new URL(`/auth/callback?code=${code}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|images|public|auth/callback).*)",
  ],
};
