import { NextResponse } from "next/server";
import { DriveMonitor } from "@/lib/google/drive-monitor";
import { DataFilter } from "@/lib/data-filter";

export async function GET() {
  try {
    // Initialize Drive Monitor and Data Filter
    const monitor = new DriveMonitor();
    const files = await monitor.checkForNewFiles();
    const filter = new DataFilter();

    // Process each new CSV file
    for (const file of files) {
      console.log(`Processing file: ${file.name} (ID: ${file.id})`);
      const content = await monitor.getFileContent(file.id);
      await filter.processCSV(content);
      console.log(`Successfully processed: ${file.name}`);
    }

    return NextResponse.json({ processed: files.length });
  } catch (error) {
    console.error("Error in cron drive-check:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
