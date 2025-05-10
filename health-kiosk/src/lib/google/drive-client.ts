import { drive_v3, google } from "googleapis";

export async function getDriveClient(): Promise<drive_v3.Drive | null> {
  try {
    // Parse the service account credentials from the environment variable
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"
    );

    // Check if required fields are present in the service account
    if (!serviceAccount.client_email) {
      console.error("client_email is missing in service account credentials");
      return null;
    }
    if (!serviceAccount.private_key) {
      console.error("private_key is missing in service account credentials");
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Test the connection by making a simple request
    await drive.files.list({
      pageSize: 1,
      fields: "files(id, name)",
    });

    return drive;
  } catch (error) {
    console.error("Error initializing Google Drive client:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error; // Pass the error to the calling function
  }
}
