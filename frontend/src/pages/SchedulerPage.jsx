import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Target, Calendar as CalIcon, ArrowRight, BellRing, ShieldCheck, Trash2, Pencil, X, Save, BookOpen, Gem, Zap, Layers } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';

const SchedulerPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0');

    const [form, setForm] = useState({
        title: '', subject: '', fromDate: todayStr, startTime: '', duration: '30'
    });

    const token = localStorage.getItem('token');

    // --- SMART IDENTITY FINDER (EXTRACT FROM JWT) ---
    let userEmail = "";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const identity = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.unique_name;
            userEmail = (identity && !identity.includes('@')) ? `${identity.toLowerCase()}@gmail.com` : identity;
        } catch (e) { }
    }
    if (!userEmail) userEmail = localStorage.getItem('userEmail') || "Guest_Student";

    const API_URL = "http://localhost:5005/api/scheduler";

    useEffect(() => {
        fetchSessions();
        if ("Notification" in window) Notification.requestPermission();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_URL}/${userEmail}`);
            setSessions(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Final check to prevent past time on today's date
            if (form.fromDate === todayStr && form.startTime < currentTimeStr) {
                alert("Cannot schedule a session in the past! Please pick a future time.");
                return;
            }

            setLoading(true);
            const finalForm = { ...form, toDate: form.fromDate, userEmail };
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, finalForm);
                alert("Study Plan Updated!");
            } else {
                await axios.post(`${API_URL}/create`, finalForm);
                alert("Study Session Scheduled!");
            }
            resetForm();
            fetchSessions();
        } catch (err) { alert("Action failed."); }
        finally { setLoading(false); }
    };

    const startFocus = async (session) => {
        const isSeconds = session.duration.toString().includes('s');
        const durationValue = parseInt(session.duration);
        const durationMs = isSeconds ? durationValue * 1000 : durationValue * 60 * 1000;
        const displayLabel = isSeconds ? `${durationValue} Seconds` : `${durationValue} Minutes`;

        // Attempt to request permission, but don't block the feature if denied
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }

        // Instant Confirmation (Browser Notification if allowed, else just alert)
        if (Notification.permission === "granted") {
            new Notification("🚀 Focus Mode Activated!", {
                body: `Target Mission: ${session.title}\nAllocated Time: ${displayLabel}`,
                icon: "https://cdn-icons-png.flaticon.com/512/2593/2593549.png",
                tag: "focus-start"
            });
        }

        // Always show the screen alert to confirm start
        alert(`STUDY PROTOCOL INITIATED: Stay focused for ${displayLabel}!`);

        // Schedule the end protocol (Sound + Alert + Notification)
        setTimeout(() => {
            // 1. ALWAYS PLAY SOUND (Even if notifications are blocked)
            try {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                if (context) {
                    const oscillator = context.createOscillator();
                    const gain = context.createGain();
                    oscillator.connect(gain);
                    gain.connect(context.destination);
                    oscillator.type = "sine";
                    oscillator.frequency.value = 880; // A5 note
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 800); // 0.8s beep
                }
            } catch (e) { console.error("Audio error"); }

            // 2. SHOW BROWSER NOTIFICATION (If allowed)
            if (Notification.permission === "granted") {
                new Notification("⏰ TIME IS UP!", {
                    body: `Your study session for "${session.title}" is complete. Take a break!`,
                    requireInteraction: true,
                    icon: "https://cdn-icons-png.flaticon.com/512/2593/2593549.png",
                    tag: "focus-end"
                });
            }

            // 3. ALWAYS SHOW SCREEN ALERT
            setTimeout(() => {
                alert(`🏁 MISSION COMPLETE: "${session.title}" session finished!\nTake a well-deserved break.`);
            }, 200);

        }, durationMs);

        // Extension integration
        window.postMessage({ type: "START_FOCUS_MODE", duration: isSeconds ? 1 : durationValue }, "*");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchSessions();
        } catch (err) { alert("Delete failed."); }
    };

    const handleEdit = (session) => {
        setIsEditing(true);
        setEditId(session.id);
        const { toDate, ...rest } = session;
        setForm({ ...rest });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ title: '', subject: '', fromDate: todayStr, startTime: '', duration: '30' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="min-h-screen bg-[#F0F2F9] p-8 lg:p-12 font-sans text-slate-800 tracking-tight overflow-x-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">

                {/* PREMIUM FORM SECTION */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-white/70 backdrop-blur-2xl p-10 lg:p-14 rounded-[4rem] shadow-[20px_40px_80px_rgba(30,27,75,0.05)] border border-white relative overflow-hidden"
                >
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-14 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-indigo-600 rounded-[2.2rem] shadow-xl shadow-indigo-200/50 text-white">
                                <CalIcon size={32} className="stroke-[2.5]" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-indigo-950">
                                    {isEditing ? "Modify" : "Smart"} <span className="text-indigo-600">Scheduler</span>
                                </h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Architect your study mission</p>
                            </div>
                        </div>
                        {isEditing && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetForm} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                                <X size={24} />
                            </motion.button>
                        )}
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Topic Identification</label>
                                <input type="text" required placeholder="Advanced Quantum Mechanics..." className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm outline-none font-black text-indigo-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Academic Subject</label>
                                <input type="text" required placeholder="Modern Physics" className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm outline-none font-black text-indigo-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-500 uppercase ml-6 tracking-widest flex items-center gap-2 italic">
                                    Target Execution Date
                                </label>
                                <input type="date" required min={todayStr} className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm outline-none font-black text-indigo-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Launch Time</label>
                                <input
                                    type="time"
                                    required
                                    min={form.fromDate === todayStr ? currentTimeStr : "00:00"}
                                    className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm outline-none font-black text-indigo-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={form.startTime}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-500 uppercase ml-6 tracking-widest">Target Duration</label>
                                <select className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm outline-none font-black text-indigo-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer appearance-none" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                                    <optgroup label="Fast Track (Seconds)">
                                        <option value="5s">🚀 5 Seconds (Quick Test)</option>
                                        <option value="10s">🚀 10 Seconds</option>
                                    </optgroup>
                                    <optgroup label="Deep Focus (Minutes)">
                                        <option value="30">📅 30 Minutes</option>
                                        <option value="60">📅 1 Hour</option>
                                        <option value="120">📅 2 Hours</option>
                                        <option value="180">📅 3 Hours</option>
                                        <option value="240">📅 4 Hours</option>
                                        <option value="300">📅 5 Hours</option>
                                        <option value="360">📅 6 Hours</option>
                                        <option value="420">📅 7 Hours</option>
                                        <option value="480">📅 8 Hours</option>
                                        <option value="540">📅 9 Hours</option>
                                        <option value="600">📅 10 Hours</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ y: -5, shadow: "0 20px 40px rgba(79,70,229,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-7 text-white rounded-[2.8rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase italic ${isEditing ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        >
                            {loading ? <Zap className="animate-pulse" /> : isEditing ? <Layers /> : <Target />}
                            {loading ? "Initializing..." : isEditing ? "Update Core Plan" : "Incorporate Mission"}
                        </motion.button>
                    </form>
                </motion.div>

                {/* PREMIUM SIDEBAR. AGENDA */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-[460px] space-y-8"
                >
                    <div className="bg-indigo-950 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-900/30 border-b-8 border-b-indigo-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Layers size={80} /></div>
                        <h2 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter italic relative z-10">
                            <BellRing size={28} className="text-indigo-400" /> My Agenda
                        </h2>
                        <p className="text-indigo-200/50 text-[10px] font-black mt-2 opacity-70 tracking-[0.2em] uppercase relative z-10">Future Study Parameters</p>
                    </div>

                    <div className="space-y-5 max-h-[750px] overflow-y-auto pr-4 custom-scroll pb-20">
                        <AnimatePresence mode="popLayout">
                            {sessions.map((s, i) => (
                                <motion.div
                                    layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, x: 100 }} transition={{ delay: i * 0.1 }}
                                    key={s.id}
                                    className={`group p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden ${s.fromDate === todayStr ? 'ring-2 ring-emerald-400' : ''}`}
                                >
                                    {s.fromDate === todayStr && (
                                        <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
                                            Active Today
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="max-w-[70%]">
                                            <h3 className="font-black text-indigo-950 text-xl leading-[1.1] mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Layers size={14} /> {s.subject}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(s)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(s.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mb-8 text-[11px] font-black text-indigo-400 uppercase tracking-[0.1em]">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100/50 italic">
                                            <Clock size={14} /> {s.startTime}
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <Gem size={14} /> {s.duration.includes('s') ? s.duration.replace('s', ' SEC') : `${s.duration} MIN`}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => startFocus(s)}
                                        className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2rem] text-[10px] font-black shadow-xl shadow-emerald-200 uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all italic"
                                    >
                                        Initiate Focus Protocol <ShieldCheck size={18} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {sessions.length === 0 && (
                            <div className="text-center py-20 opacity-20">
                                <Target size={80} className="mx-auto mb-4" />
                                <p className="font-black uppercase tracking-[0.3em]">No Active Missions</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                input[type="date"]::-webkit-inner-spin-button, 
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.3) sepia(1) saturate(5) hue-rotate(200deg);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default SchedulerPage;