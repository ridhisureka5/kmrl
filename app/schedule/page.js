"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ListChecks,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import scheduleData from "/data/kmrl_daily_schedule.json"; // ✅ dataset

export default function SchedulePage() {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    // Preprocess dataset
    const mapped = scheduleData.map((row, i) => {
      // Decide train punctuality based on warnings
      let punctuality = "On Time";
      if (
        row.Warnings &&
        (row.Warnings.toLowerCase().includes("pending") ||
          row.Warnings.toLowerCase().includes("expired") ||
          row.Warnings.toLowerCase().includes("job card"))
      ) {
        punctuality = "Delayed";
      }

      return {
        id: String(row.Trainset || i),
        trainset: row.Trainset,
        startTime: row.Start_Time || "N/A",
        trips: row.Expected_Trips || "0",
        route: row.Route_Assignment || "N/A",
        scheduleType: row.Schedule_Type,
        reasoning: row["AI Reasoning"] || "",
        warnings: row.Warnings || "None",
        punctuality,
      };
    });

    // Sort: First by numeric time, then On-Call at end
    mapped.sort((a, b) => {
      if (a.startTime === "On-Call") return 1;
      if (b.startTime === "On-Call") return -1;
      return a.startTime.localeCompare(b.startTime);
    });

    setTrains(mapped);
  }, []);

  function TypeBadge({ type }) {
    const colors = {
      "Primary Service": "bg-green-100 text-green-800",
      "Standby/Relief": "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[type] || "bg-gray-200 text-gray-700"
        }`}
      >
        {type}
      </span>
    );
  }

  function PunctualityBadge({ status }) {
    const colors = {
      "On Time": "bg-green-100 text-green-800",
      Delayed: "bg-rose-100 text-rose-800",
    };
    const icons = {
      "On Time": <CheckCircle size={14} />,
      Delayed: <XCircle size={14} />,
    };
    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-200 text-gray-700"
        }`}
      >
        {icons[status]} {status}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Calendar size={22} /> KMRL — Daily Service Plan
          </h1>
          <p className="text-sm text-gray-600">
            Showing planned train trips, routes, and punctuality status
          </p>
        </header>

        {/* Schedule List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-indigo-800 mb-4">Train Services</h3>
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
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {idx + 1}. Train {t.trainset}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> Start: {t.startTime}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ListChecks size={12} /> Expected Trips: {t.trips}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> Route: {t.route}
                    </div>
                    {t.warnings !== "None" && (
                      <div className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                        <AlertTriangle size={12} />
                        {t.warnings}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <TypeBadge type={t.scheduleType} />
                    <PunctualityBadge status={t.punctuality} />
                  </div>
                </div>
                {t.reasoning && (
                  <p className="text-xs text-gray-600 italic">
                    {t.reasoning}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
