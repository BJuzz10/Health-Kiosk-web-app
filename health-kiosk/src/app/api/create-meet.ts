import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This is a simplified version that uses a service account instead of user OAuth
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { doctorId, patientId } = body;

    // For demo purposes, we'll use a direct approach without requiring user OAuth
    // In production, you should use proper OAuth flow with user consent

    // Create a Google Meet link (simulated for now)
    const meetLink = `https://meet.google.com/lookup/${generateRandomCode()}`;

    // Save to Supabase
    const { error } = await supabase.from("consultations").insert([
      {
        doctor_id: doctorId || "unknown",
        patient_id: patientId || "unknown",
        meet_link: meetLink,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json({ error: "Database Error" }, { status: 500 });
    }

    return NextResponse.json({ meetLink });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
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
