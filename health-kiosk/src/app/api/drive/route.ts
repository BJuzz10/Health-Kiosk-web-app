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
    const { fileId, filename } = await request.json();
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const drive = await getDriveClient();
    if (!drive) {
      return NextResponse.json(
        { error: "Failed to initialize Drive client" },
        { status: 500 }
      );
    }

    // Detect file type by extension
    if (filename && isExcelFile(filename)) {
      // Fetch as binary stream for Excel files
      const response = await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );
      // Collect the stream into a Buffer
      const chunks = [];
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      // Return as base64 string (JSON-safe)
      return NextResponse.json({
        content: buffer.toString("base64"),
        encoding: "base64",
      });
    } else {
      // Fetch as text for CSV or unknown
      const response = await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "text" }
      );
      return NextResponse.json({ content: response.data, encoding: "utf8" });
    }
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}
