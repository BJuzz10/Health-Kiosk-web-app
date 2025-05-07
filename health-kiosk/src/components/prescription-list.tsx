"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaDownload, FaEye, FaTrash } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

const supabase = createClient();

interface Prescription {
  id: string;
  file_name: string;
  file_path: string;
  prescription_date: string;
  upload_date: string;
  doctor_name: string | null;
  notes: string | null;
}

interface PrescriptionListProps {
  patientId: string; // Can be either auth_id or internal ID
  isAuthId?: boolean; // If true, patientId is an auth_id and needs to be converted
  onViewPrescription?: (url: string, prescription: Prescription) => void;
}

export default function PrescriptionList({
  patientId,
  isAuthId = false,
  onViewPrescription,
}: PrescriptionListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      let internalId = patientId;

      // If we were passed an auth_id, get the internal ID first
      if (isAuthId) {
        const { data: patientData, error: patientError } = await supabase
          .from("patient_data")
          .select("id")
          .eq("auth_id", patientId)
          .single();

        if (patientError || !patientData) {
          throw new Error("Patient data not found");
        }
        internalId = patientData.id;
      }

      // Fetch prescriptions using internal ID
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", internalId)
        .order("upload_date", { ascending: false });

      if (error) throw error;

      setPrescriptions(data || []);
    } catch (err: unknown) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (prescription: Prescription) => {
    try {
      const { data, error } = await supabase.storage
        .from("prescriptions")
        .createSignedUrl(prescription.file_path, 60); // URL valid for 60 seconds

      if (error) throw error;

      if (onViewPrescription && data?.signedUrl) {
        onViewPrescription(data.signedUrl, prescription);
      } else {
        window.open(data?.signedUrl, "_blank");
      }
    } catch (err: unknown) {
      console.error("Error viewing prescription:", err);
      alert("Failed to view prescription");
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

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("prescriptions")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Update local state
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
    } catch (err: unknown) {
      console.error("Error deleting prescription:", err);
      alert("Failed to delete prescription");
    }
  };

  if (loading)
    return <div className="text-center py-4">Loading prescriptions...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Prescriptions</h3>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions found.</p>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{prescription.file_name}</h4>
                    <p className="text-sm text-gray-500">
                      Prescribed:{" "}
                      {format(
                        new Date(prescription.prescription_date),
                        "MMM dd, yyyy"
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded:{" "}
                      {format(
                        new Date(prescription.upload_date),
                        "MMM dd, yyyy"
                      )}
                    </p>
                    {prescription.doctor_name && (
                      <p className="text-sm text-gray-500">
                        Doctor: {prescription.doctor_name}
                      </p>
                    )}
                    {prescription.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        Notes: {prescription.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(prescription)}
                    >
                      <FaEye className="mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(prescription)}
                    >
                      <FaDownload className="mr-1" /> Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDelete(prescription.id, prescription.file_path)
                      }
                    >
                      <FaTrash className="mr-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
