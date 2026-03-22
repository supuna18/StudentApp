import { Routes, Route } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import ReportSite from '../components/Safety/ReportSite';
import MindfulnessZone from '../components/Safety/MindfulnessZone';
import SetLimitForm from '../components/Wellbeing/SetLimitForm';  
import MusicPlayerPage from './MusicPlayerPage'; // --- නව පේජ් එක මෙතනට IMPORT කළා ---

const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Dashboard Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-10 relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] opacity-30 -z-10 animate-bounce"></div>

        {/* Sub-routes for Member Features */}
        <Routes>
          <Route path="/" element={
            <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">
                Student Dashboard
              </h1>
              <p className="text-slate-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                Welcome back! Your personal workspace is ready for a productive session.
              </p>
              
              <div className="mt-10">
                <a href="/hub" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
                  Open Collaboration Hub
                </a>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 opacity-25 grayscale">
                 <div className="p-16 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Member 1 Module</span>
                 </div>
                 <div className="p-16 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Member 3 Module</span>
                 </div>
              </div>
            </div>
          } />

          {/* MEMBER 2 PAGES (ඔයාගේ කොටස) */}
          <Route path="safety" element={<div className="max-w-3xl mx-auto py-6"><ReportSite /></div>} />
          <Route path="wellness" element={<div className="max-w-2xl mx-auto py-6"><MindfulnessZone /></div>} />
          
          {/* --- නව MUSIC PLAYER ROUTE එක මෙතනට එකතු කළා --- */}
          <Route path="music-player" element={<MusicPlayerPage />} />

          {/* MEMBER 3 PAGES */}
          <Route path="set-limit" element={<SetLimitForm />} />

        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;