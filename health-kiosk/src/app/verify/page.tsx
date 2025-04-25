"use client";
import React, { useEffect } from "react";
import { BsCheckCircleFill } from "react-icons/bs";

const EmailConfirmationSuccess = () => {
  useEffect(() => {
    document.title = "Email Confirmation Success";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="mb-6 transform scale-100 animate-bounce-once">
          <BsCheckCircleFill className="w-20 h-20 mx-auto text-emerald-500" aria-hidden="true" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-4" role="heading">
          Email Confirmed Successfully!
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Your email has been verified. You can now access all features of our platform.
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmationSuccess;
