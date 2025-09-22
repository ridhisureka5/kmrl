"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, XCircle } from "lucide-react";
import scheduleData from "/data/kmrl_daily_schedule.json"; // ✅ your converted JSON

export default function SchedulePage() {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    // Preprocess schedule dataset
    const mapped = scheduleData.map((row, i) => ({
      id: String(row.Trainset || i),
      trainset: row.Trainset,
      line: row.Line || row.Route || "N/A",
      departure: row.Departure_Time,
      arrival: row.Arrival_Time,
      status: row.Status || "Scheduled", // Default if not provided
    }));
    setTrains(mapped);
  }, []);

  function StatusBadge({ status }) {
    const colors = {
      Scheduled: "bg-blue-100 text-blue-800",
      Running: "bg-green-100 text-green-800",
      Completed: "bg-gray-200 text-gray-700",
      Cancelled: "bg-rose-100 text-rose-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-200 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Calendar size={22} /> KMRL — Daily Schedule
          </h1>
          <p className="text-sm text-gray-600">
            Showing approved trainsets and their planned schedule
          </p>
        </header>

        {/* Schedule List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-indigo-800 mb-4">
            Train Schedule
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-auto">
            {trains.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {idx + 1}. Train {t.trainset}
                    </div>
                    <div className="text-xs text-gray-500">
                      Line: {t.line}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {t.departure} → {t.arrival}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
  