"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaBriefcaseMedical,
  FaHospital,
  FaSignOutAlt,
  FaKey,
  FaUndo,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/lib/supabase-auth";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DoctorsHomePage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
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

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  const handleAdminSettings = () => {
    setIsSettingsOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordChange = async () => {
    try {
      // Validate current password
      const { data: adminSettings } = await supabase
        .from("admin_settings")
        .select("admin_code")
        .single();

      if (!adminSettings || adminSettings.admin_code !== currentPassword) {
        setErrorMessage("Current password is incorrect");
        return;
      }

      // Validate new password
      if (newPassword.length < 5) {
        setErrorMessage("New password must be at least 5 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("New passwords do not match");
        return;
      }

      // Update password in database
      const { error: updateError } = await supabase
        .from("admin_settings")
        .update({ admin_code: newPassword })
        .eq("id", 1);

      if (updateError) throw updateError;

      setSuccessMessage("Password updated successfully!");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage("Failed to update password. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error: resetError } = await supabase
        .from("admin_settings")
        .update({ admin_code: "12345" })
        .eq("id", 1);

      if (resetError) throw resetError;

      setSuccessMessage("Password reset to default (12345)");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("Failed to reset password. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/form");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center p-4">
      <div className="w-[700px] max-w-full px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
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
            onClick={toggleLanguage}
            className="px-6 py-3 text-blue-700 text-lg font-semibold"
          >
            {t("language.toggle")}
          </Button>

          <Button
            variant="outline"
            onClick={handleAdminSettings}
            className="px-6 py-3 text-blue-700 text-lg font-semibold"
          >
            {t("admin.Settings")}
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mt-2">
          {t("admin.homepage")}
        </h1>

        {/* Buttons Section */}
        <div className="grid grid-cols-1  gap-6 mt-8">
          {[
            {
              icon: <FaUser className="text-2xl text-blue-600" />,
              text: t("admin.personal.info"),
              onClick: () => router.push("/docprofiles"),
            },
            {
              icon: <FaBriefcaseMedical className="text-2xl text-green-600" />,
              text: t("admin.start.appointments"),
              onClick: () => router.push("/appointment"),
            },
            {
              icon: <FaHospital className="text-2xl text-purple-600" />,
              text: t("admin.ehr.clinic"),
              onClick: () => window.open("https://www.ppd.ph/", "_blank"),
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="w-full flex flex-col justify-center items-center gap-4 p-6 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer bg-white"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-xl font-semibold text-center">
                {item.text}
              </span>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-4 p-6 text-xl font-semibold rounded-2xl shadow-lg hover:scale-105 transition-all"
          >
            <FaSignOutAlt className="text-2xl" />
            {t("logout.button")}
          </Button>
        </div>

        {/* Admin Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Admin Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-500 text-sm">{successMessage}</p>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleResetPassword}
                className="flex items-center gap-2"
              >
                <FaUndo /> Reset to Default
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="flex items-center gap-2"
              >
                <FaKey /> Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-10 text-gray-500 text-lg font-medium text-center">
          eKonsulTech
        </div>
      </div>
    </div>
  );
}
