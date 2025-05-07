import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// This is a simplified version that uses a service account instead of user OAuth
export async function POST(request: Request) {
  try {
    console.log("Starting create-meet request...");

    // Initialize Supabase client
    const supabase = await createClient();
    console.log("Supabase client initialized");

    // Parse the request body
    const body = await request.json();
    const { doctorId, patientId } = body;
    console.log("Request body:", { doctorId, patientId });

    // For demo purposes, we'll use a direct approach without requiring user OAuth
    // In production, you should use proper OAuth flow with user consent

    // Create a Google Meet link
    const meetLink = `https://meet.google.com/lookup/${generateRandomCode()}`;
    console.log("Generated meet link:", meetLink);

    try {
      // Save to Supabase
      console.log("Attempting to insert into consultations table...");
      const { error } = await supabase.from("consultations").insert([
        {
          doctor_id: doctorId || "unknown",
          patient_id: patientId || "unknown",
          meet_link: meetLink,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase Error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return NextResponse.json(
          {
            error: "Database Error",
            details: error.message,
            code: error.code,
            hint: error.hint,
          },
          { status: 500 }
        );
      }

      console.log("Successfully created meeting");
      return NextResponse.json({ meetLink });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json(
        {
          error: "Database Operation Failed",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in create-meet endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to create meeting",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate a random code for the meet link
function generateRandomCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) result += "-";
  }
  return result;
}
