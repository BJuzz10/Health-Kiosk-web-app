import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log(
    "Auth callback triggered with code:",
    code ? "present" : "missing"
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user to determine where to redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User authenticated:", user?.email);

      // Determine where to redirect based on user role or other logic
      // For now, we'll use a simple check based on email domain
      // In a real app, you'd check user metadata, roles, etc.
      let redirectPath = "/dashboard"; // Default for patients

      if (user?.email?.includes("admin") || user?.email?.includes("doctor")) {
        redirectPath = "/admindash"; // For admin/healthcare workers
      }

      console.log("Redirecting to:", redirectPath);

      // Use absolute URL for redirect
      const deployedUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
      return NextResponse.redirect(`${deployedUrl}${redirectPath}`);
    } else {
      console.error("Error exchanging code for session:", error);
    }
  } else {
    console.error("No code found in callback URL");
  }

  // Return the user to an error page with instructions
  const deployedUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  return NextResponse.redirect(`${deployedUrl}/auth/auth-code-error`);
}
