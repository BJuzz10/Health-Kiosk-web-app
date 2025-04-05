import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Get source from query params or from referrer as fallback
  let source = requestUrl.searchParams.get("source") || "";
  const referer = request.headers.get("referer") || "";

  // If no source but referer contains adminlogin, set source to adminlogin
  if (!source && referer.includes("adminlogin")) {
    source = "adminlogin";
  }

  console.log(
    "Auth callback triggered with code:",
    code ? "present" : "missing",
    "Source:",
    source,
    "Referer:",
    referer
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

      // Determine where to redirect based on source parameter first, then user role
      let redirectPath = "/dashboard"; // Default for patients

      // If source is adminlogin, always redirect to admindash
      if (source === "adminlogin") {
        redirectPath = "/admindash";
        console.log("Redirecting to admindash based on source parameter");
      }
      // Otherwise check email for admin/doctor indicators
      else if (
        user?.email?.includes("admin") ||
        user?.email?.includes("doctor")
      ) {
        redirectPath = "/admindash"; // For admin/healthcare workers
        console.log("Redirecting to admindash based on email");
      }

      console.log("Final redirect path:", redirectPath);

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
