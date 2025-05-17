"use client";

import { useState, useEffect, type ChangeEvent, Suspense } from "react";
import { FaChevronLeft, FaChevronRight, FaSave } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { calculateAge } from "@/lib/patient-data";

interface PatientData {
  fullName: string;
  age: string;
  sex: string;
  birthday: string;
  address: string;
  contactNumber: string;
  height: string;
  weight: string;
  systolic: string;
  diastolic: string;
  pulseRate: string;
  oxygenSaturation: string;
  temperature: string;
  symptoms: string;
  doctorNote: string;
}

function PatientInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id"); // This is now the internal patient ID

  const [formData, setFormData] = useState<PatientData>({
    fullName: "",
    age: "",
    sex: "",
    birthday: "",
    address: "",
    contactNumber: "",
    height: "",
    weight: "",
    systolic: "",
    diastolic: "",
    pulseRate: "",
    oxygenSaturation: "",
    temperature: "",
    symptoms: "",
    doctorNote: "",
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch patient data when component mounts
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        const supabase = createClient();

        // Get patient profile including doctor's note
        const { data: patientData, error: patientError } = await supabase
          .from("patient_data")
          .select("*, doctor_note")
          .eq("id", patientId) // Changed from auth_id to id
          .single();

        if (patientError) throw patientError;

        // Get latest checkup - using internal ID directly since it matches patient_id in checkups
        let checkups = null;
        try {
          const { data, error: checkupsError } = await supabase
            .from("checkups")
            .select("reason")
            .eq("patient_id", patientId)
            .not("reason", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (checkupsError) {
            console.warn("Error fetching latest checkup:", checkupsError);
          } else {
            checkups = data;
          }
        } catch (error) {
          console.error("Unexpected error fetching latest checkup:", error);
        }

        // Get vitals if there's a checkup
        let vitals = null;
        if (checkups) {
          const { data: vitalsData, error: vitalsError } = await supabase
            .from("vital_measurements")
            .select("*")
            .eq("patient_id", patientId) // Using internal ID directly
            .order("recorded_at", { ascending: false });

          if (vitalsError) throw vitalsError;
          vitals = vitalsData;
        }

        // Format birthday if exists
        const formattedBirthday = patientData.birthday
          ? new Date(patientData.birthday).toISOString().split("T")[0]
          : "";

        // Get latest values for each vital type
        const getLatestValue = (type: string) => {
          if (!vitals) return "";
          const measurement = vitals.find((v) => v.type === type);
          return measurement ? measurement.value.toString() : "";
        };

        // Update form data
        setFormData({
          fullName: patientData.name || "",
          age: patientData.birthday
            ? calculateAge(new Date(patientData.birthday)).toString()
            : "",
          sex: patientData.sex || "",
          birthday: formattedBirthday,
          address: patientData.address || "",
          contactNumber: patientData.contact || "",
          height: getLatestValue("height_cm"),
          weight: getLatestValue("weight_kg"),
          systolic: getLatestValue("bp_systolic"),
          diastolic: getLatestValue("bp_diastolic"),
          pulseRate: getLatestValue("pulse"),
          oxygenSaturation: getLatestValue("oxygen_saturation"),
          temperature: getLatestValue("temperature"),
          symptoms: Array.isArray(checkups)
            ? checkups[0]?.reason || ""
            : checkups?.reason || "",
          doctorNote: patientData.doctor_note || "",
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
        alert("Error loading patient data");
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!patientId) return;

    try {
      const supabase = createClient();

      // Update the doctor's note for the patient
      const { error } = await supabase
        .from("patient_data")
        .update({ doctor_note: formData.doctorNote })
        .eq("id", patientId);

      if (error) throw error;

      alert("Doctor's note saved successfully!");
    } catch (error) {
      console.error("Error saving doctor's note:", error);
      alert("Failed to save doctor's note");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center justify-center relative">
      {/* Clock */}
      <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
        {time.toLocaleTimeString()}
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Patient Information System
      </h1>

      {/* Main Form Container */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Personal Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Sex</Label>
              <Input name="sex" value={formData.sex} onChange={handleChange} />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className="resize-none h-20"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Right Side - Medical Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Vitals & Medical Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex gap-2">
                <Input
                  name="systolic"
                  type="number"
                  value={formData.systolic}
                  onChange={handleChange}
                  placeholder="Systolic"
                  readOnly
                />
                <Input
                  name="diastolic"
                  type="number"
                  value={formData.diastolic}
                  onChange={handleChange}
                  placeholder="Diastolic"
                  readOnly
                />
              </div>
            </div>
            <div>
              <Label>Pulse Rate (BPM)</Label>
              <Input
                type="number"
                name="pulseRate"
                value={formData.pulseRate}
                onChange={handleChange}
                placeholder="e.g., 72"
                readOnly
              />
            </div>
            <div>
              <Label>Oxygen Saturation (%)</Label>
              <Input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>

          <div>
            <Label>Patient&apos;s Complaint</Label>
            <Textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Enter the patient's symptoms here..."
              className="resize-none h-24"
              readOnly
            />
          </div>
        </div>
        {/* Doctor's Note - Full Width */}
        <div className="col-span-1 md:col-span-2 mt-1">
          <Label>Doctor&apos;s Note</Label>
          <Textarea
            name="doctorNote"
            value={formData.doctorNote}
            onChange={handleChange}
            placeholder="Write the prescription or notes..."
            className="resize-none h-40 w-full"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mt-6 gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/admindash")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <FaSave /> Save
          </Button>
          <Button
            onClick={() => router.push(`/patientdata?id=${patientId}`)}
            className="flex items-center gap-2"
          >
            Next <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PatientInformationKiosk() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <PatientInfoContent />
    </Suspense>
  );
}
