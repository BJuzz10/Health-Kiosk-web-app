"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext"; 

import BPInstructionManual from "@/components/instruction-manuals/bp-instruction";
import OxySatInstructionManual from "@/components/instruction-manuals/oxysat-instruction";
import TemperatureInstructionManual from "@/components/instruction-manuals/temperature-instruction";

export default function HealthAppsPage() {
  const [attemptingDeepLink, setAttemptingDeepLink] = useState(false);
  const [time, setTime] = useState(new Date());
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage(); //added language

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track visibility changes to detect if the app was opened
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (attemptingDeepLink && document.hidden) {
        // If the page becomes hidden while attempting a deep link,
        // it likely means the app was opened
        setAttemptingDeepLink(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptingDeepLink]);

  // Simple function to try opening an app with just the direct scheme
  const tryOpenApp = (url: string) => {
    try {
      setAttemptingDeepLink(true);

      // Set a timeout to check if we're still on the page after a delay
      // This helps detect if the app didn't open
      const timeoutId = setTimeout(() => {
        if (document.visibilityState !== "hidden" && attemptingDeepLink) {
          setAttemptingDeepLink(false);
        }
      }, 1500);

      // Try to open the app with the intent URL
      window.location.href = url;

      return () => clearTimeout(timeoutId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAttemptingDeepLink(false);
    }
  };

  //toggleLanguage
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  const openOmronApp = () => {
    // Using the SplashScreenActivity from the manifest
    const intentUrl =
      "intent://jp.co.omron.healthcare.omron_connect#Intent;scheme=android-app;end";

    tryOpenApp(intentUrl);
  };

  const openHealthTreeApp = () => {
    // Using the GuidePage activity from the manifest
    const intentUrl =
      "intent://com.jks.Spo2MonitorEx#Intent;scheme=android-app;end";

    tryOpenApp(intentUrl);
  };

  const openBeurerApp = () => {
    // Using the FragmentActivity from the manifest
    const intentUrl =
      "intent://com.beurer.healthmanager#Intent;scheme=android-app;end";

    tryOpenApp(intentUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-6 relative">
      {/* Time Display */}
      <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold z-10">
        {time.toLocaleTimeString()}
      </div>
      {/*change language button*/}
      <div className="absolute top-4 left-6">
        <Button variant="outline" onClick={toggleLanguage}>
          {t("language.toggle")}
        </Button>
      </div>

      {/* Bumalik Button */}
      <Button
        variant="outline"
        className="absolute top-15 left-65 z-10"
        onClick={() => router.push("/medinfo")}
      >
        {t("back.button")} 
      </Button>

      <h1 className="text-4xl font-extrabold text-center mb-8">
        Health Monitoring Apps
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* BP Card */}
        <Card className="w-full p-6 shadow-lg hover:bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-lg">
            <p className="text-gray-600 mb-6 text-center">
              Monitor your BP using the Omron Connect app.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button
                onClick={openOmronApp}
                className="w-full py-3 text-lg bg-blue-600 text-white hover:bg-blue-700 mt-6"
              >
                BP - Omron Connect app
              </Button>
              <BPInstructionManual />
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation Card */}
        <Card className="w-full p-6 shadow-lg hover:bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Oxygen Saturation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-lg">
            <p className="text-gray-600 mb-6 text-center">
              Check your oxygen levels with the HealthTree app.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button
                className="w-full py-3 text-lg bg-green-600 text-white hover:bg-green-700 mt-6"
                onClick={openHealthTreeApp}
              >
                OxySat - HealthTree app
              </Button>
              <OxySatInstructionManual />
            </div>
          </CardContent>
        </Card>

        {/* Temperature Card */}
        <Card className="w-full p-6 shadow-lg hover:bg-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Body Temperature
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-lg">
            <p className="text-gray-600 mb-6 text-center">
              Track your temperature using the Beurer Health Manager Pro App.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button
                className="w-full py-3 text-lg bg-red-600 text-white hover:bg-red-700"
                onClick={openBeurerApp}
              >
                Temperature - Beurer
              </Button>
              <TemperatureInstructionManual />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
