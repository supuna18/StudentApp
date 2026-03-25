import { useState, useEffect } from 'react';
import {
  Heart, Users, Shield, TrendingUp, MoreHorizontal,
  RefreshCw, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ─── colour palette (matches AdminDashboard) ─────────────────── */
const BLUE      = '#2255D2';
const LIGHT     = '#4A70F5';
const PALE      = '#93B4FF';
const NAVY      = '#0F1C4D';
const PIE_COLORS = ['#2255D2', '#4A70F5', '#059669', '#F59E0B', '#EF4444', '#8B5CF6'];

/* ─── custom tooltip ──────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-[#0F1C4D] text-white rounded-lg px-3 py-2 text-[11.5px] shadow-lg">
      {label && <div className="font-bold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i}>{p.name}: {p.value}</div>
      ))}
    </div>
  ) : null;

/* ─── empty state ─────────────────────────────────────────────── */
const EmptyState = ({ icon, msg }) => (
  <div className="flex flex-col items-center justify-center h-32 text-slate-300 gap-2">
    <span className="text-3xl">{icon}</span>
    <p className="text-[12px]">{msg}</p>
  </div>
);

/* ─── main component ──────────────────────────────────────────── */
const WellbeingAdminPanel = () => {
  const BASE = 'http://localhost:5005/api/wellbeing';

  const [overview, setOverview] = useState(null);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [ov, us] = await Promise.all([
        fetch(`${BASE}/admin/overview`, { headers }).then(r => r.json()),
        fetch(`${BASE}/admin/users`,    { headers }).then(r => r.json()),
      ]);
      setOverview(ov);
      setUsers(Array.isArray(us) ? us : []);
    } catch (err) {
      setError('Backend-ta connect karana ganna bael vuna. Server eka run karanna.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── stat cards ── */
  const statCards = overview ? [
    { val: overview.usersTracked,    lbl: 'Students Tracked',  icon: <Users size={16}/>,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { val: overview.totalLimitsSet,  lbl: 'Total Limits Set',  icon: <Shield size={16}/>,   color: 'text-violet-600', bg: 'bg-violet-50' },
    { val: `${overview.avgDailyMinutes} min`, lbl: 'Avg Daily Usage', icon: <Activity size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { val: overview.activeStreaks,   lbl: 'Active Streaks',    icon: <TrendingUp size={16}/>, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-[13px] text-slate-400">Loading wellbeing data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold text-[13px] mb-3">⚠️ {error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-[12px] font-600 hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-700 text-[#0F1C4D]">Digital Wellbeing Overview</h2>
          <p className="text-[11.5px] text-slate-400 mt-0.5">Platform-wide screen time limits &amp; usage analytics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8EEFF] rounded-[8px] text-[11.5px] font-600 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-150 disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''}/>
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 border border-[#E8EEFF] rounded-2xl bg-white overflow-hidden">
        {statCards.map(({ val, lbl, icon, color, bg }, i) => (
          <div
            key={i}
            className={`px-6 py-5 hover:bg-[#EEF2FF] transition-colors duration-200 ${i < 3 ? 'border-r border-[#E8EEFF]' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${bg} ${color}`}>
                {icon}
              </span>
              <button className="text-slate-400 hover:text-blue-600 transition-colors">
                <MoreHorizontal size={14}/>
              </button>
            </div>
            <div className="serif-heading text-[34px] text-[#0F1C4D] leading-none tracking-tight mb-1.5 italic"
                 style={{ fontFamily: "'DM Serif Display', serif" }}>
              {val}
            </div>
            <div className="text-[11.5px] text-slate-400">{lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-[1fr_240px] gap-4">

        {/* Bar: Top Domains */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Top Domains by Usage</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
          </div>
          {overview?.topDomains?.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={overview.topDomains} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="domain" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="m"/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="totalMinutes" fill={BLUE} radius={[4,4,0,0]} name="Minutes"/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" msg="No usage data yet"/>
          )}
        </div>

        {/* Pie: Category Distribution */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-700 text-[#0F1C4D]">Category Breakdown</span>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={14}/></button>
          </div>
          {overview?.categoryDistribution?.length ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={overview.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%" cy="50%"
                    innerRadius={35} outerRadius={58}
                    paddingAngle={3}
                  >
                    {overview.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                {overview.categoryDistribution.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px] text-slate-500">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}/>
                    {d.category}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="🥧" msg="No categories yet"/>
          )}
        </div>
      </div>

      {/* ── Per-User Table ── */}
      <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EEFF]">
          <div>
            <p className="text-[13.5px] font-700 text-[#0F1C4D]">Student Wellbeing Summary</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">Per-student screen time, limits &amp; focus streaks</p>
          </div>
          <span className="text-[11px] font-600 text-slate-400">{users.length} student{users.length !== 1 ? 's' : ''}</span>
        </div>

        {users.length === 0 ? (
          <div className="py-16">
            <EmptyState icon="🧘" msg="No student wellbeing data found"/>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F0F4FF]">
                {['Student ID', 'Limits', 'Avg Daily Usage', 'Streak', 'Badges'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9.5px] font-700 tracking-[.8px] uppercase text-slate-400 border-b border-[#E8EEFF] first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-[#EEF2FF] transition-colors duration-150 border-b border-[#E8EEFF] last:border-b-0">
                  <td className="pl-5 pr-4 py-3.5 text-[12px] font-600 text-[#0F1C4D] font-mono">{u.userId}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-700 bg-blue-50 text-blue-700">
                      {u.limitsCount} limit{u.limitsCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-slate-500">
                    {u.avgDailyMinutes} <span className="text-[10px] text-slate-400">min</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-700 ${u.streak > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                      🔥 {u.streak} day{u.streak !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="pr-5 px-4 py-3.5">
                    {u.badges?.length > 0
                      ? <span className="text-[16px] tracking-wide">{u.badges.join(' ')}</span>
                      : <span className="text-[11px] text-slate-300">No badges yet</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default WellbeingAdminPanel;
