"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pause, Send, Info, Calendar } from "lucide-react";
import dataset from "/data/kmrl_daily_recommendations.json";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useRouter } from "next/navigation"; // ✅ navigation

export default function InductionPlannerDemo() {
  const router = useRouter(); // ✅ router instance

  // --- Data preprocessing ---
  const initialTrains = useMemo(
    () =>
      dataset.map((row, i) => {
        let branding = "Normal";
        if (row.Branding_Priority > 15) branding = "Critical";
        else if (row.Branding_Priority > 12) branding = "High";

        return {
          id: String(row.Trainset),
          name: row.Trainset,
          odometer_km: row.Mileage,
          fitness_valid:
            row.Rolling_Cert === 1 &&
            row.Signal_Cert === 1 &&
            row.Telecom_Cert === 1,
          jobcards_open: row.Job_Card_Open,
          branding_priority: branding,
          cleaning_score: row.Cleaning_Status * 50,
          bay: i % 6,
          ai_recommendation: row.AI_Recommendation,
          status_name: row.Status_Name,
          priority_score: Number(row.Priority_Score) || 0,
          status: "Pending", // Default
        };
      }),
    []
  );

  const [trains, setTrains] = useState(initialTrains);
  const [rankedList, setRankedList] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);

  // Ranking
  useEffect(() => {
    const scored = trains.map((t) => ({
      ...t,
      _score: Number(t.priority_score) || 0,
    }));
    scored.sort((a, b) => b._score - a._score);
    setRankedList(scored);
  }, [trains]);

  // Actions
  function updateStatus(id, newStatus) {
    setTrains((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  // Date formatter
  const fmt = (t) =>
    t
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date(t))
      : "--";

  const [lastDecision, setLastDecision] = useState(null);

  // UI badges
  function StatusBadge({ status }) {
    const colors = {
      Pending: "bg-gray-200 text-gray-700",
      Approved: "bg-green-100 text-green-800",
      Held: "bg-yellow-100 text-yellow-800",
      IBL: "bg-rose-100 text-rose-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  }

  // Summary Panel
  function SummaryPanel({ trains }) {
    const statusCounts = trains.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(statusCounts).map(([k, v]) => ({
      name: k,
      value: v,
    }));

    const COLORS = ["#94a3b8", "#22c55e", "#facc15", "#f43f5e"];

    // Bar chart data for scores
    const barData = trains
      .map((t, i) => ({ name: t.name, score: t.priority_score }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="bg-white rounded-xl shadow p-6 h-full">
        <h3 className="font-bold text-indigo-800 mb-4">Overview</h3>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Trains</p>
            <p className="text-xl font-bold">{trains.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-xl font-bold">{statusCounts["Approved"] || 0}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-500">On Hold</p>
            <p className="text-xl font-bold">{statusCounts["Held"] || 0}</p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg">
            <p className="text-sm text-gray-500">IBL</p>
            <p className="text-xl font-bold">{statusCounts["IBL"] || 0}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-48 mb-6">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* ✅ New Schedule Navigation Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => router.push("/schedule")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            <Calendar size={16} /> Go to Schedule
          </button>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-900">
              KMRL — Induction Planner
            </h1>
            <p className="text-sm text-gray-600">
              AI-powered recommendations for daily induction
            </p>
          </div>
          <div className="text-right text-sm">
            <div>
              Last decision:{" "}
              <span className="font-medium">{fmt(lastDecision)}</span>
            </div>
          </div>
        </header>

        {/* Ranked List + Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side list */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-indigo-800 mb-3">
              Ranked Induction List
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-auto">
              <AnimatePresence>
                {rankedList.map((t, idx) => (
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
                          {idx + 1}. {t.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Score: {t._score.toFixed(1)} • {t.status_name}
                        </div>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setSelectedTrain(t)}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Info size={14} /> Explain
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(t.id, "Approved");
                          setLastDecision(new Date());
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(t.id, "Held");
                          setLastDecision(new Date());
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        <Pause size={14} /> Hold
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(t.id, "IBL");
                          setLastDecision(new Date());
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded bg-rose-600 text-white hover:bg-rose-700"
                      >
                        <Send size={14} /> IBL
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side: Explain Modal OR Summary */}
          <AnimatePresence>
            {selectedTrain ? (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="bg-white rounded-xl shadow p-6"
              >
                <h3 className="font-bold text-indigo-800 mb-2">
                  Why {selectedTrain.name} scored{" "}
                  {selectedTrain._score.toFixed(1)}
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    {
                      label: "Fitness valid",
                      value: selectedTrain.fitness_valid ? "+45" : "-80",
                    },
                    {
                      label: "Jobcards open",
                      value: -selectedTrain.jobcards_open * 8,
                    },
                    {
                      label: "Branding priority",
                      value: selectedTrain.branding_priority,
                    },
                    {
                      label: "Cleaning score",
                      value: selectedTrain.cleaning_score,
                    },
                  ].map((r, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{r.label}</span>
                      <span className="font-medium">{r.value}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedTrain(null)}
                  className="mt-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <SummaryPanel trains={trains} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
