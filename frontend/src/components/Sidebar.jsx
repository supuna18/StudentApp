import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShieldCheck,
  Heart,
  Clock,
  LogOut,
  User,
  Users,
  Target,
  Share2,
  Menu,
  X

} from 'lucide-react';

const menuSections = [
  {
    label: 'Menu',
    items: [
      { name: 'Dashboard Home', path: '/student-dashboard',           icon: <LayoutDashboard size={15} strokeWidth={2} /> },
      { name: 'My Profile',      path: '/student-dashboard/profile',    icon: <User size={15} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Security Guard',    path: '/student-dashboard/safety',     icon: <ShieldCheck size={15} strokeWidth={2} /> },
      { name: 'Mindfulness Zone',  path: '/student-dashboard/wellness',   icon: <Heart        size={15} strokeWidth={2} /> },
      { name: 'Usage Limits',      path: '/student-dashboard/set-limit',  icon: <Clock        size={15} strokeWidth={2} /> },
      { name: 'Freedom Path',      path: '/student-dashboard/habit-impact', icon: <Target     size={15} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Collaboration Hub', path: '/hub',                         icon: <Users        size={15} strokeWidth={2} /> },
      { name: 'Shared Resources',  path: '/student-dashboard/resources', icon: <Share2       size={15} strokeWidth={2} /> },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user, setUser] = useState({ name: 'Guest', role: 'Student', initials: 'G' });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const username = decoded.unique_name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
        const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Student';
        
        const initials = username
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        setUser({ name: username, role: role, initials: initials });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .sidebar-root { font-family: 'DM Sans', sans-serif; }
        .sidebar-logo-text { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white border border-[#E8EEFF] rounded-xl shadow-sm text-blue-600"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={`
        sidebar-root bg-white border-r border-[#E8EEFF] h-screen fixed left-0 top-0 flex flex-col z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'}
      `}>

        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-[#F0F4FF]">
          <div className="w-[34px] h-[34px] bg-blue-600 rounded-[9px] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="sidebar-logo-text text-[18px] text-[#0F1C4D] italic">EduSync</span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.label} className="mb-1">

              {/* Section label */}
              <p className="text-[9.5px] font-bold tracking-[2px] uppercase text-slate-300 px-2 mb-1.5 mt-4 first:mt-0">
                {section.label}
              </p>

              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      relative flex items-center gap-2.5 px-3 py-2.5 rounded-[11px]
                      text-[13px] font-medium transition-all duration-150 mb-0.5
                      ${isActive
                        ? 'bg-[#EEF2FF] text-blue-700 font-semibold'
                        : 'text-slate-500 hover:bg-[#F0F4FF] hover:text-blue-600'}
                    `}
                  >
                    {/* Icon box */}
                    <div
                      className={`
                        w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors duration-150
                        ${isActive ? 'bg-[#DDE6FF] text-blue-600' : 'bg-transparent text-slate-400 group-hover:bg-[#DDE6FF]'}
                      `}
                    >
                      {item.icon}
                    </div>

                    {item.name}

                    {/* Active dot */}
                    {isActive && (
                      <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User card + Logout ── */}
        <div className="px-3 pb-4 border-t border-[#F0F4FF] pt-3">

          {/* User card */}
          <div className="flex items-center gap-2.5 bg-[#F8FAFF] border border-[#E8EEFF] rounded-xl px-3 py-2.5 mb-2.5">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
              {user.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[12.5px] font-700 text-[#0F1C4D] leading-tight truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              flex items-center justify-center gap-2 w-full
              px-3 py-2.5 rounded-[10px]
              bg-transparent border border-[#E8EEFF] text-slate-400
              text-[12.5px] font-semibold
              hover:bg-red-50 hover:border-red-200 hover:text-red-500
              active:scale-[0.98] transition-all duration-200
            "
          >
            <LogOut size={13} strokeWidth={2} />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;