"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router
import { FaPrint, FaFilePdf, FaArrowLeft } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface Prescription {
  date: string;
  fileUrl: string;
}

const prescriptions: Prescription[] = [
  { date: "March 20, 2025", fileUrl: "/prescriptions/march_20_2025.pdf" },
  { date: "March 15, 2025", fileUrl: "/prescriptions/march_15_2025.pdf" },
  { date: "March 10, 2025", fileUrl: "/prescriptions/march_10_2025.pdf" },
];

export default function PrescriptionsPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<
    string | null
  >(null);
  const router = useRouter(); // ✅ Initialize router

  const handlePrint = () => {
    if (selectedPrescription) {
      const printWindow = window.open(selectedPrescription, "_blank");
      if (printWindow) {
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row p-6">
      {/* Back Button */}
      <div className="absolute bottom-6 left-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/patientdata")}
          className="flex items-center gap-2"
        >
          <FaArrowLeft /> Back to Dashboard
        </Button>
      </div>

      {/* Left Side: Prescription List */}
      <div className="w-full lg:w-1/3 bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Previous Prescriptions
        </h2>
        <ul className="space-y-2">
          {prescriptions.map((prescription, index) => (
            <li key={index}>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between px-4 py-2 border rounded-lg hover:bg-gray-200"
                onClick={() => setSelectedPrescription(prescription.fileUrl)}
              >
                <span>{prescription.date}</span>
                <FaFilePdf className="text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
        {/* Print Button */}
        <Button
          onClick={handlePrint}
          disabled={!selectedPrescription}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <FaPrint /> Print Prescription
        </Button>
      </div>

      {/* Right Side: PDF Preview */}
      <div className="w-full lg:w-2/3 flex justify-center items-center p-6">
        {selectedPrescription ? (
          <div className="bg-white shadow-lg rounded-lg p-4 w-full h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Prescription Preview
              </h2>
              <Button
                variant="destructive"
                onClick={() => setSelectedPrescription(null)}
              >
                <FiX /> Close
              </Button>
            </div>
            <iframe
              src={selectedPrescription}
              className="w-full h-full border rounded"
              title="Prescription PDF"
            />
          </div>
        ) : (
          <p className="text-gray-500 text-lg">
            Select a prescription to preview
          </p>
        )}
      </div>
    </div>
  );
}
