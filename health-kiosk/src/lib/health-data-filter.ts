import * as XLSX from "xlsx";
import {
  HealthDataResult,
  HealthData,
  CsvParseOptions,
  CsvParseResult,
} from "@/types/health-data";

/**
 * Detects the device type based on file name
 */
export function detectDeviceType(
  fileName: string
): "beurer" | "healthtree" | "omron" | "unknown" {
  const lowerFileName = fileName.toLowerCase();

  if (
    lowerFileName.includes("healthmanagerpro_export") &&
    lowerFileName.endsWith(".csv")
  ) {
    return "beurer";
  } else if (
    lowerFileName.includes("datarecord_") &&
    (lowerFileName.endsWith(".xls") || lowerFileName.endsWith(".xlsx"))
  ) {
    return "healthtree";
  } else if (
    lowerFileName.includes("[omron]") &&
    lowerFileName.includes("measurement data")
  ) {
    return "omron";
  }

  return "unknown";
}

/**
 * Process health data from various devices
 * @param fileContent The content of the file as string (for CSV) or ArrayBuffer (for Excel)
 * @param fileName The name of the file (used for device detection)
 * @param fileType 'csv' | 'excel' - The type of the file
 */
export async function processHealthData(
  fileContent: string | ArrayBuffer,
  fileName: string,
  fileType: "csv" | "excel" = "csv"
): Promise<HealthDataResult> {
  try {
    // First try to detect device type by filename
    let deviceType = detectDeviceType(fileName);

    // If unknown, try to detect by content
    if (
      deviceType === "unknown" &&
      fileType === "csv" &&
      typeof fileContent === "string"
    ) {
      if (
        fileContent.includes("Temperature") &&
        fileContent.includes("Date;Time;°C")
      ) {
        deviceType = "beurer";
      } else if (
        fileContent.includes("Measurement Date") &&
        fileContent.includes("SYS(mmHg)") &&
        fileContent.includes("DIA(mmHg)")
      ) {
        deviceType = "omron";
      }
    } else if (deviceType === "unknown" && fileType === "excel") {
      // Assume it's a Healthtree file if it's an Excel file
      deviceType = "healthtree";
    }

    // Process based on detected device type
    switch (deviceType) {
      case "beurer":
        return {
          ...(await processBeurerData(fileContent as string)),
          deviceType,
        };
      case "healthtree":
        return {
          ...(await processHealthtreeData(fileContent as ArrayBuffer)),
          deviceType,
        };
      case "omron":
        return {
          ...(await processOmronData(fileContent as string)),
          deviceType,
        };
      default:
        return {
          success: false,
          error: "Unable to determine the file type",
          deviceType: "unknown",
        };
    }
  } catch (error) {
    console.error("Error processing health data:", error);
    return {
      success: false,
      error: "Failed to process the file",
      deviceType: "unknown",
    };
  }
}

/**
 * Process Beurer temperature data
 */
