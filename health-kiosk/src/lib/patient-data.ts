import { createClient } from "@/utils/supabase/client";

export interface LatestVitals {
  bp_systolic?: number;
  bp_diastolic?: number;
  temperature?: number;
  pulse?: number;
  oxygen_saturation?: number;
  height_cm?: number;
  weight_kg?: number;
}

export interface PatientData {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  sex: string | null;
  birthday: Date | null;
  address: string | null;
  contact: string | null;
  latest_vitals: LatestVitals | null;
  created_at: string;
}

// Add a function to calculate age from birthday
export function calculateAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Checks if a user has complete patient data in the database
 * @param email The user's email address
 * @returns Boolean indicating if the user has complete data
 */

export async function hasCompletePatientData(email: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // Query the patient_data table for the user's email
    const { data, error } = await supabase
      .from("patient_data")
      .select("name, sex, birthday, address, contact")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error checking patient data:", error);
      return false;
    }

    // Check if data exists and all required fields have values
    if (!data) return false;

    // Check if any of the required fields are null or empty
    const requiredFields = ["name", "sex", "birthday", "address", "contact"];
    const hasAllFields = requiredFields.every((field) => {
      const value = data[field as keyof typeof data];
      return value !== null && value !== undefined && value !== "";
    });

    return hasAllFields;
  } catch (error) {
    console.error("Error in hasCompletePatientData:", error);
    return false;
  }
}

/**
 * Gets patient data for a specific user
 * @param email The user's email address
 * @returns The patient data or null if not found
 */
export async function getPatientData(
  email: string
): Promise<PatientData | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("patient_data")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching patient data:", error);
      return null;
    }

    return data as PatientData;
  } catch (error) {
    console.error("Error in getPatientData:", error);
    return null;
  }
}

/**
 * Creates or updates patient data for a user
 * @param patientData The patient data to save
 * @returns Boolean indicating success or failure
 */
export async function savePatientData(
  patientData: Partial<PatientData>
): Promise<boolean> {
  try {
    const supabase = createClient();

    // Check if the record already exists
    const { data: existingData } = await supabase
      .from("patient_data")
      .select("id")
      .eq("email", patientData.email!)
      .single();

    let result;

    if (existingData) {
      // Update existing record
      result = await supabase
        .from("patient_data")
        .update(patientData)
        .eq("email", patientData.email!);
    } else {
      // Insert new record
      result = await supabase.from("patient_data").insert(patientData);
    }

    if (result.error) {
      console.error("Error saving patient data:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in savePatientData:", error);
    return false;
  }
}
