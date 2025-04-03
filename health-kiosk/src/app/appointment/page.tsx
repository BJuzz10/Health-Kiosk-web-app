"use client";

import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  name: string;
  status: "Online" | "Offline";
  inMeet: boolean;
}

// Sample Patients List
const patientsList: Patient[] = [
  { name: "Juan Dela Cruz", status: "Online", inMeet: true },
  { name: "Maria Santos", status: "Offline", inMeet: false },
  { name: "Carlos Reyes", status: "Online", inMeet: false },
  { name: "Angela Flores", status: "Offline", inMeet: false },
];

export default function PatientsAppointments() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patientsList);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    setFilteredPatients(
      patientsList.filter((patient) =>
        patient.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center relative">
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
              <TableHead>In Meet</TableHead>
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
                    {patient.inMeet ? (
                      <span className="text-green-600 font-semibold">
                        ✅ In Meet
                      </span>
                    ) : (
                      <span className="text-gray-500">❌ Not in Meet</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(patient)}
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

      {/* Patient Info Dialog */}
      {selectedPatient && (
        <Dialog
          open={!!selectedPatient}
          onOpenChange={() => setSelectedPatient(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Information</DialogTitle>
            </DialogHeader>
            <p>
              <strong>Name:</strong> {selectedPatient.name}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  selectedPatient.status === "Online"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {selectedPatient.status}
              </span>
            </p>
            <p>
              <strong>Google Meet:</strong>{" "}
              {selectedPatient.inMeet ? (
                <span className="text-green-600">✅ In Meet</span>
              ) : (
                <span className="text-gray-500">❌ Not in Meet</span>
              )}
            </p>
            <Button
              variant="destructive"
              onClick={() => setSelectedPatient(null)}
            >
              <FiX /> Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

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
