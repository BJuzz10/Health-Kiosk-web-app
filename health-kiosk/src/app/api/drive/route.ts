import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/google/drive-client";

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
      fields: "nextPageToken, files(id, name)",
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
    const { fileId } = await request.json();
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

    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "text" }
    );

    return NextResponse.json({ content: response.data });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}
