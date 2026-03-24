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

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
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
        
        {/* 1. Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-6xl mx-auto mb-10 text-left"
        >
          <h1 className="text-6xl font-black tracking-tight mb-4 drop-shadow-sm">
            Digital <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Wellbeing</span> 🧘‍♂️
          </h1>
          <p className="text-xl font-medium opacity-70">
            Stay focused on your studies by limiting time on distracting websites.
          </p>
        </motion.div>

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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-[3rem] flex items-center justify-center border border-blue-100 dark:border-slate-600 shadow-xl">
               <div className="text-center p-6">
                 <div className="text-6xl mb-6 drop-shadow-lg">🎯</div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Your Focus Goals</h3>
                 <p className="text-lg font-medium text-slate-500 dark:text-slate-300">These limits act as your daily targets to reduce distractions and stay on track.</p>
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