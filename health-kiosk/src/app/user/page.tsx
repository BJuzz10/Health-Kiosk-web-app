"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FaChevronLeft, FaChevronRight, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  fullName: string;
  age: string;
  sex: string;
  birthday: string;
  address: string;
  contactNumber: string;
  height: string;
  weight: string;
  symptoms: string;
  systolic: string;
  diastolic: string;
  oxygenSaturation: string;
  temperature: string;
}

export default function PatientInformationKiosk() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    age: "",
    sex: "",
    birthday: "",
    address: "",
    contactNumber: "",
    height: "",
    weight: "",
    symptoms: "",
    systolic: "",
    diastolic: "",
    oxygenSaturation: "",
    temperature: "",
  });

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
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center relative">
      {/* Time Display */}
      <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">
        {time.toLocaleTimeString()}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center">
        Patient Information System
      </h1>

      {/* Form Container */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section: Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-1 md:col-span-2 text-lg font-semibold text-gray-700 mb-2 text-center md:text-left">
            Personal na Impormasyon
          </h2>
          <div>
            <Label>Pangalan</Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Edad</Label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Kasarian</Label>
            <Input name="sex" value={formData.sex} onChange={handleChange} />
          </div>
          <div>
            <Label>Petsa ng Kapanganakan</Label>
            <Input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>Address</Label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Numero ng Telepono</Label>
            <Input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Taas (cm)</Label>
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Timbang (kg)</Label>
            <Input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Right Section: Medical Information */}
        <div className="flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center md:text-left">
            Medikal na Impormasyon
          </h2>
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              Ano ang iyong karamdamang nais mong ipakonsulta?
            </h3>
            <Textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Ilagay ang iyong sagot dito..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
              <Label>Oxygen Saturation (% SpO2)</Label>
              <Input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Temperatura (°C)</Label>
              <Input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mt-6 gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <FaChevronLeft /> Bumalik
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
            onClick={() => router.push("/deeplink")}
            className="flex items-center gap-2"
          >
            Susunod <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
