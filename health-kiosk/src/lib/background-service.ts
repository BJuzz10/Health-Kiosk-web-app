import { DataFilter } from "./data-filter";

interface DriveFile {
  id: string;
  name: string;
}

export class BackgroundService {
  private dataFilter: DataFilter | null = null;
  private isRunning: boolean = false;
  private checkInterval: number = 60000; // Check every minute
  private lastCheckTime: string = new Date().toISOString();

  constructor() {
    // Initialize only on client side
    if (typeof window !== "undefined") {
      this.dataFilter = new DataFilter();
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning || !this.dataFilter) {
      console.log(
        "Background service is already running or not properly initialized"
      );
      return;
    }

    console.log("Starting background service...");
    this.isRunning = true;
    await this.runMonitor();
  }

  public stop(): void {
    console.log("Stopping background service...");
    this.isRunning = false;
  }

  private async runMonitor(): Promise<void> {
    if (!this.dataFilter) {
      console.error("Data Filter not initialized");
      return;
    }

    console.log("Monitor loop started");
    while (this.isRunning) {
      try {
        console.log("Checking for new files...");
        const response = await fetch("/api/drive");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const files: DriveFile[] = await response.json();

        for (const file of files) {
          try {
            console.log(`Processing file: ${file.name} (ID: ${file.id})`);
            const contentResponse = await fetch("/api/drive", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ fileId: file.id }),
            });

            if (!contentResponse.ok) {
              throw new Error("Failed to fetch file content");
            }

            const { content } = await contentResponse.json();
            await this.dataFilter.processCSV(content);
            console.log(`Successfully processed file: ${file.name}`);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        }

        this.lastCheckTime = new Date().toISOString();
      } catch (error) {
        console.error("Error in monitor loop:", error);
      }

      console.log(
        `Waiting ${this.checkInterval / 1000} seconds before next check...`
      );
      await new Promise((resolve) => setTimeout(resolve, this.checkInterval));
    }
  }
}
