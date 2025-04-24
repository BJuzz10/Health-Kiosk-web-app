"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FormDataType = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: FormDataType) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    setSubmitted(true);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header - Matching the home page */}
      <header className="w-full bg-blue-500 p-2 shadow-lg fixed top-0 left-0 z-10">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Link
            href="/"
            className="text-white text-2xl font-semibold hover:underline"
          >
            eKonsulTech
          </Link>
          <nav>
            <ul className="flex space-x-6 text-white text-lg">
              <li>
                <Button
                  variant="link"
                  className="text-white hover:text-blue-300"
                  onClick={() => router.push("/about")}
                >
                  About
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-white hover:text-blue-300"
                  onClick={() => router.push("/contacts")}
                >
                  Contacts
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content with padding to account for fixed header */}
      <div className="pt-16 p-4 sm:p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">📞 Contact Us</h1>
          <p className="text-lg text-center text-gray-600 mb-8">
            We&apos;d love to hear from you! Feel free to contact us if you have
            questions or suggestions or would like to collaborate.
          </p>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-10">
            <h2 className="text-2xl font-semibold mb-2">📧 Email</h2>
            <p className="text-gray-700 mb-4">
              <strong>kioskhealthbioe24001@gmail.com</strong> (for general
              inquiries and feedback)
            </p>
            <h2 className="text-2xl font-semibold mb-2">🕒 Office Hours</h2>
            <p className="text-gray-700">
              Monday to Friday | 8:00 AM – 5:00 PM
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-6 rounded-lg shadow-lg space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <textarea
              name="message"
              placeholder="Your Message"
              className="border border-gray-300 rounded-md p-2 w-full h-32"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition"
            >
              Send Message
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-green-600 font-semibold text-center">
              ✅ Thank you for your message! We&apos;ll get back to you soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
