export interface HealthDataResult {
  success: boolean;
  data?: HealthData[];
  error?: string;
  deviceType: "beurer" | "healthtree" | "omron" | "unknown";
}

export interface HealthData {
  measured_at: string;
  device_type: string;
  temperature?: number;
  spo2?: number;
  pulse_rate?: number;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  reading_id?: string;
}

export interface ExcelRow {
  [key: string]: string | number;
}

export interface CsvParseOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  header?: boolean;
}

export interface CsvParseResult {
  headers: string[];
  data: Record<string, string>[];
}
