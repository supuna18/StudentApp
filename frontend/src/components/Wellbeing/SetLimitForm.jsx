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
  const [dark, setDark] = useState(() => JSON.parse(localStorage.getItem('darkMode_elite') || 'false'));
  const [toasts, setToasts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [limitsCount, setLimitsCount] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    localStorage.setItem('darkMode_elite', JSON.stringify(dark));
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
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
    } catch (err) { console.error('Profile sync error:', err); }
  };

  useEffect(() => {
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
      } catch (err) { console.error('Critical Profile sync error:', err); }
    };
    initProfile();
  }, []);

  const categories = [
    { name: 'Social Media', icon: '📱', color: 'from-pink-500 to-rose-500' },
    { name: 'Entertainment', icon: '🎬', color: 'from-orange-500 to-amber-500' },
    { name: 'Education', icon: '🎓', color: 'from-emerald-500 to-teal-500' },
    { name: 'Productivity', icon: '🚀', color: 'from-blue-500 to-indigo-500' },
    { name: 'Gaming', icon: '🎮', color: 'from-purple-500 to-violet-500' },
    { name: 'Other', icon: '📦', color: 'from-slate-400 to-slate-500' },
  ];

  const popularApps = [
    { name: 'Facebook', url: 'facebook.com', bg: '#1877F2', initial: 'f', cat: 'Social Media' },
    { name: 'YouTube', url: 'youtube.com', bg: '#FF0000', initial: 'YT', cat: 'Entertainment' },
    { name: 'Instagram', url: 'instagram.com', bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', initial: 'IG', cat: 'Social Media' },
    { name: 'TikTok', url: 'tiktok.com', bg: '#000000', initial: '♪', cat: 'Social Media' },
    { name: 'Reddit', url: 'reddit.com', bg: '#FF4500', initial: 'R', cat: 'Social Media' },
    { name: 'X', url: 'twitter.com', bg: '#14171A', initial: 'X', cat: 'Social Media' },
  ];

  const timePresets = [
    { label: '15m', value: 15 }, { label: '30m', value: 30 }, { label: '45m', value: 45 },
    { label: '1h', value: 60 }, { label: '2h', value: 120 }, { label: '3h', value: 180 },
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
    if (!cleaned.includes('.') || cleaned.length < 4) return addToast('Please enter a valid URL.', 'error');
    if (isNaN(mins) || mins < 1 || mins > 1440) return addToast('Minutes must be between 1–1440.', 'error');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId(), domain: cleaned, limitMinutes: mins, category })
      });
      if (response.ok) {
        addToast('Limit activated! 🛡️', 'success');
        setDomain(''); setLimitMinutes(''); setLimitsCount(p => p + 1);
      } else addToast('Failed to save limit.', 'error');
    } catch { addToast('Server Error.', 'error'); }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const input = document.getElementById('pdf-section-usage');
    if (!input) return;
    addToast('Generating Report…', 'success');
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pdfW = pdf.internal.pageSize.getWidth();
      pdf.setFillColor(59, 130, 246); pdf.rect(0, 0, pdfW, 30, 'F');
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
      pdf.text('EDUSYNC · USAGE REPORT', margin, 20);
      pdf.addImage(imgData, 'PNG', margin, 40, pdfW - margin * 2, (canvas.height * (pdfW - margin * 2)) / canvas.width);
      pdf.save(`Edusync_Report_${Date.now()}.pdf`);
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`min-h-screen -m-10 p-10 transition-colors duration-300 ${dark ? 'bg-slate-900' : 'bg-[#f0f2f8]'}`}>

      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-5xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>
              Digital <span className="text-blue-500">Focus</span>
            </h1>
            <p className={`mt-1 text-sm font-medium uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Personal Control Panel</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-all shadow-sm
              ${dark ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Focus Streak', value: `${streak} days`, sub: streak > 0 ? '↑ Personal best' : 'Start today!', subColor: 'text-emerald-500' },
          { label: 'Sites Blocked', value: `${limitsCount}+`, sub: limitsCount > 0 ? `${limitsCount} active limits` : 'None yet', subColor: 'text-blue-500' },
          { label: 'Badges Earned', value: `${unlockedBadges.length} / 5`, sub: unlockedBadges.length < 5 ? 'Keep going!' : 'All unlocked!', subColor: 'text-amber-500' },
          { label: 'Wellbeing Score', value: `${Math.min(100, streak * 4 + limitsCount * 5)}%`, sub: '↑ Improving', subColor: 'text-violet-500' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl shadow-sm border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-extrabold ${dark ? 'text-white' : 'text-slate-800'}`}>{s.value}</p>
            <p className={`text-xs font-semibold mt-1 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Badges Row ── */}
      <div className={`max-w-6xl mx-auto rounded-2xl shadow-sm border p-6 mb-8 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Achievement Badges</p>
        <div className="flex gap-4 flex-wrap">
          {['🌱', '⚔️', '🧘', '👑', '💎'].map((icon, i) => (
            <motion.button
              key={i}
              onClick={() => i < unlockedBadges.length && setSelectedBadge(icon)}
              whileHover={i < unlockedBadges.length ? { scale: 1.08 } : {}}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all
                ${i < unlockedBadges.length
                  ? 'bg-blue-50 border-blue-200 shadow-sm cursor-pointer'
                  : 'bg-slate-50 border-dashed border-slate-200 opacity-30 grayscale cursor-default'}`}
            >
              {icon}
            </motion.button>
          ))}
          {unlockedBadges.length < 5 && (
            <div className="flex items-center text-xs text-slate-400 font-medium italic">
              {5 - unlockedBadges.length} more to unlock →
            </div>
          )}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Form Card */}
        <div className={`lg:col-span-2 rounded-2xl shadow-sm border p-8 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-1 ${dark ? 'text-white' : 'text-slate-800'}`}>Set a New Limit</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-8">Configure a site restriction</p>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* App Quick-Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Quick Select
              </label>
              <div className="flex flex-wrap gap-3 mb-4">
                {popularApps.map(a => (
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                    type="button" key={a.url}
                    onClick={() => { setDomain(a.url); setCategory(a.cat); }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm transition-all
                      ${domain === a.url ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'opacity-75 hover:opacity-100'}`}
                    style={{ background: a.bg }}
                  >
                    {a.initial}
                  </motion.button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type URL (e.g. facebook.com)"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                required
              className={`w-full px-4 h-12 border rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm
                ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-[#f0f2f8] border-slate-200 text-slate-700 focus:bg-white'}`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    type="button" key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold flex items-center gap-2 transition-all
                      ${category === cat.name
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : dark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Daily Time Limit</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {timePresets.map(p => (
                  <button
                    type="button" key={p.value}
                    onClick={() => setLimitMinutes(p.value.toString())}
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                      ${limitMinutes === p.value.toString()
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-[#f0f2f8] text-slate-500 hover:bg-slate-200'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom minutes (1–1440)"
                value={limitMinutes}
                onChange={e => setLimitMinutes(e.target.value)}
                required
                className={`w-full px-4 h-12 border rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm
                ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-[#f0f2f8] border-slate-200 text-slate-700 focus:bg-white'}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            >
              {loading ? 'Activating…' : '🔒 Activate Limit'}
            </button>
          </form>
        </div>

        {/* Sidebar Info Card */}
        <div className={`rounded-2xl shadow-sm border p-8 flex flex-col ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-lg font-bold mb-1 ${dark ? 'text-white' : 'text-slate-800'}`}>Why It Works</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-6">The science of focus</p>

          <div className="space-y-5 flex-1">
            {[
              { icon: '🧠', label: 'Dopamine Shield', desc: 'Limits reduce impulsive browsing spikes.', tag: 'SAFETY' },
              { icon: '⏱️', label: 'Focus Momentum', desc: 'Streaks compound daily discipline.', tag: 'WELLNESS' },
              { icon: '📚', label: 'Deep Work Sync', desc: 'Optimized for university study cycles.', tag: 'COMMUNITY' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#f0f2f8] border border-slate-100">
                <div className="text-2xl mt-0.5">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-extrabold uppercase tracking-tight ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest
                      ${item.tag === 'SAFETY' ? 'bg-blue-100 text-blue-600'
                        : item.tag === 'WELLNESS' ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-violet-100 text-violet-600'}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-xl bg-blue-600 text-white">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Average impact</p>
            <p className="text-3xl font-extrabold">+20%</p>
            <p className="text-xs opacity-80 mt-1">cognitive focus per active limit</p>
          </div>
        </div>
      </div>


      {/* ── Cinematic Video Banner ── */}
      <div className="max-w-6xl mx-auto mb-8 relative h-[220px] rounded-3xl overflow-hidden shadow-2xl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/tiktokio.com1774438248_Px0e3tjdNvahbUHqfIhS.mp4" type="video/mp4" />
        </video>
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300 mb-2">📡 Live Analytics</p>
          <h2 className="text-4xl font-black text-white tracking-tight mb-1">
            Focus <span className="text-blue-400">Telemetry</span>
          </h2>
          <p className="text-slate-300 text-sm font-medium">Your real-time screen discipline dashboard</p>
        </div>
        {/* Export button overlaid on banner */}
        <button
          onClick={downloadPDF}
          className="absolute right-8 bottom-8 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
        >
          ↓ Export Report
        </button>
      </div>

      {/* ── Analytics Section ── */}
      <div className="max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className={`rounded-2xl shadow-sm border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <LimitsChart dark={dark} />
          </div>
          <div id="pdf-section-usage" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl shadow-sm border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><UsageChart dark={dark} /></div>
            <div className={`rounded-2xl shadow-sm border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><UsagePieChart dark={dark} /></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl shadow-sm border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><ComparisonChart dark={dark} /></div>
            <div className={`rounded-2xl shadow-sm border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><CategoryChart dark={dark} /></div>
          </div>
        </div>
      </div>

      {/* ── Badge Modal ── */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="max-w-sm w-full p-10 rounded-2xl bg-white text-center shadow-2xl border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-7xl mb-5 animate-bounce">{selectedBadge}</div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{BADGE_INFO[selectedBadge]?.name}</h3>
              <p className="text-slate-500 italic mb-2">"{BADGE_INFO[selectedBadge]?.desc}"</p>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-8">{BADGE_INFO[selectedBadge]?.req}</p>
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-widest uppercase transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toasts ── */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className={`px-6 py-4 rounded-xl border shadow-lg pointer-events-auto flex items-center gap-3 bg-white
                ${t.type === 'success' ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`}
            >
              <div className={`w-2 h-2 rounded-full ${t.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="font-semibold text-sm">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default SetLimitForm;