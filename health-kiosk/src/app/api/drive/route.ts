import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/google/drive-client";

function isExcelFile(filename: string) {
  return filename.endsWith(".xls") || filename.endsWith(".xlsx");
}

export async function GET() {
  try {
    const drive = await getDriveClient();
    if (!drive) {
      return NextResponse.json(
        { error: "Failed to initialize Drive client" },
        { status: 500 }
      );
    }

    const response = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name, createdTime)", // Include createdTime field
      orderBy: "createdTime desc",
    });

    return NextResponse.json(response.data.files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    console.log("Raw request body:", rawBody);

    // Parse the raw body to check the filename
    const { fileId, filename } = JSON.parse(rawBody);
    console.log("Parsed fileId:", fileId);
    console.log("Parsed filename:", filename);

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Check if the file is an Excel file (HealthTree)
    if (isExcelFile(filename)) {
      // Return the drive link for Excel files
      const driveLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      console.log("Returning drive link for Excel file:", driveLink);
      return NextResponse.json({ link: driveLink });
    }

    // For Beurer and Omron files, process as JSON
    const drive = await getDriveClient();
    if (!drive) {
      return NextResponse.json(
        { error: "Failed to initialize Drive client" },
        { status: 500 }
      );
    }

    console.log("Processing as non-Excel file:", filename);

    // Fetch as text for CSV only
    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "text" }
    );
    return NextResponse.json({ content: response.data, encoding: "utf8" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
