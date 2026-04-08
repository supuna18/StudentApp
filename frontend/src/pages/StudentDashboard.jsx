import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Users, ShieldCheck, Heart, Share2, ArrowRight, Zap, Target, BookOpen, Clock } from 'lucide-react';

import Sidebar from "../components/Sidebar";
import ReportSite from '../components/Safety/ReportSite';
import MindfulnessZone from '../components/Safety/MindfulnessZone';

import FocusGamesPage from './FocusGamesPage';
import StudentResourceManager from './StudentResourceManager';
import ProfileManagement from './ProfileManagement';

import SetLimitForm from '../components/Wellbeing/SetLimitForm';
import MusicPlayerPage from './MusicPlayerPage';
import BloomPage from './BloomPage';

const stats = [
  { label: "Focus Time", value: "4h 32m", sub: "↑ 18% vs yesterday", subColor: "text-emerald-500" },
  { label: "Sites Blocked", value: "12+", sub: "3 new today", subColor: "text-amber-500" },
  { label: "Study Streak", value: "7 days", sub: "↑ Personal best", subColor: "text-emerald-500" },
  { label: "Wellbeing Score", value: "86%", sub: "↑ 4pts this week", subColor: "text-emerald-500" },
];

const modules = [
  {
    title: "Collaboration Hub",
    desc: "Connect with classmates, join study groups, and sync your academic schedule.",
    icon: <Users size={20} strokeWidth={2} />,
    iconBg: "bg-purple-50", iconColor: "text-purple-600",
    badge: "Community", badgeBg: "bg-purple-50", badgeColor: "text-purple-700",
    topBar: "from-purple-400 to-purple-600",
    arrowColor: "text-purple-600",
    member: "Member 1",
    to: "/hub",
  },
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

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Good Afternoon, Student! 👋</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Your daily focus & wellbeing summary</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-blue-600 cursor-pointer transition-all shadow-sm">
            <Bell size={20} />
          </div>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-all">
            <Clock size={16} /> Quick Action
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <span className={`text-[10px] font-black ${stat.subColor} mb-1 bg-slate-50 px-2 py-1 rounded-full`}>{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODULES GRID */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> Active Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8 }}
              onClick={() => navigate(mod.to)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col group h-[300px]"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${mod.topBar}`} />
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 ${mod.iconBg} ${mod.iconColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {mod.icon}
                  </div>
                  <span className={`${mod.badgeBg} ${mod.badgeColor} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                    {mod.badge}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-3">{mod.title}</h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed flex-1">
                  {mod.desc}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{mod.member} Module</span>
                  <div className={`${mod.arrowColor} flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all`}>
                    Go Now <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PLACEHOLDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 opacity-50">
        {placeholders.map((text, idx) => (
          <div key={idx} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex items-center justify-center text-slate-400 font-black text-xs uppercase tracking-widest">
            {text}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFF] font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 p-12 relative">
        <Routes>

          <Route path="/" element={<DashboardHome />} />

          {/* Pages */}
          <Route path="music-player" element={<MusicPlayerPage />} />
          <Route path="focus-games" element={<FocusGamesPage />} />

          {/* Member 2 */}
          <Route path="safety" element={<ReportSite />} />
          <Route path="wellness" element={<MindfulnessZone />} />
          <Route path="resources" element={<StudentResourceManager />} />
          <Route path="profile" element={<ProfileManagement />} />
          <Route path="set-limit" element={<SetLimitForm />} />
          <Route path="bloom" element={<BloomPage />} />

        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;