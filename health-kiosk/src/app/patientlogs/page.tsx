'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase"; // Adjust path if needed

export default function PatientLogPage() {
  const supabase = createClientComponentClient<Database>()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error('No user logged in')
        return
      }

      const { data, error } = await supabase
        .from('vital_signs')
        .select('recorded_at, type, value, unit')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      if (error) {
        console.error('Error fetching vital logs:', error.message)
      } else {
        setLogs(data || [])
      }

      setLoading(false)
    }

    fetchLogs()
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
