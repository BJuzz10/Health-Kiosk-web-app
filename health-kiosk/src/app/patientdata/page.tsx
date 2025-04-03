"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import {
  FaHospital,
  FaFileDownload,
  FaCamera,
  FaHistory,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    joinMeetNow: isEnglish
      ? "Join Meet Now (ONLINE)"
      : "Sumali sa Meet Ngayon (ONLINE)",
    downloadPatientInfo: isEnglish
      ? "Download Patient info (CSV file)"
      : "I-download ang Impormasyon ng Pasyente (CSV file)",
    uploadPrescription: isEnglish
      ? "Upload or Take Photo of Prescription"
      : "Mag-upload o Magkuha ng Larawan ng Reseta",
    showPrescriptionHistory: isEnglish
      ? "Show History of Prescriptions"
      : "Ipakita ang Kasaysayan ng mga Reseta",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center p-4">
      {/* Responsive Kiosk Container */}
      <div className="w-[700px] max-w-full px-4 sm:px-8">
        {/* Header with Time & Language Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/patientinfo")}
          >
            <IoArrowBack size={28} className="text-gray-700" />
          </Button>

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
            className="px-4 sm:px-6 py-2 text-blue-700 text-lg font-semibold"
          >
            {isEnglish ? "Filipino" : "English"}
          </Button>
        </div>

        {/* Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {[
            {
              icon: <FaHospital className="text-2xl text-purple-600" />,
              text: translations.joinMeetNow,
              onClick: () => router.push("/meet"),
            },
            {
              icon: <FaFileDownload className="text-2xl text-green-600" />,
              text: translations.downloadPatientInfo,
              onClick: () => router.push("/download-csv"),
            },
            {
              icon: <FaCamera className="text-2xl text-indigo-600" />,
              text: translations.uploadPrescription,
              onClick: () => router.push("/upload-prescription"),
            },
            {
              icon: <FaHistory className="text-2xl text-yellow-600" />,
              text: translations.showPrescriptionHistory,
              onClick: () => router.push("/pastprescript"),
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="w-full flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-lg sm:text-xl font-semibold">
                {item.text}
              </span>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-gray-500 text-lg font-medium text-center">
          eKonsulTech
        </div>
      </div>
    </div>
  );
}
