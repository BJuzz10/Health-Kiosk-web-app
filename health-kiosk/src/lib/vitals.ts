import { createClient } from "@/utils/supabase/client";

// Interface for vitals data
export interface VitalsData {
  id?: string;
  checkup_id: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  temperature: number | null;
  pulse: number | null;
  oxygen_saturation: number | null;
  height_cm: number | null;
  weight_kg: number | null;
}

/**
 * Creates a new vitals record
 * @param vitalsData The vitals data to save
 * @returns The created vitals record or null if failed
 */
export async function createVitals(
  vitalsData: VitalsData
): Promise<VitalsData | null> {
  try {
    const supabase = createClient();

    // Set recorded_at to current time if not provided
    const dataToInsert = {
      ...vitalsData,
    };

    const { data, error } = await supabase
      .from("vitals")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating vitals record:", error);
      return null;
    }

    return data as VitalsData;
  } catch (error) {
    console.error("Error in createVitals:", error);
    return null;
  }
}

/**
 * Updates an existing vitals record
 * @param id The ID of the vitals record to update
 * @param vitalsData The updated vitals data
 * @returns The updated vitals record or null if failed
 */
export async function updateVitals(
  id: string,
  vitalsData: Partial<VitalsData>
): Promise<VitalsData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("vitals")
      .update(vitalsData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating vitals record:", error);
      return null;
    }

    return data as VitalsData;
  } catch (error) {
    console.error("Error in updateVitals:", error);
    return null;
  }
}

/**
 * Gets vitals records for a specific checkup
 * @param checkupId The ID of the checkup
 * @returns Array of vitals records or empty array if none found
 */
export async function getVitalsByCheckupId(
  checkupId: string
): Promise<VitalsData[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("vitals")
      .select("*")
      .eq("checkup_id", checkupId)
      .order("recorded_at", { ascending: false });

    if (error) {
      console.error("Error fetching vitals records:", error);
      return [];
    }

    return data as VitalsData[];
  } catch (error) {
    console.error("Error in getVitalsByCheckupId:", error);
    return [];
  }
}

/**
 * Gets the latest vitals record for a patient
 * @param patientId The ID of the patient
 * @returns The latest vitals record or null if none found
 */
export async function getLatestVitalsForPatient(
  patientId: string
): Promise<VitalsData | null> {
  try {
    const supabase = createClient();

    // First get the latest checkup for this patient
    const { data: checkups, error: checkupError } = await supabase
      .from("checkups")
      .select("id")
      .eq("patient_id", patientId)
      .order("checkup_date", { ascending: false })
      .limit(1);

    if (checkupError || !checkups || checkups.length === 0) {
      console.error("Error fetching latest checkup:", checkupError);
      return null;
    }

    const latestCheckupId = checkups[0].id;

    // Then get the latest vitals for this checkup
    const { data: vitals, error: vitalsError } = await supabase
      .from("vitals")
      .select("*")
      .eq("checkup_id", latestCheckupId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    if (vitalsError) {
      console.error("Error fetching latest vitals:", vitalsError);
      return null;
    }

    return vitals as VitalsData;
  } catch (error) {
    console.error("Error in getLatestVitalsForPatient:", error);
    return null;
  }
}

/**
 * Updates the latest_vitals field in patient_data table
 * @param patientId The ID of the patient
 * @param vitalsData The vitals data to save
 * @returns Boolean indicating success or failure
 */
export async function updatePatientLatestVitals(
  patientId: string,
  vitalsData: VitalsData
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("patient_data")
      .update({ latest_vitals: vitalsData })
      .eq("id", patientId);

    if (error) {
      console.error("Error updating patient latest vitals:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updatePatientLatestVitals:", error);
    return false;
  }
}
