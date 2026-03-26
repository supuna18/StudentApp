import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import ReportSite from '../components/Safety/ReportSite';
import MindfulnessZone from '../components/Safety/MindfulnessZone';
import StudentResourceManager from './StudentResourceManager';

import SetLimitForm from '../components/Wellbeing/SetLimitForm';  
import MusicPlayerPage from './MusicPlayerPage'; 

import { Bell, Users, ShieldCheck, Heart, Clock, LayoutDashboard, Share2 } from 'lucide-react';

const stats = [
  { label: "Focus Time",     value: "4h 32m",  sub: "↑ 18% vs yesterday", subColor: "text-emerald-500" },
  { label: "Sites Blocked",  value: "12+",     sub: "3 new today",         subColor: "text-amber-500"   },
  { label: "Study Streak",   value: "7 days",  sub: "↑ Personal best",     subColor: "text-emerald-500" },
  { label: "Wellbeing Score",value: "86%",     sub: "↑ 4pts this week",    subColor: "text-emerald-500" },
];

const modules = [
  {
    title: "Report a Site",
    desc: "Flag harmful or distracting content to keep your learning environment clean and focused.",
    icon: <ShieldCheck size={20} strokeWidth={2} />,
    iconBg: "bg-blue-50", iconColor: "text-blue-600",
    badge: "Safety", badgeBg: "bg-blue-50", badgeColor: "text-blue-700",
    topBar: "from-blue-400",
    arrowColor: "text-blue-600",
    member: "Member 2",
    to: "safety",
  },
  {
    title: "Mindfulness Zone",
    desc: "Take mindful breaks with guided exercises to reduce stress and maintain your mental wellbeing.",
    icon: <Heart size={20} strokeWidth={2} />,
    iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
    badge: "Wellness", badgeBg: "bg-emerald-50", badgeColor: "text-emerald-700",
    topBar: "from-emerald-400",
    arrowColor: "text-emerald-600",
    member: "Member 2",
    to: "wellness",
  },
  {
    title: "Share Resources",
    desc: "Upload and share helpful notes, PDF, and articles with other students in the community.",
    icon: <Share2 size={20} strokeWidth={2} />,
    iconBg: "bg-indigo-50", iconColor: "text-indigo-600",
    badge: "Community", badgeBg: "bg-indigo-50", badgeColor: "text-indigo-700",
    topBar: "from-indigo-400",
    arrowColor: "text-indigo-600",
    member: "Member 4",
    to: "resources",
  },
];

const placeholders = ["Member 1 Module", "Member 3 Module"];


const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F0F4FF]">
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .dashboard-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading  { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="dashboard-root flex-1 ml-64 p-10 relative">

        {/* Ambient orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full bg-blue-500/[0.07] blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-indigo-400/[0.06] blur-[80px] pointer-events-none -z-10" />

        <Routes>

          {/* ── Default route ── */}
          <Route path="/" element={
            <div>

              {/* Top bar */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="serif-heading text-[28px] text-[#0F1C4D] font-normal leading-tight">
                    Student Dashboard
                  </h1>
                  <p className="text-[13px] text-slate-400 mt-1">
                    Welcome back — ready for a productive session?
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Notification bell */}
                  <div className="relative w-9 h-9 bg-white border border-[#E8EEFF] rounded-[10px] flex items-center justify-center cursor-pointer hover:border-blue-200 transition-colors">
                    <Bell size={15} className="text-slate-500" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full border-2 border-white" />
                  </div>

                  {/* CTA */}
                  <Link
                    to="/hub"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[12.5px] font-semibold px-5 py-2.5 rounded-[10px] shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
                  >
                    <Users size={13} />
                    Open Collaboration Hub
                  </Link>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#E8EEFF] rounded-2xl px-5 py-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                  >
                    <p className="text-[10.5px] font-700 text-slate-400 uppercase tracking-[1.2px] mb-2">{s.label}</p>
                    <p className="text-[22px] font-extrabold text-[#0F1C4D] tracking-tight leading-none">{s.value}</p>
                    <p className={`text-[11px] font-semibold mt-1.5 ${s.subColor}`}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Module cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {modules.map((m, i) => (
                  <Link
                    key={i}
                    to={m.to}
                    className={`
                      group relative bg-white rounded-[18px] p-6
                      border border-[#E8EEFF] hover:border-blue-200
                      shadow-sm hover:shadow-xl hover:shadow-blue-50
                      transition-all duration-300 hover:-translate-y-1 overflow-hidden
                    `}
                  >
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] bg-gradient-to-r ${m.topBar} to-transparent`} />

                    <div className="flex items-start justify-between mb-4">
                      <div className={`${m.iconBg} ${m.iconColor} w-11 h-11 rounded-[12px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {m.icon}
                      </div>
                      <span className={`${m.badgeBg} ${m.badgeColor} text-[10px] font-bold tracking-[1px] uppercase px-3 py-1 rounded-full`}>
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-[15.5px] font-bold text-[#0F1C4D] mb-1.5 tracking-tight">{m.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-[1.65]">{m.desc}</p>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F0F4FF]">
                      <span className="text-[11px] text-slate-400">{m.member}</span>
                      <span className={`flex items-center gap-1 text-[12px] font-semibold ${m.arrowColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300`}>
                        Open
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Placeholder cards */}
                {placeholders.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center bg-white/60 border-2 border-dashed border-slate-200 rounded-[18px] p-10 opacity-40"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400 italic">{label}</span>
                  </div>
                ))}
              </div>

            </div>
          } />


          
          {/* --- නව MUSIC PLAYER ROUTE එක මෙතනට එකතු කළා --- */}
          <Route path="music-player" element={<MusicPlayerPage />} />

         

          {/* Member 2 routes */}
          <Route path="safety"    element={<div className="max-w-3xl mx-auto py-6"><ReportSite /></div>} />
          <Route path="wellness"  element={<div className="max-w-2xl mx-auto py-6"><MindfulnessZone /></div>} />
          <Route path="resources" element={<StudentResourceManager />} />

          <Route path="set-limit" element={<SetLimitForm />} />

        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;