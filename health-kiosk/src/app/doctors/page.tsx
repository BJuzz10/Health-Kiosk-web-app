"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Search,
  Clock,
  Video,
  UserRound,
  MapPin,
  Calendar,
  CheckCircle,
  Bell,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUser } from "@/lib/supabase-auth";
import { getPatientData } from "@/lib/patient-data";

// Separate TimeDisplay component to prevent hydration mismatch
function TimeDisplay() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
      {time}
    </div>
  );
}

interface Schedule {
  day: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

interface Doctor {
  id: string;
  auth_id: string;
  name: string;
  specialization: string;
  consultation_type: "online" | "in-person" | "both";
  schedule: Schedule[];
  image_url: string;
  address?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Consultation {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  status: "pending" | "approved" | "completed";
  created_at: string;
  meet_link: string | null;
}

export default function AvailableDoctors() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const { t, language, setLanguage } = useLanguage(); //added language 
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationRequested, setConsultationRequested] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingConsultations, setPendingConsultations] = useState<number>(0);
  const [approvedConsultations, setApprovedConsultations] = useState<
    Consultation[]
  >([]);
  const [showPendingRequestsModal, setShowPendingRequestsModal] =
    useState(false);
  const [showConsultationsModal, setShowConsultationsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Consultation[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Consultation | null>(
    null
  );
  const [meetLink, setMeetLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDoctorRequest, setCurrentDoctorRequest] = useState<{
    doctorId: string;
    doctorName: string;
  } | null>(null);
  const [showCancelRequestModal, setShowCancelRequestModal] = useState(false);
  const [newDoctorSelection, setNewDoctorSelection] = useState<Doctor | null>(
    null
  );
  const [todaysDoctors, setTodaysDoctors] = useState<Doctor[]>([]);

  // Initialize Supabase client
  const supabase = createClient();

  // Get current day and fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch doctors...");

        // First check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        console.log("Auth check result:", { user, authError });

        if (authError) {
          throw new Error("Authentication error: " + authError.message);
        }

        if (!user) {
          console.log("No user found, redirecting to login...");
          router.push("/login");
          return;
        }

        const today = new Date();
        const dayIndex = today.getDay();
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = daysOfWeek[dayIndex];
        setCurrentDay(dayName);
        console.log("Current day:", dayName);

        // Fetch all doctors from the database
        console.log("Fetching doctors from database...");
        const { data: doctors, error: dbError } = await supabase
          .from("doctors")
          .select("*");

        console.log("Database response:", { doctors, dbError });

        if (dbError) {
          throw new Error("Database error: " + dbError.message);
        }

        if (!doctors) {
          console.log("No doctors found in database");
          setTodaysDoctors([]);
          return;
        }

        // Filter doctors who are available today
        const doctorsAvailableToday = doctors.filter((doctor) => {
          if (!doctor.schedule || !Array.isArray(doctor.schedule)) {
            console.log("Invalid schedule for doctor:", doctor.id);
            return false;
          }
          const todaySchedule = doctor.schedule.find(
            (day: Schedule) => day.day === dayName
          );
          const isAvailable = todaySchedule?.active;
          console.log("Doctor availability check:", {
            doctorId: doctor.id,
            doctorName: doctor.name,
            dayName,
            isAvailable,
            schedule: doctor.schedule,
          });
          return isAvailable;
        });

        console.log("Doctors available today:", doctorsAvailableToday);
        setTodaysDoctors(doctorsAvailableToday);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        alert(
          error instanceof Error ? error.message : "Error fetching doctors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();

    // Set up real-time subscription for doctor profile updates
    const doctorsSubscription = supabase
      .channel("doctors_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "doctors",
        },
        () => {
          console.log("Doctor profile updated, refreshing data...");
          fetchDoctors();
        }
      )
      .subscribe();

    return () => {
      doctorsSubscription.unsubscribe();
    };
  }, [router, supabase]);

  // Check for pending consultation requests and approved consultations
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const user = await getCurrentUser();
        const { data: user_name } = await supabase
          .from("patient_data")
          .select("id")
          .eq("auth_id", user?.id)
          .single();
        // Fetch pending consultations
        const {
          data: pendingData,
          error: pendingError,
          count: pendingCount,
        } = await supabase
          .from("consultations")
          .select("*", { count: "exact" })
          .eq("status", "pending")
          .eq("patient_id", user_name?.id)
          .is("meet_link", null);

        if (pendingError) {
          console.error("Error fetching pending consultations:", pendingError);
          return;
        }

        setPendingConsultations(pendingCount || 0);
        setPendingRequests(pendingData || []);

        // Set current doctor request if there's a pending request
        if (pendingData && pendingData.length > 0) {
          // Find the doctor in our list that matches the doctor_id
          const doctorId = pendingData[0].doctor_id;
          const doctor = todaysDoctors.find((d: Doctor) => d.id === doctorId);
          if (doctor) {
            setCurrentDoctorRequest({
              doctorId: doctor.id,
              doctorName: doctor.name,
            });
          }
        } else {
          setCurrentDoctorRequest(null);
        }
        if (user_name?.id) {
          // Fetch approved consultations with meet links
          const { data: approvedData, error: approvedError } = await supabase
            .from("consultations")
            .select("*")
            .eq("status", "approved")
            .eq("patient_id", user_name.id)
            .not("meet_link", "is", null)
            .order("created_at", { ascending: false });

          if (approvedError) {
            console.error(
              "Error fetching approved consultations:",
              approvedError
            );
            return;
          }

          setApprovedConsultations(approvedData || []);
        } else {
          console.warn(
            "User name is not available, skipping approved consultations fetch."
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchConsultations();

    // Set up real-time subscription for consultation updates
    const subscription = supabase
      .channel("consultations_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use useMemo to filter doctors based on search without causing re-renders
  const filteredDoctors = useMemo(() => {
    if (!search.trim()) {
      return todaysDoctors;
    }

    return todaysDoctors.filter(
      (doctor: Doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, todaysDoctors]);

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowProfileModal(true);
  };
  //toggleLanguage
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  // Update the handleRequestConsultation function to prevent multiple requests to the same doctor
  const handleRequestConsultation = async (doctor: Doctor) => {
    // If there's already a pending request for this specific doctor
    if (currentDoctorRequest && currentDoctorRequest.doctorId === doctor.id) {
      // Show an alert or notification that they already have a pending request with this doctor
      alert(
        `You already have a pending consultation request with ${doctor.name}. Please wait for a response.`
      );
      return;
    }

    // If there's already a pending request for a different doctor
    if (currentDoctorRequest && currentDoctorRequest.doctorId !== doctor.id) {
      setNewDoctorSelection(doctor);
      setShowCancelRequestModal(true);
      return;
    }

    // If no existing request
    setSelectedDoctor(doctor);
    setShowConsultationModal(true);
  };

  const confirmConsultation = async () => {
    setConsultationRequested(true);

    try {
      // Get the current user's ID from your auth context
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      // Ensure email exists before calling getPatientData
      if (!user.email) {
        throw new Error("User email not found");
      }
      const patientData = await getPatientData(user.email);

      const response = await fetch("/api/create-consultation-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          patientId: patientData?.id,
          patientName: patientData?.name,
          doctorName: selectedDoctor?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to create meeting link"
        );
      }

      // Set success message instead of meet link
      setMeetingLink(
        "Your consultation request has been sent to the doctor. Please check back later for the meeting link."
      );
    } catch (error) {
      console.error("Error creating consultation request:", error);
      alert(
        "There was a problem setting up the consultation request. Please try again."
      );
    } finally {
      setConsultationRequested(false);
    }
  };

  const handleViewPendingRequests = () => {
    setShowPendingRequestsModal(true);
  };

  const handleViewConsultations = () => {
    setShowConsultationsModal(true);
  };

  const handleSelectRequest = (request: Consultation) => {
    setSelectedRequest(request);
  };

  const handleSubmitMeetLink = async () => {
    if (!meetLink || !selectedRequest) return;

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
        .eq("id", selectedRequest.id);

      if (error) {
        console.error("Error updating consultation:", error);
        alert("Failed to add meeting link. Please try again.");
        return;
      }

      // Update local state
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== selectedRequest.id)
      );
      setPendingConsultations((prev) => prev - 1);
      setApprovedConsultations((prev) => [
        {
          ...selectedRequest,
          meet_link: meetLink,
          status: "approved",
        },
        ...prev,
      ]);

      // Reset form
      setMeetLink("");
      setSelectedRequest(null);

      alert("Meeting link has been sent to the patient!");
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinMeeting = (meetLink: string) => {
    window.open(meetLink, "_blank");
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedDoctor(null);
  };

  const closeConsultationModal = () => {
    setShowConsultationModal(false);
    setConsultationRequested(false);
    setMeetingLink(null);
  };

  const getTodaySchedule = (doctor: Doctor) => {
    const todaySchedule = doctor.schedule.find((day) => day.day === currentDay);
    return todaySchedule && todaySchedule.active
      ? `${todaySchedule.startTime} - ${todaySchedule.endTime}`
      : "Not available today";
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case "online":
        return "Online Consultation Only";
      case "in-person":
        return "In-Person Consultation Only";
      case "both":
        return "Online & In-Person Consultation";
      default:
        return "Consultation Available";
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case "online":
        return <Video className="h-4 w-4 mr-1" />;
      case "in-person":
        return <MapPin className="h-4 w-4 mr-1" />;
      case "both":
        return (
          <div className="flex">
            <Video className="h-4 w-4 mr-1" />
            <MapPin className="h-4 w-4 mr-1" />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const cancelExistingAndCreateNew = async () => {
    if (!newDoctorSelection || !currentDoctorRequest) return;

    try {
      // Find the consultation to cancel
      const { data: existingRequests } = await supabase
        .from("consultations")
        .select("*")
        .eq("doctor_id", currentDoctorRequest.doctorId)
        .eq("status", "pending")
        .is("meet_link", null);

      if (existingRequests && existingRequests.length > 0) {
        // Delete the existing request
        await supabase
          .from("consultations")
          .delete()
          .eq("id", existingRequests[0].id);
      }

      // Close the confirmation modal
      setShowCancelRequestModal(false);

      // Proceed with the new request
      setSelectedDoctor(newDoctorSelection);
      setShowConsultationModal(true);
    } catch (error) {
      console.error("Error canceling existing request:", error);
      alert(
        "There was a problem canceling your existing request. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center relative pt-20">
      {/* Time Display */}
      <TimeDisplay />

      {/* Title with Notification Badge */}
      <div className="flex items-center justify-center mb-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
          Available Doctors Today
        </h1>
        {pendingConsultations > 0 && (
          <Badge className="ml-2 bg-red-500 text-white">
            {pendingConsultations}
          </Badge>
        )}
      </div>
      <p className="text-gray-600 mb-6 text-center">
        Showing doctors available on {currentDay}
      </p>

      {/* Search Input */}
      <div className="relative w-full max-w-5xl mb-4">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search doctors by name or specialization"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* View Toggle */}
      <div className="w-full max-w-5xl mb-4">
        <Tabs
          defaultValue="grid"
          onValueChange={(value) => setViewMode(value as "grid" | "table")}
        >
          <div className="flex justify-end">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Notification Banners */}
      <div className="w-full max-w-5xl space-y-4 mb-4">
        {/* Pending Requests Banner */}
        {pendingConsultations > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="text-yellow-500 mr-2" />
              <span>
                You have <strong>{pendingConsultations}</strong> pending
                consultation{" "}
                {pendingConsultations === 1 ? "request" : "requests"}
              </span>
            </div>
            <Button
              variant="outline"
              className="bg-white"
              onClick={handleViewPendingRequests}
            >
              View Requests
            </Button>
          </div>
        )}

        {/* Active Consultations Banner */}
        {approvedConsultations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Video className="text-green-500 mr-2" />
              <span>
                You have <strong>{approvedConsultations.length}</strong> active
                consultation
                {approvedConsultations.length === 1 ? "" : "s"}
              </span>
            </div>
            <Button
              variant="outline"
              className="bg-white"
              onClick={handleViewConsultations}
            >
              View Consultations
            </Button>
          </div>
        )}
      </div>

      {/* Doctor List - Grid View */}
      {viewMode === "grid" && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Card
                key={`${doctor.id}-${doctor.updated_at}`}
                className="overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{doctor.name}</CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Available
                    </Badge>
                  </div>
                  <CardDescription>{doctor.specialization}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Doctor Profile Image - Prominently Displayed */}
                  <div className="flex justify-center">
                    <Avatar className="w-32 h-32 border-2 border-gray-200">
                      <AvatarImage
                        src={doctor.image_url || "/placeholder.svg"}
                        alt={doctor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100">
                        <UserRound size={48} />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Consultation Type */}
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {getConsultationTypeIcon(doctor.consultation_type)}
                      {getConsultationTypeLabel(doctor.consultation_type)}
                    </Badge>
                  </div>

                  {/* Today's Schedule */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                      <Clock size={16} />
                      <span>Today&apos;s Online Clinic Hours</span>
                    </div>
                    <p className="text-center font-semibold">
                      {getTodaySchedule(doctor)}
                    </p>
                  </div>

                  {/* Address for In-Person */}
                  {(doctor.consultation_type === "in-person" ||
                    doctor.consultation_type === "both") &&
                    doctor.address && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium flex items-center gap-1 mb-1">
                          <MapPin size={14} />
                          <span>Clinic Address:</span>
                        </div>
                        <p>{doctor.address}</p>
                      </div>
                    )}
                </CardContent>
                {/* Update the doctor card in grid view to disable the button if already requested */}
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleViewProfile(doctor)}
                  >
                    View Profile
                  </Button>
                  <Button
                    onClick={() => handleRequestConsultation(doctor)}
                    disabled={currentDoctorRequest?.doctorId === doctor.id}
                    className={
                      currentDoctorRequest?.doctorId === doctor.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    {currentDoctorRequest?.doctorId === doctor.id
                      ? "Requested"
                      : "Request Consultation"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No doctors available today.</p>
              <p className="text-gray-400 mt-2">
                Please check back later or try another day.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Doctor List - Table View */}
      {viewMode === "table" && (
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Consultation Type</TableHead>
                <TableHead>Today&apos;s Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={doctor.image_url || "/placeholder.svg"}
                            alt={doctor.name}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            <UserRound size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <span>{doctor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {getConsultationTypeIcon(doctor.consultation_type)}
                        <span className="text-xs">
                          {doctor.consultation_type}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-600" />
                        <span>{getTodaySchedule(doctor)}</span>
                      </div>
                    </TableCell>
                    {/* Update the table view actions column to disable the button if already requested */}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(doctor)}
                        >
                          Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRequestConsultation(doctor)}
                          disabled={
                            currentDoctorRequest?.doctorId === doctor.id
                          }
                          className={
                            currentDoctorRequest?.doctorId === doctor.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                        >
                          {currentDoctorRequest?.doctorId === doctor.id
                            ? "Requested"
                            : "Consult"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No doctors available today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {showProfileModal && selectedDoctor && (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="w-[90%] max-w-[1000px] h-[600px] p-0 overflow-hidden rounded-md shadow-2xl border border-gray-200">
            {/* Also remove the custom X button from the Doctor Profile Modal */}
            <DialogHeader className="bg-gray-50 p-4 border-b">
              <DialogTitle className="text-xl font-bold">
                Doctor Profile
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col md:flex-row h-[480px]">
              {/* Left Column - Doctor Image and Basic Info */}
              <div className="w-full md:w-1/3 border-r bg-white p-6 flex flex-col items-center">
                <Avatar className="w-32 h-32 border-4 border-gray-200">
                  <AvatarImage
                    src={selectedDoctor.image_url || "/placeholder.svg"}
                    alt={selectedDoctor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-100">
                    <UserRound size={48} />
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-xl font-bold mt-4 text-center">
                  {selectedDoctor.name}
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {selectedDoctor.specialization}
                </p>

                <Badge variant="outline" className="px-3 py-1 mb-4">
                  {getConsultationTypeLabel(selectedDoctor.consultation_type)}
                </Badge>

                <Button
                  className="w-full mt-auto"
                  onClick={() => {
                    closeProfileModal();
                    handleRequestConsultation(selectedDoctor);
                  }}
                >
                  Request Consultation
                </Button>
              </div>

              {/* Right Column - Doctor Details with Scrollable Content */}
              <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                {/* Today's Schedule */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Clock size={18} />
                    <span>Today&apos;s Online Clinic Hours ({currentDay})</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {getTodaySchedule(selectedDoctor)}
                  </p>
                </div>

                {/* In-Person Address */}
                {(selectedDoctor.consultation_type === "in-person" ||
                  selectedDoctor.consultation_type === "both") &&
                  selectedDoctor.address && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <div className="flex items-center gap-2 font-medium mb-2">
                        <MapPin size={18} />
                        <span>In-Person Consultation Address</span>
                      </div>
                      <p>{selectedDoctor.address}</p>
                    </div>
                  )}

                {/* Weekly Schedule */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 font-medium mb-3">
                    <Calendar size={18} />
                    <span>Weekly Schedule</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {selectedDoctor.schedule.map((day) => (
                      <div
                        key={day.day}
                        className="flex justify-between items-center py-1 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{day.day}</span>
                          {day.day === currentDay && (
                            <Badge variant="outline" className="text-xs">
                              Today
                            </Badge>
                          )}
                        </div>
                        {day.active ? (
                          <span className="text-green-600">
                            {day.startTime} - {day.endTime}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not Available</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Consultation Request Modal */}
      {showConsultationModal && selectedDoctor && (
        <Dialog
          open={showConsultationModal}
          onOpenChange={setShowConsultationModal}
        >
          <DialogContent className="w-[90%] max-w-[500px] p-0 overflow-hidden rounded-md shadow-2xl border border-gray-200">
            {/* Remove the custom X button from the Consultation Request Modal */}
            <DialogHeader className="bg-gray-50 p-4 border-b">
              <DialogTitle className="text-xl font-bold">
                {meetingLink ? "Consultation Ready" : "Request Consultation"}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6">
              {meetingLink ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Request Submitted!</h3>
                  <p className="text-gray-600">{meetingLink}</p>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      closeConsultationModal();
                    }}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-gray-200">
                      <AvatarImage
                        src={selectedDoctor.image_url || "/placeholder.svg"}
                        alt={selectedDoctor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100">
                        <UserRound size={24} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                      <Clock size={16} />
                      <span>Today&apos;s Clinic Hours</span>
                    </div>
                    <p className="font-semibold">
                      {getTodaySchedule(selectedDoctor)}
                    </p>
                  </div>

                  <p className="text-gray-700">
                    Would you like to request a consultation with{" "}
                    {selectedDoctor.name}? Once confirmed, you will be provided
                    with a video consultation link.
                  </p>

                  {consultationRequested ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                      <span className="ml-3">
                        Setting up your consultation...
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={closeConsultationModal}
                      >
                        Cancel
                      </Button>
                      <Button onClick={confirmConsultation}>
                        Confirm Consultation
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pending Requests Modal */}
      <Dialog
        open={showPendingRequestsModal}
        onOpenChange={setShowPendingRequestsModal}
      >
        <DialogContent className="w-[90%] max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Pending Consultation Requests
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectRequest(request)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {request.doctor_name || "Doctor"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Requested:{" "}
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>
                  </div>
                ))}

                {selectedRequest && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-2">
                      Add Google Meet Link for {selectedRequest.doctor_name}
                    </h3>
                    <Input
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                      className="mb-2"
                    />
                    <div className="text-xs text-gray-500 mb-4">
                      Create a Google Meet link at{" "}
                      <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 underline"
                      >
                        meet.google.com
                      </a>{" "}
                      and paste it above
                    </div>
                    <Button
                      onClick={handleSubmitMeetLink}
                      disabled={!meetLink || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Sending..." : "Send Meet Link"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No pending consultation requests.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPendingRequestsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Consultations Modal */}
      <Dialog
        open={showConsultationsModal}
        onOpenChange={setShowConsultationsModal}
      >
        <DialogContent className="w-[90%] max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Active Consultations
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {approvedConsultations.length > 0 ? (
              <div className="space-y-4">
                {approvedConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-4 border rounded-lg bg-white"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">
                          {consultation.doctor_name || "Doctor"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(consultation.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-600 truncate max-w-[300px]">
                        <span className="font-medium">Meet Link:</span>{" "}
                        {consultation.meet_link}
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                        onClick={() => joinMeeting(consultation.meet_link!)}
                      >
                        <ExternalLink size={14} />
                        Join Meet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active consultations.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConsultationsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Request Confirmation Modal */}
      <Dialog
        open={showCancelRequestModal}
        onOpenChange={setShowCancelRequestModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Change Consultation Request
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-gray-700 mb-4">
              You already have a pending consultation request with{" "}
              <strong>{currentDoctorRequest?.doctorName}</strong>.
            </p>
            <p className="text-gray-700">
              Would you like to cancel your current request and request a
              consultation with <strong>{newDoctorSelection?.name}</strong>{" "}
              instead?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelRequestModal(false)}
            >
              Keep Current Request
            </Button>
            <Button
              variant="destructive"
              onClick={cancelExistingAndCreateNew}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel & Request New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back Button */}
      <div className="w-full max-w-5xl mt-6 flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Bumalik
        </Button>
      </div>
    </div>
  );
}
