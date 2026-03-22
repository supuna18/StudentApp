import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";
import HubPage from "./pages/HubPage";
import StudyGroupsPage from "./pages/StudyGroupsPage";

// --- NEW IMPORT ---
import MusicPlayerPage from './pages/MusicPlayerPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<><Navbar /><main><Hero /><Features /></main><Footer /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
          <Route path="/hub/study-groups" element={<ProtectedRoute><StudyGroupsPage /></ProtectedRoute>} />
          <Route path="/hub/scheduler" element={<ProtectedRoute><div className="p-20 text-center font-bold">Scheduler Module Coming Soon</div></ProtectedRoute>} />

          <Route path="/student-dashboard/*" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* NEW ROUTE FOR MUSIC PLAYER */}
          <Route path="/student-dashboard/music-player" element={
            <ProtectedRoute>
              <MusicPlayerPage />
            </ProtectedRoute>
          } />

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