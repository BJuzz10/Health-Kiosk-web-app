"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">
          There was a problem with the authentication process. This could be due to an expired link or an issue with the
          authentication service.
        </p>
        <div className="flex flex-col space-y-4">
          <Button onClick={() => router.push("/form")} className="w-full">
            Return to Home
          </Button>
          <Button variant="outline" onClick={() => router.push("/userlogin")} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

