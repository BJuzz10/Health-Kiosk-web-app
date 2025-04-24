import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";

async function getDriveClient() {
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"
  );

  const jwt = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  await jwt.authorize();
  return google.drive({ version: "v3", auth: jwt });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const drive = await getDriveClient();

    switch (action) {
      case "find-folder":
        const folderName = searchParams.get("name") || "data_folder";
        const response = await drive.files.list({
          q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: "files(id,name)",
        });

        if (!response.data.files || response.data.files.length === 0) {
          return NextResponse.json(
            { error: `Folder '${folderName}' not found` },
            { status: 404 }
          );
        }

        return NextResponse.json({ folder: response.data.files[0] });

      case "list":
        const folderId = searchParams.get("folderId");
        const lastCheckTime = searchParams.get("lastCheckTime");

        const listResponse = await drive.files.list({
          q: `'${folderId}' in parents and createdTime > '${lastCheckTime}' and mimeType='text/csv'`,
          fields: "files(id,name,createdTime)",
          orderBy: "createdTime desc",
        });

        return NextResponse.json({ files: listResponse.data.files || [] });

      case "get":
        const fileId = searchParams.get("fileId");
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID is required" },
            { status: 400 }
          );
        }

        const file = await drive.files.get(
          {
            fileId,
            alt: "media",
          },
          { responseType: "text" }
        );

        return NextResponse.json({ content: file.data });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Drive API error:", error);
    return NextResponse.json(
      { error: "Failed to process Drive request" },
      { status: 500 }
    );
  }
}
