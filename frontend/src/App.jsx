import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";

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

          {/* 3. Student Dashboard (Member 1, 2, 3 සඳහා) */}
          <Route path="/student-dashboard" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-black text-blue-900 mb-4">Student Dashboard</h1>
                <p className="text-slate-500">Welcome back! Your focus session is ready.</p>
              </div>
            </div>
          } />

          {/* 4. Admin Dashboard (Member 4 - ඔයා සඳහා) */}
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