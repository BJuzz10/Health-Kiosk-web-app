"use server";

import { cookies } from "next/headers";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// Scopes needed for Drive API
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

// Get Google Auth URL
export async function getAuthUrl() {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", SCOPES.join(" "));
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("prompt", "consent");

  return url.toString();
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Update access token cookie
export async function updateAccessTokenCookie(
  accessToken: string,
  expiresIn: number
) {
  (await cookies()).set("google_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: expiresIn,
    path: "/",
  });
}

// Check if user is authenticated
export async function getAuthStatus() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token");
  const refreshToken = cookieStore.get("google_refresh_token");

  if (!accessToken && !refreshToken) {
    return { isAuthenticated: false };
  }

  if (!accessToken && refreshToken) {
    try {
      // We need to refresh the token, but we can't modify cookies here
      // Return a special status that indicates a refresh is needed
      return {
        isAuthenticated: false,
        needsRefresh: true,
        refreshToken: refreshToken.value,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { isAuthenticated: false };
    }
  }

  return { isAuthenticated: true };
}
