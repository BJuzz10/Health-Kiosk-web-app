import { createClient } from "@/utils/supabase/client";
import { type PatientData, calculateAge } from "./patient-data";
import type { VitalsData } from "./vitals";
import type { CheckupData } from "./checkups";
import { createClient as createServerClient } from "@/utils/supabase/server";

/**
 * Gets a patient's complete profile including calculated age
 * @param patientId The ID of the patient
 * @returns The patient profile with calculated age or null if not found
 */
export async function getPatientProfile(
  patientId: string
): Promise<(PatientData & { age: number }) | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("patient_data")
      .select("*")
      .eq("id", patientId)
      .single();

    if (error) {
      console.error("Error fetching patient profile:", error);
      return null;
    }

    const patient = data as PatientData;

    // Calculate age from birthday if available
    let age = 0;
    if (patient.birthday) {
      age = calculateAge(new Date(patient.birthday));
    }

    return {
      ...patient,
      age,
    };
  } catch (error) {
    console.error("Error in getPatientProfile:", error);
    return null;
  }
}

/**
 * Gets a patient's complete medical history
 * @param patientId The ID of the patient
 * @returns Object containing patient data, checkups, and vitals
 */
export async function getPatientMedicalHistory(patientId: string): Promise<{
  patient: (PatientData & { age: number }) | null;
  checkups: CheckupData[];
  vitals: Record<string, VitalsData[]>;
}> {
  try {
    const supabase = createClient();

    // Get patient data
    const patientProfile = await getPatientProfile(patientId);

    // Get all checkups for this patient
    const { data: checkupsData, error: checkupsError } = await supabase
      .from("checkups")
      .select("*")
      .eq("patient_id", patientId)
      .order("checkup_date", { ascending: false });

    if (checkupsError) {
      console.error("Error fetching patient checkups:", checkupsError);
      return { patient: patientProfile, checkups: [], vitals: {} };
    }

    const checkups = checkupsData as CheckupData[];

    // Get vitals for each checkup
    const vitals: Record<string, VitalsData[]> = {};

    for (const checkup of checkups) {
      const { data: vitalsData, error: vitalsError } = await supabase
        .from("vitals")
        .select("*")
        .eq("checkup_id", checkup.id)
        .order("recorded_at", { ascending: false });

      if (!vitalsError && vitalsData) {
        vitals[checkup.id!] = vitalsData as VitalsData[];
      }
    }

    return {
      patient: patientProfile,
      checkups,
      vitals,
    };
  } catch (error) {
    console.error("Error in getPatientMedicalHistory:", error);
    return { patient: null, checkups: [], vitals: {} };
  }
}

/**
 * Gets patients with their latest vitals for admin dashboard
 * @param limit Number of patients to return
 * @param offset Pagination offset
 * @returns Array of patients with their latest vitals and calculated age
 */
export async function getPatientsWithLatestVitals(
  limit = 10,
  offset = 0
): Promise<(PatientData & { age: number })[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("patient_data")
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patients with vitals:", error);
      return [];
    }

    // Calculate age for each patient
    return data.map((patient: PatientData) => {
      let age = 0;
      if (patient.birthday) {
        age = calculateAge(new Date(patient.birthday));
      }

      return {
        ...patient,
        age,
      };
    });
  } catch (error) {
    console.error("Error in getPatientsWithLatestVitals:", error);
    return [];
  }
}

/**
 * Searches for patients by name or email
 * @param searchTerm The search term
 * @param limit Number of results to return
 * @returns Array of matching patients with calculated age
 */
export async function searchPatients(
  searchTerm: string,
  limit = 10
): Promise<(PatientData & { age: number })[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("patient_data")
      .select("*")
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      console.error("Error searching patients:", error);
      return [];
    }

    // Calculate age for each patient
    return data.map((patient: PatientData) => {
      let age = 0;
      if (patient.birthday) {
        age = calculateAge(new Date(patient.birthday));
      }

      return {
        ...patient,
        age,
      };
    });
  } catch (error) {
    console.error("Error in searchPatients:", error);
    return [];
  }
}

export async function getOrCreatePatientData(userId: string) {
  const supabase = await createServerClient();

  // First try to get existing patient data
  const { data: existingPatient, error: fetchError } = await supabase
    .from("patient_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "not found" error
    throw fetchError;
  }

  if (existingPatient) {
    return existingPatient;
  }

  // If no patient data exists, create it
  const { data: newPatient, error: insertError } = await supabase
    .from("patient_data")
    .insert([{ user_id: userId }])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newPatient;
}
