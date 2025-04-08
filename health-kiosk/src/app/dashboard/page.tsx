"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaUserMd,
  FaPrint,
  FaSignOutAlt,
  FaHeartbeat, // Replaced with a more appropriate medical icon
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/lib/supabase-auth";

export default function KioskDashboard() {
  const router = useRouter();
  const [isEnglish, setIsEnglish] = useState(false);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  // Update time every second, but only on the client
  useEffect(() => {
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

    updateTime(); // Set initial time immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const translations = {
    homepage: "Homepage",
    personalData: isEnglish
      ? "Show Personal Data"
      : "Ipakita ang personal na datos",
    availableDoctors: isEnglish
      ? "Available Doctors"
      : "Mga available na Doktor",
    talkToDoctor: isEnglish ? "Talk to a Doctor" : "Makipag-usap sa Doktor",
    printPrescription: isEnglish ? "Print Prescription" : "Iprint ang reseta",
    logout: isEnglish ? "Logout" : "Mag Log out",
    medicalInformation: isEnglish
      ? "Medical Information"
      : "Impormasyon Medikal", // Correct translation
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/form");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center p-4">
      {/* Responsive Kiosk Container */}
      <div className="w-[700px] max-w-full px-4 sm:px-8">
        {/* Header with Time & Language Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
          {/* Time & Date Display (Rendered only after mount) */}
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
            onClick={() => setIsEnglish(!isEnglish)}
            className="px-6 py-3 text-blue-700 text-lg font-semibold"
          >
            {isEnglish ? "Filipino" : "English"}
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mt-2">
          {translations.homepage}
        </h1>

        {/* Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {[
            {
              icon: <FaUser className="text-2xl text-blue-600" />,
              text: translations.personalData,
              onClick: () => router.push("/user"),
            },
            {
              icon: <FaUserMd className="text-2xl text-green-600" />,
              text: translations.availableDoctors,
              onClick: () => router.push("/doctors"),
            },
            {
              icon: <FaHeartbeat className="text-2xl text-red-600" />, // Changed to FaHeartbeat for medical info
              text: translations.medicalInformation, // Updated text
              onClick: () => router.push("/medinfo"), // Adjusted route if needed
            },
            {
              icon: <FaPrint className="text-2xl text-purple-600" />,
              text: translations.printPrescription,
              onClick: () => router.push("/prescriptions"),
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="w-full flex flex-col items-center justify-center gap-4 p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-xl font-semibold">{item.text}</span>
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
            {translations.logout}
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
