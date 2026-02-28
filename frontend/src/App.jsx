import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";


// --- YOUR NEW IMPORTS (DO NOT REMOVE OTHERS) ---
import HubPage from "./pages/HubPage";
import StudyGroupsPage from "./pages/StudyGroupsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-600">
        
        <Routes>
          {/* 1. ප්‍රධාන Landing Page එක (Navbar සහ Footer සහිතව) */}
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

          {/* 2. Login Page එක (Navbar/Footer නැතිව පිරිසිදුව පෙන්වීමට) */}
          <Route path="/login" element={<Login />} />
          

          {/* --- 3. YOUR NEW ROUTES (COLLABORATION HUB) --- */}
          <Route path="/hub" element={<HubPage />} />
          <Route path="/hub/study-groups" element={<StudyGroupsPage />} />
          <Route path="/hub/scheduler" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <h1 className="text-2xl font-bold text-slate-400 text-center">
                Scheduler Module <br/> <span className="text-sm font-normal text-slate-300 italic">Coming Soon</span>
                <br/>
                <a href="/hub" className="text-blue-500 text-sm underline mt-4 inline-block">Back to Hub</a>
              </h1>
            </div>
          } />
          {/* --------------------------------------------- */}

          {/* 4. Student Dashboard (Member 1, 2, 3 සඳහා) */}
          <Route path="/student-dashboard" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-black text-blue-900 mb-4">Student Dashboard</h1>
                <p className="text-slate-500">Welcome back! Your focus session is ready.</p>
                {/* Link to your hub so you can access it from here */}
                <a href="/hub" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Open Collaboration Hub</a>
              </div>
            </div>
          } />

          {/* 5. Admin Dashboard (Member 4 - ඔයා සඳහා) */}
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