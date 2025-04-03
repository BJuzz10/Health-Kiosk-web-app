"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IoArrowBack } from "react-icons/io5";
import { FaUserMd } from "react-icons/fa";

export default function DoctorProfile() {
  const router = useRouter();
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Dr. John Doe",
    specialization: "Cardiologist",
    clinicHours: "Monday - Friday, 9:00 AM - 5:00 PM",
    profileImage: "",
  });

  const [newInfo, setNewInfo] = useState(doctorInfo);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Handle Profile Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setNewInfo({ ...newInfo, profileImage: URL.createObjectURL(file) });
    }
  };

  // Update Doctor's Info
  const handleUpdate = () => {
    setDoctorInfo(newInfo);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-6">
      {/* Header Section */}
      <div className="w-full max-w-[700px] flex items-center justify-between mb-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-gray-700"
        >
          <IoArrowBack size={28} />
        </Button>
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
          eKonsulTech
        </h1>
        {/* Placeholder for symmetry */}
        <div className="w-8"></div>
      </div>

      <Card className="w-[700px] max-w-full shadow-lg rounded-2xl p-6 flex flex-col gap-6">
        {/* Section Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center">
          Doctor’s Personal Information
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative w-40 h-40">
            <Avatar className="w-40 h-40 border-4 border-gray-300">
              {newInfo.profileImage ? (
                <AvatarImage src={newInfo.profileImage} alt="Doctor Profile" />
              ) : (
                <AvatarFallback className="text-gray-500 text-5xl">
                  <FaUserMd />
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800">
              <strong>Name:</strong> {doctorInfo.name}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              <strong>Specialization:</strong> {doctorInfo.specialization}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              <strong>Clinic Hours:</strong> {doctorInfo.clinicHours}
            </p>

            {/* Update Profile Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-4 px-6 py-2 text-blue-700 font-semibold"
                >
                  Update Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Doctor Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center gap-2">
                    <Label>Profile Picture</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="cursor-pointer text-blue-600 hover:underline"
                    >
                      {selectedImage
                        ? "Change Profile Picture"
                        : "Upload Profile Picture"}
                    </label>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newInfo.name}
                      onChange={(e) =>
                        setNewInfo({ ...newInfo, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={newInfo.specialization}
                      onChange={(e) =>
                        setNewInfo({
                          ...newInfo,
                          specialization: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Clinic Hours */}
                  <div>
                    <Label htmlFor="clinicHours">Clinic Hours</Label>
                    <Input
                      id="clinicHours"
                      value={newInfo.clinicHours}
                      onChange={(e) =>
                        setNewInfo({ ...newInfo, clinicHours: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
