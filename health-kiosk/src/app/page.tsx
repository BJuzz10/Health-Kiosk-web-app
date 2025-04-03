"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const products = [
  {
    id: 1,
    title: "Health Monitoring",
    description:
      "Advanced vital signs monitoring system for comprehensive health tracking.",
    image: "/img/monitoring.jpg",
  },
  {
    id: 2,
    title: "Virtual Consultation",
    description:
      "Connect with healthcare professionals instantly through secure video calls.",
    image: "/img/consultation.jpg",
  },
  {
    id: 3,
    title: "Medicine Tracker",
    description: "Smart medication management system with timely reminders.",
    image: "/img/prescription.jpg",
  },
];

export default function HealthcareKiosk() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8">
      {/* Left Side - Product Carousel */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
        <Carousel className="w-full max-w-[700px] md:max-w-[800px] lg:max-w-[900px]">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id} className="flex justify-center">
                <Card className="w-full h-[600px] p-10 rounded-xl shadow-xl flex flex-col items-center justify-start bg-white hover:bg-blue-50 transition-all duration-300">
                  {/* Title as Card Header */}
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                    {product.title}
                  </h3>

                  {/* Larger Image */}
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={500}
                    height={350}
                    className="w-full h-[350px] object-cover rounded-none"
                  />

                  {/* Description Below Image */}
                  <p className="text-center mt-4 text-gray-600 text-sm md:text-base">
                    {product.description}
                  </p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Responsive Navigation Buttons */}
          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 scale-90 md:scale-100" />
          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 scale-90 md:scale-100" />
        </Carousel>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start p-4 md:p-12 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          Welcome to{" "}
          <span className="text-blue-500">eKonsulTech Health Kiosk</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 mt-2 md:mt-4">
          Experience the future of healthcare with our innovative digital
          solutions. Access medical services, track your health, and connect
          with professionals all in one place.
        </p>
        <Button
          onClick={() => router.push("/form")}
          className="mt-4 md:mt-6 px-6 md:px-8 py-3 md:py-4 bg-blue-500 text-white rounded-full text-base md:text-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg"
        >
          Get Started
        </Button>

        {/* Why Choose Us? */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-xl w-full max-w-[500px] md:max-w-[700px] bg-blue-50">
          <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
            Why Choose Us?
          </h3>
          <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
            <li className="flex items-center space-x-2">
              <span className="text-blue-500">✓</span>
              <span>24/7 Healthcare Support</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-500">✓</span>
              <span>Secure Patient Data</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-500">✓</span>
              <span>Smart Health Monitoring</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
