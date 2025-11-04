// src/pages/coaching/CoachDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchCoachDashboard } from "@/lib/coachApi";

// Icons
import { Star, User, FileText, CalendarDays, CheckCircle, PlusSquare } from "lucide-react";

// StatCard Component
function StatCard({ title, count, subtitle, Icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{count}</div>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="ml-4">
        <div className="bg-indigo-50 rounded-md p-2 flex items-center justify-center border border-indigo-100 w-12 h-12">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

// QuickAction Component
function QuickAction({ title, subtitle, Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-left bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border">
        <Icon className="w-6 h-6 text-gray-800" />
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </button>
  );
}

// CardWrapper Component
function CardWrapper({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition">
      {title && <h3 className="font-semibold text-base mb-4">{title}</h3>}
      {children}
    </div>
  );
}



export default function CoachDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      setLoading(true);
      const d = await fetchCoachDashboard();
      if (!mounted) return;
      setData(d);
      setLoading(false);
    }
    loadDashboard();
    return () => (mounted = false);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold mb-3">Coach Dashboard</div>
        <div className="animate-pulse">
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const { activePrograms, enrolledChildren, pendingAssessments, upcomingSessions, recentPrograms, coachWorkload } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, Coach! 👋</h1>
          <p className="text-gray-500 text-sm">Manage your sessions, attendance, and assessments.</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Programs" count={activePrograms} subtitle="Currently running" Icon={Star} />
          <StatCard title="Enrolled Children" count={enrolledChildren} subtitle="Across your programs" Icon={User} />
          <StatCard title="Pending Assessments" count={pendingAssessments} subtitle="Need entry" Icon={FileText} />
          <StatCard title="Upcoming Sessions" count={upcomingSessions} subtitle="Next 7 days" Icon={CalendarDays} />
        </div>

        {/* Quick Actions */}
        <CardWrapper title="Quick Actions">
          <p className="text-gray-400 mb-4">Common tasks for your role</p>
          <div className="flex flex-col md:flex-row gap-4">
            <QuickAction title="Start Attendance" subtitle="Mark attendance for a session" Icon={CheckCircle} onClick={() => window.location.assign("/coaching/sessions")} />
            <QuickAction title="Add Assessment" subtitle="Enter LSAS scores" Icon={FileText} onClick={() => window.location.assign("/coaching/assessments")} />
            <QuickAction title="New Session" subtitle="Create a coaching session" Icon={PlusSquare} onClick={() => window.location.assign("/coaching/sessions/create")} />
          </div>
        </CardWrapper>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Left Column */}
          <div className="space-y-6">
            <CardWrapper title="Coach Workload">
              <p className="text-sm text-gray-500 mb-4">Sessions assigned to you this week and hours</p>
              <div className="space-y-3">
                {coachWorkload.map((c) => (
                  <div key={c.coach} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <div className="font-medium text-sm">{c.coachName}</div>
                      <div className="text-xs text-gray-400">{c.sessions} sessions • {c.hours} hrs</div>
                    </div>
                    <div className="text-indigo-600 font-semibold text-sm">{Math.round(c.utilization)}%</div>
                  </div>
                ))}
              </div>
            </CardWrapper>

            <CardWrapper title="Recent Programs">
              <p className="text-sm text-gray-500 mb-4">Latest coaching programs & batches</p>
              <div className="space-y-3">
                {recentPrograms.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <div className="font-medium">No programs yet</div>
                    <div className="text-sm">Create a program to get started</div>
                  </div>
                )}
                {recentPrograms.map((p) => (
                  <div key={p.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border">
                      <div className="text-indigo-600 font-bold">{p.abbr}</div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.site} · {p.children} children</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardWrapper>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CardWrapper title="Students">
              <p className="text-sm text-gray-500 mb-4">View all students enrolled in your programs</p>
              <button
                onClick={() => window.location.assign("/coaching/students")}
                className="w-full px-5 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
              >
                Know About Students
              </button>
            </CardWrapper>
          </div>
        </div>
      </main>
    </div>
  );
}

