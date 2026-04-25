import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { CheckCircle2, Leaf, RotateCcw, Flame, Plus, Trash2, Edit3, Calendar, TrendingDown, Hourglass, Sparkles, Moon, Sun, Settings, X, AlertCircle, FileText, Download } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

const HEALTH_MILESTONES = [
    { label: '20 Mins', desc: 'Heart rate drops', icon: '❤️', hours: 0.33, color: 'rose' },
    { label: '12 Hours', desc: 'CO levels normal', icon: '🌬️', hours: 12, color: 'blue' },
    { label: '48 Hours', desc: 'Smell/Taste improves', icon: '👅', hours: 48, color: 'amber' },
    { label: '72 Hours', desc: 'Breathing easier', icon: '🫁', hours: 72, color: 'emerald' },
    { label: '2 Weeks', desc: 'Lungs healing', icon: '🩸', hours: 336, color: 'indigo' },
    { label: '1 Month', desc: 'Cilia regains function', icon: '🧬', hours: 720, color: 'purple' },
    { label: '1 Year', desc: 'Heart risk cuts in half', icon: '🏆', hours: 8760, color: 'orange' }
];

// ── Animation Variants ──
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 18 } }
};
const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
};
const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
};
const milestoneVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 100, damping: 20 } })
};

// ── Animated Number Counter ──
const AnimatedCounter = ({ value, className }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });
    const display = useTransform(spring, (val) => Math.round(val).toLocaleString());
    const isInView = useInView(ref, { once: true });
    useEffect(() => { if (isInView) motionValue.set(value); }, [isInView, value, motionValue]);
    return <motion.span ref={ref} className={className}>{display}</motion.span>;
};

