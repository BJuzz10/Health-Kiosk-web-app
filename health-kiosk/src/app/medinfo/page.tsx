"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaChevronLeft, FaSave, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";

interface MedicalFormData {
  symptoms: string;
  systolic: string;
  diastolic: string;
  oxygenSaturation: string;
  temperature: string;
  pulserate: string;
  height: string;
  weight: string;
}

export default function MedicalInformation() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState<MedicalFormData>({
    symptoms: "",
    systolic: "",
    diastolic: "",
    oxygenSaturation: "",
    temperature: "",
    pulserate: "",
    height: "",
    weight: "",
  });

  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    setMounted(true);
    return () => clearInterval(interval);
  }, []);

  // Fetch latest measurements when component mounts
  useEffect(() => {
    const fetchLatestMeasurements = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Authentication error");
        }

        // Get patient data
        const { data: patientData, error: patientError } = await supabase
          .from("patient_data")
          .select("id")
          .eq("email", user.email)
          .single();

        if (patientError || !patientData) {
          throw new Error("Patient data not found");
        }

        // Get the latest measurements for each type by recorded_at
        const { data: measurements, error: measurementsError } = await supabase
          .from("vital_measurements")
          .select("type, value")
          .eq("patient_id", patientData.id)
          .in("type", [
            "height_cm",
            "weight_kg",
            "bp_systolic",
            "bp_diastolic",
            "temperature",
            "pulse",
            "oxygen_saturation",
          ])
          .order("recorded_at", { ascending: false });

        if (measurementsError) {
          throw new Error("Failed to fetch measurements");
        }

        // Get latest non-null symptoms that are not from devices
        const { data: latestCheckup } = await supabase
          .from("checkups")
          .select("reason")
          .eq("patient_id", patientData.id)
          .not("reason", "ilike", "%measurement from%device%")
          .not("reason", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get latest value for each type
        const getLatestValue = (type: string) => {
          const measurement = measurements?.find((m) => m.type === type);
          return measurement?.value.toString() || "";
        };

        // Update form data with latest measurements and symptoms
        setFormData((prev) => ({
          ...prev,
          height: getLatestValue("height_cm"),
          weight: getLatestValue("weight_kg"),
          systolic: getLatestValue("bp_systolic"),
          diastolic: getLatestValue("bp_diastolic"),
          temperature: getLatestValue("temperature"),
          pulserate: getLatestValue("pulse"),
          oxygenSaturation: getLatestValue("oxygen_saturation"),
          symptoms: latestCheckup?.reason || "",
        }));
      } catch (err) {
        console.error("Error fetching latest measurements:", err);
      }
    };

    fetchLatestMeasurements();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const supabase = createClient();

      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        alert(t("error.auth"));
        return;
      }

      // Get patient data by email instead of user_id
      const { data: patientData, error: patientError } = await supabase
        .from("patient_data")
        .select("*")
        .eq("email", user.email)
        .single();

      if (patientError || !patientData) {
        console.error("No patient data found for email:", user.email);
        alert(t("error.save"));
        return;
      }

      const now = new Date().toISOString();

      // Create a new checkup record using patient_data id
      const { data: checkup, error: checkupError } = await supabase
        .from("checkups")
        .insert([
          {
            patient_id: patientData.id,
            reason: formData.symptoms || null,
            checkup_date: now,
            created_at: now,
          },
        ])
        .select()
        .single();

      if (checkupError) {
        console.error("Error creating checkup:", checkupError);
        alert(t("error.save"));
        return;
      }

      // Prepare measurements array using the correct vital_type enum values
      const measurements = [];

      if (formData.height && !isNaN(Number(formData.height))) {
        measurements.push({
          checkup_id: checkup.id,
          type: "height_cm",
          value: Number(formData.height),
          unit: "cm",
          recorded_at: now,
          patient_id: patientData.id,
        });
      }

      if (formData.weight && !isNaN(Number(formData.weight))) {
        measurements.push({
          checkup_id: checkup.id,
          type: "weight_kg",
          value: Number(formData.weight),
          unit: "kg",
          recorded_at: now,
          patient_id: patientData.id,
        });
      }
      //temperature
      if (formData.temperature && !isNaN(Number(formData.temperature))) {
        measurements.push({
          checkup_id: checkup.id,
          type: "temperature",
          value: Number(formData.weight),
          unit: "kg",
          recorded_at: now,
          patient_id: patientData.id,
        });
      }

      if (measurements.length > 0) {
        const { error: measurementsError } = await supabase
          .from("vital_measurements")
          .insert(measurements);

        if (measurementsError) {
          console.error("Error saving measurements:", measurementsError);
          alert(t("error.save"));
          return;
        }
      }

      alert(t("success.save"));
      router.push("/deeplink");
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert(t("error.save"));
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center justify-center relative">
      <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
        {time.toLocaleTimeString()}
      </div>

      <div className="absolute top-4 left-6">
        <Button variant="outline" onClick={toggleLanguage}>
          {t("language.toggle")}
        </Button>
      </div>

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center">
        {t("medinfo.title")}
      </h1>

      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t("medinfo.title")}
          </h2>
          <Label className="block mb-2">{t("medinfo.symptoms")}</Label>
          <Textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder={t("medinfo.placeholder")}
            className="w-full resize-none overflow-auto h-32"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="systolic">{t("medinfo.bp")}</Label>
            <div className="flex gap-2">
              <Input
                id="systolic"
                name="systolic"
                value={formData.systolic}
                onChange={handleChange}
                placeholder="Systolic"
                readOnly
              />
              <Input
                id="diastolic"
                name="diastolic"
                value={formData.diastolic}
                onChange={handleChange}
                placeholder="Diastolic"
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="oxygenSaturation">{t("medinfo.oxygen")}</Label>
            <Input
              id="oxygenSaturation"
              name="oxygenSaturation"
              value={formData.oxygenSaturation}
              onChange={handleChange}
              placeholder="SpO2 %"
              readOnly
            />
          </div>

          <div>
            <Label>{t("medinfo.temp")}</Label>
            <Input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className="mt-1 bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="pulserate">{t("medinfo.pulse")}</Label>
            <Input
              id="pulserate"
              name="pulserate"
              value={formData.pulserate}
              onChange={handleChange}
              placeholder="BPM"
              readOnly
            />
          </div>

          <div>
            <Label>{t("medinfo.height")}</Label>
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t("medinfo.weight")}</Label>
            <Input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mt-6 gap-2 mx-auto">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> {t("back.button")}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <FaSave /> {t("save.button")}
          </Button>
          <Button
            onClick={() => router.push("/deeplink")}
            className="flex items-center gap-2"
          >
            {t("next.button")} <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
