import { BackgroundService } from "./background-service";

let backgroundService: BackgroundService | null = null;

export async function initializeBackgroundService() {
  if (!backgroundService) {
    console.log("🚀 Starting background service initialization...");
    try {
      backgroundService = new BackgroundService();
      await backgroundService.start();
      console.log("✅ Background service successfully initialized and started");
      console.log("📝 Service will check for new files every minute");
    } catch (error) {
      console.error("❌ Failed to initialize background service:", error);
      throw error;
    }
  } else {
    console.log("ℹ️ Background service is already running");
  }
}

export function getBackgroundService() {
  return backgroundService;
}

export function stopBackgroundService() {
  if (backgroundService) {
    console.log("🛑 Stopping background service...");
    backgroundService.stop();
    backgroundService = null;
    console.log("✅ Background service stopped");
  } else {
    console.log("ℹ️ No background service running to stop");
  }
}
