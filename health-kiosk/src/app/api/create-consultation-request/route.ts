import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { doctorId, patientId, patientName } = body;

    // Save to Supabase without a meet link
    const { error } = await supabase.from("consultations").insert([
      {
        doctor_id: doctorId || "unknown",
        patient_id: patientId || "unknown",
        patient_name: patientName || "Unknown Patient",
        status: "pending",
        created_at: new Date().toISOString(),
        meet_link: null, // No meet link yet
      },
    ]);

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json({ error: "Database Error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Consultation request created successfully",
    });
  } catch (error) {
    console.error("Error creating consultation request:", error);
    return NextResponse.json(
      { error: "Failed to create consultation request" },
      { status: 500 }
    );
  }
}
