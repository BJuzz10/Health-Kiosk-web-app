"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 font-sans-serif">
      {/* Header - Matching the home page */}
      <header className="w-full bg-blue-500 p-2 shadow-lg fixed top-0 left-0 z-10">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Link href="/" className="text-white text-2xl font-semibold hover:underline">
            eKonsulTech
          </Link>
          <nav>
            <ul className="flex space-x-6 text-white text-lg">
              <li>
                <Button variant="link" className="text-white hover:text-blue-300" onClick={() => router.push("/about")}>
                  About
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-white hover:text-blue-300" onClick={() => router.push("/contacts")}>
                  Contacts
                </Button>
                </li>
              </ul>
            </nav>
          </div>
        </header>

      {/* Main content with padding to account for fixed header */}
      <main className="pt-16">
        <div className="w-full bg-transparent h-40 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-blue-600 pt-4">About Us</h1>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center p-4 md:p-8 gap-12">
          <div className="flex flex-col space-y-4 max-w-sm lg:max-w-xs">
            <p className="text-3xl font-bold text-gray-700 text-center lg:text-left lg:mx-0 mx-8">Who Are We?</p>
          </div>
          <div className="max-w-2xl space-y-4">
            <p className="text-lg text-gray-800 lg:text-justify text-center">
              We are a team of dedicated students from Batangas State University, working together to create innovative
              solutions that improve healthcare accessibility for underserved communities, particularly in the
              Geographically Isolated and Disadvantaged Areas (GIDA) of Batangas Province.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between p-4 md:p-8 gap-12">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <p className="text-3xl font-bold text-gray-700">Innovative Integration of Health Monitoring Tools</p>
            <p className="text-lg text-gray-800 lg:text-justify">
              Our web application empowers individuals to check vital health metrics easily.
            </p>
          </div>
          <div className="flex-1 w-[400px] h-[400px]">
            <Image
              src="/img/health-monitoring.jpg"
              alt="Health Monitoring Tools"
              width={400} // Defining width and height for optimization
              height={400}
              className="rounded-lg object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row-reverse items-center justify-between p-4 md:p-8 gap-12">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <p className="text-3xl font-bold text-gray-700">Breaking Barriers to Healthcare Access</p>
            <p className="text-lg text-gray-800 lg:text-justify">
              Our system transforms remote healthcare delivery, putting essential information within the reach of those
              who need it most.
            </p>
          </div>
          <div className="flex-1 w-[400px] h-[400px]">
            <Image
              src="/img/access.jpg"
              alt="Breaking Barriers to Healthcare Access"
              width={400} // Defining width and height for optimization
              height={400}
              className="rounded-lg object-contain"
            />
          </div>
        </div>

        <div className="w-full bg-blue-600 text-white">
          <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
            <div className="flex flex-col md:flex-row w-full max-w-6xl justify-between gap-8 text-center md:text-left">
              <div className="flex-1 flex flex-col items-center md:items-start justify-center">
                <h2 className="text-4xl font-bold mb-4">Our Vision</h2>
                <p>
                  To create a future where every community, regardless of distance or economic status, has access to
                  primary healthcare through innovative biomedical technologies.
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center md:items-start justify-center">
                <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
                <p>
                  To develop an accessible and reliable digital health system that empowers marginalized communities
                  with vital healthcare tools and information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-6 py-10 bg-white text-center">
          <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>

          <p className="max-w-4xl mx-auto mb-10 text-gray-700">
            This project is a collaboration between Biomedical Engineering students from Batangas State University –
            Alangilan Campus and College of Medicine students from Batangas State University - Pablo Borbon Campus. Our
            interdisciplinary team combines technical innovation with clinical insight, guided by our shared commitment
            to improve healthcare delivery for all.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/1.jpg"
                  alt="Bob Justin B. Jobo"
                  width={96} // Defined width and height for optimization
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Bob Justin B. Jobo</h3>
                <p className="text-sm text-gray-600">Project Leader of the Biomedical Engineering Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/2.jpg"
                  alt="Nataniel Allan Alejandre"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Nataniel Allan Alejandre</h3>
                <p className="text-sm text-gray-600">Project Member of the Biomedical Engineering Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/3.jpg"
                  alt="Ceon Addy Louise Q. Ilagan"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Ceon Addy Louise Q. Ilagan</h3>
                <p className="text-sm text-gray-600">Project Member of the Biomedical Engineering Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/4.jpg"
                  alt="Dinson Del Rosario"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Dinson Del Rosario</h3>
                <p className="text-sm text-gray-600">Project Leader of the College of Medicine Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/5.jpg"
                  alt="Ariane May Cleofe"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Ariane May Cleofe</h3>
                <p className="text-sm text-gray-600">Project Member of the College of Medicine Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/6.jpg"
                  alt="Hayzel Datinguinoo"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Hayzel Datinguinoo</h3>
                <p className="text-sm text-gray-600">Project Member of the College of Medicine Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/7.jpg"
                  alt="Chin Angel L. Hidalgo"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Chin Angel L. Hidalgo</h3>
                <p className="text-sm text-gray-600">Project Member of the College of Medicine Team</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Image
                  src="/img/profilepicture/8.jpg"
                  alt="Little Arielle G. Ocampo"
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4"
                />
                <h3 className="font-semibold">Little Arielle G. Ocampo</h3>
                <p className="text-sm text-gray-600">Project Member of the College of Medicine Team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
