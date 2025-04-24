"use server";

import { parse } from "csv-parse/sync";

// Find or create a folder by name
export async function findOrCreateFolder(
  accessToken: string,
  folderName: string
) {
  // First, try to find the folder
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to search for folder:", error);
    throw new Error(`Failed to search for folder: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  // If folder exists, return it
  if (data.files && data.files.length > 0) {
    console.log(`Found existing folder: ${folderName}`);
    return data.files[0];
  }

  // If folder doesn't exist, create it
  console.log(`Creating new folder: ${folderName}`);
  const createUrl = "https://www.googleapis.com/drive/v3/files";

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error("Failed to create folder:", error);
    throw new Error(`Failed to create folder: ${JSON.stringify(error)}`);
  }

  return createResponse.json();
}

// List folders from Google Drive
export async function listFolders(accessToken: string) {
  // Modified query to get all folders, including those in shared drives
  const query =
    "mimeType='application/vnd.google-apps.folder' and trashed=false";

  // Request more fields and increase the max results
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name)&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to list folders:", error);
    throw new Error(`Failed to list folders: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  console.log(`Found ${data.files?.length || 0} folders`);
  return data.files || [];
}

// Get folder by ID
export async function getFolder(accessToken: string, folderId: string) {
  const url = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get folder: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// List CSV files in a folder
export async function listCsvFilesInFolder(
  accessToken: string,
  folderId: string
) {
  // Modified query to get all CSV files in the folder
  const query = `'${folderId}' in parents and (mimeType='text/csv' or name contains '.csv') and trashed=false`;

  // Request more fields and increase the max results
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,modifiedTime)&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to list CSV files:", error);
    throw new Error(`Failed to list CSV files: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  console.log(
    `Found ${data.files?.length || 0} CSV files in folder ${folderId}`
  );
  return data.files || [];
}

// Download and parse CSV file
export async function downloadAndParseCsvFile(
  accessToken: string,
  fileId: string
) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to download CSV file: ${error}`);
  }

  const csvContent = await response.text();

  try {
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Extract headers
    const headers = Object.keys(records[0] || {});

    return {
      headers,
      rows: records,
    };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Failed to parse CSV file");
  }
}
