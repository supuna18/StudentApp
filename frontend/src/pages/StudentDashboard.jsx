import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import ReportSite from '../components/Safety/ReportSite';
import MindfulnessZone from '../components/Safety/MindfulnessZone';

import FocusGamesPage from './FocusGamesPage';
import StudentResourceManager from './StudentResourceManager';
import ProfileManagement from './ProfileManagement';

import SetLimitForm from '../components/Wellbeing/SetLimitForm';
import MusicPlayerPage from './MusicPlayerPage';

import { Bell, Users, ShieldCheck, Heart, Share2 } from 'lucide-react';

const stats = [
  { label: "Focus Time", value: "4h 32m", sub: "↑ 18% vs yesterday", subColor: "text-emerald-500" },
  { label: "Sites Blocked", value: "12+", sub: "3 new today", subColor: "text-amber-500" },
  { label: "Study Streak", value: "7 days", sub: "↑ Personal best", subColor: "text-emerald-500" },
  { label: "Wellbeing Score", value: "86%", sub: "↑ 4pts this week", subColor: "text-emerald-500" },
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
      <Sidebar />

      <div className="flex-1 ml-64 p-10 relative">
        <Routes>

          <Route path="/" element={<div>Dashboard Home</div>} />

          {/* Pages */}
          <Route path="music-player" element={<MusicPlayerPage />} />
          <Route path="focus-games" element={<FocusGamesPage />} />

          {/* Member 2 */}
          <Route path="safety" element={<ReportSite />} />
          <Route path="wellness" element={<MindfulnessZone />} />
          <Route path="resources" element={<StudentResourceManager />} />
          <Route path="profile" element={<ProfileManagement />} />
          <Route path="set-limit" element={<SetLimitForm />} />

        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;