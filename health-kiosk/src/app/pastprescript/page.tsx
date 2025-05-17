/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaPrint, FaArrowLeft, FaDownload, FaEye } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface Prescription {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  prescription_date: string;
  upload_date: string;
  doctor_name: string | null;
  notes: string | null;
}

export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrescriptionsContent />
    </Suspense>
  );
}

function PrescriptionsContent() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("id");
  const [isValidPatient, setIsValidPatient] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<{
    url: string;
    data: Prescription | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Validate patient ID
  useEffect(() => {
    const validatePatient = async () => {
      if (!patientIdParam) {
        router.push("/appointment");
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("patient_data")
          .select("id")
          .eq("id", patientIdParam)
          .single();

        if (error || !data) {
          console.error("Invalid patient ID:", error);
          router.push("/appointment");
          return;
        }

        setIsValidPatient(true);
      } catch (err) {
        console.error("Error validating patient:", err);
        router.push("/appointment");
      }
    };

    validatePatient();
  }, [patientIdParam, router]);

  // Redirect if no patient ID
  useEffect(() => {
    if (!patientIdParam) {
      router.push("/appointment");
      return;
    }
  }, [patientIdParam, router]);

  // Add print styles
  useEffect(() => {
    // Add a style tag for print media
    const style = document.createElement("style");
    style.innerHTML = `
    @media print {
      .no-print { 
        display: none !important; 
      }
      .print-only {
        display: block !important;
      }
      body, html {
        background: white !important;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch prescriptions from Supabase
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching prescriptions for patient_id:", patientIdParam);

        // Fetch prescriptions for the current user using patientIdParam directly
        const { data, error } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", patientIdParam) // Use patientIdParam directly
          .order("prescription_date", { ascending: false });

        if (error) {
          console.error("Error fetching prescriptions:", error);
          throw error;
        }

        console.log("Fetched prescriptions:", data);
        setPrescriptions(data || []);
      } catch (err: unknown) {
        console.error("Error fetching prescriptions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load prescriptions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientIdParam]);

  const handleViewPrescription = async (prescription: Prescription) => {
    try {
      // Get a signed URL for the file
      const { data, error } = await supabase.storage
        .from("prescriptions")
        .createSignedUrl(prescription.file_path, 60); // URL valid for 60 seconds

      if (error) throw error;

      if (!data.signedUrl) throw new Error("Failed to get file URL");

      setSelectedPrescription({
        url: data.signedUrl,
        data: prescription,
      });
    } catch (err: unknown) {
      console.error("Error viewing prescription:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to view prescription");
      }
    }
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      const { data, error } = await supabase.storage
        .from("prescriptions")
        .download(prescription.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = prescription.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error("Error downloading prescription:", err);
      alert("Failed to download prescription");
    }
  };

  const handlePrint = () => {
    if (selectedPrescription) {
      // Create a temporary container for printing
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow pop-ups to print prescriptions");
        return;
      }

      // For image files
      if (selectedPrescription.data?.file_type.includes("image")) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Prescription</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${selectedPrescription.url}" alt="Prescription" />
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      // For PDF files
      else {
        printWindow.location.href = selectedPrescription.url;
        setTimeout(() => {
          printWindow.print();
        }, 1000); // Give the PDF time to load
      }
    }
  };

  // Function to truncate file name if it's too long
  const truncateFileName = (fileName: string, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop() || "";
    const nameWithoutExt = fileName.substring(
      0,
      fileName.length - extension.length - 1
    );

    return `${nameWithoutExt.substring(
      0,
      maxLength - extension.length - 3
    )}...${extension}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center">
        <div className="text-xl">Loading prescriptions...</div>
      </div>
    );

  if (!isValidPatient)
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
        <Button className="mt-4" onClick={() => router.push("/admindash")}>
          Back to Dashboard
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col p-6 space-y-6 md:flex-row md:space-x-6 md:space-y-0 print:bg-white print:p-0">
      {/* Left Side: Prescription List */}
      <div className="w-full md:w-1/4 bg-white shadow-xl rounded-lg p-4 relative no-print flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2">
          Prescriptions
        </h2>

        {/* Scrollable prescription list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto pr-1 mb-4"
          style={{ maxHeight: "calc(100vh - 240px)" }}
        >
          {prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className={`cursor-pointer transition-colors p-3 rounded-lg flex items-center justify-between ${
                    selectedPrescription?.data?.id === prescription.id
                      ? "bg-blue-100 border border-blue-300"
                      : "hover:bg-gray-50 border border-gray-100"
                  }`}
                  onClick={() => handleViewPrescription(prescription)}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div
                      className="font-medium text-sm truncate"
                      title={prescription.file_name}
                    >
                      {truncateFileName(prescription.file_name)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(
                        new Date(prescription.prescription_date),
                        "MMM dd, yyyy"
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(prescription);
                    }}
                    title="Download"
                  >
                    <FaDownload className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">
              No prescriptions found.
            </p>
          )}
        </div>

        {/* Back button */}
        <div className="mt-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/admindash")}
            className="flex items-center gap-2 w-full"
          >
            <FaArrowLeft size={14} /> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Right Side: PDF Preview */}
      <div className="w-full md:w-3/4 flex flex-col bg-white shadow-xl rounded-lg p-4 print:shadow-none print:p-0 print:border-0 print:h-auto">
        {selectedPrescription ? (
          <>
            <div className="flex justify-between items-center mb-4 no-print">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedPrescription.data?.file_name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    Prescribed:{" "}
                    {format(
                      new Date(
                        selectedPrescription.data?.prescription_date || ""
                      ),
                      "MMM dd, yyyy"
                    )}
                  </span>
                  {selectedPrescription.data?.doctor_name && (
                    <>
                      <span>•</span>
                      <span>
                        Doctor: {selectedPrescription.data.doctor_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-1"
                  disabled={!selectedPrescription}
                >
                  <FaPrint size={14} /> Print
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrescription(null)}
                  className="flex items-center gap-1"
                >
                  <FiX size={16} />
                </Button>
              </div>
            </div>

            {/* Display based on file type */}
            <div className="flex-1 border rounded-lg overflow-hidden min-h-[500px] print:border-0">
              {selectedPrescription.data?.file_type.includes("image") ? (
                <div className="flex-1 flex items-center justify-center overflow-auto h-full">
                  <img
                    src={selectedPrescription.url || "/placeholder.svg"}
                    alt="Prescription"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={selectedPrescription.url}
                  className="w-full h-full border-0"
                  title="Prescription PDF"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-gray-500">
            <FaEye size={48} className="text-gray-300 mb-4" />
            <p className="text-lg">Select a prescription to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
