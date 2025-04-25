/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase-auth";
import { hasCompletePatientData } from "@/lib/patient-data";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { savePatientData } from "@/lib/patient-data";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPhoneLogin, setIsPhoneLogin] = useState(false); // Track if phone login is selected
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  // Update the handleEmailAuth function to save patient data during signup
  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isSignUp) {
        // For signup, pass the source parameter
        const { user } = await signUpWithEmail(email, password, "userlogin");

        // Save the user's name and email to patient_data table
        if (user && fullName) {
          await savePatientData({
            email: email,
            name: fullName,
            sex: null,
            address: null,
            contact: null,
          });
        }

        // Show success message for sign up
        setError("Check your email for a confirmation link!");
      } else {
        const { user } = await signInWithEmail(email, password);
        if (user) {
          // Check if user has complete patient data
          const hasData = await hasCompletePatientData(user.email!);

          // Redirect based on data existence
          if (user.email?.includes("admin") || user.email?.includes("doctor")) {
            router.push("/admindash");
          } else {
            router.push(hasData ? "/dashboard" : "/user");
          }
        }
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      setError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 overflow-hidden">
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
      <div className="w-full max-w-3xl flex flex-col shadow-lg rounded-xl overflow-hidden bg-white p-8">
        {/* Tab Toggle */}
        <div className="flex justify-center space-x-6 mb-6">
          {/* Sign In Button */}
          <button
            className={`text-lg font-semibold pb-2 transition ${
              !isSignUp && !isPhoneLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => {
              setIsSignUp(false);
              setIsPhoneLogin(false); // Deactivate Phone login when Sign In is clicked
            }}
          >
            Sign In
          </button>

          {/* Sign Up Button */}
          <button
            className={`text-lg font-semibold pb-2 transition ${
              isSignUp && !isPhoneLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => {
              setIsSignUp(true);
              setIsPhoneLogin(false); // Deactivate Phone login when Sign Up is clicked
            }}
          >
            Sign Up
          </button>

          {/* Phone Button */}
          <button
            className={`text-lg font-semibold pb-2 transition ${
              isPhoneLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => setIsPhoneLogin(!isPhoneLogin)} // Toggle Phone Login
          >
            Phone
          </button>
        </div>

        {/* Form Container */}
        <div className="relative w-full min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-full space-y-5"
                onSubmit={handleEmailAuth}
              >
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg transition disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Sign Up"}
                </motion.button>
              </motion.form>
            ) : !isPhoneLogin ? ( // Render Email SignIn when phone login is not selected
              <motion.form
                key="signin"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-full space-y-5"
                onSubmit={handleEmailAuth}
              >
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg transition disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Sign In"}
                </motion.button>
              </motion.form>
            ) : (
              // Render Phone SignIn when phone login is selected
              <div className="absolute w-full space-y-5">
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter your phone number"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg transition mt-4"
                  >
                    Send OTP
                  </motion.button>
                </div>

                {/* Hide OTP section */}
                {/* <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Enter OTP"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg transition mt-4"
                  >
                    Verify OTP
                  </motion.button>
                </div> */}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <Alert
            variant={
              error.includes("Check your email") ? "default" : "destructive"
            }
            className="mt-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {error.includes("Check your email") ? "Info" : "Error"}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
