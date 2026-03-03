import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Sidebar from "./components/Sidebar"; // Sidebar Component එක
import SetLimitForm from './components/Wellbeing/SetLimitForm';

// --- MEMBER 2 COMPONENTS IMPORT ---
import ReportSite from './components/Safety/ReportSite';
import MindfulnessZone from './components/Safety/MindfulnessZone';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-600">
        
        <Routes>
          {/* 1. ප්‍රධාන Landing Page එක */}
          <Route path="/" element={
            <>
              <Navbar />
              <main>
                <Hero />
                <Features />
              </main>
              <Footer />
            </>
          } />

          {/* 2. Login & Signup Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 3. Student Dashboard (Restructured with Sidebar, Sub-routes & Advanced UI) */}
          <Route path="/student-dashboard/*" element={
            <div className="flex min-h-screen bg-slate-50">
              {/* Dashboard Sidebar */}
              <Sidebar />
              
              {/* Main Content Area with Background Animations */}
              <div className="flex-1 ml-64 p-10 relative overflow-hidden">
                
                {/* --- ADVANCED BACKGROUND DECORATION --- */}
                {/* ඉහළ දකුණු පස ඇති නිල් පාට Blur Circle එක */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
                {/* පහළ වම් පස ඇති දම් පාට Blur Circle එක */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] opacity-30 -z-10 animate-bounce"></div>

                {/* Sub-routes for Member Features */}
                <Routes>
                  {/* Dashboard Home - Default view */}
                  <Route path="/" element={
                    <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
                      <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">
                        Student Dashboard
                      </h1>
                      <p className="text-slate-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                        Welcome back! Your personal workspace is ready for a productive session.
                      </p>
                      
                      {/* Placeholders for other members */}
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

                {/* --- MEMBER 1 PAGES (ඔයාගේ DIGITAL WELLBEING එක) --- */}
                  <Route path="/set-limit" element={
                    <div className="max-w-3xl mx-auto py-6">
                      <SetLimitForm />
                    </div>
                  } />

                  {/* --- MEMBER 2 PAGES (CRUD & ANIMATIONS INTEGRATED) --- */}






                  {/* --- MEMBER 2 PAGES (CRUD & ANIMATIONS INTEGRATED) --- */}
                  <Route path="/safety" element={
                    <div className="max-w-3xl mx-auto py-6">
                      <ReportSite />
                    </div>
                  } />

                  <Route path="/wellness" element={
                    <div className="max-w-2xl mx-auto py-6">
                      <MindfulnessZone />
                    </div>
                  } />
                </Routes>
              </div>
            </div>
          } />

          {/* 4. Admin Dashboard (Member 4) */}
          <Route path="/admin-dashboard" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
              <div className="text-center">
                <h1 className="text-4xl font-black text-blue-400 mb-4 tracking-tighter">Admin Control Center</h1>
                <p className="text-slate-400 font-medium">System-wide monitoring and resource management active.</p>
              </div>
            </div>
          } />
        </Routes>

      </div>
    </Router>
  );
}

export default App;