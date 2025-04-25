"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { useLanguage } from "@/context/LanguageContext";

export default function HealthKiosk() {
  const [adminCode, setAdminCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminLogin = () => {
    if (adminCode === "12345") {
      router.push("/adminlogin");
    } else {
      setErrorMessage("Invalid code. Please try again.");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 bg-gradient-to-br from-blue-50 to-teal-50 px-4">
      <header className="w-full bg-blue-500 p-2 shadow-lg fixed top-0 left-0 z-10">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Link
            href="/"
            className="text-white text-2xl font-semibold hover:underline"
          >
            eKonsulTech
          </Link>
          <nav>
            <ul className="flex space-x-6 text-white text-lg">
              <li>
                <Button
                  variant="link"
                  className="text-white hover:text-blue-300"
                  onClick={() => router.push("/about")}
                >
                  About
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-white hover:text-blue-300"
                  onClick={() => router.push("/contacts")}
                >
                  Contacts
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      {/* Language Toggle */}
      <div className="absolute top-20 right-8">
        <Button variant="outline" onClick={toggleLanguage}>
          {t("language.toggle")}
        </Button>
      </div>
      <div className="text-center mb-14 max-w-screen-xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
          {t("app.name")}
        </h1>
        <p className="text-2xl text-gray-600 mt-4">{t("form.welcome")}</p>
      </div>

      {/* Role Selection Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 w-full max-w-4xl">
        {/* User Button */}
        <Button
          variant="outline"
          className="w-full md:w-80 h-64 md:h-80 flex flex-col items-center justify-center rounded-xl bg-teal-50 hover:bg-teal-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg p-4 md:p-6"
          onClick={() => router.push("/userlogin")}
        >
          <FaUserAlt
            className="text-teal-600 mb-4 md:mb-6"
            style={{ width: "4rem", height: "4rem" }}
          />
          <div className="text-xl md:text-2xl lg:text-3xl font-semibold text-teal-700 text-center w-full overflow-hidden">
            {t("form.patient")}
          </div>
        </Button>

        {/* Admin Button with Dialog Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:w-80 h-64 md:h-80 flex flex-col items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg p-4 md:p-6"
              onClick={() => setIsDialogOpen(true)}
            >
              <FaUserCog
                className="text-gray-600 mb-4 md:mb-6"
                style={{ width: "4rem", height: "4rem" }}
              />
              <div className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 text-center w-full overflow-hidden">
                {t("form.healthworker")}
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("form.admin.access")}</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 mb-4">{t("form.admin.code")}</p>
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
                {t("form.admin.submit")}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="text-xl px-6 py-3"
              >
                {t("form.admin.cancel")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
