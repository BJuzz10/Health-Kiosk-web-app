import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { processHealthData } from "@/lib/health-data-filter";
import { HealthData } from "@/types/health-data";

// Initialize Supabase client
let supabase: Awaited<ReturnType<typeof createClient>>;

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client if not already initialized
    if (!supabase) {
      supabase = await createClient();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Determine file type
    const fileType = file.name.endsWith(".csv") ? "csv" : "excel";

    // Read file content
    const content =
      fileType === "csv" ? await file.text() : await file.arrayBuffer();

    // Process the file
    const result = await processHealthData(content, file.name, fileType);

    if (!result.success || !result.data || result.data.length === 0) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Save to appropriate Supabase table based on device type
    let saveResult;

    switch (result.deviceType) {
      case "beurer":
        saveResult = await saveTemperatureData(result.data[0], userId);
        break;
      case "healthtree":
        saveResult = await savePulseOximeterData(result.data, userId);
        break;
      case "omron":
        saveResult = await saveBloodPressureData(result.data[0], userId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Unknown device type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      deviceType: result.deviceType,
      data: saveResult,
    });
  } catch (error) {
    console.error("Error processing health data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process the file" },
      { status: 500 }
    );
  }
}

// Helper functions to save data to Supabase
async function saveTemperatureData(data: HealthData, userId: string) {
  const { error, data: result } = await supabase
    .from("temperature_readings")
    .insert({
      user_id: userId,
      temperature: data.temperature,
      measured_at: data.measured_at,
      device_type: data.device_type,
    })
    .select();

  if (error) throw error;
  return result;
}

async function savePulseOximeterData(data: HealthData[], userId: string) {
  const readings = data.map((reading) => ({
    user_id: userId,
    reading_id: reading.reading_id,
    spo2: reading.spo2,
    pulse_rate: reading.pulse_rate,
    measured_at: reading.measured_at,
    device_type: reading.device_type,
  }));

  const { error, data: result } = await supabase
    .from("pulse_oximeter_readings")
    .insert(readings)
    .select();

  if (error) throw error;
  return result;
}

async function saveBloodPressureData(data: HealthData, userId: string) {
  const { error, data: result } = await supabase
    .from("blood_pressure_readings")
    .insert({
      user_id: userId,
      systolic: data.systolic,
      diastolic: data.diastolic,
      pulse_rate: data.pulse_rate,
      measured_at: data.measured_at,
      device_type: data.device_type,
    })
    .select();

  if (error) throw error;
  return result;
}
