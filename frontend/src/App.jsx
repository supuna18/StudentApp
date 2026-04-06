import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WellbeingSection from "./components/WellbeingSection";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";

// HEAD features
import ChatPage from './pages/ChatPage';
import SchedulerPage from './pages/SchedulerPage';
import CalendarPage from './pages/CalendarPage';
import AlarmPage from './pages/AlarmPage';

// Common
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HubPage from "./pages/HubPage";
import StudyGroupsPage from "./pages/StudyGroupsPage";

// NEW
import MusicPlayerPage from './pages/MusicPlayerPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">

        <Routes>

          {/* 1. Public Pages */}
          <Route path="/" element={
            <>
              <Navbar />
              <main>
                <Hero />
                <WellbeingSection />
                <Features />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 2. Collaboration Hub */}
          <Route path="/hub" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <HubPage />
            </ProtectedRoute>
          } />

          <Route path="/hub/study-groups" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudyGroupsPage />
            </ProtectedRoute>
          } />

          {/* Chat */}
          <Route path="/chat/:groupId" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <ChatPage />
            </ProtectedRoute>
          } />

          {/* Scheduler (optional groupId) */}
          <Route path="/hub/scheduler/:groupId?" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <SchedulerPage />
            </ProtectedRoute>
          } />

          {/* Calendar */}
          <Route path="/hub/calendar/:groupId" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <CalendarPage />
            </ProtectedRoute>
          } />

          {/* Alarm */}
          <Route path="/hub/alarms/:groupId" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <AlarmPage />
            </ProtectedRoute>
          } />

          {/* 3. Student Dashboard */}
          <Route path="/student-dashboard/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Music Player */}
          <Route path="/student-dashboard/music-player" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <MusicPlayerPage />
            </ProtectedRoute>
          } />

          {/* 4. Admin Dashboard */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;