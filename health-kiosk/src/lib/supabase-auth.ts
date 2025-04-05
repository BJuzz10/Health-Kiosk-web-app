import { createClient } from "@/utils/supabase/client";
import { hasCompletePatientData } from "./patient-data";

// Create a Supabase client for browser-side authentication
const supabase = createClient();

// Function to sign in with Google
export async function signInWithGoogle(source?: string) {
  try {
    // Get the base URL from the environment or window location
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    // Ensure we're using the direct callback URL with source parameter
    let redirectUrl = `${baseUrl}/auth/callback`;

    // Add source parameter if provided
    if (source) {
      redirectUrl += `?source=${source}`;
    }

    console.log(
      "Redirect URL for Google auth:",
      redirectUrl,
      "Source:",
      source
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: source ? { source } : undefined, // Add source as a query param too for redundancy
      },
    });

    if (error) {
      console.error("Google sign-in error:", error);

      // Check for specific provider not enabled error
      if (
        error.message?.includes("provider is not enabled") ||
        error.message?.includes("Unsupported provider")
      ) {
        throw new Error(
          "Google authentication is not configured. Please contact the administrator."
        );
      }

      throw error;
    }

    // After successful Google sign-in, check if we need to create initial patient data
    // This will be handled in the callback route since this redirects to Google

    return data;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

// Function to sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Email sign-in error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
}

// Function to sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  source?: string
) {
  try {
    // Get the base URL from the environment or window location
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    // Ensure we're using the direct callback URL
    let redirectUrl = `${baseUrl}/auth/callback`;

    // Add source parameter if provided
    if (source) {
      redirectUrl += `?source=${source}`;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Email sign-up error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
}

// Function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }

  return true;
}

// Function to get current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Get user error:", error);
    return null;
  }

  return user;
}

// Function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Function to check if user has complete profile data and determine redirect path
export async function getRedirectPathAfterAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return "/form"; // Not authenticated, go to home
  }

  // Check if user is admin/doctor based on email
  if (user.email?.includes("admin") || user.email?.includes("doctor")) {
    return "/admindash"; // Admin/doctor dashboard
  }

  // For regular users, check if they have complete patient data
  const hasData = await hasCompletePatientData(user.email!);

  return hasData ? "/dashboard" : "/user"; // Go to dashboard if data exists, otherwise to user profile
}
