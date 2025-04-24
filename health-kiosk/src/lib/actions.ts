"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAuthUrl as getGoogleAuthUrl,
  getAuthStatus,
} from "@/lib/google/auth-service";
import {
  findOrCreateFolder,
  listCsvFilesInFolder,
  downloadAndParseCsvFile,
} from "@/lib/google/drive-service";

// Session storage for data folder ID
let dataFolderId: string | null = null;

// Get Google Auth URL
export async function getAuthUrl() {
  return await getGoogleAuthUrl();
}

// Initialize data folder
export async function initializeDataFolder() {
  const { isAuthenticated } = await getAuthStatus();

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to home");
    redirect("/");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    console.log("No access token found, redirecting to home");
    redirect("/");
  }

  try {
    console.log("Finding or creating data_folder");
    const folder = await findOrCreateFolder(accessToken, "data_folder");

    if (folder) {
      console.log(`Found data_folder with ID: ${folder.id}`);
      dataFolderId = folder.id;
      return {
        success: true,
        folderId: folder.id,
        folderName: folder.name,
      };
    } else {
      console.error("Failed to find or create data_folder");
      return {
        success: false,
        message: "Failed to find or create data_folder in your Google Drive",
      };
    }
  } catch (error) {
    console.error("Error initializing data folder:", error);
    return {
      success: false,
      message:
        "Error accessing Google Drive. Please check permissions and try again.",
    };
  }
}

// Get CSV files from data folder
export async function getCsvFiles() {
  const { isAuthenticated } = await getAuthStatus();

  if (!isAuthenticated) {
    console.log("User not authenticated");
    return [];
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken || !dataFolderId) {
    console.log("No access token or data folder ID");
    return [];
  }

  try {
    console.log(`Fetching CSV files from data_folder: ${dataFolderId}`);
    const files = await listCsvFilesInFolder(accessToken, dataFolderId);
    console.log(`Found ${files.length} CSV files`);
    return files;
  } catch (error) {
    console.error("Error fetching CSV files:", error);
    return [];
  }
}

// Get CSV data from a file
export async function getCsvData(fileId: string) {
  const { isAuthenticated } = await getAuthStatus();

  if (!isAuthenticated) {
    throw new Error("Not authenticated");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token");
  }

  console.log(`Downloading and parsing CSV file: ${fileId}`);
  return downloadAndParseCsvFile(accessToken, fileId);
}
