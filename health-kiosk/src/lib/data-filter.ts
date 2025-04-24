import { parse } from "csv-parse/sync";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

interface VitalData {
  user_id: string;
  timestamp: string;
  blood_pressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  heart_rate?: number;
  // Add other vital signs as needed
}

interface CSVRecord {
  user_id: string;
  timestamp: string;
  systolic?: string;
  diastolic?: string;
  temperature?: string;
  heart_rate?: string;
}

export class DataFilter {
  private supabase: SupabaseClient | null = null;

  async initialize() {
    if (!this.supabase) {
      this.supabase = createClient();
    }
  }

  private determineFilterType(csvContent: string): string {
    // Check for Beurer specific patterns
    if (csvContent.includes("HealthManagerPro")) {
      return "beurer";
    }
    // Check for Omron specific patterns
    if (csvContent.includes("[OMRON]")) {
      return "omron";
    }
    // Check for HealthTree specific patterns
    if (csvContent.includes("DataRecord")) {
      return "healthtree";
    }
    return "unknown";
  }

  private async processBeurerData(csvContent: string): Promise<VitalData[]> {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((record: CSVRecord) => ({
      user_id: record.user_id,
      timestamp: record.timestamp,
      blood_pressure:
        record.systolic && record.diastolic
          ? {
              systolic: Number(record.systolic),
              diastolic: Number(record.diastolic),
            }
          : undefined,
      temperature: record.temperature ? Number(record.temperature) : undefined,
      heart_rate: record.heart_rate ? Number(record.heart_rate) : undefined,
    }));
  }

  private async processOmronData(): Promise<VitalData[]> {
    // Implement Omron specific processing
    return [];
  }

  private async processHealthTreeData(): Promise<VitalData[]> {
    // Implement HealthTree specific processing
    return [];
  }

  public async processCSV(csvContent: string): Promise<void> {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized");
    }

    const filterType = this.determineFilterType(csvContent);
    let processedData: VitalData[];

    switch (filterType) {
      case "beurer":
        processedData = await this.processBeurerData(csvContent);
        break;
      case "omron":
        processedData = await this.processOmronData();
        break;
      case "healthtree":
        processedData = await this.processHealthTreeData();
        break;
      default:
        throw new Error("Unknown filter type");
    }

    await this.updateVitals(processedData);
  }

  private async updateVitals(data: VitalData[]): Promise<void> {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await this.supabase.from("vitals").insert(data);
    if (error) {
      throw error;
    }
  }
}
