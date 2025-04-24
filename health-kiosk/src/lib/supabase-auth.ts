import { createBrowserClient } from "@supabase/ssr";
import { hasCompletePatientData } from "./patient-data";

// Create a Supabase client for browser-side operations
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function handleSignUp(email: string, password: string) {
  try {
    // Create auth user first
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("No user data returned after signup");

    // Create patient data with auth user's UID
    const { error: patientError } = await supabase.from("patient_data").insert({
      user_id: authData.user.id, // This is the key part - linking auth UID to patient_data
      email: email,
    });

    if (patientError) {
      console.error("Error creating patient data:", patientError);
      await supabase.auth.signOut();
      throw patientError;
    }

    return authData;
  } catch (error) {
    console.error("Error in handleSignUp:", error);
    throw error;
  }
}

export async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function handleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getPatientDataByUserId(userId: string) {
  const { data, error } = await supabase
    .from("patient_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

// Function to get current user and their patient data
export async function getCurrentUserAndPatientData() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return { user: null, patientData: null };

    const patientData = await getPatientDataByUserId(user.id);
    return { user, patientData };
  } catch (error) {
    console.error("Error in getCurrentUserAndPatientData:", error);
    return { user: null, patientData: null };
  }
}
