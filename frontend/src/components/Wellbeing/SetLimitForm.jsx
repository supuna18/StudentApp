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
import confetti from 'canvas-confetti';

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
    { label: '4h', value: 240 }, { label: '5h', value: 300 }, { label: '6h', value: 360 },
  ];

  const BADGE_INFO = {
    '🌱': { name: 'Focus Rookie', desc: 'Started your digital wellbeing journey.', req: '1 Day Streak' },
    '⚔️': { name: 'Disciplined', desc: 'Consistency is building a great habit!', req: '3 Day Streak' },
    '🧘': { name: 'Focus Guru', desc: 'Master of your own concentration.', req: '7 Day Streak' },
    '👑': { name: 'Productivity King', desc: 'An inspiration to all students.', req: '15 Day Streak' },
    '💎': { name: 'Digital Diamond', desc: 'Perfection in discipline achieved.', req: '30 Day Streak' },
  };

  const formatMinutes = (m) => {
    const mins = parseInt(m);
    if (isNaN(mins) || mins <= 0) return '';
    const h = Math.floor(mins / 60);
    const mm = mins % 60;
    return h > 0 ? `(${h}h ${mm}m)` : `(${mm}m)`;
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
    addToast('Generating Full Diagnostic Report…', 'success');
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, scrollY: -window.scrollY, backgroundColor: dark ? '#0f172a' : '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // ── 1. Header (Branded) ──
      pdf.setFillColor(37, 99, 235); pdf.rect(0, 0, pdfW, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24); pdf.setFont('helvetica', 'bold');
      pdf.text('EDUSYNC', margin, 18);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
      pdf.text('FULL WELLBEING DIAGNOSTIC & ANALYTICS', margin, 26);
      
      pdf.setFontSize(8);
      const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      pdf.text(`REPORT ID: ${Date.now()}`, pdfW - margin - 50, 15);
      pdf.text(`GENERATED: ${dateStr.toUpperCase()}`, pdfW - margin - 50, 20);
      pdf.text(`SECURE HASH: ${Math.random().toString(36).substring(7).toUpperCase()}`, pdfW - margin - 50, 25);

      // ── 2. Performance Dashboard ──
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Summary', margin, 52);
      pdf.setDrawColor(226, 232, 240); pdf.line(margin, 54, pdfW - margin, 54);

      // Performance Grid
      const score = Math.min(100, streak * 4 + limitsCount * 5);
      const stats = [
        { l: 'CURRENT STREAK', v: `${streak} Days` },
        { l: 'TOTAL LIMITS', v: `${limitsCount} Domains` },
        { l: 'MASTERY SCORE', v: `${score}%` },
        { l: 'BADGES EARNED', v: `${unlockedBadges.length} / 5` }
      ];

      stats.forEach((s, i) => {
        pdf.setFontSize(8); pdf.setTextColor(148, 163, 184); pdf.text(s.l, margin + (i * 42), 65);
        pdf.setFontSize(12); pdf.setTextColor(37, 99, 235); pdf.setFont('helvetica', 'bold');
        pdf.text(s.v, margin + (i * 42), 72);
      });

      // ── 3. Success Narrative & Recommendations ──
      pdf.setFillColor(248, 250, 252); pdf.roundedRect(margin, 82, pdfW - margin * 2, 25, 3, 3, 'F');
      pdf.setTextColor(71, 85, 105); pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      const narrative = streak > 5 
        ? "Excellent focus consistency! Your cognitive discipline is significantly above average. Recommendation: Maintain current study blocks."
        : "Initial focus patterns emerging. You are building valuable digital discipline. Recommendation: Try increasing limits on weekends.";
      pdf.text(`AI INSIGHT: ${narrative}`, margin + 5, 89, { maxWidth: pdfW - margin * 2 - 10 });
      pdf.text(`MILESTONES UNLOCKED: ${unlockedBadges.join('  ') || 'None'}`, margin + 5, 102);

      // ── 4. Behavioral Telemetry (The Image) ──
      pdf.setTextColor(30, 41, 59); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
      pdf.text('Behavioral Telemetry (Usage Analytics)', margin, 120);
      
      const imgW = pdfW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, 125, imgW, imgH);

      // ── 5. Detailed Domain Telemetry (Mini Table) ──
      const tableY = 125 + imgH + 15;
      if (tableY < pdfH - 40) {
        pdf.setFontSize(12); pdf.text('Domain Control Summary', margin, tableY);
        pdf.setDrawColor(226, 232, 240); pdf.line(margin, tableY + 2, pdfW - margin, tableY + 2);
        
        pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
        pdf.text('Site / Domain', margin, tableY + 8);
        pdf.text('Current Restriction', margin + 60, tableY + 8);
        pdf.text('Security Status', margin + 110, tableY + 8);
        
        pdf.setTextColor(71, 85, 105);
        pdf.text('Active Monitors Tracking:', margin, tableY + 15);
        pdf.text(`${limitsCount} endpoints active and synced with browser enforcer.`, margin + 35, tableY + 15);
      }

      // ── 6. Footer (Branded) ──
      pdf.setFillColor(241, 245, 249); pdf.rect(0, pdfH - 22, pdfW, 22, 'F');
      pdf.setTextColor(148, 163, 184); pdf.setFontSize(7);
      pdf.text('CONFIDENTIAL STUDENT TELEMETRY · FOR ACADEMIC USE ONLY', margin, pdfH - 12);
      pdf.text('WELLBEING ENGINE v2.5 FINAL', pdfW - margin - 40, pdfH - 12);
      
      pdf.setDrawColor(37, 99, 235); pdf.setLineWidth(1.5);
      pdf.line(0, 0, 0, pdfH); // left sidebar accent

      pdf.save(`Edusync_Full_Diagnostic_${Date.now()}.pdf`);
      addToast('✅ Full Diagnostic Report Exported', 'success');
    } catch (err) { 
      console.error(err);
      addToast('❌ Export Failed', 'error');
    }
  };

  return (
    <div className={`min-h-screen -m-10 p-10 transition-colors duration-300 ${dark ? 'bg-slate-900' : 'bg-[#f0f2f8]'}`}>

      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border
              ${dark ? 'bg-slate-800 border-slate-700 shadow-blue-900/20' : 'bg-white border-slate-100 shadow-blue-100'}`}>
              {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                </p>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shield Active</span>
                </div>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>
                Digital <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Focus</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden lg:flex flex-col items-end px-4 py-2 rounded-xl border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
              <p className={`text-xs font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>📡 100% Operational</p>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all shadow-sm active:scale-90
                ${dark ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700 shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-md'}`}
            >
              <motion.span animate={{ rotate: dark ? 360 : 0 }} transition={{ duration: 0.5 }}>
                {dark ? '🌙' : '☀️'}
              </motion.span>
            </button>
          </div>
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
      {/* ── Mastery Achievements ── */}
      <div className={`max-w-6xl mx-auto rounded-3xl shadow-xl border p-8 mb-10 overflow-hidden relative
        ${dark ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500 text-[10px] font-black text-white uppercase tracking-tighter">Level Up</span>
              <h2 className={`text-2xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>Mastery Achievements</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-md">Unlock exclusive badges as you maintain your focus streak and build digital discipline.</p>
          </div>
          
          <div className="min-w-[200px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Progress</span>
              <span className="text-sm font-black text-blue-500">{Math.round((unlockedBadges.length / 5) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedBadges.length / 5) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-5 flex-wrap relative z-10">
          {['🌱', '⚔️', '🧘', '👑', '💎'].map((icon, i) => {
            const isUnlocked = i < unlockedBadges.length;
            return (
              <motion.button
                key={icon}
                onClick={() => {
                  setSelectedBadge(icon);
                  if (i < unlockedBadges.length) {
                    confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#2563eb', '#3b82f6', '#60a5fa', '#ffffff']
                    });
                  }
                }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 transition-all duration-500
                  ${isUnlocked
                    ? 'bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg shadow-blue-100 cursor-pointer'
                    : 'bg-slate-50/50 border-dashed border-slate-200 opacity-40 grayscale cursor-pointer hover:opacity-100 hover:grayscale-0'}`}
              >
                {/* Glow for unlocked */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <span className="relative z-10">{icon}</span>
                
                {/* Status indicator */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm
                  ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                  {isUnlocked ? '✓' : '🔒'}
                </div>
              </motion.button>
            );
          })}
          
          <div className="flex flex-col justify-center ml-2">
            <p className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              {unlockedBadges.length === 5 ? 'All Achievements Unlocked! 🎉' : `Next goal: ${5 - unlockedBadges.length} more badges`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Keep your streak alive to rank up</p>
          </div>
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
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (val > 1440) {
                    addToast('⚠️ Max limit is 1440 mins (24h)', 'error');
                    setLimitMinutes('1440');
                  } else {
                    setLimitMinutes(e.target.value);
                  }
                }}
                onBlur={e => {
                  const val = parseInt(e.target.value);
                  if (e.target.value !== '' && (isNaN(val) || val < 1)) {
                    addToast('⚠️ Min limit is 1 min', 'error');
                    setLimitMinutes('1');
                  }
                }}
                min="1"
                max="1440"
                required
                className={`w-full px-4 h-12 border rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm
                ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-[#f0f2f8] border-slate-200 text-slate-700 focus:bg-white'}`}
              />
              {limitMinutes && (
                <p className="mt-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>Estimated Time: {formatMinutes(limitMinutes)}</span>
                </p>
              )}
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
              <div key={i} className={`flex gap-4 p-4 rounded-xl border transition-colors duration-300
                ${dark ? 'bg-slate-700/50 border-slate-600' : 'bg-[#f0f2f8] border-slate-100'}`}>
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