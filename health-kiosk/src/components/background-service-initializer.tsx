"use client";

import { useEffect } from "react";
import { initializeBackgroundService } from "@/lib/background-init";

export function BackgroundServiceInitializer() {
  useEffect(() => {
    console.log("🚀 Starting background service initialization from client...");
    initializeBackgroundService()
      .then(() => {
        console.log("🎉 Background service initialized successfully on client");
      })
      .catch((error) => {
        console.error("💥 Failed to initialize background service:", error);
      });
  }, []);

  // This component doesn't render anything
  return null;
}
