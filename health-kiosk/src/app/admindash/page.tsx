"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaBriefcaseMedical,
  FaUsers,
  FaHospital,
  FaSignOutAlt,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/lib/supabase-auth";
import { useLanguage } from "@/context/LanguageContext";

export default function DoctorsHomePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/"); // Changed from /form to /
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center p-4">
      <div className="w-[700px] max-w-full px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
          {currentTime && currentDate && (
            <div className="absolute top-4 right-6 flex flex-col items-center sm:items-end">
              <p className="text-lg font-semibold text-gray-900">
                {currentTime}
              </p>
              <p className="text-sm text-gray-500">{currentDate}</p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={toggleLanguage}
            className="px-6 py-3 text-blue-700 text-lg font-semibold"
          >
            {t("language.toggle")}
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mt-2">
          {t("admin.homepage")}
        </h1>

        {/* Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {[
            {
              icon: <FaUser className="text-2xl text-blue-600" />,
              text: t("admin.personal.info"),
              onClick: () => router.push("/docprofiles"),
            },
            {
              icon: <FaBriefcaseMedical className="text-2xl text-green-600" />,
              text: t("admin.start.appointments"),
              onClick: () => router.push("/appointment"),
            },
            {
              icon: <FaUsers className="text-2xl text-indigo-600" />,
              text: t("admin.patient.info"),
              onClick: () => router.push("/patientinfo"),
            },
            {
              icon: <FaHospital className="text-2xl text-purple-600" />,
              text: t("admin.ehr.clinic"),
              onClick: () => window.open("https://www.ppd.ph/", "_blank"),
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="w-full flex flex-col justify-center items-center gap-4 p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-xl font-semibold text-center">
                {item.text}
              </span>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-4 p-6 text-xl font-semibold rounded-2xl shadow-lg hover:scale-105 transition-all"
          >
            <FaSignOutAlt className="text-2xl" />
            {t("logout.button")}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-gray-500 text-lg font-medium text-center">
          eKonsulTech
        </div>
      </div>
    </div>
  );
}
