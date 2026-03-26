import React, { useState, useEffect } from 'react';
import UsageChart from './UsageChart';
import UsagePieChart from './UsagePieChart';
import LimitsChart from './LimitsChart';
import CategoryChart from './CategoryChart';
import ComparisonChart from './ComparisonChart';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getUserId } from '../../utils/wellbeingUtils';

const SetLimitForm = () => {
  const [domain, setDomain] = useState('');
  const [limitMinutes, setLimitMinutes] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Can be changed by user
  const [toasts, setToasts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [limitsCount, setLimitsCount] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const syncProfile = async (newStreak, newBadges) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await fetch(`http://localhost:5005/api/wellbeing/profile/${userId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak: newStreak, badges: newBadges })
      });
    } catch (err) { console.error("Profile sync error:", err); }
  };

  useEffect(() => {
    const saved = localStorage.getItem('darkMode_elite');
    if (saved) setDarkMode(JSON.parse(saved));

    const initProfile = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const today = new Date().toDateString();
          const lastDate = data.lastFocusDate ? new Date(data.lastFocusDate).toDateString() : null;
          let currentStreak = data.streak || 0;
          let currentBadges = data.badges || [];

          if (!lastDate || lastDate !== today) {
            currentStreak += 1;
            const milestones = [
              { streak: 1, icon: '🌱' }, { streak: 3, icon: '⚔️' },
              { streak: 7, icon: '🧘' }, { streak: 15, icon: '👑' }, { streak: 30, icon: '💎' }
            ];
            const newBadges = milestones.filter(m => currentStreak >= m.streak).map(m => m.icon);
            currentBadges = [...new Set([...currentBadges, ...newBadges])];
            syncProfile(currentStreak, currentBadges);
          }
          
          setStreak(currentStreak);
          setUnlockedBadges(currentBadges);

          const limRes = await fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`);
          if (limRes.ok) {
            const limData = await limRes.json();
            setLimitsCount(limData?.data?.length || 0);
          }
        }
      } catch (err) { console.error("Critical Profile sync error:", err); }
    };
    initProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode_elite', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const categories = [
    { name: 'Social Media', icon: '📱' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Education', icon: '🎓' },
    { name: 'Productivity', icon: '🚀' },
    { name: 'Gaming', icon: '🎮' },
    { name: 'Other', icon: '📦' }
  ];

  const popularApps = [
    { name: 'Facebook', url: 'facebook.com', color: 'bg-blue-500', icon: 'f', cat: 'Social Media' },
    { name: 'YouTube', url: 'youtube.com', color: 'bg-red-500', icon: 'Y', cat: 'Entertainment' },
    { name: 'Instagram', url: 'instagram.com', color: 'bg-gradient-to-r from-pink-400 to-purple-500', icon: 'I', cat: 'Social Media' },
    { name: 'TikTok', url: 'tiktok.com', color: 'bg-gray-800', icon: 'T', cat: 'Social Media' },
    { name: 'Reddit', url: 'reddit.com', color: 'bg-orange-500', icon: 'R', cat: 'Social Media' },
    { name: 'X / Twitter', url: 'twitter.com', color: 'bg-gray-900', icon: 'X', cat: 'Social Media' },
  ];

  const timePresets = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
  ];

  const BADGE_INFO = {
    '🌱': { name: 'Focus Rookie', desc: 'Started your digital wellbeing journey.', req: '1 Day Streak' },
    '⚔️': { name: 'Disciplined', desc: 'Consistency is building a great habit!', req: '3 Day Streak' },
    '🧘': { name: 'Focus Guru', desc: 'Master of your own concentration.', req: '7 Day Streak' },
    '👑': { name: 'Productivity King', desc: 'An inspiration to all students.', req: '15 Day Streak' },
    '💎': { name: 'Digital Diamond', desc: 'Perfection in discipline achieved.', req: '30 Day Streak' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = domain.includes('://') ? domain.split('://')[1].split('/')[0] : domain.split('/')[0];
    const mins = parseInt(limitMinutes);
    if (!cleaned.includes('.') || cleaned.length < 4) return addToast("Please enter a valid URL.", "error");
    if (isNaN(mins) || mins < 1 || mins > 1440) return addToast("Minutes must be between 1-1440.", "error");

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId(), domain: cleaned, limitMinutes: mins, category })
      });
      if (response.ok) {
        addToast("Limit set successfully! 🛡️", "success");
        setDomain(''); setLimitMinutes(''); setLimitsCount(p => p + 1);
      } else addToast("Failed to save limit.", "error");
    } catch { addToast("Server Error.", "error"); }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const input = document.getElementById('pdf-section-usage');
    if (!input) return;
    addToast("Generating Premium Report...", "success");
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: darkMode ? '#0f172a' : '#ffffff', scrollY: -window.scrollY });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth(), pdfH = pdf.internal.pageSize.getHeight(), margin = 15;
      pdf.setFillColor(30, 58, 138); pdf.rect(0, 0, pdfW, 35, 'F');
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.setFont("helvetica", "bold");
      pdf.text("EDUSYNC PERFORMANCE REPORT", margin, 22);
      pdf.addImage(imgData, 'PNG', margin, 60, pdfW - margin * 2, (canvas.height * (pdfW - margin * 2)) / canvas.width);
      pdf.save(`Edusync_Report_${Date.now()}.pdf`);
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`-m-10 p-10 min-h-screen transition-all duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HUD Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Digital <span className="text-blue-500">Focus</span></h1>
          <p className="text-sm opacity-50 uppercase tracking-widest font-bold">Personal Control Panel</p>
        </div>
        <button onClick={toggleDarkMode} className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">{darkMode ? "🌙" : "☀️"}</button>
      </div>

      {/* Cinematic Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-6xl mx-auto h-[300px] mb-12 rounded-[3.5rem] overflow-hidden shadow-2xl group">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale opacity-40">
          <source src="/tiktokio.com1774438248_Px0e3tjdNvahbUHqfIhS.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[1px]" />
        <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-20 text-white">
           <h2 className="text-5xl font-black mb-4 tracking-tight">Mission Status: <span className="text-blue-400 italic">Active</span></h2>
           <p className="text-xl max-w-xl opacity-90 font-medium">Maximize your academic potential by securing your digital environment.</p>
        </div>
      </motion.div>

      {/* Stats Bento */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-8 rounded-[2.5rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center shadow-xl">
           <div className="text-5xl mb-2">🔥</div>
           <div className="text-4xl font-black">{streak}</div>
           <div className="text-xs font-black uppercase tracking-widest opacity-40">Day Streak</div>
        </div>
        <div className="md:col-span-3 p-8 rounded-[2.5rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-6 overflow-x-auto scrollbar-hide shadow-xl">
           {['🌱', '⚔️', '🧘', '👑', '💎'].map((icon, i) => (
             <motion.button key={i} onClick={() => i < unlockedBadges.length && setSelectedBadge(icon)}
               whileHover={i < unlockedBadges.length ? { scale: 1.1 } : {}}
               className={`h-20 w-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl border-2 transition-all ${i < unlockedBadges.length ? 'bg-blue-500/20 border-blue-400 shadow-lg' : 'opacity-10 grayscale border-dashed border-slate-400'}`}
             >
               {icon}
             </motion.button>
           ))}
        </div>
      </div>

      {/* Enhanced Command Form */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
        <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700">
           <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* App Selector */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-4">1. Identify Application Node</label>
                <div className="flex flex-wrap gap-4 mb-6">
                   {popularApps.map(a => (
                     <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" key={a.url} onClick={() => {setDomain(a.url); setCategory(a.cat)}}
                       className={`h-14 w-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-xl shadow-lg transition-all ${a.color} ${domain === a.url ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-slate-800 scale-110' : 'opacity-80 hover:opacity-100'}`}
                     >
                       {a.icon}
                     </motion.button>
                   ))}
                </div>
                <input type="text" placeholder="Or type URL (e.g. facebook.com)" value={domain} onChange={e => setDomain(e.target.value)} required
                  className="w-full p-5 h-16 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-lg" />
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-4">2. Classify Resource Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {categories.map(cat => (
                     <button type="button" key={cat.name} onClick={() => setCategory(cat.name)}
                       className={`p-4 rounded-xl border-2 font-bold flex items-center gap-3 transition-all ${category === cat.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'border-slate-100 dark:border-slate-700 opacity-60 hover:opacity-100'}`}
                     >
                        <span>{cat.icon}</span>
                        <span className="text-sm">{cat.name}</span>
                     </button>
                   ))}
                </div>
              </div>

              {/* Time Presets & Input */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-4">3. Configure Temporal Perimeter</label>
                <div className="flex flex-wrap gap-3 mb-6">
                   {timePresets.map(preset => (
                     <button type="button" key={preset.value} onClick={() => setLimitMinutes(preset.value.toString())}
                       className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${limitMinutes === preset.value.toString() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                     >
                       {preset.label}
                     </button>
                   ))}
                </div>
                <input type="number" placeholder="Enter Custom Minutes (1-1440)" value={limitMinutes} onChange={e => setLimitMinutes(e.target.value)} required
                  className="w-full p-5 h-16 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:border-blue-500 font-bold text-lg" />
              </div>

              <button type="submit" disabled={loading} className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
                {loading ? "Activating Control..." : "ACTIVATE PERIMETER 🔒"}
              </button>
           </form>
        </div>

        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-[#0f172a] to-blue-900 text-white flex flex-col justify-center border-t-4 border-blue-500 overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
           <h3 className="text-3xl font-black mb-6">Strategy Hub</h3>
           <p className="text-lg opacity-80 leading-relaxed mb-8">Every defined limit increases your cognitive focus by <span className="text-blue-400 font-black">20%</span> on average.</p>
           <div className="space-y-6">
              {[
                { title: 'Dopamine Shield', desc: 'Auto-blocks distracting notifications.' },
                { title: 'Focus Momentum', desc: 'Increases with every day of consistency.' },
                { title: 'Deep Work Sync', desc: 'Optimized for university study cycles.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="text-blue-400 font-black text-xl">0{i+1}</div>
                   <div>
                      <div className="font-bold text-sm uppercase tracking-widest">{item.title}</div>
                      <div className="text-xs opacity-60 mt-1">{item.desc}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="max-w-6xl mx-auto">
         <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-4xl font-black italic tracking-tight">Focus Telemetry</h2>
               <div className="h-1.5 w-24 bg-blue-600 rounded-full mt-2" />
            </div>
            <button onClick={downloadPDF} className="h-16 px-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-100 dark:border-slate-700 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all">
               Export Summary
            </button>
         </div>

         <div className="space-y-10">
            <LimitsChart />
            <div id="pdf-section-usage" className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <UsageChart />
               <UsagePieChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <ComparisonChart />
               <CategoryChart />
            </div>
         </div>
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl" onClick={() => setSelectedBadge(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="max-w-md w-full p-12 rounded-[4rem] bg-white dark:bg-[#1e293b] text-center relative shadow-2xl border-4 border-blue-500/20" onClick={e => e.stopPropagation()}>
               <div className="text-8xl mb-6 drop-shadow-2xl animate-bounce">{selectedBadge}</div>
               <h3 className="text-4xl font-black mb-2 tracking-tighter">{BADGE_INFO[selectedBadge]?.name}</h3>
               <p className="text-xl font-medium opacity-70 mb-10 italic">"{BADGE_INFO[selectedBadge]?.desc}"</p>
               <button onClick={() => setSelectedBadge(null)} className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl">Close Console</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-8 left-8 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }} 
              className={`px-8 py-5 rounded-3xl border-2 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto flex items-center gap-3 ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
               <div className={`w-2 h-2 rounded-full ${t.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
               <span className="font-black text-xs uppercase tracking-[0.2em]">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default SetLimitForm;