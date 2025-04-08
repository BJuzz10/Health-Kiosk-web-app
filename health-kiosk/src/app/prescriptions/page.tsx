"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPrint, FaFilePdf, FaArrowLeft } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface Prescription {
  date: string;
  fileUrl: string;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<
    string | null
  >(null);
  const router = useRouter();

  // Simulate fetching from API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      // Replace with actual fetch logic later
      const mockData: Prescription[] = [
        { date: "March 20, 2025", fileUrl: "/prescriptions/march_20_2025.pdf" },
        { date: "March 15, 2025", fileUrl: "/prescriptions/march_15_2025.pdf" },
        { date: "March 10, 2025", fileUrl: "/prescriptions/march_10_2025.pdf" },
      ];
      setPrescriptions(mockData);
    };

    fetchPrescriptions();
  }, []);

  const handlePrint = () => {
    if (selectedPrescription) {
      const printWindow = window.open(selectedPrescription, "_blank");
      if (printWindow) {
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col p-6 space-y-6 md:flex-row md:space-x-6 md:space-y-0">
      {/* Left Side: Prescription List */}
      <div className="w-full md:w-1/3 bg-white shadow-xl rounded-lg p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Previous Prescriptions
        </h2>
        {prescriptions.length > 0 ? (
          <ul className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <li key={index}>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-200 transition duration-300"
                  onClick={() => setSelectedPrescription(prescription.fileUrl)}
                >
                  <span>{prescription.date}</span>
                  <FaFilePdf className="text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No prescriptions found.</p>
        )}

        <Button
          onClick={handlePrint}
          disabled={!selectedPrescription}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          <FaPrint /> Print Prescription
        </Button>

        <div className="absolute bottom-6 left-6 z-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition duration-300 p-2 rounded-lg"
          >
            <FaArrowLeft /> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Right Side: PDF Preview */}
      <div className="w-full md:w-2/3 flex justify-center items-center p-6">
        {selectedPrescription ? (
          <div className="bg-white shadow-xl rounded-lg p-6 w-full h-[80vh] flex flex-col border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Prescription Preview
              </h2>
              <Button
                variant="destructive"
                onClick={() => setSelectedPrescription(null)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <FiX /> Close
              </Button>
            </div>
            <iframe
              src={selectedPrescription}
              className="w-full h-full border rounded-lg"
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
