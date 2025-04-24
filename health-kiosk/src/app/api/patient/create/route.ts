import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First check if patient data already exists for this user
    const { data: existingPatient, error: fetchError } = await supabase
      .from("patient_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking existing patient:", fetchError);
      return NextResponse.json(
        { error: "Failed to check existing patient" },
        { status: 500 }
      );
    }

    if (existingPatient) {
      return NextResponse.json(existingPatient);
    }

    // If no patient data exists, create it
    const { data: newPatient, error: insertError } = await supabase
      .from("patient_data")
      .insert([
        {
          user_id: userId,
          email: email || null, // Add email if provided
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating patient:", insertError);
      return NextResponse.json(
        { error: "Failed to create patient" },
        { status: 500 }
      );
    }

    return NextResponse.json(newPatient);
  } catch (error) {
    console.error("Error in patient creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
