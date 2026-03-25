import React, { useState, useEffect } from 'react';
import UsageChart from './UsageChart';
import UsagePieChart from './UsagePieChart';
import LimitsChart from './LimitsChart';
import CategoryChart from './CategoryChart';
import ComparisonChart from './ComparisonChart';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SetLimitForm = () => {
  const [domain, setDomain] = useState('');
  const [limitMinutes, setLimitMinutes] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const syncProfile = async (newStreak, newBadges) => {
    try {
      await fetch('http://localhost:5005/api/wellbeing/profile/user123/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak: newStreak, badges: newBadges })
      });
    } catch (err) { console.error("Profile sync error:", err); }
  };

  // Persist dark mode preference and init profile
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setDarkMode(JSON.parse(saved));

    const initProfile = async () => {
      try {
        console.log("Fetching Wellbeing Profile for user123...");
        const response = await fetch('http://localhost:5005/api/wellbeing/profile/user123');
        if (response.ok) {
          const data = await response.json();
          console.log("Profile data received:", data);
          
          const today = new Date().toDateString();
          const lastDate = data.lastFocusDate ? new Date(data.lastFocusDate).toDateString() : null;
          let currentStreak = data.streak || 0;
          let currentBadges = data.badges || [];

          // If it's a new day or first time, increment streak and update badges
          if (!lastDate || lastDate !== today) {
            console.log("New focus day detected. Incrementing streak...");
            currentStreak += 1;
            
            // Re-calculate badges based on new streak
            const milestones = [
              { streak: 1, icon: '🌱' },
              { streak: 3, icon: '⚔️' },
              { streak: 7, icon: '🧘' },
              { streak: 15, icon: '👑' },
              { streak: 30, icon: '💎' }
            ];
            
            const newBadges = milestones
              .filter(m => currentStreak >= m.streak)
              .map(m => m.icon);
            
            currentBadges = [...new Set([...currentBadges, ...newBadges])];
            console.log("Syncing updated streak/badges to MongoDB:", { currentStreak, currentBadges });
            syncProfile(currentStreak, currentBadges);
          }
          
          console.log("Setting final streak state:", currentStreak);
          setStreak(currentStreak);
          setUnlockedBadges(currentBadges);
        } else {
            console.warn("Backend profile fetch failed, status:", response.status);
        }
      } catch (err) {
        console.error("Critical Profile sync error:", err);
      }
    };

    initProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    { name: 'Facebook', url: 'facebook.com', color: 'bg-blue-500 dark:bg-blue-400', icon: 'f', cat: 'Social Media' },
    { name: 'YouTube', url: 'youtube.com', color: 'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-400 dark:to-red-500', icon: 'Y', cat: 'Entertainment' },
    { name: 'Instagram', url: 'instagram.com', color: 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-300 dark:to-purple-400', icon: 'I', cat: 'Social Media' },
    { name: 'TikTok', url: 'tiktok.com', color: 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700', icon: 'T', cat: 'Social Media' },
    { name: 'Reddit', url: 'reddit.com', color: 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500', icon: 'R', cat: 'Social Media' },
    { name: 'X / Twitter', url: 'twitter.com', color: 'bg-gray-900 dark:bg-gray-800', icon: 'X', cat: 'Social Media' },
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
    '🌱': { name: 'Focus Rookie', desc: 'Started your digital wellbeing journey. Well done!', req: '1 Day Streak' },
    '⚔️': { name: 'Disciplined', desc: 'Consistency is key. You are building a great habit!', req: '3 Day Streak' },
    '🧘': { name: 'Focus Guru', desc: 'Master of your own time. Your concentration is superhuman!', req: '7 Day Streak' },
    '👑': { name: 'Productivity King', desc: 'An inspiration to all students. Unstoppable focus.', req: '15 Day Streak' },
    '💎': { name: 'Digital Diamond', desc: 'Rarest level of discipline achieved. Perfection.', req: '30 Day Streak' },
  };

  const cleanDomain = (url) => {
    // Regex to extract domain from any URL
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1].toLowerCase().trim() : url.toLowerCase().trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation for Domain
    const cleaned = cleanDomain(domain);
    if (!cleaned.includes('.') || cleaned.length < 4) {
      addToast("කරුණාකර නිවැරදි වෙබ් ලිපිනයක් ලබා දෙන්න. (e.g. facebook.com)", "error");
      return;
    }

    // 2. Validation for Time
    const mins = parseInt(limitMinutes);
    if (isNaN(mins) || mins < 1 || mins > 1440) {
      addToast("කාලය විනාඩි 1 ත් 1440 ත් අතර විය යුතුය.", "error");
      return;
    }

    setLoading(true);
    
    const newLimit = {
      userId: "user123", 
      domain: cleaned,
      limitMinutes: mins,
      category: category
    };

    try {
      const response = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit)
      });

      if (response.ok) {
        addToast("Success! Your focus session is now secured. 🛡️", "success");
        setDomain('');
        setLimitMinutes('');
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Backend returned 400 error data:", errorData);
        if (errorData && errorData.errors) {
            addToast(`Validation Error: ${JSON.stringify(errorData.errors)}`, "error");
        } else {
            addToast("Something went wrong. Please try again.", "error");
        }
      }
    } catch (error) {
      addToast("Backend Error: Please check if your server is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    // Only capture the Usage charts section for a clean, focused report
    const input = document.getElementById('pdf-section-usage');
    if (!input) { addToast("Usage data not found!", "error"); return; }

    addToast("Generating PDF... please wait ⏳", "success");

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        scrollY: -window.scrollY
      });

      const imgData = canvas.toDataURL('image/png');

      // Landscape A4: 297 x 210 mm
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const headerH = 22, footerH = 12, margin = 10;
      const availW = pdfW - margin * 2;
      const availH = pdfH - headerH - footerH - margin;

      // Fit image preserving aspect ratio
      const ratio = canvas.height / canvas.width;
      let imgW = availW, imgH = imgW * ratio;
      if (imgH > availH) { imgH = availH; imgW = imgH / ratio; }
      const xOff = margin + (availW - imgW) / 2;

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // ── Header (navy blue) ──────────────────────────────
      pdf.setFillColor(30, 58, 138);
      pdf.rect(0, 0, pdfW, headerH, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
      pdf.text("EDUSYNC", 12, 15);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
      pdf.text("Digital Wellbeing — Actual Usage Report", pdfW - 12, 15, { align: 'right' });

      // ── Subtitle bar (light blue) ───────────────────────
      pdf.setFillColor(219, 234, 254); // blue-100
      pdf.rect(0, headerH, pdfW, 8, 'F');
      pdf.setTextColor(30, 64, 175);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(8);
      pdf.text(`Report Date: ${dateStr}   |   User: user123   |   Period: Today`, 12, headerH + 5.5);

      // ── Usage chart image ───────────────────────────────
      pdf.addImage(imgData, 'PNG', xOff, headerH + 10, imgW, imgH);

      // ── Footer ──────────────────────────────────────────
      pdf.setFillColor(241, 245, 249);
      pdf.rect(0, pdfH - footerH, pdfW, footerH, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.text("Confidential — For personal use only", 12, pdfH - 4);
      pdf.text("www.edusync.com", pdfW - 12, pdfH - 4, { align: 'right' });

      pdf.save('EduSync-Usage-Report.pdf');
      addToast("PDF downloaded! 📄", "success");
    } catch (error) {
      console.error("PDF error:", error);
      addToast("Error generating PDF!", "error");
    }
  };


  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none space-y-3 w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                  : 'bg-rose-500/90 border-rose-400 text-white'
              }`}
            >
              <span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-bold">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 z-50 p-4 rounded-3xl shadow-2xl transition-all duration-300 backdrop-blur-sm border-4 ${
          darkMode
            ? 'bg-slate-800 text-blue-300 border-slate-600'
            : 'bg-white text-blue-700 border-blue-200 shadow-blue-200/50'
        }`}
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      <div className={`-m-10 p-10 min-h-screen transition-all duration-500 ${
        darkMode ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-900'
      }`}>
        
        {/* 1. Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto mb-12 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/20"
        >
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/tiktokio.com1774438248_Px0e3tjdNvahbUHqfIhS.mp4" type="video/mp4" />
            </video>
            <div className={`absolute inset-0 ${darkMode ? 'bg-slate-900/60 backdrop-blur-[2px]' : 'bg-blue-900/40 backdrop-blur-[1px]'}`}></div>
          </div>
          
          {/* ✨ Animated Bokeh Particles Overlay */}
          <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute rounded-full blur-[100px]"
                style={{
                  width: `${Math.random() * 400 + 200}px`,
                  height: `${Math.random() * 400 + 200}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(139, 92, 246, 0.4)',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 p-12 md:p-20 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Focus Mode Active
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-2xl">
                Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Wellbeing</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl drop-shadow-lg leading-relaxed">
                Transform your digital habits. Stay disciplined, stay focused, and achieve your study goals with EduSync.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ✨ Achievements & Streak Section */}
        <div className="max-w-6xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={`md:col-span-1 p-6 rounded-[2.5rem] flex flex-col items-center justify-center border shadow-xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-white/50'} backdrop-blur-xl relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-5xl mb-2 animate-bounce drop-shadow-lg">🔥</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600">{streak}</div>
            <div className="text-xs font-black uppercase tracking-widest opacity-40 mt-1">Day Streak</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`md:col-span-3 p-6 rounded-[2.5rem] border shadow-xl flex items-center gap-6 overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-white/50'} backdrop-blur-xl`}
          >
            <div className="flex-shrink-0 text-xs font-black uppercase tracking-widest opacity-30 [writing-mode:vertical-lr] rotate-180">Badges</div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['🌱', '⚔️', '🧘', '👑', '💎'].map((icon, i) => {
                const isUnlocked = i < unlockedBadges.length;
                return (
                  <motion.button
                    key={i}
                    onClick={() => isUnlocked && setSelectedBadge(icon)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                    className={`h-20 w-20 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all relative outline-none ${isUnlocked ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg shadow-blue-500/10 cursor-pointer' : 'bg-slate-100/50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700 opacity-20 grayscale cursor-not-allowed'}`}
                  >
                    {isUnlocked && <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>}
                    <span className={isUnlocked ? 'drop-shadow-md' : ''}>{icon}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="hidden md:block ml-auto text-right pr-4">
               <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Next Goal</div>
               <div className="text-lg font-bold text-blue-500 italic font-serif">"Stay Disciplined"</div>
            </div>
          </motion.div>
        </div>

      {/* 🏆 Achievement Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`max-w-md w-full p-10 rounded-[3rem] shadow-2xl border-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-blue-100 text-slate-900'} relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[100px]"></div>
              
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-6 right-6 text-2xl opacity-40 hover:opacity-100 transition-opacity"
              >✕</button>

              <div className="text-center relative z-10">
                <motion.div 
                   animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="text-8xl mb-6 drop-shadow-2xl"
                >
                  {selectedBadge}
                </motion.div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">{BADGE_INFO[selectedBadge]?.name}</h2>
                <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-black tracking-widest uppercase mb-6 border border-blue-500/20">
                  Requirement: {BADGE_INFO[selectedBadge]?.req}
                </div>
                <p className="text-xl font-medium opacity-70 leading-relaxed mb-8 italic">
                  "{BADGE_INFO[selectedBadge]?.desc}"
                </p>
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Keep Focusing 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* 2. Main Content Grid (Tips + Form) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className={`p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'}`}>
              <h3 className="text-2xl font-black mb-4">💡 Focus Tip</h3>
              <p className="text-lg opacity-90">Set limits to boost concentration and reduce digital eye strain.</p>
            </div>
            
            <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-blue-100/50'}`}>
              <h4 className="font-bold mb-4 text-xl">Why set limits?</h4>
              <ul className="space-y-3 opacity-80 font-medium text-lg">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Boost concentration</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Reduce eye strain</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Deep study focus</li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className={`p-10 rounded-[2.5rem] shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50 backdrop-blur-xl'}`}>
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* App Selection */}
                <div>
                  <label className="text-sm font-black uppercase tracking-widest block mb-4 opacity-60">1. Choose Application</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                    {popularApps.map((app, i) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + (i * 0.05) }}
                        key={app.url}
                        type="button"
                        onClick={() => {
                          setDomain(app.url);
                          setCategory(app.cat);
                        }}
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-black transition-all ${app.color} ${domain === app.url ? 'ring-4 ring-blue-500 ring-offset-4 shadow-lg shadow-blue-500/30' : 'opacity-80 hover:opacity-100'}`}
                      >
                        {app.icon}
                      </motion.button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Or type URL (e.g., netflix.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className={`w-full p-5 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest block opacity-60">2. Select Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat, i) => (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (i * 0.05) }}
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`p-4 rounded-2xl border-2 font-bold flex items-center gap-2 transition-all ${category === cat.name ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600' : 'border-slate-100 dark:border-slate-700 opacity-60 hover:opacity-100'}`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest block opacity-60">3. Set Daily Duration</label>
                  <div className="flex flex-wrap gap-3">
                    {timePresets.map((preset, i) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (i * 0.05) }}
                        key={preset.value}
                        type="button"
                        onClick={() => setLimitMinutes(preset.value.toString())}
                        className={`px-6 py-3 rounded-full font-bold transition-all ${limitMinutes === preset.value.toString() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                      >
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Custom Minutes (1 - 1440)"
                    value={limitMinutes}
                    onChange={(e) => setLimitMinutes(e.target.value)}
                    className={`w-full p-5 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {loading ? "Activating..." : "Activate Restriction 🔒"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* 3. Analysis Charts Section (බාර් චාර්ට් සහ පයි චාර්ට්) */}
        <motion.div 
          id="charts-container"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className={`max-w-6xl mx-auto mt-16 p-8 rounded-[3rem] ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'} shadow-2xl`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <h2 className="text-4xl font-black tracking-tight">
              Focus Insights <span data-html2canvas-ignore="true" className="text-blue-600 opacity-60 text-xl font-medium block md:inline mt-2 md:mt-0">(Report)</span>
            </h2>
            <button 
              data-html2canvas-ignore="true"
              onClick={downloadPDF}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
            >
              📄 Download PDF
            </button>
          </div>
          
          <h3 className="text-2xl font-bold tracking-tight mb-6 opacity-80">
            Configured Limits <span data-html2canvas-ignore="true" className="text-blue-600 opacity-60 text-sm font-medium">(Form Data)</span>
          </h3>
          <div id="pdf-section-limits" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <LimitsChart />
            <div className={`p-8 rounded-[3rem] flex items-center justify-center border shadow-xl transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
               <div className="text-center p-6">
                 <div className="text-6xl mb-6 drop-shadow-lg">🎯</div>
                 <h3 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Your Focus Goals</h3>
                 <p className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>These limits act as your daily targets to reduce distractions and stay on track.</p>
               </div>
            </div>
          </div>

          <div id="pdf-section-usage" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UsageChart />
            <UsagePieChart />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div id="pdf-section-comparison"><ComparisonChart /></div>
            <div id="pdf-section-category"><CategoryChart /></div>
          </div>
        </motion.div>

      </div> {/* මුළු Content එකම වහන ප්‍රධාන Div එක */}
    </>
  );
};

export default SetLimitForm;