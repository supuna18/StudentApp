import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard Home', path: '/student-dashboard', icon: '🏠' },
    { name: 'Security Guard', path: '/student-dashboard/safety', icon: '🛡️' },
    { name: 'Mindfulness Zone', path: '/student-dashboard/wellness', icon: '🧘' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col shadow-2xl z-50">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400 italic">EduSync</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-4 rounded-xl transition ${
              location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button className="w-full bg-slate-800 p-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;