import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Get the base URL (works in both local and deployed environments)
  const baseUrl = requestUrl.origin;

  // Default next path
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const next = requestUrl.searchParams.get("next") ?? "/";

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

      // Log the redirect URL for debugging
      console.log(`Redirecting to: ${baseUrl}${redirectPath}`);

      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
