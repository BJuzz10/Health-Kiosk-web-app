/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";

// Time Display Component
function TimeDisplay() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
      {time}
    </div>
  );
}

// Patient Data Interface
interface Patient {
  id: string;
  name: string;
  status: "Online" | "Offline";
  auth_id: string | null;
}

export default function PatientsAppointments() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClient();

  // Fetch patients and setup presence channel
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch patients...");

        // Fetch all patients and their active status from the database
        console.log(
          "Fetching patients and their active status from database..."
        );
        const { data: patientData, error: dbError } = await supabase
          .from("patient_data")
          .select("id, name, auth_id, active_status");

        console.log("Database response:", { patientData, dbError });

        if (dbError) {
          throw new Error("Database error: " + dbError.message);
        }

        if (!patientData) {
          console.log("No patients found in database");
          setPatients([]);
          return;
        }

        // Initialize patients with status based on active_status column
        const updatedPatients: Patient[] = patientData.map((patient) => ({
          id: patient.id,
          name: patient.name,
          auth_id: patient.auth_id,
          status: patient.active_status === "online" ? "Online" : "Offline",
        }));

        setPatients(updatedPatients);
        setFilteredPatients(updatedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert(
          error instanceof Error ? error.message : "Error fetching patients"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();

    // Cleanup function
    return () => {
      const mainChannel = supabase.channel("patient-presence");
      mainChannel.unsubscribe();
    };
  }, []);

  // Filter patients based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        patient.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [search, patients]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center relative pt-20">
      {/* Time Display */}
      <TimeDisplay />

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center w-full">
        Patients Appointments
      </h1>

      {/* Search Input */}
      <div className="relative w-full max-w-5xl mb-4">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search patients by name"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Patients List Table */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <TableRow key={index}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-white font-semibold ${
                        patient.status === "Online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/patientinfo?id=${patient.id}`)
                      }
                    >
                      Info
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-4 text-gray-500"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Back Button */}
      <div className="w-full max-w-5xl mt-6 flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/admindash")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> Back
        </Button>
      </div>
    </div>
  );
}
