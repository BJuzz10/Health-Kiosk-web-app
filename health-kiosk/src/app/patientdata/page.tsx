"use client";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import { saveAs } from "file-saver";

import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import {
  FaHospital,
  FaFileDownload,
  FaCamera,
  FaHistory,
  FaVideo,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import PrescriptionUpload from "@/components/prescription-upload";

const supabase = createClient();

// Create a separate component for the main content that uses useSearchParams
function PatientDataContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("id");
  const [isEnglish, setIsEnglish] = useState(false);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showMeetLinkModal, setShowMeetLinkModal] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidPatient, setIsValidPatient] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState<{
    hasPending: boolean;
    hasApproved: boolean;
    meetLink: string | null;
    consultationId: string | null;
  }>({
    hasPending: false,
    hasApproved: false,
    meetLink: null,
    consultationId: null,
  });
  const [showMeetOptionsModal, setShowMeetOptionsModal] = useState(false);
  const [newMeetLink, setNewMeetLink] = useState("");

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

  // Fetch consultation status using internal patient ID
  useEffect(() => {
    const fetchConsultationStatus = async () => {
      if (!patientIdParam) return; // Add this check

      try {
        // Get the most recent consultation for this patient
        const { data, error } = await supabase
          .from("consultations")
          .select("*")
          .eq("patient_id", patientIdParam) // Use internal ID
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching consultation:", error);
          return;
        }

        if (data) {
          setConsultationStatus({
            hasPending: data.status === "pending",
            hasApproved: data.status === "approved" && !!data.meet_link,
            meetLink: data.meet_link,
            consultationId: data.id,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchConsultationStatus();

    // Set up real-time subscription for consultation updates
    const subscription = supabase
      .channel("consultations_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
          filter: `patient_id=eq.${patientIdParam}`, // Add filter for specific patient
        },
        () => {
          fetchConsultationStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [patientIdParam]); // Add patientId dependency

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

  const handleJoinMeet = () => {
    if (consultationStatus.hasApproved && consultationStatus.meetLink) {
      // Instead of directly opening the link, show a modal with options
      setShowMeetOptionsModal(true);
    } else {
      setShowMeetLinkModal(true);
    }
  };

  const joinExistingMeet = () => {
    if (consultationStatus.meetLink) {
      window.open(consultationStatus.meetLink, "_blank");
      setShowMeetOptionsModal(false);
    }
  };

  const handleUpdateMeetLink = async () => {
    if (!newMeetLink || !consultationStatus.consultationId) return;

    setIsSubmitting(true);

    try {
      // Update the consultation with the new meet link
      const { error } = await supabase
        .from("consultations")
        .update({
          meet_link: newMeetLink,
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultationStatus.consultationId);

      if (error) {
        console.error("Error updating meet link:", error);
        alert("Failed to update meeting link. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Update local state
      setConsultationStatus({
        ...consultationStatus,
        meetLink: newMeetLink,
      });

      // Close modal and reset state
      setShowMeetOptionsModal(false);
      setNewMeetLink("");
      alert("Meeting link has been updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMeetLink = async () => {
    if (!meetLink || !consultationStatus.consultationId) return;

    setIsSubmitting(true);

    try {
      // Update the consultation with the meet link
      const { error } = await supabase
        .from("consultations")
        .update({
          meet_link: meetLink,
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultationStatus.consultationId);

      if (error) {
        console.error("Error updating consultation:", error);
        alert("Failed to add meeting link. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Update local state
      setConsultationStatus({
        ...consultationStatus,
        hasPending: false,
        hasApproved: true,
        meetLink: meetLink,
      });

      // Close modal and reset state
      setShowMeetLinkModal(false);
      setMeetLink("");
      alert("Meeting link has been added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const patientId = searchParams.get("id");
      if (!patientId) {
        alert("Patient ID is missing.");
        return;
      }

      // Fetch patient data
      const { data: patientData, error: patientError } = await supabase
        .from("patient_data")
        .select("name, email, sex, birthday, address, contact")
        .eq("id", patientId)
        .single();

      if (patientError || !patientData) {
        console.error("Error fetching patient data:", patientError);
        alert("Failed to fetch patient data.");
        return;
      }

      // Fetch vital measurements data
      const { data: vitalData, error: vitalError } = await supabase
        .from("vital_measurements")
        .select("checkup_id, patient_id, type, value, unit, recorded_at") //added recorded_at
        .eq("patient_id", patientId);

      if (vitalError || !vitalData) {
        console.error("Error fetching vital measurements:", vitalError);
        alert("Failed to fetch vital measurements.");
        return;
      }

      // Combine data into a single CSV
      const csvData = [
        "Patient Data",
        Object.keys(patientData).join(","),
        Object.values(patientData).join(","),
        "",
        "Vital Measurements",
        Object.keys(vitalData[0] || {}).join(","),
        ...vitalData.map((vital) => Object.values(vital).join(",")),
      ].join("\n");

      // Create a Blob and download the CSV
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `patient_${patientId}_data.csv`);
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("An unexpected error occurred while generating the CSV.");
    }
  };

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
    uploadModalTitle: isEnglish
      ? "Upload Prescription"
      : "Mag-upload ng Reseta",
    selectFile: isEnglish ? "Select File" : "Pumili ng File",
    upload: isEnglish ? "Upload" : "I-upload",
    takePhoto: isEnglish ? "Take Photo" : "Kumuha ng Larawan",
    fileSelected: isEnglish ? "File Selected" : "Napiling File",
    noFileSelected: isEnglish ? "No file selected" : "Walang napiling file",
    Backbutton: isEnglish ? "Back" : "Bumalik",
    addMeetLink: isEnglish
      ? "Add Google Meet Link"
      : "Magdagdag ng Google Meet Link",
    meetLinkPlaceholder: isEnglish
      ? "Enter Google Meet link here"
      : "Ilagay ang Google Meet link dito",
    submit: isEnglish ? "Submit" : "Ipasa",
    cancel: isEnglish ? "Cancel" : "Kanselahin",
    meetLinkInstructions: isEnglish
      ? "Please create a Google Meet link and paste it below:"
      : "Mangyaring gumawa ng Google Meet link at i-paste ito sa ibaba:",
    meetPending: isEnglish
      ? "Your consultation request is pending. The doctor will provide a meeting link soon."
      : "Ang iyong kahilingan sa konsultasyon ay nakabinbin. Magbibigay ang doktor ng link sa miting sa lalong madaling panahon.",
    meetReady: isEnglish
      ? "Your consultation is ready! Click to join the meeting."
      : "Handa na ang iyong konsultasyon! I-click upang sumali sa miting.",
    noMeetYet: isEnglish
      ? "No consultation has been requested yet."
      : "Wala pang hiniling na konsultasyon.",
    close: isEnglish ? "Close" : "Isara",
    prescriptionHistory: isEnglish
      ? "Prescription History"
      : "Kasaysayan ng mga Reseta",
    meetOptions: isEnglish ? "Meeting Options" : "Mga Opsyon sa Pagpupulong",
    joinExistingMeet: isEnglish
      ? "Join Existing Meeting"
      : "Sumali sa Kasalukuyang Pagpupulong",
    updateMeetLink: isEnglish
      ? "Update Meeting Link"
      : "I-update ang Link ng Pagpupulong",
    updateLink: isEnglish ? "Update Link" : "I-update ang Link",
    updating: isEnglish ? "Updating..." : "Ina-update...",
  };

  // Only render content if we have a valid patient
  if (!isValidPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center p-4">
      {/* Responsive Kiosk Container */}
      <div className="w-[700px] max-w-full px-4 sm:px-8">
        {/* Header with Time & Language Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admindash")}
            className="flex items-center gap-2"
          >
            <FaChevronLeft /> {translations.Backbutton}
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
          {/* Join Meet Button with Notification Dot */}
          <Card
            className="w-full flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center relative"
            onClick={handleJoinMeet}
          >
            <div className="relative">
              <FaHospital className="text-2xl text-purple-600" />
              {consultationStatus.hasPending && (
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
              {consultationStatus.hasApproved && (
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full"></span>
              )}
            </div>
            <span className="text-lg sm:text-xl font-semibold">
              {translations.joinMeetNow}
            </span>
          </Card>

          {/* Other buttons */}
          <Card
            className="w-full flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center"
            onClick={handleDownloadCSV}
          >
            <FaFileDownload className="text-2xl text-green-600" />
            <span className="text-lg sm:text-xl font-semibold">
              {translations.downloadPatientInfo}
            </span>
          </Card>

          <Card
            className="w-full flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <FaCamera className="text-2xl text-indigo-600" />
            <span className="text-lg sm:text-xl font-semibold">
              {translations.uploadPrescription}
            </span>
          </Card>

          <Card
            className="w-full flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white text-center"
            onClick={() => router.push(`/pastprescript?id=${patientIdParam}`)}
          >
            <FaHistory className="text-2xl text-yellow-600" />
            <span className="text-lg sm:text-xl font-semibold">
              {translations.showPrescriptionHistory}
            </span>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-10 text-gray-500 text-lg font-medium text-center">
          eKonsulTech
        </div>
      </div>

      {/* Upload Prescription Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {translations.uploadModalTitle}
            </DialogTitle>
          </DialogHeader>

          {patientIdParam && ( // Only render if we have a patient ID
            <PrescriptionUpload
              patientId={patientIdParam}
              onSuccess={() => {
                setTimeout(() => setIsUploadModalOpen(false), 2000);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Meet Link Modal */}
      <Dialog open={showMeetLinkModal} onOpenChange={setShowMeetLinkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {consultationStatus.hasApproved
                ? "Join Consultation"
                : "Consultation Status"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {consultationStatus.hasPending && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <FaVideo className="h-5 w-5 text-yellow-600" />
                <AlertTitle className="text-yellow-800 font-medium">
                  Consultation Pending
                </AlertTitle>
                <AlertDescription className="text-yellow-700">
                  {translations.meetPending}
                </AlertDescription>

                {/* Doctor interface to add meet link */}
                <div className="mt-4 pt-4 w-full border-yellow-200 items-center">
                  <div className="w-95 text-yellow-800 mb-2 justify-center flex flex-col items-center">
                    <span>{translations.meetLinkInstructions}</span>
                  </div>
                  <div className="pl-14 flex-col items-center justify-center mb-4">
                    <Input
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                      className="mb-2 w-65 "
                    />
                  </div>
                  <div className="pl-24">
                    <Button
                      className="w-45 bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={handleSubmitMeetLink}
                      disabled={!meetLink || isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : translations.submit}
                    </Button>
                  </div>
                </div>
              </Alert>
            )}

            {consultationStatus.hasApproved && (
              <Alert className="bg-green-50 border-green-200">
                <FaVideo className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 font-medium">
                  Consultation Ready
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {translations.meetReady}
                </AlertDescription>
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (consultationStatus.meetLink) {
                      window.open(consultationStatus.meetLink, "_blank");
                      setShowMeetLinkModal(false);
                    }
                  }}
                >
                  Join Meeting
                </Button>
              </Alert>
            )}

            {!consultationStatus.hasPending &&
              !consultationStatus.hasApproved && (
                <Alert className="bg-gray-50 border-gray-200">
                  <FaVideo className="h-5 w-5 text-gray-600" />
                  <AlertTitle className="text-gray-800 font-medium">
                    No Active Consultation
                  </AlertTitle>
                  <AlertDescription className="text-gray-700">
                    {translations.noMeetYet}
                  </AlertDescription>
                </Alert>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMeetLinkModal(false)}
            >
              {translations.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meet Options Modal */}
      <Dialog
        open={showMeetOptionsModal}
        onOpenChange={setShowMeetOptionsModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {translations.meetOptions}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex flex-col space-y-2">
              <Button
                onClick={joinExistingMeet}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FaVideo className="mr-2" /> {translations.joinExistingMeet}
              </Button>

              <p className="text-sm text-gray-500 mt-1">
                {consultationStatus.meetLink}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">
                {translations.updateMeetLink}
              </h3>
              <Input
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={newMeetLink}
                onChange={(e) => setNewMeetLink(e.target.value)}
                className="mb-2"
              />
              <Button
                onClick={handleUpdateMeetLink}
                disabled={!newMeetLink || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? translations.updating : translations.updateLink}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMeetOptionsModal(false)}
            >
              {translations.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PatientDataPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <PatientDataContent />
    </Suspense>
  );
}
