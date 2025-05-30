'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PatientLogEntry } from "@/types/health-data";

export default function PatientLogPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<PatientLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientData = async () => {
      try{
        //const supabase = createClient();
        // logs here
        const { 
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Authentication error')
        }
        // Get patient data
        const { data: patientData, error: patientError } = await supabase
          .from("patient_data")
          .select("id")
          .eq("email", user.email)
          .single();

        if (patientError || !patientData) {
          throw new Error("Patient data not found");
        }
        //console.log("User ID:", user.id);

        const { data: vitalData, error: vitalError } = await supabase
          .from("vital_measurements")
          .select('recorded_at, type, value, unit')
          .eq('patient_id', patientData.id) //removed user.id
          .order('recorded_at', { ascending: false });

        if (vitalError || !vitalData) {
          throw new Error('Error fetching vital logs:', vitalError);
        } else {
          setLogs(vitalData || [])
        }
      } catch (err) {
      console.error('Unexpected error:', err);
      }
      setLoading(false);
    };

    fetchPatientData()
  }, [supabase])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Vital Sign Logs</h1>
      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No vital signs recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border">Recorded At</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Value</th>
                <th className="px-4 py-2 border">Unit</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-blue-50">
                  <td className="px-4 py-2 border">{new Date(log.recorded_at).toLocaleString()}</td>
                  <td className="px-4 py-2 border capitalize">{log.type}</td>
                  <td className="px-4 py-2 border">{log.value}</td>
                  <td className="px-4 py-2 border">{log.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
