import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, Activity, Clock, Shield, Search, RefreshCcw, 
  Download, Filter, TrendingUp, MoreVertical, LayoutGrid,
  Mail, ExternalLink, ShieldCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const WellbeingAdminPanel = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalLimits: 0, avgUsage: 0, activeStreaks: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [studentSummary, setStudentSummary] = useState([]);
  const [usageTrend, setUsageTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch('http://localhost:5005/api/wellbeing/admin/overview');
      const summariesRes = await fetch('http://localhost:5005/api/wellbeing/admin/users');
      
      const statsData = await statsRes.json();
      const summariesData = await summariesRes.json();

      setStats({
        totalStudents: statsData.usersTracked || 0,
        totalLimits: statsData.totalLimitsSet || 0,
        avgUsage: statsData.avgDailyMinutes || 0,
        activeStreaks: statsData.activeStreaks || 0
      });

      setCategoryData(Array.isArray(statsData.categoryDistribution) ? statsData.categoryDistribution : []);
      setStudentSummary(Array.isArray(summariesData) ? summariesData : []);
      
      // Real or Mocked Trend
      setUsageTrend(statsData.topDomains?.map(d => ({ name: d.domain, mins: d.totalMinutes })) || []);
      
      setLoading(false);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const downloadReport = async () => {
    const input = document.getElementById('wellbeing-admin-report');
    if (!input) return;
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgW = 190;
      const imgH = (canvas.height * imgW) / canvas.width;
      pdf.setFontSize(20);
      pdf.text("EDUSYNC WELLBEING INTELLIGENCE", 15, 20);
      pdf.addImage(imgData, 'PNG', 10, 30, imgW, imgH);
      pdf.save(`Wellbeing_Admin_Summary_${Date.now()}.pdf`);
    } catch (err) { console.error(err); }
  };

  const filteredStudents = Array.isArray(studentSummary) ? studentSummary.filter(s => 
    (s.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Activity className="text-primary animate-spin mr-3" />
      <span className="font-bold text-slate-500">Loading Wellbeing Intelligence...</span>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div id="wellbeing-admin-report">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-primary/5 flex items-center justify-center text-primary">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-primary text-[9px] font-black text-white uppercase tracking-tighter">Admin Console</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Live</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                Wellbeing <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Intelligence</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={fetchAdminData} 
              className="p-3.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-90"
              title="Refresh Data"
            >
              <RefreshCcw size={20} className="text-slate-600" />
            </button>
            <button 
              onClick={downloadReport} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Download size={20} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Tracked Students', val: stats.totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Configured Limits', val: stats.totalLimits, icon: ShieldCheck, color: 'text-secondary', bg: 'bg-secondary/10' },
            { label: 'Avg usage (Mins)', val: stats.avgUsage, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Active Streaks', val: stats.activeStreaks, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`${s.bg} p-4 rounded-2xl ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{s.val}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Trend */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <TrendingUp size={20} className="text-primary" />
              High-Traffic Nodes
            </h3>
            <div className="h-[300px] w-full">
              {usageTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="mins" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-300">No trend data available.</div>}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <LayoutGrid size={20} className="text-secondary" />
              Resource Allocation
            </h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="count">
                      {categoryData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} cornerRadius={8} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="text-slate-300">No category distribution found.</div>}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS[i % COLORS.length]}} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Management Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Student Behavioral Summary</h3>
              <p className="text-sm text-slate-400">Total of {filteredStudents.length} active monitors linked.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                  <th className="px-8 py-5">Profile</th>
                  <th className="px-8 py-5">Limits</th>
                  <th className="px-8 py-5">Daily Usage</th>
                  <th className="px-8 py-5">Streak</th>
                  <th className="px-8 py-5">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-primary/10/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                            {s.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{s.username}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1"><Mail size={10}/> {s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                          {s.limitsCount} Configured
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[80px]">
                            <div className="bg-primary h-full" style={{width: `${Math.min(s.avgDailyMinutes, 100)}%`}} />
                          </div>
                          <span className="text-xs font-black text-slate-700">{s.avgDailyMinutes}m</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-primary text-sm italic">
                        🔥 {s.streak} Days
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-1">
                          {s.badges && s.badges.length > 0 ? (
                            s.badges.slice(0, 3).map((b, idx) => (
                              <span key={idx} className="text-lg" title={b}>{b}</span>
                            ))
                          ) : <span className="text-slate-300 italic text-[10px]">No badges</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">No matching telemetry report found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellbeingAdminPanel;


