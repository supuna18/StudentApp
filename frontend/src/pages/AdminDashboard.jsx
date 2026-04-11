import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  LayoutDashboard, Users, ShieldAlert, BookOpen, LogOut,
  Activity, MoreHorizontal, Filter, Search, TrendingUp,
  TrendingDown, Minus, Edit2, Trash2, ExternalLink, Send, Heart, Download, Layers
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line, Area
} from 'recharts';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import UserManagement  from './UserManagement';
import SafetyApprovals from './SafetyApprovals';
import ResourceManager from './ResourceManager';
import WellbeingAdminPanel from './WellbeingAdminPanel';
import SystemHealth from './SystemHealth';

/* ─── constants ──────────────────────────────────────────────── */
const PIE_COLORS  = ['#2255D2', '#4A70F5', '#93B4FF'];
const AVT_COLORS  = ['#2255D2', '#4A70F5', '#1843B8', '#6366F1', '#059669'];
const initials    = (n) => (n || "U").split(' ').map((w) => w[0]).join('');


// barData and tableRows are now fetched from the database

// Resources table row data is now dynamic

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
  // navItems array kulla idhai add pannunga
  { id: 'Collaboration Hub', icon: <Layers size={14} />, section: 'General' },
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

  /* ─── COLLABORATION HUB COMPONENT ─── */
