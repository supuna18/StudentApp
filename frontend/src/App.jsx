import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";

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

          {/* 2. Login Page එක */}
          <Route path="/login" element={<Login />} />

          {/* 3. Student Dashboard (Member 1, 2, 3 සඳහා) */}
          <Route path="/student-dashboard" element={
            <div className="min-h-screen bg-slate-50 p-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-blue-900 mb-4">Student Dashboard</h1>
                  <p className="text-slate-500">Welcome back! Your focus session is ready.</p>
                </div>

                {/* --- MEMBER 2 SECTION START --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ආරක්ෂාව සඳහා Link එකක් Report කරන කොටස */}
                  <ReportSite />

                  {/* විවේකයක් ගැනීමට Mindfulness කොටස */}
                  <MindfulnessZone />
                </div>
                {/* --- MEMBER 2 SECTION END --- */}

                {/* අනාගතයේදී Member 1 සහ 3 ගේ කොටස් මේ යටින් එකතු කළ හැක */}
              </div>
            </div>
          } />

          {/* 4. Admin Dashboard (Member 4) */}
          <Route path="/admin-dashboard" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
              <div className="text-center">
                <h1 className="text-4xl font-black text-blue-400 mb-4">Admin Control Center</h1>
                <p className="text-slate-400">System-wide monitoring and resource management active.</p>
              </div>
            </div>
          } />
        </Routes>

      </div>
    </Router>
  );
}

export default App;