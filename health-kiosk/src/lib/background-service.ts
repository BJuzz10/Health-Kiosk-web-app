import { DataFilter } from "./data-filter";

interface DriveFile {
  id: string;
  name: string;
  createdTime: string; // Assuming createdTime is a string in ISO format
  link: string; // Add link property to represent the drive file link
}

export class BackgroundService {
  private dataFilter: DataFilter | null = null;
  private isRunning: boolean = false;
  private checkInterval: number = 60000; // Check every minute
  private lastCheckTime: string = new Date().toISOString();
  private processedFileIds: Set<string> = new Set();

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

        console.log("Fetched files:", files);

        for (const file of files) {
          if (this.processedFileIds.has(file.id)) {
            console.log(
              `Skipping file: ${file.name} (ID: ${file.id}) as it has already been processed.`
            );
            continue;
          }

          try {
            const fileUploadTime = new Date(file.createdTime).getTime(); // Use createdTime instead of file.id
            const currentTime = Date.now();
            const timeDifference = (currentTime - fileUploadTime) / 1000 / 60; // Convert to minutes

            if (timeDifference > 1.2) {
              console.log(
                `Skipping file: ${file.name} (ID: ${file.id}) as it was uploaded more than 3 minutes ago.`
              );
              continue;
            }

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

            const { content, encoding, link } = await contentResponse.json(); // Include link in the response
            let fileContent = content;
            if (encoding === "base64") {
              // Decode base64 to Uint8Array for Excel files
              const binaryString =
                typeof atob !== "undefined"
                  ? atob(content)
                  : Buffer.from(content, "base64").toString("binary");
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              fileContent = bytes;
            }
            await this.dataFilter.processFile(fileContent, file.name, link); // Pass the link to DataFilter
            console.log(`Successfully processed file: ${file.name}`);

            // Mark file as processed
            this.processedFileIds.add(file.id);
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
