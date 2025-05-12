import { parse } from "csv-parse/sync";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface VitalMeasurement {
  checkup_id: string;
  type:
    | "bp_systolic"
    | "bp_diastolic"
    | "temperature"
    | "pulse"
    | "oxygen_saturation"
    | "height_cm"
    | "weight_kg";
  value: number;
  unit: string;
  patient_id?: string;
}

interface OmronRecord {
  "Measurement Date": string;
  Timezone: string;
  "SYS(mmHg)": string;
  "DIA(mmHg)": string;
  "Pulse(bpm)": string;
  "Irregular heartbeat": string;
  "IHB detection count": string;
  "Body Movement": string;
  "Cuff wrap guide": string;
  "Positioning Indicator": string;
  "room temperature(°C": string;
  "Measurement Mode": string;
  Device: string;
}

export class DataFilter {
  private supabase = createClient();

  private determineFileType(fileContent: Uint8Array): "excel" | "csv" {
    // Check for Excel file magic numbers
    const header = fileContent.slice(0, 4);
    const excelMagicNumbers = {
      // XLSX magic numbers
      xlsx: [0x50, 0x4b, 0x03, 0x04],
      // XLS magic numbers
      xls: [0xd0, 0xcf, 0x11, 0xe0],
    };

    if (
      header.every((value, index) => value === excelMagicNumbers.xlsx[index]) ||
      header.every((value, index) => value === excelMagicNumbers.xls[index])
    ) {
      return "excel";
    }

    return "csv";
  }

  private determineFilterType(filename: string): string {
    console.log("Analyzing filename:", filename);

    // Convert to lowercase for case-insensitive matching
    const lowerFilename = filename.toLowerCase();

    // Check for Beurer specific patterns
    if (lowerFilename.includes("healthmanagerpro")) {
      console.log("Detected Beurer format");
      return "beurer";
    }

    // Check for Omron specific patterns
    if (lowerFilename.includes("[omron]")) {
      console.log("Detected Omron format");
      return "omron";
    }

    // Check for HealthTree specific patterns
    if (lowerFilename.includes("datarecord")) {
      console.log("Detected HealthTree format");
      return "healthtree";
    }

    console.log("Could not determine format from filename:", filename);
    throw new Error(
      "Could not determine device type from filename: " + filename
    );
  }

