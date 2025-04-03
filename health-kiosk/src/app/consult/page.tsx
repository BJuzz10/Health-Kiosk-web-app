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

interface Doctor {
  name: string;
  specialization: string;
  availability: string;
}

const doctorsList: Doctor[] = [
  {
    name: "Dr. Juan Dela Cruz",
    specialization: "Cardiology",
    availability: "Online",
  },
  {
    name: "Dr. Maria Santos",
    specialization: "Pediatrics",
    availability: "Offline",
  },
];

export default function AvailableDoctors() {
  const router = useRouter();
  const [search, setSearch] = useState(" ");
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsList);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  useEffect(() => {
    setFilteredDoctors(
      doctorsList.filter((doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestConsultation = () => {
    setLoading(true);
    setTimeout(() => {
      setMeetingLink("https://meet.google.com/example-meeting"); // Dummy link
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center relative">
      {/* Time Display */}
      <TimeDisplay />

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center w-full">
        Consult Doctors
      </h1>

      {/* Search Input */}
      <div className="relative w-full max-w-5xl mb-4">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search doctors by name"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Doctor List Table */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer"
                  onClick={() => {
                    if (doctor.availability === "Offline") {
                      setShowOfflineDialog(true);
                    } else {
                      setSelectedDoctor(doctor);
                      setMeetingLink(null);
                    }
                  }}
                >
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-white font-semibold ${
                        doctor.availability === "Online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {doctor.availability}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-4 text-gray-500"
                >
                  No doctors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Doctor Consultation Dialog */}
      {selectedDoctor && (
        <Dialog
          open={!!selectedDoctor}
          onOpenChange={() => setSelectedDoctor(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Request Consultation with {selectedDoctor.name}
              </DialogTitle>
            </DialogHeader>
            <p>Specialization: {selectedDoctor.specialization}</p>
            <Button onClick={handleRequestConsultation} disabled={loading}>
              {loading ? "Requesting..." : "Request Consultation"}
            </Button>
            {meetingLink && (
              <div className="mt-4 p-4 border rounded bg-gray-100">
                <p>Google Meet Link:</p>
                <a
                  href={meetingLink}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {meetingLink}
                </a>
              </div>
            )}
            <Button
              variant="destructive"
              onClick={() => setSelectedDoctor(null)}
            >
              <FiX /> Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Offline Doctor Dialog */}
      <Dialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doctor Unavailable</DialogTitle>
          </DialogHeader>
          <p>The Doctor is currently offline or unavailable.</p>
          <Button
            variant="destructive"
            onClick={() => setShowOfflineDialog(false)}
          >
            <FiX /> Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Back Button */}
      <div className="w-full max-w-5xl mt-6 flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> Bumalik
        </Button>
      </div>
    </div>
  );
}
