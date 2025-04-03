"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FiUsers,
  FiSettings,
  FiHome,
  FiCalendar,
  FiMenu,
  FiVideo,
  FiEye,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const mockPatients = [
  {
    id: "P001",
    name: "John Smith",
    age: 45,
    contact: "+1-555-0123",
    lastVisit: new Date(2024, 0, 15),
    status: "Active",
    prescriptions: [
      {
        medication: "Amoxicillin",
        dosage: "500mg",
        frequency: "3x daily",
        doctor: "Dr. Sarah Wilson",
      },
      {
        medication: "Ibuprofen",
        dosage: "400mg",
        frequency: "As needed",
        doctor: "Dr. Mike Chen",
      },
    ],
    consultationStatus: "Completed",
  },
  {
    id: "P002",
    name: "Emma Johnson",
    age: 32,
    contact: "+1-555-0124",
    lastVisit: new Date(2024, 0, 20),
    status: "Pending",
    prescriptions: [
      {
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "1x daily",
        doctor: "Dr. James Brown",
      },
    ],
    consultationStatus: "Pending",
  },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden m-4">
            <FiMenu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <h2 className="text-2xl font-bold text-blue-600">MedAdmin</h2>
          <nav className="mt-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <FiHome className="mr-2" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FiUsers className="mr-2" /> Patients
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FiCalendar className="mr-2" /> Appointments
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FiSettings className="mr-2" /> Settings
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h1 className="text-2xl font-semibold">Patient Management</h1>
          <Input
            type="text"
            placeholder="Search patients..."
            className="mt-2 lg:mt-0 lg:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>
                    {format(patient.lastVisit, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        patient.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <FiEye size={18} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Prescriptions for {patient.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          {patient.prescriptions.map((prescription, index) => (
                            <div key={index} className="border p-3 rounded-lg">
                              <p className="font-medium">
                                {prescription.medication}
                              </p>
                              <p className="text-gray-600">
                                Dosage: {prescription.dosage}
                              </p>
                              <p className="text-gray-600">
                                Frequency: {prescription.frequency}
                              </p>
                              <p className="text-gray-600">
                                Prescribed by: {prescription.doctor}
                              </p>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon">
                      <FiVideo size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
