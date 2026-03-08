import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard"; // Sidebar Component එක
import SetLimitForm from './components/Wellbeing/SetLimitForm';

import StudentDashboard from "./pages/StudentDashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";

// --- YOUR IMPORTS (Collaboration Hub) ---
import HubPage from "./pages/HubPage";
import StudyGroupsPage from "./pages/StudyGroupsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        
        <Routes>
          {/* 1. Public Pages (Leader's Part) */}
          <Route path="/" element={<><Navbar /><main><Hero /><Features /></main><Footer /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 2. YOUR PART: Collaboration Hub Management System */}
          <Route path="/hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
          <Route path="/hub/study-groups" element={<ProtectedRoute><StudyGroupsPage /></ProtectedRoute>} />
          {/* Placeholder for your Module 02 from the slide */}
          <Route path="/hub/scheduler" element={<ProtectedRoute><div className="p-20 text-center font-bold">Scheduler Module Coming Soon</div></ProtectedRoute>} />

          {/* 3. Student Dashboard (Leader's Part) */}
          <Route path="/student-dashboard/*" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* 4. Admin Dashboard (Member 4's Part) */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>

      </div>
    </Router>
  );
}

export default App;