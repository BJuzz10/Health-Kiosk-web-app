"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";

type LanguageContextType = {
  language: "en" | "tl";
  setLanguage: (lang: "en" | "tl") => void;
  t: (key: string) => string;
};

const defaultLanguageContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: () => "",
};

export const LanguageContext = createContext<LanguageContextType>(
  defaultLanguageContext
);

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<"en" | "tl">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") as
      | "en"
      | "tl";
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: "en" | "tl") => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const t = (key: string): string => {
    if (!mounted) return translations.en[key] || key;

    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations object
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    "app.name": "eKonsulTech Health Kiosk",
    "language.toggle": "Filipino",
    "back.button": "Back",
    "save.button": "Save",
    "next.button": "Next",
    "logout.button": "Logout",

    // Form page
    "form.welcome": "Please select your role to continue",
    "form.patient": "Login as Patient",
    "form.healthworker": "Login as Doctor",
    "form.admin.access": "Admin Access",
    "form.admin.code": "Enter Healthcare Admin Access:",
    "form.admin.submit": "Submit",
    "form.admin.cancel": "Cancel",

    // Dashboard
    "dashboard.homepage": "Homepage",
    "dashboard.personal.data": "Show Personal Data",
    "dashboard.available.doctors": "Available Doctors",
    "dashboard.medical.info": "Medical Information",
    "dashboard.print.prescription": "Print Prescription",

    // Admin Dashboard
    "admin.homepage": "Doctor's Home Page",
    "admin.personal.info": "Doctor's Personal Information",
    "admin.start.appointments": "Start Health Kiosk Appointments",
    "admin.patient.info": "Patient Information",
    "admin.ehr.clinic": "PPD Clinic (EHR)",
    "admin.Settings": "Settings",

    // Medical Information
    "medinfo.title": "Medical Information",
    "medinfo.symptoms": "What symptoms would you like to consult about?",
    "medinfo.bp": "Blood Pressure (mmHg)",
    "medinfo.oxygen": "Oxygen Saturation (% SpO2)",
    "medinfo.temp": "Temperature (°C)",
    "medinfo.pulse": "Pulse Rate (bpm)",
    "medinfo.height": "Height (cm)",
    "medinfo.weight": "Weight (kg)",
    "medinfo.placeholder": "Enter your answer here...",

    // User Profile
    "user.title": "Patient Information System",
    "user.personal.info": "Personal Information",
    "user.name": "Name",
    "user.age": "Age",
    "user.sex": "Sex",
    "user.birthday": "Birthday",
    "user.address": "Address",
    "user.contact": "Contact Number", 

    //Available /doctors
    "doctors.title": "Available Doctors Today",
  },
  tl: {
    // Common
    "app.name": "eKonsulTech Health Kiosk",
    "language.toggle": "English",
    "back.button": "Bumalik",
    "save.button": "I-save",
    "next.button": "Susunod",
    "logout.button": "Mag Log out",

    // Form page
    "form.welcome": "Piliin ang iyong tungkulin upang magpatuloy",
    "form.patient": "Ako ay Pasyente",
    "form.healthworker": "Ako ay Doktor",
    "form.admin.access": "Admin Access",
    "form.admin.code": "Ilagay ang Healthcare Admin Access:",
    "form.admin.submit": "Ipasa",
    "form.admin.cancel": "Kanselahin",

    // Dashboard
    "dashboard.homepage": "Homepage",
    "dashboard.personal.data": "Ipakita ang personal na datos",
    "dashboard.available.doctors": "Mga available na Doktor",
    "dashboard.medical.info": "Impormasyon Medikal",
    "dashboard.print.prescription": "Iprint ang reseta",

    // Admin Dashboard
    "admin.homepage": "Doctor's Home Page",
    "admin.personal.info": "Personal na Impormasyon ng Doktor",
    "admin.start.appointments": "Simulan ang Health Kiosk Appointment",
    "admin.patient.info": "Impormasyon ng Pasyente",
    "admin.ehr.clinic": "PPD Clinic (EHR)",
    "admin.Settings": "Mga Setting",

    // Medical Information
    "medinfo.title": "Medikal na Impormasyon",
    "medinfo.symptoms": "Ano ang iyong karamdamang nais mong ipakonsulta?",
    "medinfo.bp": "Presyon ng Dugo (mmHg)",
    "medinfo.oxygen": "Oxygen Saturation (% SpO2)",
    "medinfo.temp": "Temperatura (°C)",
    "medinfo.pulse": "Pulse Rate (bpm)",
    "medinfo.height": "Taas (cm)",
    "medinfo.weight": "Timbang (kg)",
    "medinfo.placeholder": "Ilagay ang iyong sagot dito...",

    // User Profile
    "user.title": "Sistema ng Impormasyon ng Pasyente",
    "user.personal.info": "Personal na Impormasyon",
    "user.name": "Pangalan",
    "user.age": "Edad",
    "user.sex": "Kasarian",
    "user.birthday": "Petsa ng Kapanganakan",
    "user.address": "Address",
    "user.contact": "Numero ng Telepono",

    //Available /doctors
    "doctors.title": "Available Doctors Today",
  },
};

import React from "react";
