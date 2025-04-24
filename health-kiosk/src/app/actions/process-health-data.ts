"use server";

import { createClient } from "@/utils/supabase/server";
import { processHealthData } from "@/lib/health-data-filter";
import { HealthData } from "@/types/health-data";

type VitalType =
  | "bp_systolic"
  | "bp_diastolic"
  | "temperature"
  | "pulse"
  | "oxygen_saturation"
  | "height_cm"
  | "weight_kg";

interface VitalMeasurement {
  checkup_id: string;
  type: VitalType;
  value: number;
  unit?: string;
  recorded_at?: string;
}

// Initialize Supabase client
let supabase: Awaited<ReturnType<typeof createClient>>;

function transformToVitalMeasurement(
  data: HealthData,
  type: VitalType,
  unit?: string
): VitalMeasurement {
  return {
    checkup_id: data.reading_id || crypto.randomUUID(),
    type,
    value: getValueByType(data, type),
    unit,
    recorded_at: data.measured_at,
  };
}

function getValueByType(data: HealthData, type: VitalType): number {
  switch (type) {
    case "temperature":
      return data.temperature || 0;
    case "pulse":
      return data.pulse_rate || 0;
    case "oxygen_saturation":
      return data.spo2 || 0;
    case "bp_systolic":
      return data.systolic || 0;
    case "bp_diastolic":
      return data.diastolic || 0;
    default:
      return 0;
  }
}

/**
 * Process a health data file and save to Supabase
 */
export async function processAndSaveHealthData(formData: FormData) {
  try {
    // Initialize the Supabase client if not already initialized
    if (!supabase) {
      supabase = await createClient();
    }

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Determine file type
    const fileType = file.name.endsWith(".csv") ? "csv" : "excel";

    // Read file content
    const content =
      fileType === "csv" ? await file.text() : await file.arrayBuffer();

    // Process the file
    const result = await processHealthData(content, file.name, fileType);

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: result.error };
    }

    // Save to appropriate Supabase table based on device type
    let saveResult;

    switch (result.deviceType) {
      case "beurer":
        saveResult = await saveTemperatureData(
          transformToVitalMeasurement(result.data[0], "temperature", "°C")
        );
        break;
      case "healthtree":
        const pulseOximeterData = result.data
          .map((data) => [
            transformToVitalMeasurement(data, "oxygen_saturation", "%"),
            transformToVitalMeasurement(data, "pulse", "bpm"),
          ])
          .flat();
        saveResult = await savePulseOximeterData(pulseOximeterData);
        break;
      case "omron":
        const bloodPressureData = [
          transformToVitalMeasurement(result.data[0], "bp_systolic", "mmHg"),
          transformToVitalMeasurement(result.data[0], "bp_diastolic", "mmHg"),
          transformToVitalMeasurement(result.data[0], "pulse", "bpm"),
        ];
        saveResult = await saveBloodPressureData(bloodPressureData);
        break;
      default:
        return { success: false, error: "Unknown device type" };
    }

    return {
      success: true,
      deviceType: result.deviceType,
      data: saveResult,
    };
  } catch (error) {
    console.error("Error processing health data:", error);
    return { success: false, error: "Failed to process the file" };
  }
}

/**
 * Save temperature data to Supabase
 */
async function saveTemperatureData(data: VitalMeasurement) {
  const { error, data: result } = await supabase
    .from("vital_measurements")
    .insert({
      checkup_id: data.checkup_id,
      type: "temperature",
      value: data.value,
      unit: "°C",
      recorded_at: data.recorded_at || new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return result;
}

/**
 * Save pulse oximeter data to Supabase
 */
async function savePulseOximeterData(data: VitalMeasurement[]) {
  const readings = data.map((reading) => ({
    checkup_id: reading.checkup_id,
    type: reading.type,
    value: reading.value,
    unit: reading.unit || (reading.type === "oxygen_saturation" ? "%" : "bpm"),
    recorded_at: reading.recorded_at || new Date().toISOString(),
  }));

  const { error, data: result } = await supabase
    .from("vital_measurements")
    .insert(readings)
    .select();

  if (error) throw error;
  return result;
}

/**
 * Save blood pressure data to Supabase
 */
async function saveBloodPressureData(data: VitalMeasurement[]) {
  const readings = data.map((reading) => ({
    checkup_id: reading.checkup_id,
    type: reading.type,
    value: reading.value,
    unit: reading.unit || (reading.type === "bp_systolic" ? "mmHg" : "bpm"),
    recorded_at: reading.recorded_at || new Date().toISOString(),
  }));

  const { error, data: result } = await supabase
    .from("vital_measurements")
    .insert(readings)
    .select();

  if (error) throw error;
  return result;
}
