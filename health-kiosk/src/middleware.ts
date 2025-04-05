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
    // Redirect to the callback route with the code and preserve source parameter
    const code = url.searchParams.get("code");
    const source = url.searchParams.get("source");

    let callbackUrl = `/auth/callback?code=${code}`;
    if (source) {
      callbackUrl += `&source=${source}`;
    }

    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|images|public|auth/callback).*)",
  ],
};
