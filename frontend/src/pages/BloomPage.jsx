import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Settings, ChevronLeft, ChevronRight, Plus, 
  Thermometer, Smile, Activity, ExternalLink, Calendar as CalendarIcon, 
  X, Trash2, CheckCircle2, Info, Sparkles, Clock
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const BloomPage = () => {
  // --- State ---
  const [user, setUser] = useState({ name: 'User' });
  const [periods, setPeriods] = useState([]);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [dailyLogs, setDailyLogs] = useState({});
  const [selectedDailyLog, setSelectedDailyLog] = useState({ flow: 'Normal', mood: 'Balanced', note: '', symptoms: [] });
  const [newPeriodDate, setNewPeriodDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // --- Initialize Metadata ---
  const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const response = await fetch(`http://localhost:5005/api/bloom${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  };

  const fetchBloomData = async () => {
    try {
        setLoading(true);
        const data = await apiFetch('/data');
        setPeriods(data.periods.sort((a,b) => new Date(b.startDate) - new Date(a.startDate)));
        
        const logsMap = {};
        data.dailyLogs.forEach(l => {
            const d = l.date.split('T')[0];
            logsMap[d] = l;
        });
        setDailyLogs(logsMap);
        setPeriodDuration(data.settings.periodDuration);
    } catch (e) {
        console.error("Fetch error", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const username = decoded.unique_name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
        setUser({ name: username });
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
    fetchBloomData();
  }, []);

  // --- Logical Helpers ---
  const lastPeriodDate = useMemo(() => {
    if (periods.length === 0) return null;
    return new Date(periods[0].startDate);
  }, [periods]);

  const cycleStats = useMemo(() => {
    if (!lastPeriodDate) return { day: 1, nextPeriod: null, ovulation: null, fertileStart: null, fertileEnd: null };
    const today = new Date();
    const diffTime = today - lastPeriodDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const day = (diffDays % 28) + 1;

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const nextPeriod = addDays(lastPeriodDate, 28);
    const fertileStart = addDays(lastPeriodDate, 10);
    const fertileEnd = addDays(lastPeriodDate, 15);
    const ovulation = addDays(lastPeriodDate, 13);

    return { day, nextPeriod, ovulation, fertileStart, fertileEnd };
  }, [lastPeriodDate]);

  const daysToFertile = useMemo(() => {
    if (!cycleStats.fertileStart) return 0;
    const today = new Date();
    if (today >= cycleStats.fertileStart && today <= cycleStats.fertileEnd) return 0;
    const diff = cycleStats.fertileStart - today;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [cycleStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const phaseDetails = useMemo(() => {
    const d = cycleStats.day;
    if (d <= periodDuration) return { name: "Menstrual", color: "text-rose-600", heroBg: "bg-[#B33045]" };
    if (d <= 11) return { name: "Follicular", color: "text-emerald-600", heroBg: "bg-[#7A9D8C]" };
    if (d <= 16) return { name: "Ovulation", color: "text-rose-500", heroBg: "bg-[#B33045]" };
    return { name: "Luteal", color: "text-indigo-600", heroBg: "bg-[#7161EF]" };
  }, [cycleStats.day, periodDuration]);

  // --- Calendar Logic ---
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
    }
    const padding = 42 - days.length;
    for (let i = 1; i <= padding; i++) {
        days.push({ day: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
    }
    return days;
  };

  const checkDateType = (date) => {
    if (!date) return null;
    const dTime = date.getTime();
    const dateStr = date.toISOString().split('T')[0];

    // Check if within any logged period range
    for (const p of periods) {
        const start = new Date(p.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + periodDuration - 1);
        
        if (dTime >= start.getTime() && dTime <= end.getTime()) {
            return 'period';
        }
    }

    if (cycleStats.nextPeriod) {
        const nextTime = cycleStats.nextPeriod.getTime();
        if (dTime >= nextTime && dTime < nextTime + periodDuration * 86400000) return 'predicted-period';
    }

    if (cycleStats.fertileStart && cycleStats.fertileEnd) {
        if (dTime >= cycleStats.fertileStart.getTime() && dTime <= cycleStats.fertileEnd.getTime()) return 'fertile';
    }

    if (cycleStats.ovulation && dateStr === cycleStats.ovulation.toISOString().split('T')[0]) return 'ovulation';

    return null;
  };

  const handleMonthChange = (offset) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));
  };

  const handleAddPeriod = async () => {
    try {
        if (editingPeriod) {
            await apiFetch('/period', {
                method: 'POST',
                body: JSON.stringify({ ...editingPeriod, startDate: newPeriodDate })
            });
        } else {
            if (periods.some(p => p.startDate === newPeriodDate)) return;
            await apiFetch('/period', {
                method: 'POST',
                body: JSON.stringify({ startDate: newPeriodDate })
            });
        }
        await fetchBloomData();
        setIsModalOpen(false);
        setEditingPeriod(null);
    } catch (e) {
        alert("Failed to save period record.");
    }
  };

  const handleDeletePeriod = async (id) => {
      try {
          await apiFetch(`/period/${id}`, { method: 'DELETE' });
          await fetchBloomData();
      } catch (e) {
          alert("Failed to delete record.");
      }
  };

  const handleEditInit = (period) => {
      setEditingPeriod(period);
      setNewPeriodDate(period.startDate);
      setIsModalOpen(true);
  };

  const handleUpdateDuration = async (val) => {
      const num = parseInt(val);
      if (num > 0 && num <= 14) {
          try {
              await apiFetch('/settings', {
                  method: 'POST',
                  body: JSON.stringify({ periodDuration: num })
              });
              setPeriodDuration(num);
          } catch (e) {
              console.error(e);
          }
      }
  };

  const handleOpenDailyLog = () => {
      const today = new Date().toISOString().split('T')[0];
      const existing = dailyLogs[today] || { flow: 'Normal', mood: 'Balanced', note: '', symptoms: [] };
      setSelectedDailyLog(existing);
      setIsDailyModalOpen(true);
  };

  const handleSaveDailyLog = async () => {
      try {
          const today = new Date().toISOString().split('T')[0];
          await apiFetch('/daily', {
              method: 'POST',
              body: JSON.stringify({ ...selectedDailyLog, date: today })
          });
          await fetchBloomData();
          setIsDailyModalOpen(false);
      } catch (e) {
          alert("Failed to save daily log.");
      }
  };

  const handleDeleteDailyLog = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        await apiFetch(`/daily/${today}`, { method: 'DELETE' });
        await fetchBloomData();
        setIsDailyModalOpen(false);
    } catch (e) {
        alert("Failed to delete daily log.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "---";
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#2D3748] font-sans pb-24 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .bloom-serif { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-8 pt-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search insights..." className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-100 text-sm shadow-sm" />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={20} />
          </button>
          <button className="p-3 bg-[#B33045] rounded-2xl text-white hover:bg-rose-700 transition-all shadow-lg" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-8">
        <div className="lg:col-span-8 space-y-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative h-64 rounded-[2.5rem] overflow-hidden ${phaseDetails.heroBg} text-white p-10 flex flex-col justify-center shadow-xl`}>
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[2px] opacity-80 mb-2 block">Daily Status</span>
              <h1 className="text-4xl font-medium mb-1 drop-shadow-sm">{getGreeting()}, {user.name}.</h1>
              <h2 className="text-5xl bloom-serif italic text-rose-100">You're in your {phaseDetails.name} phase.</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center py-12">
              <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="80" cy="80" r="70" stroke="#B33045" strokeWidth="10" fill="transparent" 
                    strokeDasharray="440" strokeDashoffset={440 - (440 * (28 - (28 - cycleStats.day)) / 28)} 
                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#2D3748]">{28 - cycleStats.day}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Days Left</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Until next period</h3>
              <p className="text-sm text-slate-400 font-medium">Cycle Day {cycleStats.day} of 28</p>
            </div>

            <div className="bg-[#E9E1FF] rounded-[2.5rem] p-10 border border-[#DED4FF] flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-indigo-700 opacity-80 mb-2 block">Fertility window</span>
                <h3 className="text-3xl font-bold mb-3 text-indigo-900 leading-tight">Fertile in {daysToFertile} days</h3>
                <p className="text-indigo-600/70 text-sm leading-relaxed font-medium">Your typical duration: <b>{periodDuration} days</b>.</p>
              </div>
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm self-start px-4 py-2 rounded-full border border-white/50 mt-6 relative z-10">
                <div className={`w-2 h-2 ${cycleStats.day >= 11 && cycleStats.day <= 16 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'} rounded-full`}></div>
                <span className="text-[11px] font-bold text-indigo-800">
                    {cycleStats.day >= 11 && cycleStats.day <= 16 ? 'High Today' : 'Low chance'}
                </span>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-lg shadow-rose-900/5">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-slate-800">{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex gap-4">
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100" onClick={() => handleMonthChange(-1)}><ChevronLeft size={20} className="text-slate-400" /></button>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100" onClick={() => handleMonthChange(1)}><ChevronRight size={20} className="text-slate-400" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center mb-6">
                {['M','T','W','T','F','S','S'].map((d, i) => <span key={i} className="text-[11px] font-bold text-slate-300 uppercase underline decoration-rose-500 decoration-2 underline-offset-8">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-4">
                {getCalendarDays().map((dayObj, i) => {
                    const dateType = checkDateType(dayObj.fullDate);
                    const isToday = dayObj.fullDate.toDateString() === new Date().toDateString();
                    return (
                        <div key={i} className="flex items-center justify-center p-1 relative">
                            <motion.div 
                                onClick={() => { setNewPeriodDate(dayObj.fullDate.toISOString().split('T')[0]); setIsModalOpen(true); }}
                                className={`w-11 h-11 flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all cursor-pointer relative
                                    ${!dayObj.isCurrentMonth ? 'text-slate-200 opacity-40' : 'text-slate-600'}
                                    ${dateType === 'period' ? 'bg-rose-500 text-white shadow-lg' : ''}
                                    ${dateType === 'predicted-period' ? 'border-2 border-dashed border-rose-300 bg-rose-50 text-rose-600' : ''}
                                    ${dateType === 'fertile' ? 'bg-indigo-100 text-indigo-700' : ''}
                                    ${isToday ? 'ring-2 ring-slate-800' : ''}
                                    ${!dateType && dayObj.isCurrentMonth ? 'hover:bg-slate-50' : ''}
                                `}
                            >
                                {dayObj.day}
                                {dateType === 'ovulation' && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 space-y-8 border border-slate-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setIsSettingsOpen(true)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Settings size={18} />
                    </button>
                </div>
                <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-2">
                        <Activity size={24} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Quick Stats</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-3">
                        <StatRow 
                            icon={<Sparkles size={14} className="text-indigo-400" />} 
                            label="Fertile window" 
                            value={`${formatDate(cycleStats.fertileStart)} – ${formatDate(cycleStats.fertileEnd)}`} 
                        />
                        <StatRow 
                            icon={<Smile size={14} className="text-indigo-500" />} 
                            label="Ovulation" 
                            value={formatDate(cycleStats.ovulation)} 
                        />
                        <StatRow 
                            icon={<CalendarIcon size={14} className="text-rose-400" />} 
                            label="Next Period" 
                            value={formatDate(cycleStats.nextPeriod)} 
                        />
                        <StatRow 
                            icon={<Clock size={14} className="text-slate-400" />} 
                            label="Last Period log" 
                            value={formatDate(lastPeriodDate)} 
                            highlight 
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Period length</span>
                    <span className="text-xs font-bold text-rose-500">{periodDuration} days</span>
                </div>
            </section>
            
            <section className="bg-slate-800 rounded-[2.5rem] p-8 space-y-6 text-white text-center shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Droplets className="text-rose-400 mx-auto relative z-10" size={32} />
                <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-bold tracking-tight">Daily log</h3>
                    <p className="text-white/40 text-sm">
                        {dailyLogs[new Date().toISOString().split('T')[0]] ? 'Update today\'s entry' : 'How was your cycle today?'}
                    </p>
                </div>
                
                {dailyLogs[new Date().toISOString().split('T')[0]] ? (
                    <div className="bg-white/5 p-4 rounded-2xl text-left space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#B33045]">
                            <span>Today's Status</span>
                            <CheckCircle2 size={12} />
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                            <span className="text-rose-200">Flow: {dailyLogs[new Date().toISOString().split('T')[0]].flow}</span>
                            <span className="text-indigo-200">Mood: {dailyLogs[new Date().toISOString().split('T')[0]].mood}</span>
                        </div>
                        {dailyLogs[new Date().toISOString().split('T')[0]].note && (
                            <p className="text-[10px] text-white/50 italic line-clamp-2">"{dailyLogs[new Date().toISOString().split('T')[0]].note}"</p>
                        )}
                        <button onClick={handleOpenDailyLog} className="w-full py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">Edit Log</button>
                    </div>
                ) : (
                    <div className="flex gap-4 relative z-10">
                        {['Light','Normal','Heavy'].map(l => (
                            <button key={l} onClick={() => { setSelectedDailyLog({ ...selectedDailyLog, flow: l }); setIsDailyModalOpen(true); }} className="flex-1 bg-white/5 py-4 rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 transition-all">{l}</button>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 space-y-6 border border-slate-50 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold tracking-tight">History</h3>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{periods.length} Logs</span>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {periods.length === 0 ? (
                        <p className="text-center text-slate-300 text-xs py-10 italic">No logs found yet.</p>
                    ) : (
                        periods.map(p => {
                            const end = new Date(p.startDate);
                            end.setDate(end.getDate() + periodDuration - 1);
                            return (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-rose-100 transition-all">
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-slate-700">
                                            {formatDate(new Date(p.startDate))} – {formatDate(end)}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider italic">
                                            {new Date(p.startDate).getFullYear()} • {periodDuration} Days
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditInit(p)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-rose-500 shadow-sm">
                                            <ExternalLink size={14} />
                                        </button>
                                        <button onClick={() => handleDeletePeriod(p.id)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
      </div>

       {/* Settings Modal */}
       <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-slate-800">Settings</h3>
                    <X className="text-slate-300 cursor-pointer" size={24} onClick={() => setIsSettingsOpen(false)} />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Period Duration (Days)</label>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleUpdateDuration(periodDuration - 1)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold">-</button>
                        <span className="flex-1 text-center text-4xl font-bold text-[#B33045]">{periodDuration}</span>
                        <button onClick={() => handleUpdateDuration(periodDuration + 1)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold">+</button>
                    </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="w-full py-5 rounded-3xl bg-slate-800 text-white font-bold">Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Log Period Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); setEditingPeriod(null); }} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8">
                <h3 className="text-2xl font-bold bloom-serif italic">{editingPeriod ? 'Edit Period Entry' : 'Start New Period'}</h3>
                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Log start date</label>
                    <input type="date" value={newPeriodDate} onChange={(e) => setNewPeriodDate(e.target.value)} className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
                <div className="p-6 bg-rose-50 rounded-2xl space-y-2 border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                        <Info size={14} /> <span>Cycle Tip</span>
                    </div>
                    <p className="text-xs text-rose-900/70 leading-relaxed">
                        Bloom will track a <b>{periodDuration}-day</b> period from this date. Change this in settings if needed.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleAddPeriod} className="flex-1 py-5 rounded-3xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
                        {editingPeriod ? 'Update entry' : 'Save record'} <CheckCircle2 size={18} />
                    </button>
                    {editingPeriod && (
                        <button onClick={() => { handleDeletePeriod(editingPeriod.id); setIsModalOpen(false); setEditingPeriod(null); }} className="px-6 py-5 rounded-3xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors active:scale-95">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Daily Wellness Modal (Mood & Daily Log) */}
      <AnimatePresence>
        {isDailyModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDailyModalOpen(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold bloom-serif italic">Daily Wellness</h3>
                    <X className="text-slate-300 cursor-pointer" size={24} onClick={() => setIsDailyModalOpen(false)} />
                </div>

                <div className="space-y-6">
                    {/* Flow */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Flow Intensity</label>
                        <div className="flex gap-2">
                            {['None', 'Light', 'Normal', 'Heavy'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setSelectedDailyLog({ ...selectedDailyLog, flow: f })}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold border transition-all ${selectedDailyLog.flow === f ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Current Mood</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Happy', 'Calm', 'Balanced', 'Tired', 'Anxious', 'Irritable'].map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setSelectedDailyLog({ ...selectedDailyLog, mood: m })}
                                    className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${selectedDailyLog.mood === m ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood Journal */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Mood Journal</label>
                        <textarea 
                            value={selectedDailyLog.note}
                            onChange={(e) => setSelectedDailyLog({ ...selectedDailyLog, note: e.target.value })}
                            placeholder="How are you feeling today?"
                            className="w-full bg-slate-50 rounded-2xl p-5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-slate-100 resize-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleSaveDailyLog} className="flex-1 py-5 rounded-3xl bg-slate-900 text-white font-bold shadow-lg active:scale-95 transition-all">
                        Save Entry
                    </button>
                    {dailyLogs[new Date().toISOString().split('T')[0]] && (
                        <button onClick={handleDeleteDailyLog} className="px-6 py-5 rounded-3xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors active:scale-95">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button onClick={() => setIsModalOpen(true)} className="bg-[#B33045] text-white px-10 py-5 rounded-full font-bold shadow-2xl shadow-rose-900/20 hover:scale-105 active:scale-95 transition-all text-xl flex items-center gap-3">
           <Droplets size={24} /> Log Period
        </button>
      </div>
    </div>
  );
};

const StatRow = ({ icon, label, value, highlight }) => (
  <div className="flex justify-between items-center group cursor-default">
      <div className="flex items-center gap-3">
          <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
              {icon}
          </div>
          <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-bold ${highlight ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      <div className={`w-3 h-3 rounded-md ${color}`} />
      <span>{label}</span>
  </div>
);

const Droplets = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 16.3c2.2 0 4-1.8 4-4 0-1.5-1.5-4.1-2.9-5.9a1.1 1.1 0 0 0-2.2 0C4.5 8.2 3 10.8 3 12.3c0 2.2 1.8 4 4 4z"></path>
        <path d="M15.7 18.5c1.8 0 3.3-1.5 3.3-3.3 0-1.3-1.3-3.4-2.4-4.9a0.9 0.9 0 0 0-1.8 0c-1.1 1.5-2.4 3.6-2.4 4.9 0 1.8 1.5 3.3 3.3 3.3z"></path>
    </svg>
);

export default BloomPage;
