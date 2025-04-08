"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FaChevronLeft, FaChevronRight, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientData {
  fullName: string;
  status: string;
  age: string;
  sex: string;
  birthday: string;
  address: string;
  contactNumber: string;
  height: string;
  weight: string;
  systolic: string;
  diastolic: string;
  pulseRate: string;
  oxygenSaturation: string;
  temperature: string;
  symptoms: string;
  doctorNote: string;
}

export default function PatientInformationKiosk() {
  const router = useRouter();
  const [formData, setFormData] = useState<PatientData>({
    fullName: "",
    status: "Online",
    age: "",
    sex: "",
    birthday: "",
    address: "",
    contactNumber: "",
    height: "",
    weight: "",
    systolic: "",
    diastolic: "",
    pulseRate: "",
    oxygenSaturation: "",
    temperature: "",
    symptoms: "",
    doctorNote: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Form data saved:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center justify-center relative">
      {/* Clock */}
      <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
        {time.toLocaleTimeString()}
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Patient Information System
      </h1>

      {/* Search Input */}
      <div className="w-full max-w-5xl mb-4">
        <Input
          type="text"
          placeholder="Search patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Personal Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input
                name="status"
                value={formData.status}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Sex</Label>
              <Input name="sex" value={formData.sex} onChange={handleChange} />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className="resize-none h-20"
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Medical Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Vitals & Medical Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex gap-2">
                <Input
                  name="systolic"
                  type="number"
                  value={formData.systolic}
                  onChange={handleChange}
                  placeholder="Systolic"
                />
                <Input
                  name="diastolic"
                  type="number"
                  value={formData.diastolic}
                  onChange={handleChange}
                  placeholder="Diastolic"
                />
              </div>
            </div>
            <div>
              <Label>Pulse Rate (BPM)</Label>
              <Input
                type="number"
                name="pulseRate"
                value={formData.pulseRate}
                onChange={handleChange}
                placeholder="e.g., 72"
              />
            </div>
            <div>
              <Label>Oxygen Saturation (%)</Label>
              <Input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Patient&apos;s Complaint</Label>
            <Textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Enter the patient's symptoms here..."
              className="resize-none h-24"
            />
          </div>

          <div>
            <Label>Doctor&apos;s Note</Label>
            <Textarea
              name="doctorNote"
              value={formData.doctorNote}
              onChange={handleChange}
              placeholder="Write the prescription or notes..."
              className="resize-none h-24"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mt-6 gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/admindash")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <FaSave /> Save
          </Button>
          <Button
            onClick={() => router.push("/patientdata")}
            className="flex items-center gap-2"
          >
            Next <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
