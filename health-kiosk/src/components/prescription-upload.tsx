"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaUpload, FaSpinner } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface PrescriptionUploadProps {
  patientId: string; // This is now the internal ID from patient_data
  onSuccess?: () => void;
}

export default function PrescriptionUpload({
  patientId, // Now directly using internal ID
  onSuccess,
}: PrescriptionUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Today's date as default
  );
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");

  // Validate patient exists first
  useEffect(() => {
    const validatePatient = async () => {
      try {
        const { data, error } = await supabase
          .from("patient_data")
          .select("id")
          .eq("id", patientId)
          .single();

        if (error || !data) {
          setError("Invalid patient ID");
          return;
        }
      } catch (err) {
        console.error("Error validating patient:", err);
        setError("Could not validate patient");
      }
    };

    validatePatient();
  }, [patientId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!patientId) {
      setError("Invalid patient ID");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Get current doctor's user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Not authorized to upload prescriptions");
      }

      // Get doctor record
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("id, name")
        .eq("auth_id", user.id)
        .single();

      if (doctorError || !doctorData) {
        throw new Error("Doctor record not found");
      }

      // Verify patient exists again before upload
      const { data: patientData, error: patientError } = await supabase
        .from("patient_data")
        .select("id")
        .eq("id", patientId)
        .single();

      if (patientError || !patientData) {
        throw new Error("Patient record not found");
      }

      // 1. Upload file to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("prescriptions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create record in prescriptions table
      const { error: insertError } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: patientId,
          doctor_id: doctorData.id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          prescription_date: prescriptionDate,
          doctor_name: doctorName || doctorData.name,
          notes: notes,
        });

      if (insertError) throw insertError;

      // Success
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPrescriptionDate(new Date().toISOString().split("T")[0]);
      setDoctorName("");
      setNotes("");

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Error uploading prescription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload prescription"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-medium">Upload Prescription</h3>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">
            Prescription uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="prescription-file">Prescription File</Label>
          <Input
            ref={fileInputRef}
            id="prescription-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="mt-1"
          />
          {file && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="prescription-date">Prescription Date</Label>
          <Input
            id="prescription-date"
            type="date"
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="doctor-name">Doctor Name (Optional)</Label>
          <Input
            id="doctor-name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Enter doctor's name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes"
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <FaSpinner className="mr-2 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" /> Upload Prescription
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
