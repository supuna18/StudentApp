import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  LayoutDashboard, Users, ShieldAlert, BookOpen, LogOut,
  Activity, MoreHorizontal, Filter, Search, TrendingUp,
  TrendingDown, Minus, Edit2, Trash2, ExternalLink, Send, Heart,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import UserManagement  from './UserManagement';
import SafetyApprovals from './SafetyApprovals';
import ResourceManager from './ResourceManager';
import WellbeingAdminPanel from './WellbeingAdminPanel';
import SystemHealth from './SystemHealth';

/* ─── constants ──────────────────────────────────────────────── */
const PIE_COLORS  = ['#2255D2', '#4A70F5', '#93B4FF'];
const AVT_COLORS  = ['#2255D2', '#4A70F5', '#1843B8', '#6366F1', '#059669'];
const initials    = (n) => n.split(' ').map((w) => w[0]).join('');

const pieData = [
  { name: 'Approved', value: 45 },
  { name: 'Pending',  value: 30 },
  { name: 'Blocked',  value: 25 },
];

const barData = [
  { month: 'Jan', students: 320, reports: 140 },
  { month: 'Feb', students: 410, reports: 180 },
  { month: 'Mar', students: 380, reports: 210 },
  { month: 'Apr', students: 520, reports: 160 },
  { month: 'May', students: 490, reports: 240 },
  { month: 'Jun', students: 610, reports: 195 },
  { month: 'Jul', students: 580, reports: 220 },
  { month: 'Aug', students: 720, reports: 270 },
  { month: 'Sep', students: 680, reports: 300 },
];

const tableRows = [
  { title: 'Mastering Focus in Digital Age',  status: 'Approved', number: '#EDU-001', person: 'Kristin Watson',  type: 'Video'   },
  { title: 'Mental Health for Tech Students', status: 'Pending',  number: '#EDU-002', person: 'Jerome Bell',     type: 'Article' },
  { title: 'Cybersafety Fundamentals',        status: 'Approved', number: '#EDU-003', person: 'Leslie Alexander', type: 'Course'  },
  { title: 'Mindfulness in Learning Spaces',  status: 'Pending',  number: '#EDU-004', person: 'Dianne Russell',  type: 'Video'   },
  { title: 'Digital Wellness for Students',   status: 'Blocked',  number: '#EDU-005', person: 'Wade Warren',     type: 'Article' },
];

const statusConfig = {
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✓' },
  Pending:  { bg: 'bg-orange-50',  text: 'text-orange-600',  icon: '→' },
  Blocked:  { bg: 'bg-red-50',     text: 'text-red-500',     icon: '✕' },
};

const navItems = [
  { id: 'Analytics',        icon: <LayoutDashboard size={14} />, section: 'General' },
  { id: 'User Management',  icon: <Users           size={14} />, section: 'General' },
  { id: 'Safety Approvals', icon: <ShieldAlert     size={14} />, section: 'General' },
  { id: 'Resource Manager', icon: <BookOpen        size={14} />, section: 'General' },
  { id: 'Digital Wellbeing',icon: <Heart           size={14} />, section: 'General' },
  { id: 'System Health',    icon: <Activity        size={14} />, section: 'Other'   },
];

