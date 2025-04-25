import { drive_v3 } from "googleapis";
import { getDriveClient } from "@/lib/google/drive-client";

export class DriveMonitor {
  private drive: drive_v3.Drive | null = null;
  private folderId: string | null = null;
  private lastCheckTime: Date = new Date(0);
  private processedFiles: Set<string> = new Set();

  constructor() {
    this.initializeDrive();
  }

  private async initializeDrive(): Promise<void> {
    try {
      this.drive = await getDriveClient();
      if (!this.drive) {
        throw new Error("Failed to initialize Google Drive client");
      }

      // Try to get folder ID from environment variable first
      const envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (envFolderId) {
        this.folderId = envFolderId;
      } else {
        // If no folder ID in env, try to find it
        const response = await this.drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and name='Health Kiosk Data'",
          fields: "files(id, name)",
        });

        if (
          response.data.files &&
          response.data.files.length > 0 &&
          response.data.files[0].id
        ) {
          this.folderId = response.data.files[0].id;
        } else {
          throw new Error("Health Kiosk Data folder not found");
        }
      }

      console.log("Drive Monitor initialized successfully");
    } catch (error) {
      console.error("Error initializing Drive Monitor:", error);
      this.drive = null;
      this.folderId = null;
    }
  }

  public async checkForNewFiles(): Promise<
    Array<{ id: string; name: string }>
  > {
    if (!this.drive || !this.folderId) {
      console.error("Drive Monitor not properly initialized");
      return [];
    }

    try {
      const response = await this.drive.files.list({
        q: `'${
          this.folderId
        }' in parents and modifiedTime > '${this.lastCheckTime.toISOString()}'`,
        fields: "files(id, name, modifiedTime)",
      });

      const newFiles = response.data.files || [];
      this.lastCheckTime = new Date();

      // Filter out already processed files and ensure id exists
      const unprocessedFiles = newFiles.filter(
        (file): file is drive_v3.Schema$File & { id: string } =>
          file.id !== null &&
          file.id !== undefined &&
          !this.processedFiles.has(file.id)
      );

      // Add new files to processed set
      unprocessedFiles.forEach((file) => {
        this.processedFiles.add(file.id);
      });

      return unprocessedFiles.map((file) => ({
        id: file.id,
        name: file.name || "",
      }));
    } catch (error) {
      console.error("Error checking for new files:", error);
      return [];
    }
  }

  public async getFileContent(fileId: string): Promise<string> {
    if (!this.drive) {
      throw new Error("Drive Monitor not properly initialized");
    }

    try {
      const response = await this.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "text" }
      );
      return response.data as string;
    } catch (error) {
      console.error(`Error getting file content for ${fileId}:`, error);
      throw error;
    }
  }
}
