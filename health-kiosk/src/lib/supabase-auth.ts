import { createClient } from "@/utils/supabase/client";

// Create a Supabase client for browser-side authentication
const supabase = createClient();

// Function to sign in with Google
export async function signInWithGoogle() {
  try {
    // Use environment variable for the deployed URL if available
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = new URL("/auth/callback", siteUrl).toString();

    console.log("Redirect URL for Google auth:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
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
export async function signUpWithEmail(email: string, password: string) {
  try {
    // Use environment variable for the deployed URL if available
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = new URL("/auth/callback", siteUrl).toString();

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
