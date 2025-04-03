import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine where to redirect based on the URL the user came from
      const referer = request.headers.get("referer") || "";
      let redirectPath = "/dashboard"; // Default for patients

      if (referer.includes("/adminlogin")) {
        redirectPath = "/admindash"; // For admin/healthcare workers
      }

      // Use absolute URL for redirect to ensure we don't use localhost in production
      const deployedUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

      // Log the redirect URL for debugging
      console.log(`Redirecting to: ${deployedUrl}${redirectPath}`);

      return NextResponse.redirect(`${deployedUrl}${redirectPath}`);
    }
  }

  // Return the user to an error page with instructions
  const deployedUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  return NextResponse.redirect(`${deployedUrl}/auth/auth-code-error`);
}
