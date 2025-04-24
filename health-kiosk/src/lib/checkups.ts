import { createClient } from "@/utils/supabase/client";

// Interface for checkup data
export interface CheckupData {
  id?: string;
  patient_id: string;
  reason: string | null;
  checkup_date: Date;
  created_at?: Date;
}

/**
 * Creates a new checkup record
 * @param checkupData The checkup data to save
 * @returns The created checkup record or null if failed
 */
export async function createCheckup(
  checkupData: CheckupData
): Promise<CheckupData | null> {
  try {
    const supabase = createClient();

    // Set created_at to current time if not provided
    const dataToInsert = {
      ...checkupData,
      created_at: checkupData.created_at || new Date(),
    };

    const { data, error } = await supabase
      .from("checkups")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating checkup record:", error);
      return null;
    }

    return data as CheckupData;
  } catch (error) {
    console.error("Error in createCheckup:", error);
    return null;
  }
}

/**
 * Updates an existing checkup record
 * @param id The ID of the checkup record to update
 * @param checkupData The updated checkup data
 * @returns The updated checkup record or null if failed
 */
export async function updateCheckup(
  id: string,
  checkupData: Partial<CheckupData>
): Promise<CheckupData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checkups")
      .update(checkupData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating checkup record:", error);
      return null;
    }

    return data as CheckupData;
  } catch (error) {
    console.error("Error in updateCheckup:", error);
    return null;
  }
}

/**
 * Gets checkup records for a specific patient
 * @param patientId The ID of the patient
 * @returns Array of checkup records or empty array if none found
 */
export async function getCheckupsByPatientId(
  patientId: string
): Promise<CheckupData[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checkups")
      .select("*")
      .eq("patient_id", patientId)
      .order("checkup_date", { ascending: false });

    if (error) {
      console.error("Error fetching checkup records:", error);
      return [];
    }

    return data as CheckupData[];
  } catch (error) {
    console.error("Error in getCheckupsByPatientId:", error);
    return [];
  }
}

/**
 * Gets a specific checkup record by ID
 * @param id The ID of the checkup record
 * @returns The checkup record or null if not found
 */
export async function getCheckupById(id: string): Promise<CheckupData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checkups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching checkup record:", error);
      return null;
    }

    return data as CheckupData;
  } catch (error) {
    console.error("Error in getCheckupById:", error);
    return null;
  }
}

/**
 * Gets the latest checkup record for a patient
 * @param patientId The ID of the patient
 * @returns The latest checkup record or null if none found
 */
export async function getLatestCheckupForPatient(
  patientId: string
): Promise<CheckupData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checkups")
      .select("*")
      .eq("patient_id", patientId)
      .order("checkup_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching latest checkup:", error);
      return null;
    }

    return data as CheckupData;
  } catch (error) {
    console.error("Error in getLatestCheckupForPatient:", error);
    return null;
  }
}

/**
 * Creates a new checkup with vitals in a single transaction
 * @param checkupData The checkup data
 * @param vitalsData The vitals data
 * @returns Object containing the created checkup and vitals, or null if failed
 */
export async function createCheckupWithVitals(
  checkupData: CheckupData,
  vitalsData: Omit<import("./vitals").VitalsData, "checkup_id">
): Promise<{
  checkup: CheckupData;
  vitals: import("./vitals").VitalsData;
} | null> {
  try {
    const supabase = createClient();

    // Start a transaction
    const { data: checkup, error: checkupError } = await supabase
      .from("checkups")
      .insert({
        ...checkupData,
        created_at: checkupData.created_at || new Date(),
      })
      .select()
      .single();

    if (checkupError) {
      console.error("Error creating checkup in transaction:", checkupError);
      return null;
    }

    // Create vitals with the new checkup ID
    const { data: vitals, error: vitalsError } = await supabase
      .from("vitals")
      .insert({
        ...vitalsData,
        checkup_id: checkup.id,
        recorded_at: new Date(),
      })
      .select()
      .single();

    if (vitalsError) {
      console.error("Error creating vitals in transaction:", vitalsError);
      // Note: In a real transaction, we would rollback here, but Supabase doesn't support
      // true transactions in the client library yet
      return null;
    }

    // Update the patient's latest_vitals
    await supabase
      .from("patient_data")
      .update({ latest_vitals: vitals })
      .eq("id", checkupData.patient_id);

    return {
      checkup: checkup as CheckupData,
      vitals: vitals as import("./vitals").VitalsData,
    };
  } catch (error) {
    console.error("Error in createCheckupWithVitals:", error);
    return null;
  }
}
