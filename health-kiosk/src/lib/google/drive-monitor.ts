interface GoogleFile {
  id: string;
  name: string;
  createdTime?: string;
}

export class DriveMonitor {
  private folderId: string | null = null;
  private lastCheckTime: Date = new Date(0);

  constructor() {
    this.initializeDrive();
  }

  private async initializeDrive() {
    try {
      console.log("Initializing Drive Monitor...");

      // First try to get the folder ID from environment
      this.folderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || null;

      // If not configured, try to find the folder
      if (!this.folderId) {
        console.log("Folder ID not configured, searching for data_folder...");
        const response = await fetch("/api/drive?action=find-folder");

        if (!response.ok) {
          throw new Error("Failed to find data folder");
        }

        const data = await response.json();
        if (data.folder) {
          this.folderId = data.folder.id;
          console.log(`Found data_folder with ID: ${this.folderId}`);
        } else {
          throw new Error("Data folder not found");
        }
      } else {
        console.log(`Using configured folder ID: ${this.folderId}`);
      }
    } catch (error) {
      console.error("Error initializing Drive Monitor:", error);
      throw error;
    }
  }

  public async checkForNewFiles(): Promise<GoogleFile[]> {
    if (!this.folderId) {
      throw new Error("Drive Monitor not properly initialized");
    }

    try {
      console.log(`Checking for new files in folder ${this.folderId}...`);
      const response = await fetch(
        `/api/drive?action=list&folderId=${
          this.folderId
        }&lastCheckTime=${this.lastCheckTime.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to list files");
      }

      const data = await response.json();
      this.lastCheckTime = new Date();
      console.log(
        `Found ${data.files?.length || 0} new files since last check`
      );

      return data.files || [];
    } catch (error) {
      console.error("Error checking for new files:", error);
      throw error;
    }
  }

  public async getFileContent(fileId: string): Promise<string> {
    try {
      const response = await fetch(`/api/drive?action=get&fileId=${fileId}`);

      if (!response.ok) {
        throw new Error("Failed to get file content");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Error getting file content:", error);
      throw error;
    }
  }
}