  private async getCurrentPatientId(): Promise<string> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Authentication required");
    }

    const { data: patientData, error: patientError } = await this.supabase
      .from("patient_data")
      .select("id")
      .eq("email", user.email)
      .single();

    if (patientError || !patientData) {
      throw new Error("Patient data not found");
    }

    return patientData.id;
  }

  private async processBeurerData(
    csvContent: string,
    patientId: string
  ): Promise<VitalMeasurement[]> {
    const cleanContent = csvContent.replace(/^\\uFEFF/, "");
    const sections = cleanContent.split(/\r?\n\r?\n/);
    const measurements: VitalMeasurement[] = [];

    const temperatureSection = sections.find((section) =>
      section.trim().startsWith("Temperature")
    );

    if (temperatureSection) {
      const lines = temperatureSection.split(/\r?\n/);
      const headerIndex = lines.findIndex(
        (line) =>
          line.includes("Date") && line.includes("Time") && line.includes("°C")
      );

      if (headerIndex !== -1) {
        const temperatureLines = lines
          .slice(headerIndex + 1)
          .filter((line) => line.trim());
        if (temperatureLines.length > 0) {
          const mostRecentRecord = temperatureLines[0]; // Take only the most recent record
          const [date, time, temperature] = mostRecentRecord.split(";");
          if (date && time && temperature) {
            const [month, day, year] = date.split("/");
            const [timeStr] = time.split(",");
            const [hours, minutes] = timeStr.split(":");
            const isPM = timeStr.toLowerCase().includes("pm");

            let hour = parseInt(hours);
            if (isPM && hour < 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;

            const checkupTimestamp = `${year}-${month.padStart(
              2,
              "0"
            )}-${day.padStart(2, "0")} ${hour
              .toString()
              .padStart(2, "0")}:${minutes.padStart(2, "0")}`;

            const checkupId = uuidv4();
            const { error: checkupError } = await this.supabase
              .from("checkups")
              .insert({
                id: checkupId,
                patient_id: patientId,
                checkup_date: checkupTimestamp,
                reason: "Temperature measurement from Beurer device",
                created_at: new Date().toISOString(),
              });

            if (checkupError) {
              console.error("Error creating checkup:", checkupError);
              throw new Error(
                `Failed to create checkup: ${checkupError.message}`
              );
            }

            measurements.push({
              checkup_id: checkupId,
              type: "temperature",
              value: parseFloat(temperature),
              unit: "°C",
              patient_id: patientId,
            });
          }
        }
      }
    }

    return measurements;
  }

  private async processOmronData(
    csvContent: string,
    patientId: string
  ): Promise<VitalMeasurement[]> {
    const cleanContent = csvContent.replace(/^\uFEFF/, "");
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      bom: true,
      trim: true,
    }) as OmronRecord[];

    const sortedRecords = records.sort((a: OmronRecord, b: OmronRecord) => {
      const dateA = this.parseOmronDate(a["Measurement Date"], a["Timezone"]);
      const dateB = this.parseOmronDate(b["Measurement Date"], b["Timezone"]);
      return dateB.getTime() - dateA.getTime();
    });

    const latestRecord = sortedRecords[0];
    if (!latestRecord) {
      throw new Error("No records found in Omron data");
    }

    const timestamp = this.parseOmronDate(
      latestRecord["Measurement Date"],
      latestRecord["Timezone"]
    ).toISOString();

    const checkupId = uuidv4();
    const { error: checkupError } = await this.supabase
      .from("checkups")
      .insert({
        id: checkupId,
        patient_id: patientId,
        checkup_date: timestamp,
        reason: "Blood pressure measurement from Omron device",
        created_at: new Date().toISOString(),
      });

    if (checkupError) {
      console.error("Error creating checkup:", checkupError);
      throw new Error(`Failed to create checkup: ${checkupError.message}`);
    }

    const measurements: VitalMeasurement[] = [];

    if (latestRecord["SYS(mmHg)"]) {
      measurements.push({
        checkup_id: checkupId,
        type: "bp_systolic",
        value: Number(latestRecord["SYS(mmHg)"]),
        unit: "mmHg",
        patient_id: patientId,
      });
    }

    if (latestRecord["DIA(mmHg)"]) {
      measurements.push({
        checkup_id: checkupId,
        type: "bp_diastolic",
        value: Number(latestRecord["DIA(mmHg)"]),
        unit: "mmHg",
        patient_id: patientId,
      });
    }

    return measurements;
  }

  private parseOmronDate(date: string, timezone: string): Date {
    // Convert YYYY/MM/DD HH:mm to YYYY-MM-DD HH:mm
    const formattedDate = date.replace(/\//g, "-");
    // Create a date string with the timezone
    const dateString = `${formattedDate}:00${
      timezone === "Asia/Manila" ? "+08:00" : "Z"
    }`;
    return new Date(dateString);
  }

  public async processFile(
    fileContent: ArrayBuffer | string,
    filename: string,
    link?: string // Make link optional
  ): Promise<void> {
    try {
      const deviceType = this.determineFilterType(filename);

      if (deviceType === "healthtree") {
        if (!link) {
          throw new Error(
            "Drive file link is required for processing HealthTree data"
          );
        }

        const response = await fetch(
          "https://health-kiosk-web-app-rrbq.onrender.com/download",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ link }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to process HealthTree data via external endpoint"
          );
        }

        const responseData = await response.json();
        console.log("Response from external endpoint:", responseData);

        // Call processHealthTreeData with the response data
        await this.processHealthTreeData(
          responseData,
          await this.getCurrentPatientId()
        );
        return;
      }

      const buffer =
        typeof fileContent === "string"
          ? new TextEncoder().encode(fileContent)
          : new Uint8Array(fileContent);
      const fileType = this.determineFileType(buffer);

      // Directly use the file content for Beurer and Omron files without Excel conversion
      const csvContent =
        fileType === "csv"
          ? typeof fileContent === "string"
            ? fileContent
            : new TextDecoder().decode(buffer)
          : (() => {
              throw new Error("Excel file processing is no longer supported.");
            })();

      let measurements: VitalMeasurement[] = [];

      switch (deviceType) {
        case "beurer":
          measurements = await this.processBeurerData(
            csvContent,
            await this.getCurrentPatientId()
          );
          break;
        case "omron":
          measurements = await this.processOmronData(
            csvContent,
            await this.getCurrentPatientId()
          );
          break;
        default:
          throw new Error("Unsupported device type");
      }

      if (measurements.length === 0) {
        throw new Error("No valid measurements found in the file");
      }

      const { error } = await this.supabase
        .from("vital_measurements")
        .upsert(measurements);

      if (error) {
        console.error("Error upserting data:", error);
        throw new Error(`Failed to upsert data: ${error.message}`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      throw new Error(
        `Failed to process file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async processHealthTreeData(
    responseData: {
      filter_csv_response: {
        filtered_data: Array<{
          ID: string | number;
          "SPO2(%)": string | number;
          "PR(bpm)": string | number;
        }>;
      };
    },
    patientId: string
  ): Promise<VitalMeasurement[]> {
    const records = responseData.filter_csv_response.filtered_data;

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("No records found in HealthTree data");
    }

    const currentTimestamp = new Date().toISOString();

    const checkupId = uuidv4();
    const { error: checkupError } = await this.supabase
      .from("checkups")
      .insert({
        patient_id: patientId,
        checkup_date: currentTimestamp,
        reason: "Vital signs measurement from HealthTree device",
        created_at: new Date().toISOString(),
      });

    if (checkupError) {
      console.error("Error creating checkup:", checkupError);
      throw new Error(`Failed to create checkup: ${checkupError.message}`);
    }

    const measurements: VitalMeasurement[] = [];

    const latestRecord = records[0];

    if (latestRecord["SPO2(%)"]) {
      measurements.push({
        checkup_id: checkupId,
        type: "oxygen_saturation",
        value: Number(latestRecord["SPO2(%)"]),
        unit: "%",
      });
    }

    if (latestRecord["PR(bpm)"]) {
      measurements.push({
        checkup_id: checkupId,
        type: "pulse",
        value: Number(latestRecord["PR(bpm)"]),
        unit: "bpm",
      });
    }

    return measurements;
  }
}
