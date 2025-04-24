"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Search, X, Clock, Video, UserRound, MapPin, Calendar, CheckCircle } from "lucide-react"

// Separate TimeDisplay component to prevent hydration mismatch
function TimeDisplay() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString())
    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return <div className="absolute top-4 right-6 text-gray-700 text-lg font-semibold">{time}</div>
}

interface Schedule {
  day: string
  active: boolean
  startTime: string
  endTime: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
  consultationType: "online" | "in-person" | "both"
  schedule: Schedule[]
  profileImage: string
  address?: string
}

// Sample doctors data with more detailed information
const doctorsList: Doctor[] = [
  {
    id: "dr-juan",
    name: "Dr. Juan Dela Cruz",
    specialization: "Cardiology",
    consultationType: "both",
    profileImage: "/placeholder.svg?height=300&width=300",
    address: "123 Medical Center, Healthcare Avenue, Metro City",
    schedule: [
      { day: "Monday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Tuesday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Wednesday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Thursday", active: false, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Friday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Saturday", active: false, startTime: "9:00 AM", endTime: "12:00 PM" },
      { day: "Sunday", active: false, startTime: "9:00 AM", endTime: "12:00 PM" },
    ],
  },
  {
    id: "dr-maria",
    name: "Dr. Maria Santos",
    specialization: "Pediatrics",
    consultationType: "online",
    profileImage: "/placeholder.svg?height=300&width=300",
    schedule: [
      { day: "Monday", active: false, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Tuesday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Wednesday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Thursday", active: true, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Friday", active: false, startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Saturday", active: true, startTime: "9:00 AM", endTime: "12:00 PM" },
      { day: "Sunday", active: false, startTime: "9:00 AM", endTime: "12:00 PM" },
    ],
  },
  {
    id: "dr-antonio",
    name: "Dr. Antonio Reyes",
    specialization: "Dermatology",
    consultationType: "in-person",
    profileImage: "/placeholder.svg?height=300&width=300",
    address: "456 Skin Care Center, Health District, Metro City",
    schedule: [
      { day: "Monday", active: true, startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Tuesday", active: true, startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Wednesday", active: false, startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Thursday", active: true, startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Friday", active: true, startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Saturday", active: false, startTime: "10:00 AM", endTime: "2:00 PM" },
      { day: "Sunday", active: false, startTime: "10:00 AM", endTime: "2:00 PM" },
    ],
  },
]

export default function AvailableDoctors() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentDay, setCurrentDay] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [consultationRequested, setConsultationRequested] = useState(false)
  const [meetingLink, setMeetingLink] = useState<string | null>(null)

  // Store the original list of available doctors
  const [todaysDoctors, setTodaysDoctors] = useState<Doctor[]>([])

  // Get current day and filter available doctors
  useEffect(() => {
    const today = new Date()
    const dayIndex = today.getDay() // 0 is Sunday, 1 is Monday, etc.
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = daysOfWeek[dayIndex]
    setCurrentDay(dayName)

    // Filter doctors who are available today
    const doctorsAvailableToday = doctorsList.filter((doctor) => {
      const todaySchedule = doctor.schedule.find((day) => day.day === dayName)
      return todaySchedule?.active
    })

    setTodaysDoctors(doctorsAvailableToday)
  }, [])

  // Use useMemo to filter doctors based on search without causing re-renders
  const filteredDoctors = useMemo(() => {
    if (!search.trim()) {
      return todaysDoctors
    }

    return todaysDoctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search, todaysDoctors])

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowProfileModal(true)
  }

  const handleRequestConsultation = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowConsultationModal(true)
  }

  const confirmConsultation = () => {
    setConsultationRequested(true)

    // Simulate getting a meeting link after a delay
    setTimeout(() => {
      setMeetingLink("https://meet.google.com/example-meeting")
    }, 1500)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setSelectedDoctor(null)
  }

  const closeConsultationModal = () => {
    setShowConsultationModal(false)
    setConsultationRequested(false)
    setMeetingLink(null)
  }

  const getTodaySchedule = (doctor: Doctor) => {
    const todaySchedule = doctor.schedule.find((day) => day.day === currentDay)
    return todaySchedule && todaySchedule.active
      ? `${todaySchedule.startTime} - ${todaySchedule.endTime}`
      : "Not available today"
  }

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case "online":
        return "Online Consultation Only"
      case "in-person":
        return "In-Person Consultation Only"
      case "both":
        return "Online & In-Person Consultation"
      default:
        return "Consultation Available"
    }
  }

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case "online":
        return <Video className="h-4 w-4 mr-1" />
      case "in-person":
        return <MapPin className="h-4 w-4 mr-1" />
      case "both":
        return (
          <div className="flex">
            <Video className="h-4 w-4 mr-1" />
            <MapPin className="h-4 w-4 mr-1" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4 flex flex-col items-center relative pt-20">
      {/* Time Display */}
      <TimeDisplay />

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 text-center w-full">
        Available Doctors Today
      </h1>
      <p className="text-gray-600 mb-6 text-center">Showing doctors available on {currentDay}</p>

      {/* Search Input */}
      <div className="relative w-full max-w-5xl mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search doctors by name or specialization"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* View Toggle */}
      <div className="w-full max-w-5xl mb-4">
        <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as "grid" | "table")}>
          <div className="flex justify-end">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Doctor List - Grid View */}
      {viewMode === "grid" && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{doctor.name}</CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
                  </div>
                  <CardDescription>{doctor.specialization}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Doctor Profile Image - Prominently Displayed */}
                  <div className="flex justify-center">
                    <Avatar className="w-32 h-32 border-2 border-gray-200">
                      <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
                      <AvatarFallback className="bg-gray-100">
                        <UserRound size={48} />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Consultation Type */}
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                      {getConsultationTypeIcon(doctor.consultationType)}
                      {getConsultationTypeLabel(doctor.consultationType)}
                    </Badge>
                  </div>

                  {/* Today's Schedule */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                      <Clock size={16} />
                      <span>Today&apos;s Online Clinic Hours</span>
                    </div>
                    <p className="text-center font-semibold">{getTodaySchedule(doctor)}</p>
                  </div>

                  {/* Address for In-Person */}
                  {(doctor.consultationType === "in-person" || doctor.consultationType === "both") &&
                    doctor.address && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium flex items-center gap-1 mb-1">
                          <MapPin size={14} />
                          <span>Clinic Address:</span>
                        </div>
                        <p>{doctor.address}</p>
                      </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleViewProfile(doctor)}>
                    View Profile
                  </Button>
                  <Button onClick={() => handleRequestConsultation(doctor)}>Request Consultation</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No doctors available today.</p>
              <p className="text-gray-400 mt-2">Please check back later or try another day.</p>
            </div>
          )}
        </div>
      )}

      {/* Doctor List - Table View */}
      {viewMode === "table" && (
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Consultation Type</TableHead>
                <TableHead>Today&apos;s Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
                          <AvatarFallback>
                            <UserRound size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <span>{doctor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getConsultationTypeIcon(doctor.consultationType)}
                        <span className="text-xs">{doctor.consultationType}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-600" />
                        <span>{getTodaySchedule(doctor)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewProfile(doctor)}>
                          Profile
                        </Button>
                        <Button size="sm" onClick={() => handleRequestConsultation(doctor)}>
                          Consult
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No doctors available today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {showProfileModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[90%] max-w-[1000px] h-[600px] p-0 overflow-hidden rounded-md shadow-2xl border border-gray-200">
            <CardHeader className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Doctor Profile</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeProfileModal}>
                  <X size={18} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row h-[480px]">
                {/* Left Column - Doctor Image and Basic Info */}
                <div className="w-full md:w-1/3 border-r bg-white p-6 flex flex-col items-center">
                  <Avatar className="w-32 h-32 border-4 border-gray-200">
                    <AvatarImage src={selectedDoctor.profileImage || "/placeholder.svg"} alt={selectedDoctor.name} />
                    <AvatarFallback className="bg-gray-100">
                      <UserRound size={48} />
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-bold mt-4 text-center">{selectedDoctor.name}</h3>
                  <p className="text-gray-600 mb-4 text-center">{selectedDoctor.specialization}</p>

                  <Badge variant="outline" className="px-3 py-1 mb-4">
                    {getConsultationTypeLabel(selectedDoctor.consultationType)}
                  </Badge>

                  <Button
                    className="w-full mt-auto"
                    onClick={() => {
                      closeProfileModal()
                      handleRequestConsultation(selectedDoctor)
                    }}
                  >
                    Request Consultation
                  </Button>
                </div>

                {/* Right Column - Doctor Details with Scrollable Content */}
                <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                  {/* Today's Schedule */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                      <Clock size={18} />
                      <span>Today&apos;s Online Clinic Hours ({currentDay})</span>
                    </div>
                    <p className="text-lg font-semibold">{getTodaySchedule(selectedDoctor)}</p>
                  </div>

                  {/* In-Person Address */}
                  {(selectedDoctor.consultationType === "in-person" || selectedDoctor.consultationType === "both") &&
                    selectedDoctor.address && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-center gap-2 font-medium mb-2">
                          <MapPin size={18} />
                          <span>In-Person Consultation Address</span>
                        </div>
                        <p>{selectedDoctor.address}</p>
                      </div>
                    )}

                  {/* Weekly Schedule */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 font-medium mb-3">
                      <Calendar size={18} />
                      <span>Weekly Schedule</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {selectedDoctor.schedule.map((day) => (
                        <div key={day.day} className="flex justify-between items-center py-1 border-b last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{day.day}</span>
                            {day.day === currentDay && (
                              <Badge variant="outline" className="text-xs">
                                Today
                              </Badge>
                            )}
                          </div>
                          {day.active ? (
                            <span className="text-green-600">
                              {day.startTime} - {day.endTime}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not Available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 p-4 border-t flex justify-end">
              <Button variant="outline" onClick={closeProfileModal}>
                <X size={16} className="mr-2" /> Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Consultation Request Modal */}
      {showConsultationModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[90%] max-w-[500px] p-0 overflow-hidden rounded-md shadow-2xl border border-gray-200">
            <CardHeader className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">
                  {meetingLink ? "Consultation Ready" : "Request Consultation"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeConsultationModal}>
                  <X size={18} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {meetingLink ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Your consultation is ready!</h3>
                  <p className="text-gray-600">You can now join the video consultation with {selectedDoctor.name}.</p>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      window.open(meetingLink, "_blank")
                      closeConsultationModal()
                    }}
                  >
                    Join Consultation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-gray-200">
                      <AvatarImage src={selectedDoctor.profileImage || "/placeholder.svg"} alt={selectedDoctor.name} />
                      <AvatarFallback className="bg-gray-100">
                        <UserRound size={24} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{selectedDoctor.name}</h3>
                      <p className="text-gray-600">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                      <Clock size={16} />
                      <span>Today&apos;s Clinic Hours</span>
                    </div>
                    <p className="font-semibold">{getTodaySchedule(selectedDoctor)}</p>
                  </div>

                  <p className="text-gray-700">
                    Would you like to request a consultation with {selectedDoctor.name}? Once confirmed, you will be
                    provided with a video consultation link.
                  </p>

                  {consultationRequested ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                      <span className="ml-3">Setting up your consultation...</span>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={closeConsultationModal}>
                        Cancel
                      </Button>
                      <Button onClick={confirmConsultation}>Confirm Consultation</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back Button */}
      <div className="w-full max-w-5xl mt-6 flex justify-start">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <ChevronLeft size={16} /> Bumalik
        </Button>
      </div>
    </div>
  )
}