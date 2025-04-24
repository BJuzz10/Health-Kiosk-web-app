import { DriveMonitor } from "./google/drive-monitor";
import { DataFilter } from "./data-filter";

export class BackgroundService {
  private driveMonitor: DriveMonitor;
  private dataFilter: DataFilter;
  private isRunning: boolean = false;
  private checkInterval: number = 60000; // Check every minute

  constructor() {
    this.driveMonitor = new DriveMonitor();
    this.dataFilter = new DataFilter();
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("Background service is already running");
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
    console.log("Monitor loop started");
    while (this.isRunning) {
      try {
        console.log("Checking for new files...");
        const newFiles = await this.driveMonitor.checkForNewFiles();
        console.log(`Found ${newFiles.length} new files`);

        for (const file of newFiles) {
          try {
            console.log(`Processing file: ${file.name} (ID: ${file.id})`);
            const content = await this.driveMonitor.getFileContent(file.id);
            await this.dataFilter.processCSV(content);
            console.log(`Successfully processed file: ${file.name}`);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        }
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