const CollaborationHubManager = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('http://localhost:5005/api/studygroups/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setGroups(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchGroups();
  }, [token]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Study Groups Intelligence Report", 15, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Group Name', 'Subject', 'Owner', 'Members']],
      body: groups.map(g => [g.groupName || g.GroupName, g.subject || g.Subject, g.createdByEmail || g.CreatedByEmail, (g.members || g.Members)?.length || 0]),
      theme: 'striped'
    });
    doc.save("Hub_Report.pdf");
  };

  if (loading) return <div className="p-10 text-slate-400 font-bold animate-pulse text-xs">SCANNING HUB DATA...</div>;

  return (
    <div className="anim-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Layers size={24}/></div>
           <div><p className="text-2xl font-black italic text-[#0F1C4D]">{groups.length}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Active Circles</p></div>
        </div>
        <button onClick={downloadPDF} className="bg-[#0F1C4D] p-6 rounded-2xl text-white shadow-lg flex items-center justify-between hover:bg-blue-900 transition-all">
          <div className="text-left"><p className="font-bold text-sm">Download Report</p><p className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">Export PDF Intelligence</p></div>
          <Download size={24}/>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEFF] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E8EEFF] bg-[#F8FAFF]"><p className="text-[13px] font-black italic text-[#0F1C4D] uppercase">Circle Monitoring Summary</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50"><th className="p-4">Group/Subject</th><th className="p-4">Owner</th><th className="p-4 text-right">Population</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {groups.map((g, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4"><p className="text-xs font-bold text-slate-700">{g.groupName || g.GroupName}</p><p className="text-[10px] text-blue-500 font-bold">{g.subject || g.Subject}</p></td>
                  <td className="p-4 text-[11px] text-slate-500 font-mono italic">{g.createdByEmail || g.CreatedByEmail}</td>
                  <td className="p-4 text-right font-black text-[#0F1C4D] text-sm">{(g.members || g.Members)?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── component ──────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('Analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0, activeBlocks: 0, pendingReports: 0, systemHealth: '0%',
  });
  const [adminInfo, setAdminInfo] = useState({
    username: 'Admin', email: 'admin@edusync.com', initials: 'AD',
  });

  const [pieData, setPieData] = useState([]);
  const [safetyPieData, setSafetyPieData] = useState([]);
  const [resourceByTypeData, setResourceByTypeData] = useState([]);
  const [safetyApprovalsCount, setSafetyApprovalsCount] = useState({ pending: 0, approved: 0 });
  const [barData, setBarData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [timeframe, setTimeframe] = useState('6M');
  const [trendType, setTrendType] = useState('monthly'); // 'weekly' or 'monthly'

  const fetchAnalytics = async (tf, type) => {
    console.log(`Fetching analytics for timeframe: ${tf}, type: ${type}`);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const monthsMap = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
      const months = monthsMap[tf] || 6;

      const url = `http://localhost:5005/api/admin/analytics?months=${months}&type=${type}`;
      const analyticsRes = await fetch(url, { headers });
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        console.log("Analytics data received:", data);
        const pData = [
          { name: 'Approved', value: data.distribution.approved },
          { name: 'Pending', value: data.distribution.pending },
        ];
        // Ensure pie shows a default uncolored slice if completely zero
        setPieData(pData.every(d => d.value === 0) ? [{ name: 'No Resources', value: 1, fill: '#E8EEFF' }] : pData);
        
        // Map robust Resource types
        if (data.distribution.byType && data.distribution.byType.length > 0) {
          const mappedByType = data.distribution.byType.map(item => ({
            name: item._id || 'Unknown',
            value: item.count
          }));
          setResourceByTypeData(mappedByType);
        } else {
          setResourceByTypeData([{ name: 'No Resources', value: 0 }]);
        }

        setSafetyPieData([
          { name: 'Pending', value: data.safetyDistribution.pending },
          { name: 'Approved', value: data.safetyDistribution.approved },
          { name: 'Blocked', value: data.safetyDistribution.blocked },
        ]);
        
        setSafetyApprovalsCount({
          pending: data.safetyDistribution.pending || 0,
          approved: data.safetyDistribution.approved || 0
        });

        setBarData(data.trends);
      } else {
        console.error("Failed to fetch analytics:", analyticsRes.status, analyticsRes.statusText);
        const errText = await analyticsRes.text();
        console.error("Error details:", errText);
      }
    } catch (err) {
      console.error("Error in fetchAnalytics:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const d = jwtDecode(token);
        const username = d.unique_name || d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Admin';
        const email    = d.email || d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'admin@edusync.com';
        setAdminInfo({ username, email, initials: username.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2) });
      } catch (err) { console.error("JWT Decode error:", err); }
    }
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Basic Stats
        console.log("Fetching basic stats...");
        const statsRes = await fetch('http://localhost:5005/api/admin/stats', { headers });
        if (statsRes.ok) {
          const sData = await statsRes.json();
          console.log("Stats received:", sData);
          setStats(sData);
        } else {
          console.error("Failed to fetch stats:", statsRes.status);
        }

        // Initial Analytics
        await fetchAnalytics(timeframe, trendType);

        // Resources Table
        console.log("Fetching resources...");
        const resourcesRes = await fetch('http://localhost:5005/api/admin/resources', { headers });
        if (resourcesRes.ok) {
          const rData = await resourcesRes.json();
          console.log("Resources received:", rData.length);
          setTableRows(rData.map(r => ({
            id: r.id || r._id,
            title: r.title,
            status: r.isApproved ? 'Approved' : 'Pending',
            number: '#RES-' + (r.id || r._id).substring(0, 5).toUpperCase(),
            person: 'User ' + r.userId.substring(0, 5),
            type: r.fileType || 'File'
          })));
        } else {
          console.error("Failed to fetch resources:", resourcesRes.status);
        }
      } catch (err) { console.error("Error in main useEffect:", err); }
    })();
  }, []);

  useEffect(() => {
    if (activeTab === 'Analytics') {
      fetchAnalytics(timeframe, trendType);
    }
  }, [timeframe, trendType]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/', { replace: true }); };

  const downloadReport = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // EduSync Header styling
      pdf.setFillColor(15, 28, 77); // #0F1C4D
      pdf.rect(0, 0, 210, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("EduSync", 15, 18);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Administrative Analytics", 15, 28);
      
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 130, 28);

      pdf.setTextColor(15, 28, 77); // Reset to dark colors for text
      
      // 1. Key Statistics Table
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Key Platform Statistics", 15, 50);
      
      autoTable(pdf, {
        startY: 55,
        head: [['Metric', 'Value']],
        body: [
          ['Total Students', stats.totalStudents.toString()],
          ['Active Blocks', stats.activeBlocks.toString()],
          ['Pending Reports', stats.pendingReports.toString()],
          ['System Health', stats.systemHealth.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 85, 210] }, // #2255D2
        margin: { left: 15, right: 15 }
      });

      // 2. Resource Distribution Table
      const nextY2 = pdf.lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.text("Resource Distribution by Type", 15, nextY2);
      
      autoTable(pdf, {
        startY: nextY2 + 5,
        head: [['Resource Type', 'Count']],
        body: resourceByTypeData.map(r => [r.name, r.value.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [34, 85, 210] },
        margin: { left: 15, right: 15 }
      });

      // 3. Detailed Educational Resources Table
      const nextY3 = pdf.lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.text("Detailed Educational Resources", 15, nextY3);
      
      autoTable(pdf, {
        startY: nextY3 + 5,
        head: [['Title', 'Status', 'Ref No.', 'Owner', 'Type']],
        body: tableRows.map(row => [
          row.title || 'N/A', 
          row.status || 'N/A', 
          row.number || 'N/A', 
          row.person || 'N/A', 
          row.type || 'N/A'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [34, 85, 210] },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });

      pdf.save(`EduSync_Analytics_Report_${Date.now()}.pdf`);
    } catch (err) { console.error("Error generating PDF:", err); }
  };

  
  /* ── stat cards data ── */
  const statCards = [
    { val: stats.totalStudents.toLocaleString(), badge: '+12%', dir: 'up', lbl: 'Total Students'  },
    { val: stats.activeBlocks.toLocaleString(),  badge: '+5%',  dir: 'up', lbl: 'Active Blocks'   },
    { val: stats.pendingReports.toLocaleString(),badge: '-2',   dir: 'dn', lbl: 'Pending Reports' },
    { val: stats.systemHealth,                   badge: 'Stable',dir: 'fl', lbl: 'System Health'  },
  ];

  /* ── analytics content ── */
  const AnalyticsContent = () => (
    <div id="admin-analytics-report">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E8EEFF] rounded-2xl bg-white overflow-hidden mb-5">
        {statCards.map(({ val, badge, dir, lbl }, i) => (
          <div
            key={i}
            className={`px-6 py-5 hover:bg-[#EEF2FF] transition-colors duration-200 ${i < 3 ? 'lg:border-r border-[#E8EEFF]' : ''} ${i % 2 === 0 ? 'sm:border-r' : ''} border-b lg:border-b-0`}
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
            <div className="serif-heading text-[28px] md:text-[34px] text-[#0F1C4D] leading-none tracking-tight mb-1.5 italic">{val}</div>
            <div className="text-[11px] md:text-[11.5px] text-slate-400">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Resource & Safety KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Pie: Resource Distribution */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Resource Distribution</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
          </div>
          <div className="flex-1 h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Resource by Type */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Resources by Type</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
          </div>
          <div className="flex-1 h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={resourceByTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEFF"/>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="value" fill="#4A70F5" radius={[4,4,0,0]} name="Count"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Approvals KPI */}
        <div className="bg-gradient-to-br from-[#0F1C4D] to-[#1E3A8A] border border-[#0F1C4D] rounded-2xl p-6 text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
          {/* Background decoration */}
          <ShieldAlert className="absolute -right-6 -bottom-6 text-white/5" size={140} />
          
          <div className="relative z-10">
            <h3 className="text-[13px] font-700 text-white/80 uppercase tracking-wider mb-6">Safety Approvals</h3>
            
            <div className="flex justify-between items-end mb-5">
              <div>
                <p className="text-[12px] text-white/70 mb-1">Pending Review</p>
                <p className="font-serif text-4xl font-bold leading-none">{safetyApprovalsCount.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-400/20 text-orange-400 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/10 mb-5"></div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[12px] text-white/70 mb-1">Approved Safe</p>
                <p className="text-2xl font-bold leading-none text-emerald-400">{safetyApprovalsCount.approved}</p>
              </div>
              <div className="text-[11px] bg-white/10 px-2 py-1 rounded font-semibold text-emerald-300">
                Action Required: {safetyApprovalsCount.pending > 0 ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5 mb-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-700 text-[#0F1C4D]">Activity Trends</span>
            <div className="flex bg-[#F0F4FF] p-1 rounded-lg">
              <button 
                onClick={() => setTrendType('monthly')}
                className={`px-3 py-1 text-[10px] font-700 rounded-md transition-all ${trendType === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >Monthly</button>
              <button 
                onClick={() => setTrendType('weekly')}
                className={`px-3 py-1 text-[10px] font-700 rounded-md transition-all ${trendType === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >Weekly</button>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1 bg-[#F0F4FF] border border-[#E8EEFF] p-1 rounded-lg">
              {['1M','3M','6M','1Y'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-700 transition-all duration-150
                    ${t === timeframe ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-600'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[500px]">
            <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 10 }}/>
              <Area yAxisId="left" type="monotone" dataKey="students" fill="#EEF2FF" stroke="#2255D2" strokeWidth={2} name="New Students" />
              <Bar yAxisId="right" dataKey="reports" fill="#F59E0B" radius={[4,4,0,0]} name="Safety Reports" barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-4 border-b border-[#E8EEFF] gap-4">
          <div>
            <p className="text-[13.5px] font-700 text-[#0F1C4D]">Educational Resources</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">Manage and review all platform resources</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8EEFF] rounded-[8px] text-[11.5px] font-600 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-150">
              <Filter size={11}/> Filter
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8EEFF] rounded-[8px] bg-[#F0F4FF] flex-1 md:min-w-[180px]">
              <Search size={12} className="text-slate-400 flex-shrink-0"/>
              <input
                placeholder="Search resources…"
                className="border-none bg-transparent outline-none text-[12px] text-[#0F1C4D] w-full placeholder:text-slate-400"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
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
    </div>
  );

  /* ── render content ── */
  const tabIcons = {
    'Analytics': <TrendingUp className="text-blue-500" size={20} />,
    'User Management': <Users className="text-indigo-500" size={20} />,
    // tabIcons object kulla idhai add pannunga
    'Collaboration Hub': <Layers className="text-emerald-500" size={20} />,
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
      // renderContent switch case kulla idhai add pannunga
case 'Collaboration Hub': return <CollaborationHubManager token={localStorage.getItem('token')} />;
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

        {/* ─── Mobile Sidebar Toggle ─── */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-white border border-[#E8EEFF] rounded-xl shadow-md text-blue-600"
        >
          {isSidebarOpen ? <Trash2 size={20} /> : <MoreHorizontal size={20} />}
        </button>

        {/* ─── Sidebar ─────────────────────────────────────── */}
        <aside className={`
          w-[220px] bg-white border-r border-[#E8EEFF] flex flex-col fixed top-0 bottom-0 z-50 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

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
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
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

        {/* ─── Overlay ─── */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
        )}

        {/* ─── Main ─────────────────────────────────────────── */}
        <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen transition-all duration-300">

          {/* Topbar */}
          <div className="bg-white border-b border-[#E8EEFF] px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-40 anim-up gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="serif-heading text-[20px] md:text-[22px] text-[#0F1C4D] italic leading-tight">{activeTab}</h1>
                <span className="opacity-80">{tabIcons[activeTab]}</span>
              </div>
              <p className="text-[11px] md:text-[12px] text-slate-400 mt-0.5">Real-time monitoring and administrative controls.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'Analytics' && (
                <button 
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] text-[12px] font-bold shadow-[0_4px_12px_rgba(34,85,210,0.25)] hover:shadow-[0_6px_16px_rgba(34,85,210,0.35)] transition-all active:scale-[0.98]"
                >
                  <Download size={14} strokeWidth={2.5}/> Download Report
                </button>
              )}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#EEF2FF] border border-blue-200/50 rounded-[10px] text-[10px] md:text-[11.5px] font-700 text-blue-600 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" style={{ animation: 'pulse 2s infinite' }}/>
                System Live
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;