// ── Toast Notification ──
const Toast = ({ message, type = 'success', onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            type === 'success' ? 'bg-secondary text-white border-secondary' : 'bg-rose-500 text-white border-rose-400'
        }`}
    >
        {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-bold tracking-tight">{message}</span>
    </motion.div>
);

// ── Floating Orb ──
const FloatingOrb = ({ style, className }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        style={style}
        animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
);

const HabitImpactPage = () => {
    const [loading, setLoading]     = useState(true);
    const [status, setStatus]       = useState(null);
    const [isSaving, setIsSaving]   = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [toast, setToast] = useState(null);
    const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('fp-dark') === 'true');

    const [form, setForm] = useState({ habitType: 'Smoking', cps: 15, years: 8, packPrice: 1500 });
    const [logForm, setLogForm] = useState({
        id: null,
        date: new Date().toISOString().split('T')[0],
        count: 0,
        unitPrice: 130
    });

    const isSmoking = form.habitType === 'Smoking';
    const priceTiers = [90, 110, 130, 160, 170];

    const token = localStorage.getItem('token');
    let userName = 'Guest';
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || decoded.unique_name || 'Guest';
        } catch (e) { console.error('Token decode error:', e); }
    }

    const API_URL = 'http://localhost:5005/api/habit';

    // Persist dark mode preference
    const toggleDark = () => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('fp-dark', String(next));
            return next;
        });
    };

    useEffect(() => { fetchStatus(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    useEffect(() => { fetchStatus(); }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/${userName}`);
            if (res.data && res.data.message !== 'First_Time_User') {
                setStatus(res.data);
                setForm({ habitType: res.data.habitType || 'Smoking', cps: res.data.dailyAmount || 15, years: res.data.yearsActive || 8, packPrice: res.data.unitPrice || 1500 });
            }
        } catch { console.log('No existing status.'); }
        finally { setLoading(false); }
    };

    const handleUpdateProjection = async (isStarting = false) => {
        setIsSaving(true);
        try {
            const newStatus = { ...status, habitType: form.habitType, dailyAmount: form.cps, yearsActive: form.years, unitPrice: form.packPrice, userId: userName, quitDate: (isStarting || !status) ? new Date().toISOString() : status.quitDate, dailyLogs: status?.dailyLogs || [], updatedAt: new Date().toISOString() };
            if (!newStatus.id || newStatus.id === 'null') delete newStatus.id;
            await axios.post(API_URL, newStatus);
            setStatus(newStatus);
            setShowSettings(false);
            showToast(isStarting ? 'Journey Started! 🚀' : 'Baseline Updated! ✨');
            if (isStarting) triggerConfetti();
            setTimeout(() => setIsSaving(false), 500);
        } catch { showToast('Failed to sync. Please try again.', 'error'); setIsSaving(false); }
    };

    const handleSaveLog = async () => {
        if (logForm.count < 0) return showToast('Please enter a valid count.', 'error');
        setIsLogging(true);
        try {
            const logEntry = { id: logForm.id || Math.random().toString(36).substr(2, 9), date: new Date(logForm.date).toISOString(), count: Number(logForm.count), unitPrice: Number(logForm.unitPrice) };
            await axios.post(`${API_URL}/log/${userName}`, logEntry);
            await fetchStatus();
            setLogForm({ id: null, date: new Date().toISOString().split('T')[0], count: 0, unitPrice: 130 });
            setIsLogging(false);
            showToast('Log entry saved! 📝');
        } catch { showToast('Failed to save log entry.', 'error'); setIsLogging(false); }
    };

    const handleMarkTodayClean = async () => {
        setIsLogging(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await axios.post(`${API_URL}/log/${userName}`, { id: Math.random().toString(36).substr(2, 9), date: new Date(today).toISOString(), count: 0, unitPrice: 0 });
            await fetchStatus();
            setIsLogging(false);
            showToast('Another clean day! Amazing! 🌿');
            triggerConfetti();
        } catch { showToast('Failed to mark today as clean.', 'error'); setIsLogging(false); }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('Delete this entry?')) return;
        try { 
            await axios.delete(`${API_URL}/log/${userName}/${logId}`); 
            fetchStatus(); 
            showToast('Entry deleted successfully.');
        }
        catch { showToast('Failed to delete log.', 'error'); }
    };

    const handleEditLog = (log) => {
        setLogForm({ id: log.id, date: new Date(log.date).toISOString().split('T')[0], count: log.count, unitPrice: log.unitPrice });
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset your streak?')) return;
        try { await axios.delete(`${API_URL}/${userName}`); setStatus(null); fetchStatus(); }
        catch { console.error('Reset failed'); }
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(225, 29, 72); // rose-600
        doc.text('Freedom Path Recovery Report', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`User Index: ${userName}`, 14, 32);
        doc.text(`Report Period: ${monthYear}`, 14, 37);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

        // Summary Cards
        doc.setDrawColor(240);
        doc.setFillColor(252, 252, 252);
        doc.roundedRect(14, 50, 60, 25, 3, 3, 'FD');
        doc.roundedRect(80, 50, 60, 25, 3, 3, 'FD');
        doc.roundedRect(146, 50, 50, 25, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('MONTHLY SPENDING', 19, 57);
        doc.text('LIFE REGAINED', 85, 57);
        doc.text('STREAK', 151, 57);

        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text(`Rs. ${monthlySpending.toLocaleString()}`, 19, 67);
        doc.text(`${lifeRegainedYears.toFixed(1)} Years`, 85, 67);
        doc.text(`${streakDays} Days`, 151, 67);

        // --- Custom Manual Table ---
        let yPos = 85;
        const headers = ['DATE', 'UNITS / AMOUNT', 'UNIT PRICE', 'TOTAL COST'];
        const colWidths = [45, 45, 45, 45];
        const startX = 14;

        // Header Background
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(startX, yPos, 182, 12, 1, 1, 'F');
        
        // Header Text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        headers.forEach((h, i) => {
            doc.text(h, startX + 5 + (i * 45), yPos + 8);
        });

        yPos += 12;
        doc.setFont('helvetica', 'normal');
        
        const sortedLogs = [...monthLogs].sort((a,b) => new Date(a.date) - new Date(b.date));

        sortedLogs.forEach((log, idx) => {
            // Zebra Striping
            if (idx % 2 === 0) {
                doc.setFillColor(252, 252, 252);
                doc.rect(startX, yPos, 182, 10, 'F');
            }

            doc.setTextColor(71, 85, 105); // slate-600
            doc.setFontSize(9);
            
            const dateStr = new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            doc.text(dateStr, startX + 5, yPos + 7);
            doc.text(log.count.toString(), startX + 5 + 45, yPos + 7);
            doc.text(`Rs. ${log.unitPrice}`, startX + 5 + 90, yPos + 7);
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59); // slate-800
            doc.text(`Rs. ${(log.count * log.unitPrice).toLocaleString()}`, startX + 5 + 135, yPos + 7);
            doc.setFont('helvetica', 'normal');

            yPos += 10;

            // Page break check
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });

        const finalY = yPos;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('This report is generated by EduSync Wellness Monitoring.', 14, finalY + 15);

        doc.save(`FreedomPath_Report_${monthYear.replace(' ', '_')}.pdf`);
        showToast('Report generated successfully! 📑');
    };

    // ── Dark mode style helpers ──
    const d = (light, dark) => darkMode ? dark : light;

    // Token aliases for readability
    const bg        = d('bg-[#fafafc]',  'bg-[#0f111a]');
    const card      = d('bg-white',      'bg-[#1a1d2e]');
    const cardBorder= d('border-slate-100', 'border-slate-700/40');
    const cardShadow= d('shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]', 'shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]');
    const textPrimary = d('text-slate-800',  'text-slate-100');
    const textSecond  = d('text-slate-500',  'text-slate-400');
    const textMuted   = d('text-slate-400',  'text-slate-500');
    const inputBg     = d('bg-slate-50',     'bg-slate-800');
    const divider     = d('border-slate-50', 'border-slate-700/40');

    if (loading) {
        return (
            <div className={`min-h-screen ${bg} flex items-center justify-center transition-colors duration-500`}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-rose-500" />
            </div>
        );
    }

    const isJourneyActive = !!status;
    const quitDate  = status?.quitDate ? new Date(status.quitDate) : null;
    const now       = new Date();
    const diffMs    = quitDate ? Math.max(0, now - quitDate) : 0;
    const streakDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const streakHours = diffMs / (1000 * 60 * 60);

    const dailyBaselineCost = isSmoking ? (form.cps / 20) * form.packPrice : form.cps * form.packPrice;
    const currentMonth = now.getMonth();
    const currentYear  = now.getFullYear();
    const monthLogs    = (status?.dailyLogs || []).filter(log => { const d2 = new Date(log.date); return d2.getMonth() === currentMonth && d2.getFullYear() === currentYear; });
    const monthlySpending = monthLogs.reduce((acc, log) => acc + log.count * log.unitPrice, 0);
    const lifeRegainedYears = isSmoking ? (form.cps * form.years * 1.5) / 100 + 0.2 : (form.cps * form.years * 1.2) / 100 + 0.1;

    const hour = now.getHours();
    const greeting  = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const greetEmoji = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙';

    return (
        <motion.div
            className={`min-h-screen ${bg} ${textPrimary} font-sans selection:bg-primary/10 pb-20 relative overflow-hidden transition-colors duration-500`}
            initial={false} animate={{ backgroundColor: darkMode ? '#0f111a' : '#fafafc' }}
        >
            {/* ── Floating Orbs ── */}
            <FloatingOrb className={d('bg-rose-200/30',   'bg-rose-900/20')}   style={{ width: 400, height: 400, top: -100, left: -150 }} />
            <FloatingOrb className={d('bg-blue-200/20',   'bg-blue-900/15')}   style={{ width: 300, height: 300, top: 200, right: -80 }} />
            <FloatingOrb className={d('bg-orange-100/40', 'bg-purple-900/15')} style={{ width: 250, height: 250, bottom: 100, left: '40%' }} />

            {/* ── Header ── */}
            <motion.div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 mb-4 relative z-10" initial="hidden" animate="visible" variants={containerVariants}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <motion.div className="flex items-center gap-5" variants={slideInLeft}>
                        <motion.div
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border ${card} ${cardBorder} shadow-rose-100`}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            {greetEmoji}
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">{greeting}</p>
                                <span className={`w-1 h-1 rounded-full ${d('bg-slate-300','bg-slate-600')}`} />
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                                    </span>
                                    <span className={`text-[10px] font-bold ${textMuted} uppercase tracking-widest hidden sm:inline-block`}>Tracking Active</span>
                                </div>
                            </div>
                            <h1 className={`text-3xl md:text-5xl font-black tracking-tight ${textPrimary}`}>
                                Freedom <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">Path</span>
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div className="flex items-center gap-3" variants={slideInRight}>
                        {/* Settings Button */}
                        <motion.button
                            onClick={() => setShowSettings(true)}
                            className={`p-3 rounded-2xl border ${card} ${cardBorder} ${textMuted} hover:${textPrimary} transition-all shadow-sm`}
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            title="Baseline Settings"
                        >
                            <Settings size={20} />
                        </motion.button>

                        {/* Dark mode toggle */}
                        <motion.button
                            onClick={toggleDark}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                            whileTap={{ scale: 0.95 }}
                            title="Toggle dark mode"
                        >
                            <motion.div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${darkMode ? 'bg-white text-primary' : 'bg-white text-amber-500'}`}
                                animate={{ x: darkMode ? 26 : 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {darkMode ? <Moon size={11} /> : <Sun size={11} />}
                            </motion.div>
                        </motion.button>
                        <motion.div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 ${cardBorder} shadow-sm cursor-pointer`} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                            <img src={`https://ui-avatars.com/api/?name=${userName}&background=ffe4e6&color=e11d48`} alt="Profile" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Content Grid ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 xl:grid-cols-12 gap-12 relative z-10">

                {/* ──── LEFT COLUMN ──── */}
                <motion.div className="xl:col-span-4 space-y-8 sticky top-8 self-start" initial="hidden" animate="visible" variants={containerVariants}>

                    {/* Image */}
                    <motion.div className={`${card} p-2 rounded-[2.5rem] border ${cardBorder} ${cardShadow} overflow-hidden`} variants={cardVariants} whileHover={{ scale: 1.02 }} transition={{ type:'spring', stiffness:200, damping:20 }}>
                        <img src="/How-to-Stop-Smoking.png" alt="Freedom Path" className="w-full h-48 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-700" />
                    </motion.div>

                    {/* Video Insight */}
                    <motion.div className={`${card} p-4 rounded-[2rem] border ${cardBorder} shadow-sm relative overflow-hidden group`} variants={cardVariants} whileHover={{ scale: 1.01 }}>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" animate={{ x: ['-100%','200%'] }} transition={{ duration:3, repeat:Infinity, repeatDelay:4, ease:'easeInOut' }} />
                        <div className="flex items-center gap-3 mb-3">
                            <motion.div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg" animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}>
                                <Leaf size={14} />
                            </motion.div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Recovery Insight</p>
                        </div>
                        <div className={`rounded-xl overflow-hidden shadow-inner ${inputBg}`}>
                            <video src="/addiction_bird.mp4" autoPlay loop muted playsInline className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>

                    {/* Streak Card */}
                    <motion.div className={`${card} p-8 rounded-[2.5rem] border ${cardBorder} ${cardShadow}`} variants={cardVariants}>
                        {isJourneyActive ? (
                            <div className="text-center">
                                <motion.span className="text-[10px] font-black uppercase tracking-widest text-[#0F4C81] bg-primary/10 px-4 py-1.5 rounded-full mb-6 inline-block" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, type:'spring' }}>
                                    Active Journey
                                </motion.span>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <AnimatedCounter value={streakDays} className={`text-7xl font-black ${textPrimary} tracking-tighter tabular-nums`} />
                                    <span className={`text-2xl font-bold ${textMuted}`}>Days</span>
                                </div>
                                <p className={`text-xs font-bold ${textSecond} uppercase tracking-widest mb-8`}>Freedom Momentum</p>
                                <motion.button onClick={handleReset} className="text-[11px] font-black uppercase text-rose-500 flex items-center gap-2 mx-auto hover:text-rose-400 px-6 py-3 bg-rose-500/10 rounded-xl transition" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                                    <RotateCcw size={14} /> Reset Progress
                                </motion.button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <motion.div className={`w-16 h-16 ${inputBg} rounded-3xl ${textMuted} flex items-center justify-center mx-auto mb-6 shadow-inner`} animate={{ scale:[1,1.08,1] }} transition={{ duration:2, repeat:Infinity }}>
                                    <Flame size={32} />
                                </motion.div>
                                <h4 className={`text-2xl font-black ${textPrimary} mb-3 tracking-tight`}>Ready to break free?</h4>
                                <p className={`text-sm ${textSecond} font-medium mb-8 leading-relaxed px-4`}>Set your baseline and take the first step towards a healthier, wealthier you.</p>
                                <motion.button onClick={() => setShowSettings(true)} className={`w-full py-4 ${d('bg-[#1f2937] text-white','bg-slate-100 text-slate-900')} font-bold rounded-2xl shadow-lg transition-all`} whileHover={{ scale:1.03, boxShadow:'0 10px 30px rgba(0,0,0,0.2)' }} whileTap={{ scale:0.97 }}>
                                    Configure Dashboard
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                    {/* Daily Log Form */}
                    <AnimatePresence>
                        {isJourneyActive && (
                            <motion.div initial={{ opacity:0, y:30, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20, scale:0.95 }} transition={{ type:'spring', stiffness:100, damping:18 }} className={`${card} p-8 rounded-[2.5rem] border ${d('border-blue-100','border-blue-900/40')} shadow-[0_25px_60px_-20px_rgba(30,58,138,0.08)] relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <h3 className={`text-xl font-black ${textPrimary} mb-6 flex items-center gap-3`}>
                                    <motion.div className="p-2 bg-primary text-white rounded-lg" whileHover={{ rotate:90 }} transition={{ type:'spring', stiffness:200 }}>
                                        <Plus size={18} strokeWidth={3} />
                                    </motion.div>
                                    Log Daily Usage
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Date</label>
                                        <div className="relative">
                                            <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} size={16} />
                                            <input type="date" value={logForm.date} onChange={e => setLogForm({...logForm, date:e.target.value})} className={`w-full h-14 ${inputBg} border-none rounded-2xl pl-12 pr-5 text-sm font-bold ${textPrimary} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Amount Smoked</label>
                                        <input type="number" placeholder="0" value={logForm.count||''} onChange={e=>setLogForm({...logForm,count:e.target.value})} className={`w-full h-16 ${inputBg} border-none rounded-2xl px-6 text-2xl font-black ${textPrimary} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Price Per Cigarette (LKR)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {priceTiers.map(price => (
                                                <motion.button key={price} onClick={() => setLogForm({...logForm, unitPrice:price})} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${logForm.unitPrice === price ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : `${inputBg} ${textSecond} hover:opacity-80`}`} whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}>
                                                    Rs.{price}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.button onClick={handleSaveLog} disabled={isLogging} className="w-full h-14 bg-primary hover:bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all disabled:opacity-50" whileHover={{ scale:1.02, boxShadow:'0 15px 30px rgba(37,99,235,0.3)' }} whileTap={{ scale:0.97 }}>
                                        {isLogging ? 'Saving...' : (logForm.id ? 'Update Log Entry' : 'Add Log Entry')}
                                    </motion.button>
                                    {logForm.id && (
                                        <button onClick={() => setLogForm({id:null,date:new Date().toISOString().split('T')[0],count:0,unitPrice:130})} className={`w-full text-xs font-bold ${textMuted} hover:${textSecond} transition`}>
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ──── RIGHT COLUMN ──── */}
                <motion.div className="xl:col-span-8 space-y-8" initial="hidden" animate="visible" variants={containerVariants}>

                    {/* Stats Row */}
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={cardVariants}>
                        {/* Monthly Spending */}
                        <motion.div className={`${card} rounded-[2.5rem] p-10 ${cardShadow} border ${cardBorder} relative overflow-hidden group flex flex-col h-full`} whileHover={{ scale:1.02, boxShadow: darkMode ? '0 25px 60px -20px rgba(244,63,94,0.2)' : '0 25px 60px -20px rgba(244,63,94,0.12)' }} transition={{ type:'spring', stiffness:200, damping:20 }}>
                            <div className={`absolute inset-0 ${d('bg-gradient-to-br from-rose-50/0 to-rose-50/60','bg-gradient-to-br from-rose-900/0 to-rose-900/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]`} />
                            <motion.div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-8 shadow-sm" whileHover={{ rotate:-10, scale:1.1 }}>
                                <TrendingDown size={28} />
                            </motion.div>
                            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-1">Monthly Spending</p>
                            <h3 className={`text-[3.5rem] font-black ${textPrimary} tracking-tighter leading-none mb-6 flex items-baseline gap-2`}>
                                Rs. <AnimatedCounter value={monthlySpending} className="tabular-nums" />
                            </h3>
                            <div className={`mt-auto pt-6 border-t ${divider} flex items-center justify-between`}>
                                <span className={`text-xs font-bold ${textMuted}`}>Total logs: {monthLogs.length}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${inputBg} rounded-md ${textMuted}`}>
                                    {now.toLocaleString('default',{month:'long'})}
                                </span>
                            </div>
                        </motion.div>

                        {/* Vitality Roadmap */}
                        <motion.div className={`${card} rounded-[2.5rem] p-10 ${cardShadow} border ${cardBorder} flex flex-col h-full`} whileHover={{ scale:1.02 }} transition={{ type:'spring', stiffness:200, damping:20 }}>
                            <div className="flex items-center justify-between mb-8">
                                <motion.div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm" whileHover={{ rotate:10, scale:1.1 }}>
                                    <Hourglass size={28} />
                                </motion.div>
                                <div className="text-right">
                                    <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">Life Regained</p>
                                    <h3 className={`text-4xl font-black ${textPrimary} tracking-tighter leading-none`}>
                                        {lifeRegainedYears.toFixed(1)} <span className={`text-sm font-bold ${d('opacity-30','opacity-40')}`}>Yrs</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <h4 className={`text-xs font-black ${textMuted} uppercase tracking-[0.2em] mb-4`}>Vitality Roadmap</h4>
                                {HEALTH_MILESTONES.map((m, i) => {
                                    const isAchieved = streakHours >= m.hours;
                                    return (
                                        <motion.div key={m.label} custom={i} initial="hidden" animate="visible" variants={milestoneVariants} className={`flex items-center gap-4 transition-all duration-500 ${isAchieved ? 'opacity-100' : 'opacity-30 grayscale-[0.5]'}`}>
                                            <motion.div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-white/5 ${isAchieved ? `bg-${m.color}-500/10 text-xl` : `${inputBg} text-base opacity-50`}`} animate={isAchieved ? { scale:[1,1.15,1] } : {}} transition={{ duration:1.5, repeat:isAchieved?Infinity:0, repeatDelay:2 }}>
                                                {isAchieved ? m.icon : '🔒'}
                                            </motion.div>
                                            <div className="flex-1">
                                                <p className={`text-[11px] font-black uppercase tracking-widest ${isAchieved ? `text-${m.color}-500` : textMuted}`}>{m.label}</p>
                                                <p className={`text-[13px] font-bold ${textSecond} leading-tight`}>{m.desc}</p>
                                            </div>
                                            {isAchieved && (
                                                <motion.div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-white" initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:200, delay:i*0.1 }}>
                                                    <CheckCircle2 size={12} />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className={`pt-8 mt-8 border-t ${divider}`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-secondary" />
                                    <span className={`text-xs font-bold ${textSecond}`}>Biological recovery active</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Freedom Calendar */}
                    <motion.div className={`${card} rounded-[2.5rem] p-10 ${cardShadow} border ${cardBorder}`} variants={cardVariants}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className={`text-2xl font-black ${textPrimary} tracking-tight`}>Freedom Calendar</h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted} mt-1`}>{now.toLocaleString('default',{month:'long',year:'numeric'})}</p>
                            </div>
                            <motion.button onClick={handleMarkTodayClean} disabled={isLogging} className="px-5 py-2.5 bg-secondary/10 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/20 hover:bg-secondary/20 transition-all flex items-center gap-2" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                                <CheckCircle2 size={14} /> Mark Today Clean
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {['S','M','T','W','T','F','S'].map((dd,i) => (
                                <div key={i} className={`text-center text-[10px] font-black ${textMuted} py-2`}>{dd}</div>
                            ))}
                            {Array.from({ length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() }).map((_,i) => <div key={`e${i}`} />)}
                            {Array.from({ length: new Date(now.getFullYear(), now.getMonth()+1, 0).getDate() }).map((_,i) => {
                                const day = i + 1;
                                const dateStr = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0];
                                const log = (status?.dailyLogs||[]).find(l => new Date(l.date).toISOString().split('T')[0] === dateStr);
                                const isToday = day === now.getDate() && now.getMonth() === new Date().getMonth();
                                const isFuture = new Date(now.getFullYear(), now.getMonth(), day) > now;
                                const isAfterQuit = status?.quitDate && new Date(dateStr) >= new Date(new Date(status.quitDate).setHours(0,0,0,0));

                                let cellClass = inputBg;
                                let textClass = textMuted;
                                let icon = null;
                                if (log) {
                                    if (log.count === 0) { cellClass = 'bg-secondary shadow-lg shadow-emerald-500/20'; textClass = 'text-white'; icon = <Leaf size={8} />; }
                                    else                 { cellClass = 'bg-rose-500 shadow-lg shadow-rose-500/20'; textClass = 'text-white'; icon = <Flame size={8} />; }
                                } else if (isAfterQuit && !isFuture) {
                                    cellClass = `${inputBg} border border-dashed ${d('border-slate-200','border-slate-600')}`;
                                }

                                return (
                                    <motion.div key={day} onClick={() => setLogForm({...logForm, date:dateStr})} className={`group aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer relative ${cellClass} ${textClass}`} initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.015, type:'spring', stiffness:200, damping:20 }} whileHover={{ scale:1.15, zIndex:10 }} whileTap={{ scale:0.9 }}>
                                        <span className="text-xs font-black">{day}</span>
                                        {icon && <div className="mt-0.5">{icon}</div>}
                                        {isToday && !log && (
                                            <motion.div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" animate={{ scale:[1,1.5,1], opacity:[1,0.5,1] }} transition={{ duration:1.5, repeat:Infinity }} />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className={`mt-8 pt-8 border-t ${divider} flex items-center justify-center gap-6`}>
                            {[{color:'bg-secondary',label:'Clean Day'},{color:'bg-rose-500',label:'Usage Logged'},{color:`${inputBg} border border-dashed ${d('border-slate-300','border-slate-600')}`,label:'Pending'}].map(({color,label}) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${color}`} />
                                    <span className={`text-[10px] font-black uppercase ${textMuted} tracking-widest`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Log History */}
                    <motion.div className={`${card} rounded-[2.5rem] p-10 ${cardShadow} border ${cardBorder}`} variants={cardVariants}>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className={`text-2xl font-black ${textPrimary} tracking-tight`}>Logging History</h3>
                            <div className="flex items-center gap-3">
                                <motion.button 
                                    onClick={handleDownloadReport}
                                    className={`p-2.5 ${inputBg} ${textMuted} hover:${textPrimary} rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border ${cardBorder}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Download size={14} /> PDF Report
                                </motion.button>
                                <motion.div className={`px-5 py-2 ${inputBg} rounded-2xl text-[10px] font-black uppercase tracking-widest ${textMuted}`} animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:2, repeat:Infinity }}>
                                    Total: {status?.dailyLogs?.length || 0}
                                </motion.div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {(status?.dailyLogs||[]).sort((a,b) => new Date(b.date)-new Date(a.date)).map((log, idx) => (
                                    <motion.div key={log.id} layout initial={{ opacity:0, x:-30, scale:0.95 }} animate={{ opacity:1, x:0, scale:1 }} exit={{ opacity:0, x:30, scale:0.95 }} transition={{ delay:idx*0.04, type:'spring', stiffness:100, damping:18 }} className={`group flex items-center justify-between p-6 ${d('bg-slate-50/50 hover:bg-white','bg-slate-800/40 hover:bg-slate-800')} rounded-[2rem] border border-transparent ${d('hover:border-slate-100','hover:border-slate-700/50')} transition-all duration-300 hover:shadow-xl`} whileHover={{ x:4 }}>
                                        <div className="flex items-center gap-6">
                                            <motion.div className={`w-14 h-14 rounded-2xl ${card} border ${cardBorder} flex flex-col items-center justify-center shadow-sm`} whileHover={{ rotate:-5, scale:1.05 }}>
                                                <span className={`text-[9px] font-black uppercase ${textMuted} leading-none mb-0.5`}>{new Date(log.date).toLocaleString('default',{month:'short'})}</span>
                                                <span className={`text-xl font-black ${textPrimary} leading-none`}>{new Date(log.date).getDate()}</span>
                                            </motion.div>
                                            <div>
                                                <span className={`text-lg font-black ${textPrimary} leading-none`}>{log.count} <span className={`text-xs font-bold ${textMuted}`}>units</span></span>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Price: Rs.{log.unitPrice}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <motion.button onClick={() => handleEditLog(log)} className={`p-3 ${card} border ${cardBorder} ${textMuted} hover:text-primary hover:border-primary/20 rounded-xl transition-all shadow-sm`} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}>
                                                <Edit3 size={16} />
                                            </motion.button>
                                            <motion.button onClick={() => handleDeleteLog(log.id)} className={`p-3 ${card} border ${cardBorder} ${textMuted} hover:text-rose-500 hover:border-rose-500/20 rounded-xl transition-all shadow-sm`} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}>
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </div>
                                        <div className={`text-right group-hover:hidden`}>
                                            <p className={`text-lg font-black ${textMuted} leading-none mb-1`}>Rs. {(log.count*log.unitPrice).toLocaleString()}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${d('text-slate-300','text-slate-600')}`}>Total Spent</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(!status?.dailyLogs || status.dailyLogs.length === 0) && (
                                <motion.div className="py-20 text-center" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring' }}>
                                    <motion.div className={`w-20 h-20 ${inputBg} rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${textMuted} shadow-inner`} animate={{ rotate:[0,5,-5,0] }} transition={{ duration:3, repeat:Infinity }}>
                                        <Sparkles size={32} />
                                    </motion.div>
                                    <p className={`text-sm font-bold ${textMuted}`}>No logs yet. Start tracking your daily usage above!</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Settings Modal ── */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:20 }} className={`${card} w-full max-w-lg p-10 rounded-[3rem] border ${cardBorder} shadow-2xl relative z-10 overflow-hidden`}>
                             <div className="absolute top-0 right-0 p-6">
                                <motion.button onClick={() => setShowSettings(false)} className={`p-3 rounded-full ${inputBg} ${textMuted} hover:${textPrimary} transition-all`} whileHover={{ rotate:90 }} whileTap={{ scale:0.9 }}>
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <motion.div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-8" whileHover={{ rotate:10 }}>
                                <Settings size={32} />
                            </motion.div>

                            <h2 className="text-3xl font-black tracking-tight mb-2">Journey Settings</h2>
                            <p className={`${textMuted} text-sm font-medium mb-10`}>Configure your habit baseline to track impact more accurately.</p>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Daily Average</label>
                                        <div className="relative group">
                                            <input type="number" value={form.cps} onChange={e=>setForm({...form,cps:Number(e.target.value)})} className={`w-full h-16 ${inputBg} border-none rounded-2xl px-6 text-xl font-bold ${textPrimary} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Pack Price (LKR)</label>
                                        <div className="relative group">
                                            <input type="number" value={form.packPrice} onChange={e=>setForm({...form,packPrice:Number(e.target.value)})} className={`w-full h-16 ${inputBg} border-none rounded-2xl px-6 text-xl font-bold ${textPrimary} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-[10px] uppercase font-black ${textMuted} tracking-widest ml-1`}>Years Active</label>
                                    <input type="number" value={form.years} onChange={e=>setForm({...form,years:Number(e.target.value)})} className={`w-full h-16 ${inputBg} border-none rounded-2xl px-6 text-xl font-bold ${textPrimary} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`} />
                                </div>

                                <motion.button onClick={() => handleUpdateProjection(!isJourneyActive)} disabled={isSaving} className="w-full h-16 bg-primary hover:bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                                    {isSaving ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : isJourneyActive ? 'Update Baseline' : 'Initialize Journey'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Toast Notifications ── */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <style>{`
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                ::-webkit-scrollbar { width: 10px; }
                ::-webkit-scrollbar-track { background: ${darkMode ? '#0f111a' : '#fafafc'}; }
                ::-webkit-scrollbar-thumb { background: ${darkMode ? '#334155' : '#e2e8f0'}; border-radius: 10px; border: 3px solid ${darkMode ? '#0f111a' : '#fafafc'}; }
                ::-webkit-scrollbar-thumb:hover { background: ${darkMode ? '#475569' : '#cbd5e1'}; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: ${darkMode ? 'invert(1)' : 'none'}; }
            `}</style>
        </motion.div>
    );
};

export default HabitImpactPage;


