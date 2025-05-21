/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRouter } from "next/navigation";
import type React from "react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, UserRound, Clock } from "lucide-react";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ScheduleDay {
  day: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_SCHEDULE: ScheduleDay[] = DAYS_OF_WEEK.map((day) => ({
  day,
  active: false,
  startTime: "9:00 AM",
  endTime: "5:00 PM",
}));

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

export default function DoctorProfile() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialization: "",
    address: "",
    consultationType: "both",
    schedule: DEFAULT_SCHEDULE,
    profileImage: "/placeholder.svg?height=300&width=300",
  });

  const [newInfo, setNewInfo] = useState(doctorInfo);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<{
    day: string;
    available: boolean;
    hours: string;
  } | null>(null);
  const [currentDay, setCurrentDay] = useState("");

  // Initial data fetch - only runs once when component mounts
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (initialFetchDone) return;

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/adminlogin");
          return;
        }

        // Fetch doctor profile
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (doctorError) {
          if (doctorError.code === "PGRST116") {
            // No profile exists yet, create initial profile
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const initialProfile = {
                auth_id: userData.user.id,
                email: userData.user.email,
                name: "",
                specialization: "",
                address: "",
                consultation_type: "both",
                schedule: DEFAULT_SCHEDULE,
                image_url: doctorInfo.profileImage,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              const { error: insertError } = await supabase
                .from("doctors")
                .insert([initialProfile]);

              if (insertError) {
                throw insertError;
              }

              const profileData = {
                name: "",
                specialization: "",
                address: "",
                consultationType: "both",
                schedule: DEFAULT_SCHEDULE,
                profileImage: doctorInfo.profileImage,
              };

              setDoctorInfo(profileData);
              setNewInfo(profileData);
            }
          } else {
            throw doctorError;
          }
        } else if (doctorData) {
          const profileData = {
            name: doctorData.name || "",
            specialization: doctorData.specialization || "",
            address: doctorData.address || "",
            consultationType: doctorData.consultation_type || "both",
            schedule: doctorData.schedule
              ? DEFAULT_SCHEDULE.map((defaultDay) => {
                  const existingDay = doctorData.schedule.find(
                    (d: ScheduleDay) => d.day === defaultDay.day
                  );
                  return existingDay || defaultDay;
                })
              : DEFAULT_SCHEDULE,
            profileImage: doctorData.image_url || doctorInfo.profileImage,
          };
          setDoctorInfo(profileData);
          setNewInfo(profileData);
        }

        // Set today's schedule
        const today = new Date();
        const dayIndex = today.getDay();
        const dayName = DAYS_OF_WEEK[dayIndex];
        setCurrentDay(dayName);

        const schedule = doctorData?.schedule || doctorInfo.schedule;
        const todayData = schedule.find(
          (day: {
            day: string;
            active: boolean;
            startTime: string;
            endTime: string;
          }) => day.day === dayName
        );
        if (todayData) {
          setTodaySchedule({
            day: dayName,
            available: todayData.active,
            hours: todayData.active
              ? `${todayData.startTime} - ${todayData.endTime}`
              : "Not available",
          });
        }

        setInitialFetchDone(true);
      } catch (error) {
        console.error("Error in auth check:", error);
        router.push("/adminlogin");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, []); // Remove all dependencies to prevent constant updates

  // Update today's schedule when newInfo.schedule changes
  useEffect(() => {
    if (!initialFetchDone) return;

    const today = new Date();
    const dayIndex = today.getDay();
    const dayName = DAYS_OF_WEEK[dayIndex];

    const todayData = newInfo.schedule.find(
      (day: {
        day: string;
        active: boolean;
        startTime: string;
        endTime: string;
      }) => day.day === dayName
    );

    if (todayData) {
      setTodaySchedule({
        day: dayName,
        available: todayData.active,
        hours: todayData.active
          ? `${todayData.startTime} - ${todayData.endTime}`
          : "Not available",
      });
    }
  }, [newInfo.schedule, initialFetchDone]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(file);

        // Upload to Supabase Storage
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("doctor-profiles")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("doctor-profiles").getPublicUrl(fileName);

        // Set the new image URL in the state
        setNewInfo({ ...newInfo, profileImage: publicUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/adminlogin");
        return;
      }

      // Validate required fields
      if (!newInfo.name || !newInfo.specialization) {
        throw new Error("Name and specialization are required");
      }

      // Validate address for in-person consultations
      if (
        (newInfo.consultationType === "in-person" ||
          newInfo.consultationType === "both") &&
        !newInfo.address
      ) {
        throw new Error("Address is required for in-person consultations");
      }

      // First get the current doctor data to ensure we have the email
      const { data: currentDoctor, error: fetchError } = await supabase
        .from("doctors")
        .select("email")
        .eq("auth_id", user.id)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch current doctor data");
      }

      const updateData = {
        name: newInfo.name,
        specialization: newInfo.specialization,
        address: newInfo.address,
        consultation_type: newInfo.consultationType,
        schedule: newInfo.schedule,
        image_url: newInfo.profileImage, // Make sure this is set correctly
        updated_at: new Date().toISOString(),
        email: currentDoctor.email || user.email,
      };

      console.log("Updating doctor profile with data:", updateData); // Add logging

      const { error: updateError } = await supabase
        .from("doctors")
        .update(updateData)
        .eq("auth_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      setDoctorInfo(newInfo);

      // Show success message or handle UI feedback
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error instanceof Error ? error.message : "Error updating profile");
    }
  };

  const handleScheduleChange = (
    index: number,
    field: string,
    value: boolean | string
  ) => {
    const updatedSchedule = [...newInfo.schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setNewInfo({ ...newInfo, schedule: updatedSchedule });
  };

  const formatSchedule = (schedule: typeof doctorInfo.schedule) => {
    const activeDays = schedule.filter((day) => day.active);
    if (activeDays.length === 0) return "No available hours";

    return activeDays
      .map((day) => `${day.day}: ${day.startTime} - ${day.endTime}`)
      .join(", ");
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

  // Check if doctor is available today
  const isDoctorAvailableToday = todaySchedule?.available || false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white p-8 lg:p-12">
      <div className="flex flex-col items-center justify-center w-full">
        {/* Header Section */}
        <div className="w-full max-w-[700px] flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admindash")}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
            eKonsulTech
          </h1>

          <div className="w-8"></div>
        </div>

        {isDoctorAvailableToday ? (
          <Card className="w-full max-w-[700px] shadow-xl rounded-2xl p-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Doctor&apos;s Profile
              </h2>
              <Badge className="bg-green-500 hover:bg-green-600">
                Available Today
              </Badge>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture - More Prominent */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <Avatar className="w-full h-full border-4 border-gray-300 rounded-xl">
                    {doctorInfo.profileImage ? (
                      <AvatarImage
                        src={doctorInfo.profileImage || "/placeholder.svg"}
                        alt="Doctor Profile"
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-gray-500 text-6xl bg-gray-100">
                        <UserRound size={64} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* Consultation Type Badge */}
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-300 px-4 py-2 text-sm"
                >
                  {getConsultationTypeLabel(doctorInfo.consultationType)}
                </Badge>
              </div>

              {/* Doctor Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {doctorInfo.name}
                  </h3>
                  <p className="text-xl text-gray-600">
                    {doctorInfo.specialization}
                  </p>
                </div>

                {/* Today's Schedule */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Clock size={18} />
                    <span>Today&apos;s Online Clinic Hours ({currentDay})</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {todaySchedule?.hours}
                  </p>
                </div>

                {/* Address for In-Person */}
                {(doctorInfo.consultationType === "in-person" ||
                  doctorInfo.consultationType === "both") &&
                  doctorInfo.address && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-1">
                        In-Person Consultation Address:
                      </h4>
                      <p className="text-gray-600">{doctorInfo.address}</p>
                    </div>
                  )}

                {/* Full Schedule */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">
                    Weekly Schedule:
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {formatSchedule(doctorInfo.schedule)}
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-4 px-8 py-3 text-blue-700 font-semibold"
                    >
                      Update Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update Doctor Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      {/* Profile Image Upload */}
                      <div className="flex flex-col items-center gap-3">
                        <Label className="text-xl">Profile Picture</Label>
                        <div className="w-40 h-40 mb-2">
                          <Avatar className="w-full h-full border-2 border-gray-300">
                            {newInfo.profileImage ? (
                              <AvatarImage
                                src={newInfo.profileImage || "/placeholder.svg"}
                                alt="Doctor Profile"
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="text-gray-500 text-4xl bg-gray-100">
                                <UserRound size={48} />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="fileUpload"
                        />
                        <label
                          htmlFor="fileUpload"
                          className="cursor-pointer text-blue-600 hover:underline text-lg"
                        >
                          {selectedImage
                            ? "Change Profile Picture"
                            : "Upload Profile Picture"}
                        </label>
                      </div>

                      {/* Name */}
                      <div>
                        <Label htmlFor="name" className="text-xl">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newInfo.name}
                          onChange={(e) =>
                            setNewInfo({ ...newInfo, name: e.target.value })
                          }
                          className="text-lg py-3"
                        />
                      </div>

                      {/* Specialization */}
                      <div>
                        <Label htmlFor="specialization" className="text-xl">
                          Specialization
                        </Label>
                        <Input
                          id="specialization"
                          value={newInfo.specialization}
                          onChange={(e) =>
                            setNewInfo({
                              ...newInfo,
                              specialization: e.target.value,
                            })
                          }
                          className="text-lg py-3"
                        />
                      </div>

                      {/* Consultation Type */}
                      <div>
                        <Label className="text-xl mb-3 block">
                          Consultation Type
                        </Label>
                        <RadioGroup
                          value={newInfo.consultationType}
                          onValueChange={(value) =>
                            setNewInfo({ ...newInfo, consultationType: value })
                          }
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online">
                              Online Consultation Only
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="in-person" id="in-person" />
                            <Label htmlFor="in-person">
                              In-Person Consultation Only
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">
                              Both Online & In-Person Consultation
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Address */}
                      <div
                        className={
                          newInfo.consultationType === "online"
                            ? "opacity-50"
                            : ""
                        }
                      >
                        <Label htmlFor="address" className="text-xl">
                          Address{" "}
                          <span className="text-gray-500 text-sm">
                            (Required for in-person consultations)
                          </span>
                        </Label>
                        <Textarea
                          id="address"
                          value={newInfo.address}
                          onChange={(e) =>
                            setNewInfo({ ...newInfo, address: e.target.value })
                          }
                          className="text-lg py-3 min-h-[100px]"
                          placeholder="Enter your clinic address for in-person consultations"
                          disabled={newInfo.consultationType === "online"}
                        />
                      </div>

                      {/* Clinic Hours */}
                      <div className="space-y-4">
                        <Label className="text-xl">Clinic Hours</Label>
                        <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto bg-white">
                          {newInfo.schedule.map((day, index) => (
                            <div
                              key={day.day}
                              className="flex flex-col gap-2 py-3 border-b last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`day-${index}`}
                                  checked={day.active}
                                  onCheckedChange={(checked) =>
                                    handleScheduleChange(
                                      index,
                                      "active",
                                      checked === true
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`day-${index}`}
                                  className="font-medium"
                                >
                                  {day.day}
                                </Label>
                                {day.day === currentDay && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs"
                                  >
                                    Today
                                  </Badge>
                                )}
                              </div>

                              {day.active && (
                                <div className="grid grid-cols-2 gap-4 ml-6 mt-2">
                                  <div className="space-y-2">
                                    <Label className="text-sm">
                                      Start Time
                                    </Label>
                                    <div className="flex gap-2">
                                      <Select
                                        value={day.startTime.split(":")[0]}
                                        onValueChange={(value) => {
                                          const [minutes, period] =
                                            day.startTime.split(/[: ]/);
                                          handleScheduleChange(
                                            index,
                                            "startTime",
                                            `${value}:${minutes} ${period}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {HOURS.map((hour) => (
                                            <SelectItem
                                              key={hour}
                                              value={hour.toString()}
                                            >
                                              {hour}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={
                                          day.startTime
                                            .split(":")[1]
                                            .split(" ")[0]
                                        }
                                        onValueChange={(value) => {
                                          const [hour, period] =
                                            day.startTime.split(/[: ]/);
                                          handleScheduleChange(
                                            index,
                                            "startTime",
                                            `${hour}:${value} ${period}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Min" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {MINUTES.map((min) => (
                                            <SelectItem key={min} value={min}>
                                              {min}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={day.startTime.split(" ")[1]}
                                        onValueChange={(value) => {
                                          const [time] =
                                            day.startTime.split(" ");
                                          handleScheduleChange(
                                            index,
                                            "startTime",
                                            `${time} ${value}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="AM/PM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PERIODS.map((period) => (
                                            <SelectItem
                                              key={period}
                                              value={period}
                                            >
                                              {period}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm">End Time</Label>
                                    <div className="flex gap-2">
                                      <Select
                                        value={day.endTime.split(":")[0]}
                                        onValueChange={(value) => {
                                          const [minutes, period] =
                                            day.endTime.split(/[: ]/);
                                          handleScheduleChange(
                                            index,
                                            "endTime",
                                            `${value}:${minutes} ${period}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {HOURS.map((hour) => (
                                            <SelectItem
                                              key={hour}
                                              value={hour.toString()}
                                            >
                                              {hour}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={
                                          day.endTime
                                            .split(":")[1]
                                            .split(" ")[0]
                                        }
                                        onValueChange={(value) => {
                                          const [hour, period] =
                                            day.endTime.split(/[: ]/);
                                          handleScheduleChange(
                                            index,
                                            "endTime",
                                            `${hour}:${value} ${period}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Min" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {MINUTES.map((min) => (
                                            <SelectItem key={min} value={min}>
                                              {min}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={day.endTime.split(" ")[1]}
                                        onValueChange={(value) => {
                                          const [time] = day.endTime.split(" ");
                                          handleScheduleChange(
                                            index,
                                            "endTime",
                                            `${time} ${value}`
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="AM/PM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PERIODS.map((period) => (
                                            <SelectItem
                                              key={period}
                                              value={period}
                                            >
                                              {period}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button size="lg" onClick={handleUpdate}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="w-full max-w-[700px] shadow-xl rounded-2xl p-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Doctor&apos;s Profile
              </h2>
              <Badge variant="outline" className="bg-gray-100 text-gray-500">
                Not Available Today
              </Badge>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-32 h-32 opacity-50">
                <Avatar className="w-full h-full border-2 border-gray-300">
                  {doctorInfo.profileImage ? (
                    <AvatarImage
                      src={doctorInfo.profileImage || "/placeholder.svg"}
                      alt="Doctor Profile"
                      className="object-cover grayscale"
                    />
                  ) : (
                    <AvatarFallback className="text-gray-400 text-4xl bg-gray-100">
                      <UserRound size={48} />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mt-4">
                {doctorInfo.name}
              </h3>
              <p className="text-gray-500">{doctorInfo.specialization}</p>
              <p className="text-gray-400 mt-6">
                This doctor is not available for consultations today.
              </p>
              <p className="text-gray-400">
                Please check back on their next scheduled day.
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-8 px-8 py-3 text-blue-700 font-semibold"
                  >
                    Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Update Doctor Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-xl">Profile Picture</Label>
                      <div className="w-40 h-40 mb-2">
                        <Avatar className="w-full h-full border-2 border-gray-300">
                          {newInfo.profileImage ? (
                            <AvatarImage
                              src={newInfo.profileImage || "/placeholder.svg"}
                              alt="Doctor Profile"
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-gray-500 text-4xl bg-gray-100">
                              <UserRound size={48} />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="fileUpload"
                      />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer text-blue-600 hover:underline text-lg"
                      >
                        {selectedImage
                          ? "Change Profile Picture"
                          : "Upload Profile Picture"}
                      </label>
                    </div>

                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-xl">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newInfo.name}
                        onChange={(e) =>
                          setNewInfo({ ...newInfo, name: e.target.value })
                        }
                        className="text-lg py-3"
                      />
                    </div>

                    {/* Specialization */}
                    <div>
                      <Label htmlFor="specialization" className="text-xl">
                        Specialization
                      </Label>
                      <Input
                        id="specialization"
                        value={newInfo.specialization}
                        onChange={(e) =>
                          setNewInfo({
                            ...newInfo,
                            specialization: e.target.value,
                          })
                        }
                        className="text-lg py-3"
                      />
                    </div>

                    {/* Consultation Type */}
                    <div>
                      <Label className="text-xl mb-3 block">
                        Consultation Type
                      </Label>
                      <RadioGroup
                        value={newInfo.consultationType}
                        onValueChange={(value) =>
                          setNewInfo({ ...newInfo, consultationType: value })
                        }
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online">
                            Online Consultation Only
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label htmlFor="in-person">
                            In-Person Consultation Only
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="both" />
                          <Label htmlFor="both">
                            Both Online & In-Person Consultation
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Address */}
                    <div
                      className={
                        newInfo.consultationType === "online"
                          ? "opacity-50"
                          : ""
                      }
                    >
                      <Label htmlFor="address" className="text-xl">
                        Address{" "}
                        <span className="text-gray-500 text-sm">
                          (Required for in-person consultations)
                        </span>
                      </Label>
                      <Textarea
                        id="address"
                        value={newInfo.address}
                        onChange={(e) =>
                          setNewInfo({ ...newInfo, address: e.target.value })
                        }
                        className="text-lg py-3 min-h-[100px]"
                        placeholder="Enter your clinic address for in-person consultations"
                        disabled={newInfo.consultationType === "online"}
                      />
                    </div>

                    {/* Clinic Hours */}
                    <div className="space-y-4">
                      <Label className="text-xl">Clinic Hours</Label>
                      <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto bg-white">
                        {newInfo.schedule.map((day, index) => (
                          <div
                            key={day.day}
                            className="flex flex-col gap-2 py-3 border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`day-${index}`}
                                checked={day.active}
                                onCheckedChange={(checked) =>
                                  handleScheduleChange(
                                    index,
                                    "active",
                                    checked === true
                                  )
                                }
                              />
                              <Label
                                htmlFor={`day-${index}`}
                                className="font-medium"
                              >
                                {day.day}
                              </Label>
                              {day.day === currentDay && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Today
                                </Badge>
                              )}
                            </div>

                            {day.active && (
                              <div className="grid grid-cols-2 gap-4 ml-6 mt-2">
                                <div className="space-y-2">
                                  <Label className="text-sm">Start Time</Label>
                                  <div className="flex gap-2">
                                    <Select
                                      value={day.startTime.split(":")[0]}
                                      onValueChange={(value) => {
                                        const [minutes, period] =
                                          day.startTime.split(/[: ]/);
                                        handleScheduleChange(
                                          index,
                                          "startTime",
                                          `${value}:${minutes} ${period}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Hour" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {HOURS.map((hour) => (
                                          <SelectItem
                                            key={hour}
                                            value={hour.toString()}
                                          >
                                            {hour}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={
                                        day.startTime
                                          .split(":")[1]
                                          .split(" ")[0]
                                      }
                                      onValueChange={(value) => {
                                        const [hour, period] =
                                          day.startTime.split(/[: ]/);
                                        handleScheduleChange(
                                          index,
                                          "startTime",
                                          `${hour}:${value} ${period}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Min" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {MINUTES.map((min) => (
                                          <SelectItem key={min} value={min}>
                                            {min}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={day.startTime.split(" ")[1]}
                                      onValueChange={(value) => {
                                        const [time] = day.startTime.split(" ");
                                        handleScheduleChange(
                                          index,
                                          "startTime",
                                          `${time} ${value}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="AM/PM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {PERIODS.map((period) => (
                                          <SelectItem
                                            key={period}
                                            value={period}
                                          >
                                            {period}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">End Time</Label>
                                  <div className="flex gap-2">
                                    <Select
                                      value={day.endTime.split(":")[0]}
                                      onValueChange={(value) => {
                                        const [minutes, period] =
                                          day.endTime.split(/[: ]/);
                                        handleScheduleChange(
                                          index,
                                          "endTime",
                                          `${value}:${minutes} ${period}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Hour" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {HOURS.map((hour) => (
                                          <SelectItem
                                            key={hour}
                                            value={hour.toString()}
                                          >
                                            {hour}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={
                                        day.endTime.split(":")[1].split(" ")[0]
                                      }
                                      onValueChange={(value) => {
                                        const [hour, period] =
                                          day.endTime.split(/[: ]/);
                                        handleScheduleChange(
                                          index,
                                          "endTime",
                                          `${hour}:${value} ${period}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Min" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {MINUTES.map((min) => (
                                          <SelectItem key={min} value={min}>
                                            {min}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={day.endTime.split(" ")[1]}
                                      onValueChange={(value) => {
                                        const [time] = day.endTime.split(" ");
                                        handleScheduleChange(
                                          index,
                                          "endTime",
                                          `${time} ${value}`
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="AM/PM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {PERIODS.map((period) => (
                                          <SelectItem
                                            key={period}
                                            value={period}
                                          >
                                            {period}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button size="lg" onClick={handleUpdate}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