export async function processBeurerData(
  fileContent: string
): Promise<Omit<HealthDataResult, "deviceType">> {
  try {
    // Find the temperature section
    const temperatureIndex = fileContent.indexOf("Temperature");

    if (temperatureIndex === -1) {
      return {
        success: false,
        error: "Invalid file format: Temperature section not found",
      };
    }

    // Extract the temperature data section
    const temperatureSection = fileContent.substring(temperatureIndex);

    // Parse the temperature data
    // Skip the "Temperature" header line
    const lines = temperatureSection.split(/\r?\n/).slice(1);

    // Find the header line (Date;Time;°C;Comment;Medication)
    const headerLineIndex = lines.findIndex((line) =>
      line.includes("Date;Time;°C")
    );

    if (headerLineIndex === -1) {
      return {
        success: false,
        error: "Invalid file format: Temperature data headers not found",
      };
    }

    // Extract and parse the temperature data
    const temperatureData = lines
      .slice(headerLineIndex + 1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const parts = line.split(";");
        if (parts.length >= 3) {
          const date = parts[0];
          const time = parts[1];
          const temperature = parts[2];

          // Parse date (MM/DD/YYYY) and time (HH:MM AM/PM)
          const [month, day, year] = date.split("/");
          const [hours, minutes] = time.split(":");
          const isPM = time.toLowerCase().includes("pm");

          // Convert to 24-hour format
          let hour = Number.parseInt(hours);
          if (isPM && hour < 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;

          // Format as YYYY-MM-DD HH:MM:SS
          const formattedDateTime = `${year}-${month.padStart(
            2,
            "0"
          )}-${day.padStart(2, "0")} ${hour
            .toString()
            .padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;

          return {
            temperature: Number.parseFloat(temperature),
            measured_at: formattedDateTime,
            device_type: "beurer",
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Get the most recent temperature reading
    const sortedData = temperatureData.sort((a, b) => {
      return (
        new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
      );
    });

    const latestReading = sortedData[0];

    return {
      success: true,
      data: latestReading ? [latestReading] : [],
    };
  } catch (error) {
    console.error("Error processing Beurer data:", error);
    return {
      success: false,
      error:
        "Failed to process the file. Please check the file format and try again.",
    };
  }
}

/**
 * Process Healthtree pulse oximeter data
 */
export async function processHealthtreeData(
  fileContent: ArrayBuffer
): Promise<Omit<HealthDataResult, "deviceType">> {
  try {
    const workbook = XLSX.read(fileContent, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as Array<
      Array<string | number>
    >;

    // Find the header row
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (
        Array.isArray(row) &&
        row.some((cell) => String(cell) === "ID") &&
        row.some((cell) => String(cell) === "Time") &&
        row.some((cell) => String(cell) === "SPO2(%)") &&
        row.some((cell) => String(cell) === "PR(bpm)")
      ) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return {
        success: false,
        error:
          "Invalid file format: Missing required headers (ID, Time, SPO2(%), PR(bpm))",
      };
    }

    // Extract headers
    const headers = rawData[headerRowIndex];

    // Find column indices
    const idIndex = headers.findIndex((h) => String(h) === "ID");
    const timeIndex = headers.findIndex((h) => String(h) === "Time");
    const spo2Index = headers.findIndex((h) => String(h) === "SPO2(%)");
    const prIndex = headers.findIndex((h) => String(h) === "PR(bpm)");

    if (
      idIndex === -1 ||
      timeIndex === -1 ||
      spo2Index === -1 ||
      prIndex === -1
    ) {
      return {
        success: false,
        error: "Invalid file format: Missing required columns",
      };
    }

    // Extract data rows
    const rows = rawData
      .slice(headerRowIndex + 1)
      .filter(
        (row): row is Array<string | number> =>
          Array.isArray(row) &&
          row.length >= Math.max(idIndex, timeIndex, spo2Index, prIndex) + 1
      );

    // Convert to objects with proper headers
    const formattedData: HealthData[] = rows.map((row) => ({
      reading_id: String(row[idIndex] || ""),
      measured_at: String(row[timeIndex] || ""),
      spo2: Number.parseInt(String(row[spo2Index] || "0"), 10),
      pulse_rate: Number.parseInt(String(row[prIndex] || "0"), 10),
      device_type: "healthtree",
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Error processing Healthtree data:", error);
    return {
      success: false,
      error:
        "Failed to process the file. Please check the file format and try again.",
    };
  }
}

/**
 * Process Omron blood pressure data
 */
export async function processOmronData(
  fileContent: string
): Promise<Omit<HealthDataResult, "deviceType">> {
  try {
    // Parse the CSV data
    const { headers, data } = parseCsv(fileContent);

    // Validate the file format
    const requiredHeaders = ["Measurement Date", "SYS(mmHg)", "DIA(mmHg)"];
    const hasRequiredHeaders = requiredHeaders.every((header) =>
      headers.some((h) => h.includes(header))
    );

    if (!hasRequiredHeaders) {
      return {
        success: false,
        error:
          "Invalid file format: Missing required headers (Measurement Date, SYS(mmHg), DIA(mmHg))",
      };
    }

    // Transform the data
    const transformedData: HealthData[] = data.map((row) => ({
      measured_at: (() => {
        const dateHeader =
          headers.find((h) => h.includes("Measurement Date")) || "";
        if (dateHeader && row[dateHeader]) {
          const dateStr = row[dateHeader];
          const dateParts = dateStr.split(" ");
          if (dateParts.length >= 2) {
            const [datePart, timePart] = dateParts;
            const [year, month, day] = datePart.split("/");
            return `${year}-${month}-${day} ${timePart}:00`;
          }
          return row[dateHeader];
        }
        return new Date().toISOString();
      })(),
      device_type: "omron",
      systolic: Number.parseInt(
        row[headers.find((h) => h.includes("SYS(mmHg)")) || ""] || "0",
        10
      ),
      diastolic: Number.parseInt(
        row[headers.find((h) => h.includes("DIA(mmHg)")) || ""] || "0",
        10
      ),
      pulse_rate: Number.parseInt(
        row[headers.find((h) => h.includes("Pulse(bpm)")) || ""] || "0",
        10
      ),
    }));

    // Sort by measurement date (most recent first)
    const sortedData = [...transformedData].sort((a, b) => {
      return (
        new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
      );
    });

    // Get the most recent reading
    const latestReading = sortedData[0];

    return {
      success: true,
      data: latestReading ? [latestReading] : [],
    };
  } catch (error) {
    console.error("Error processing Omron data:", error);
    return {
      success: false,
      error:
        "Failed to process the file. Please check the file format and try again.",
    };
  }
}

/**
 * Simple CSV parser
 */
function parseCsv(
  csvString: string,
  options: CsvParseOptions = {}
): CsvParseResult {
  const { delimiter = ",", skipEmptyLines = true, header = true } = options;

  // Split the CSV string into lines
  let lines = csvString.split(/\r?\n/);

  // Filter out empty lines if skipEmptyLines is true
  if (skipEmptyLines) {
    lines = lines.filter((line) => line.trim() !== "");
  }

  // Parse each line into an array of values
  const rawData = lines.map((line) => {
    // Handle quoted values
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = "";
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        // Toggle quote state
        inQuotes = !inQuotes;
        // If we're ending a quote and the next char is also a quote, it's an escaped quote
        if (!inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          currentValue += '"';
          i += 2;
          continue;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(currentValue);
        currentValue = "";
      } else {
        // Regular character
        currentValue += char;
      }

      i++;
    }

    // Add the last field
    result.push(currentValue);

    return result;
  });

  // Extract headers if header is true
  const headers = header && rawData.length > 0 ? rawData[0] : [];

  // Convert raw data to objects if header is true
  const data =
    header && rawData.length > 0
      ? rawData.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = index < row.length ? row[index] : "";
          });
          return obj;
        })
      : [];

  return { headers, data };
}
