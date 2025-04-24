"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageContext } from "@/context/LanguageContext";

export default function LanguageSelect() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setLanguage } = useContext(LanguageContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectLanguage = (language: "en" | "tl") => {
    // Save to localStorage
    localStorage.setItem("preferredLanguage", language);

    // Update the context immediately
    setLanguage(language);

    // Short delay to ensure the language change is processed
    setTimeout(() => {
      router.push("/form");
    }, 100);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome to eKonsulTech
        </h1>
        <p className="text-xl text-gray-600">
          Please select your preferred language / Piliin ang iyong gustong wika
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <Card
            className="w-full md:w-64 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => selectLanguage("en")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src="/img/1.png"
                  alt="English"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">English</h2>
              <p className="text-gray-600 mb-4">Continue in English</p>
              <Button className="w-full" onClick={() => selectLanguage("en")}>
                Select
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <Card
            className="w-full md:w-64 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => selectLanguage("tl")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src="/img/2.png"
                  alt="Tagalog"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tagalog</h2>
              <p className="text-gray-600 mb-4">Magpatuloy sa Tagalog</p>
              <Button className="w-full" onClick={() => selectLanguage("tl")}>
                Piliin
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="mt-12 text-gray-500">
        You can change your language preference later in the settings.
        <br />
        Maaari mong baguhin ang iyong gustong wika sa mga setting sa ibang
        pagkakataon.
      </p>
    </div>
  );
}
