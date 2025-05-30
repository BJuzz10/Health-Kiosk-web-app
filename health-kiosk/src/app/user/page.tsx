"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  savePatientData,
  getPatientData,
  calculateAge,
} from "@/lib/patient-data";
import { getCurrentUser } from "@/lib/supabase-auth";

interface PersonalFormData {
  fullName: string;
  sex: string;
  birthday: string;
  address: string;
  contactNumber: string;
}

export default function PersonalInformation() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [formData, setFormData] = useState<PersonalFormData>({
    fullName: "",
    sex: "",
    birthday: "",
    address: "",
    contactNumber: "",
  });

  // Add alert state variables after the formData state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);
  const [mounted, setMounted] = useState(false);

  // Get current user and their data
  useEffect(() => {
    const fetchUserAndData = async () => {
      const user = await getCurrentUser();
      if (user?.email) {
        setUserEmail(user.email);

        // Fetch existing patient data
        const patientData = await getPatientData(user.email);
        if (patientData) {
          setFormData({
            fullName: patientData.name || "",
            sex: patientData.sex || "",
            birthday: patientData.birthday
              ? new Date(patientData.birthday).toISOString().split("T")[0]
              : "",
            address: patientData.address || "",
            contactNumber: patientData.contact || "",
          });
        }
      }
    };

    fetchUserAndData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Replace the handleSave function with this updated version
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      setAlertType("error");
      setAlertMessage("User not authenticated. Please sign in again.");
      return;
    }

    setIsLoading(true);

    try {
      // Save patient data to database
      const success = await savePatientData({
        email: userEmail,
        name: formData.fullName,
        sex: formData.sex,
        birthday: formData.birthday ? new Date(formData.birthday) : null,
        address: formData.address,
        contact: formData.contactNumber,
      });

      if (success) {
        setAlertType("success");
        setAlertMessage("Patient information saved successfully!");

        // Redirect to deeplink page after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setAlertType("error");
        setAlertMessage(
          "Failed to save patient information. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving patient data:", error);
      setAlertType("error");
      setAlertMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center mt-16">
        {t("user.title")}
      </h1>

      {/* Alert Message */}
      {alertMessage && (
        <Alert
          variant={alertType === "error" ? "destructive" : "default"}
          className="mb-4 max-w-5xl w-full"
        >
          {alertType === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSave}
        className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 space-y-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t("user.personal.info")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">{t("user.name")}</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="sex">{t("user.sex")}</Label>
              <Input
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="birthday">{t("user.birthday")}</Label>
              <Input
                id="birthday"
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
              {formData.birthday && (
                <div className="text-sm text-muted-foreground mt-1">
                  {t("user.age")}: {calculateAge(new Date(formData.birthday))}{" "}
                  years old
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">{t("user.contact")}</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full max-w-6xl mt-6 gap-2 mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <FaChevronLeft /> {t("back.button")}
          </Button>
          <div className="flex gap-2 justify-end w-full md:w-auto">
            <Button
              type="submit"
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <FaSave /> {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
