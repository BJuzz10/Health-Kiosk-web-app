import { NextResponse } from "next/server";
import { BackgroundService } from "@/lib/background-service";
import { DriveMonitor } from "@/lib/google/drive-monitor";
import { DataFilter } from "@/lib/data-filter";

let backgroundService: BackgroundService | null = null;

export async function GET() {
  const monitor = new DriveMonitor();
  // (initializeDrive runs in constructor)
  const files = await monitor.checkForNewFiles();
  const filter = new DataFilter();
  for (const f of files) {
    const content = await monitor.getFileContent(f.id);
    await filter.processFile(content, f.name);
    console.log(`Processed ${f.name}`);
  }
  return NextResponse.json({ processed: files.length });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Handle stop request
  if (body.action === "stop") {
    if (backgroundService) {
      backgroundService.stop();
      backgroundService = null;
      return NextResponse.json({
        status: "stopped",
        message: "Background service stopped",
      });
    }
    return NextResponse.json({
      status: "stopped",
      message: "No background service running",
    });
  }

  // Handle file processing request
  if (body.content && body.filename) {
    const filter = new DataFilter();
    await filter.processFile(body.content, body.filename);
    return NextResponse.json({ status: "processed" });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

// New status endpoint
export async function HEAD() {
  return NextResponse.json({
    status: backgroundService ? "running" : "stopped",
    message: backgroundService
      ? "Background service is running"
      : "No background service running",
  });
}
