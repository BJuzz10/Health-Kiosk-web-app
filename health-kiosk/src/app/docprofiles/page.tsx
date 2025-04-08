"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaChevronLeft } from "react-icons/fa";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white p-8 lg:p-12">
      <div className="flex flex-col items-center justify-center w-full">
        {/* Header Section */}
        <div className="w-full max-w-[700px] flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admindash")}
            className="flex items-center gap-2"
          >
            <FaChevronLeft /> Bumalik
          </Button>

          <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
            eKonsulTech
          </h1>

          <div className="w-8"></div>
        </div>

        <Card className="w-full max-w-[700px] shadow-xl rounded-2xl p-8 flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Doctor’s Personal Information
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="relative w-48 h-48">
              <Avatar className="w-48 h-48 border-4 border-gray-300">
                {newInfo.profileImage ? (
                  <AvatarImage
                    src={newInfo.profileImage}
                    alt="Doctor Profile"
                  />
                ) : (
                  <AvatarFallback className="text-gray-500 text-6xl">
                    <FaUserMd />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <p className="text-xl font-semibold text-gray-800">
                <strong>Name:</strong> {doctorInfo.name}
              </p>
              <p className="text-xl text-gray-600 mt-3">
                <strong>Specialization:</strong> {doctorInfo.specialization}
              </p>
              <p className="text-xl text-gray-600 mt-3">
                <strong>Clinic Hours:</strong> {doctorInfo.clinicHours}
              </p>

              {/* Update Profile Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-6 px-8 py-3 text-blue-700 font-semibold"
                  >
                    Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Doctor Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-xl">Profile Picture</Label>
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

                    {/* Clinic Hours */}
                    <div>
                      <Label htmlFor="clinicHours" className="text-xl">
                        Clinic Hours
                      </Label>
                      <Input
                        id="clinicHours"
                        value={newInfo.clinicHours}
                        onChange={(e) =>
                          setNewInfo({
                            ...newInfo,
                            clinicHours: e.target.value,
                          })
                        }
                        className="text-lg py-3"
                      />
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
      </div>
    </div>
  );
}