/* ─── custom tooltip ─────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-[#0F1C4D] text-white rounded-lg px-3 py-2 text-[11.5px] shadow-lg">
      {label && <div className="font-bold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i}>{p.name}: {p.value}</div>
      ))}
    </div>
  ) : null;

/* ─── component ──────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('Analytics');
  const [stats, setStats] = useState({
    totalStudents: 0, activeBlocks: 0, pendingReports: 0, systemHealth: '0%',
  });
  const [adminInfo, setAdminInfo] = useState({
    username: 'Admin', email: 'admin@edusync.com', initials: 'AD',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const d = jwtDecode(token);
        const username = d.unique_name || d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Admin';
        const email    = d.email || d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'admin@edusync.com';
        setAdminInfo({ username, email, initials: username.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2) });
      } catch (err) { console.error(err); }
    }
    (async () => {
      try {
        const res = await fetch('http://localhost:5005/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) setStats(await res.json());
      } catch (err) { console.error(err); }
    })();
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/', { replace: true }); };

  /* ── stat cards data ── */
  const statCards = [
    { val: stats.totalStudents.toLocaleString(), badge: '+12%', dir: 'up', lbl: 'Total Students'  },
    { val: stats.activeBlocks.toLocaleString(),  badge: '+5%',  dir: 'up', lbl: 'Active Blocks'   },
    { val: stats.pendingReports.toLocaleString(),badge: '-2',   dir: 'dn', lbl: 'Pending Reports' },
    { val: stats.systemHealth,                   badge: 'Stable',dir: 'fl', lbl: 'System Health'  },
  ];

  /* ── analytics content ── */
  const AnalyticsContent = () => (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 border border-[#E8EEFF] rounded-2xl bg-white overflow-hidden mb-5">
        {statCards.map(({ val, badge, dir, lbl }, i) => (
          <div
            key={i}
            className={`px-6 py-5 hover:bg-[#EEF2FF] transition-colors duration-200 ${i < 3 ? 'border-r border-[#E8EEFF]' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                ${dir === 'up' ? 'bg-emerald-50 text-emerald-700' : dir === 'dn' ? 'bg-red-50 text-red-500' : 'bg-[#EEF2FF] text-slate-400'}`}
              >
                {dir === 'up' ? <TrendingUp size={9}/> : dir === 'dn' ? <TrendingDown size={9}/> : <Minus size={9}/>}
                {badge}
              </span>
              <button className="text-slate-400 hover:text-blue-600 transition-colors">
                <MoreHorizontal size={14}/>
              </button>
            </div>
            <div className="serif-heading text-[34px] text-[#0F1C4D] leading-none tracking-tight mb-1.5 italic">{val}</div>
            <div className="text-[11.5px] text-slate-400">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[220px_1fr] gap-4 mb-5">
        {/* Pie */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Resource Distribution</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-600 text-slate-500">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }}/>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Student & Report Activity</span>
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1 bg-[#F0F4FF] border border-[#E8EEFF] p-1 rounded-lg">
                {['1M','3M','6M','1Y'].map((t) => (
                  <button key={t} className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-700 transition-all duration-150
                    ${t === '1Y' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-600'}`}
                  >{t}</button>
                ))}
              </div>
              <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barGap={4} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="students" fill="#2255D2" radius={[4,4,0,0]} name="Students"/>
              <Bar dataKey="reports"  fill="#93B4FF" radius={[4,4,0,0]} name="Reports"/>
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6, fontFamily: 'DM Sans' }}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EEFF]">
          <div>
            <p className="text-[13.5px] font-700 text-[#0F1C4D]">Educational Resources</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">Manage and review all platform resources</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8EEFF] rounded-[8px] text-[11.5px] font-600 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-150">
              <Filter size={11}/> Filter
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8EEFF] rounded-[8px] bg-[#F0F4FF] min-w-[180px]">
              <Search size={12} className="text-slate-400 flex-shrink-0"/>
              <input
                placeholder="Search resources…"
                className="border-none bg-transparent outline-none text-[12px] text-[#0F1C4D] w-full placeholder:text-slate-400"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>
            <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5"><MoreHorizontal size={14}/></button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F0F4FF]">
              <th className="pl-5 pr-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Title ↕</th>
              <th className="px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Status ↕</th>
              <th className="px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Number ↕</th>
              <th className="px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Responsible Person ↕</th>
              <th className="px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Type</th>
              <th className="pr-5 px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => {
              const s = statusConfig[row.status];
              return (
                <tr key={i} className="hover:bg-[#EEF2FF] transition-colors duration-150 border-b border-[#E8EEFF] last:border-b-0">
                  <td className="pl-5 pr-4 py-3.5 text-[12.5px] font-600 text-[#0F1C4D]">{row.title}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-700 ${s.bg} ${s.text}`}>
                      {s.icon} {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[10.5px] font-600 text-slate-400 font-mono">{row.number}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9.5px] font-800 text-white flex-shrink-0"
                        style={{ background: AVT_COLORS[i % AVT_COLORS.length] }}
                      >
                        {initials(row.person)}
                      </div>
                      <span className="text-[12.5px] text-[#0F1C4D]">{row.person}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[10px] font-700 tracking-[.5px] uppercase text-slate-400">{row.type}</td>
                  <td className="pr-5 px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E8EEFF] rounded-[7px] text-[10.5px] font-600 text-slate-500 hover:border-blue-400 hover:text-blue-600 bg-white transition-all duration-150 whitespace-nowrap">
                        <Send size={9}/> Revise
                      </button>
                      {[<Edit2 size={12}/>, <Trash2 size={12}/>, <ExternalLink size={12}/>].map((ic, j) => (
                        <button key={j} className="w-7 h-7 rounded-[7px] border-none bg-transparent flex items-center justify-center text-slate-400 hover:bg-[#EEF2FF] hover:text-blue-600 transition-all duration-150">
                          {ic}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ── render content ── */
  const tabIcons = {
    'Analytics': <TrendingUp className="text-blue-500" size={20} />,
    'User Management': <Users className="text-indigo-500" size={20} />,
    'Safety Approvals': <ShieldAlert className="text-red-500" size={20} />,
    'Resource Manager': <BookOpen className="text-emerald-500" size={20} />,
    'System Health': <Activity className="text-amber-500" size={20} />,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':         return <AnalyticsContent />;
      case 'User Management':   return <UserManagement />;
      case 'Safety Approvals':  return <SafetyApprovals />;
      case 'Resource Manager':  return <ResourceManager />;
      case 'Digital Wellbeing': return <WellbeingAdminPanel />;
      case 'System Health':     return <SystemHealth />;
      default:                  return <div className="text-slate-400 text-sm mt-10 text-center">Coming Soon…</div>;
    }
  };

  /* ── sidebar sections ── */
  const sidebarSections = ['General', 'Other'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .admin-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.35); } }
        .anim-up { animation: fadeUp .5s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="admin-root flex min-h-screen bg-[#F0F4FF]">

        {/* ─── Sidebar ─────────────────────────────────────── */}
        <aside className="w-[220px] bg-white border-r border-[#E8EEFF] flex flex-col fixed top-0 left-0 bottom-0 z-50">

          {/* Brand */}
          <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#E8EEFF]">
            <div className="w-[34px] h-[34px] bg-blue-600 rounded-[9px] flex items-center justify-center shadow-[0_4px_12px_rgba(34,85,210,0.25)] flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <span className="serif-heading block text-[17px] text-[#0F1C4D] italic leading-tight">EduSync</span>
              <span className="block text-[8.5px] font-700 tracking-[1.8px] uppercase text-blue-600 mt-0.5">Admin Portal</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
            {sidebarSections.map((section) => (
              <div key={section}>
                <p className="text-[9px] font-700 tracking-[2px] uppercase text-slate-300 px-2.5 pt-3 pb-1.5">{section}</p>
                {navItems.filter((n) => n.section === section).map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`
                        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px]
                        text-[12.5px] font-500 transition-all duration-150 mb-0.5 text-left
                        ${isActive
                          ? 'bg-blue-600 text-white font-600 shadow-[0_4px_12px_rgba(34,85,210,0.25)]'
                          : 'text-slate-500 hover:bg-[#EEF2FF] hover:text-blue-600'}
                      `}
                    >
                      <span className={isActive ? 'opacity-100' : 'opacity-70'}>{item.icon}</span>
                      {item.id}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-2.5 pb-4 border-t border-[#E8EEFF] pt-3">
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-2">
              <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-[11px] font-800 text-white flex-shrink-0">
                {adminInfo.initials}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[12px] font-700 text-[#0F1C4D] truncate">{adminInfo.username}</p>
                <p className="text-[10.5px] text-slate-400 truncate">{adminInfo.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-[10px] bg-transparent border border-[#E8EEFF] text-slate-400 text-[12px] font-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 active:scale-[0.98] transition-all duration-200"
            >
              <LogOut size={13}/> Logout
            </button>
          </div>
        </aside>

        {/* ─── Main ─────────────────────────────────────────── */}
        <div className="flex-1 ml-[220px] flex flex-col min-h-screen">

          {/* Topbar */}
          <div className="bg-white border-b border-[#E8EEFF] px-8 py-4 flex items-center justify-between sticky top-0 z-40 anim-up">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="serif-heading text-[22px] text-[#0F1C4D] italic leading-tight">{activeTab}</h1>
                <span className="opacity-80">{tabIcons[activeTab]}</span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">Real-time monitoring and administrative controls.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#EEF2FF] border border-blue-200/50 rounded-full text-[11.5px] font-700 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" style={{ animation: 'pulse 2s infinite' }}/>
                System Live
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;