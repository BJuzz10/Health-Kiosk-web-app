"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserAlt, FaUserCog } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function HealthKiosk() {
  const [adminCode, setAdminCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleAdminLogin = () => {
    if (adminCode === "12345") {
      router.push("/adminlogin");
    } else {
      setErrorMessage("Invalid code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 bg-gradient-to-br from-blue-50 to-teal-50 px-4">
      {/* Welcome Text */}
      <div className="text-center mb-14 max-w-screen-xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
          eKonsulTech Health Kiosk
        </h1>
        <p className="text-2xl text-gray-600 mt-4">
          Please select your role to continue
        </p>
      </div>

      {/* Role Selection Buttons */}
      <div className="flex justify-center gap-12 w-full max-w-4xl">
        {/* User Button */}
        <Button
          variant="outline"
          className="w-80 h-80 flex flex-col items-center justify-center rounded-xl bg-teal-50 hover:bg-teal-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg p-6"
          onClick={() => router.push("/userlogin")}
        >
          <FaUserAlt className="w-24 h-24 text-teal-600 mb-6" />
          <span className="text-3xl font-semibold text-teal-700 text-center w-full leading-tight">
            Mag Log-in <br /> bilang Pasyente
          </span>
        </Button>

        {/* Admin Button with Dialog Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-80 h-80 flex flex-col items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg p-6"
              onClick={() => setIsDialogOpen(true)}
            >
              <FaUserCog className="w-24 h-24 text-gray-600 mb-6" />
              <span className="text-3xl font-semibold text-gray-700 text-center w-full leading-tight">
                Mag Log-in <br /> bilang Health Worker
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Access</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 mb-4">Enter Healthcare Admin Access:</p>
            <Input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Enter code"
              className="mb-2 text-xl p-4"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleAdminLogin}
                className="bg-blue-600 hover:bg-blue-700 text-xl px-6 py-3"
              >
                Submit
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="text-xl px-6 py-3"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
