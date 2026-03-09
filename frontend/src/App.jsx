import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from './pages/ChatPage'; 
import SchedulerPage from './pages/SchedulerPage';
import CalendarPage from './pages/CalendarPage';
import AlarmPage from './pages/AlarmPage';

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
          {/* 1. Public Pages */}
          <Route path="/" element={<><Navbar /><main><Hero /><Features /></main><Footer /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 2. YOUR PART: Collaboration Hub Management System */}
          <Route path="/hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
          <Route path="/hub/study-groups" element={<ProtectedRoute><StudyGroupsPage /></ProtectedRoute>} />
          
          <Route path="/chat/:groupId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          
          {/* [FIXED] මෙතන අන්තිමට තියෙන '?' ලකුණ නිසා /hub/scheduler විතරක් ගැහුවත් පේජ් එක ලෝඩ් වෙනවා */}
          <Route path="/hub/scheduler/:groupId?" element={<ProtectedRoute><SchedulerPage /></ProtectedRoute>} />
          
          <Route path="/hub/calendar/:groupId" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/hub/alarms/:groupId" element={<ProtectedRoute><AlarmPage /></ProtectedRoute>} />

          {/* 3. Student Dashboard */}
          <Route path="/student-dashboard/*" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* 4. Admin Dashboard */}
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