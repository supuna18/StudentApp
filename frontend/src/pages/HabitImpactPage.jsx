import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Banknote, Hourglass, CheckCircle2, Leaf, ArrowLeft, RotateCcw, Flame, Plus, Trash2, Edit3, Calendar, TrendingDown } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const HabitImpactPage = () => {
    const navigate = useNavigate();

    // Basic User Session State
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    // Baseline Form State
    const [form, setForm] = useState({
        habitType: 'Smoking',
        cps: 15,
        years: 8,
        packPrice: 1500
    });

    // Daily Log Form State
    const [logForm, setLogForm] = useState({
        id: null,
        date: new Date().toISOString().split('T')[0],
        count: 0,
        unitPrice: 130
    });

    const isSmoking = form.habitType === 'Smoking';
    const priceTiers = [90, 110, 130, 160, 170];

    // Auth Token Handling
    const token = localStorage.getItem('token');
    let userName = "Guest";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name || decoded.unique_name || "Guest";
        } catch (e) { console.error("Error decoding token:", e); }
    }

    const API_URL = "http://localhost:5005/api/habit";

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/${userName}`);
            if (res.data && res.data.message !== "First_Time_User") {
                setStatus(res.data);
                setForm({
                    habitType: res.data.habitType || 'Smoking',
                    cps: res.data.dailyAmount || 15,
                    years: res.data.yearsActive || 8,
                    packPrice: res.data.unitPrice || 1500
                });
            }
        } catch (err) {
            console.log("No existing status found.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProjection = async (isStarting = false) => {
        setIsSaving(true);
        try {
            const newStatus = {
                ...status,
                habitType: form.habitType,
                dailyAmount: form.cps,
                yearsActive: form.years,
                unitPrice: form.packPrice,
                userId: userName,
                quitDate: (isStarting || !status) ? new Date().toISOString() : status.quitDate,
                dailyLogs: status?.dailyLogs || [],
                updatedAt: new Date().toISOString()
            };

            // Remove id completely if it is not a valid existing ID to avoid sending null to backend
            if (!newStatus.id || newStatus.id === "null") {
                delete newStatus.id;
            }

            await axios.post(API_URL, newStatus);
            setStatus(newStatus);
            setTimeout(() => setIsSaving(false), 500);
        } catch (err) {
            alert("Failed to update projection.");
            setIsSaving(false);
        }
    };

    const handleSaveLog = async () => {
        if (logForm.count <= 0) return alert("Please enter a valid count.");
        setIsLogging(true);
        try {
            const logEntry = {
                id: logForm.id || Math.random().toString(36).substr(2, 9),
                date: new Date(logForm.date).toISOString(),
                count: Number(logForm.count),
                unitPrice: Number(logForm.unitPrice)
            };
            await axios.post(`${API_URL}/log/${userName}`, logEntry);

            // Re-fetch to get updated list
            await fetchStatus();

            // Reset form
            setLogForm({ id: null, date: new Date().toISOString().split('T')[0], count: 0, unitPrice: 130 });
            setIsLogging(false);
        } catch (err) {
            alert("Failed to save log entry.");
            setIsLogging(false);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm("Delete this entry?")) return;
        try {
            await axios.delete(`${API_URL}/log/${userName}/${logId}`);
            fetchStatus();
        } catch (err) {
            alert("Failed to delete log.");
        }
    };

    const handleEditLog = (log) => {
        setLogForm({
            id: log.id,
            date: new Date(log.date).toISOString().split('T')[0],
            count: log.count,
            unitPrice: log.unitPrice
        });
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset your streak? This will erase your current active progress!")) return;
        try {
            await axios.delete(`${API_URL}/${userName}`);
            setStatus(null);
            fetchStatus();
        } catch (err) {
            console.error("Reset failed");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-[#0F4C81] animate-spin"></div>
            </div>
        );
    }

    const isJourneyActive = !!status;
    const quitDate = status?.quitDate ? new Date(status.quitDate) : null;
    const now = new Date();
    const diffMs = quitDate ? Math.max(0, now - quitDate) : 0;
    const streakDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Calculations
    const dailyBaselineCost = isSmoking ? (form.cps / 20) * form.packPrice : form.cps * form.packPrice;

    // Calculate Monthly Spending from Logs
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLogs = (status?.dailyLogs || []).filter(log => {
        const d = new Date(log.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlySpending = monthLogs.reduce((acc, log) => acc + (log.count * log.unitPrice), 0);
    const projectedYearlySavings = (dailyBaselineCost * 365.25) - (monthlySpending * 12);

    const lifeRegainedYears = isSmoking
        ? (form.cps * form.years * 1.5) / 100 + 0.2
        : (form.cps * form.years * 1.2) / 100 + 0.1;

    return (
        <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans selection:bg-blue-100 pb-20">
            {/* ── Page Header ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl hover:bg-slate-50 transition-colors hidden sm:block">
                            <ArrowLeft size={20} className="text-slate-600" strokeWidth={2.5} />
                        </button>
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border bg-white border-slate-100 shadow-rose-100">
                            {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                                    {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Tracking Active</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800">
                                Freedom <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">Path</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end px-4 py-2 rounded-xl border bg-white border-slate-100 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                            <p className="text-xs font-bold text-emerald-600">📡 100% Operational</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-slate-100 shadow-sm cursor-pointer ml-auto">
                            <img src={`https://ui-avatars.com/api/?name=${userName}&background=ffe4e6&color=e11d48`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 xl:grid-cols-12 gap-12">

                {/* LEFT COLUMN: CONTROLS */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Inspiring Image */}
                    <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                        <img src="/How-to-Stop-Smoking.png" alt="Freedom Path" className="w-full h-48 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-700" />
                    </div>

                    {/* Streak Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
                        {isJourneyActive ? (
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F4C81] bg-blue-50 px-4 py-1.5 rounded-full mb-6 inline-block">Active Journey</span>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <span className="text-7xl font-black text-[#1f2937] tracking-tighter">{streakDays}</span>
                                    <span className="text-2xl font-bold text-slate-400">Days</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Freedom Momentum</p>
                                <button onClick={handleReset} className="text-[11px] font-black uppercase text-rose-500 flex items-center gap-2 mx-auto hover:text-rose-700 transition px-6 py-3 bg-rose-50 rounded-xl">
                                    <RotateCcw size={14} /> Reset Progress
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl text-slate-300 flex items-center justify-center mx-auto mb-6 shadow-inner"><Flame size={32} /></div>
                                <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Ready to break free?</h4>
                                <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed px-4">Set your baseline and take the first step towards a healthier, wealthier you.</p>
                                <button
                                    onClick={() => handleUpdateProjection(true)}
                                    className="w-full py-4 bg-[#1f2937] text-white font-bold rounded-2xl shadow-lg hover:bg-black transition-all"
                                >
                                    Start Journey
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Daily Input Form */}
                    <AnimatePresence>
                        {isJourneyActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-[0_25px_60px_-20px_rgba(30,58,138,0.08)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={18} strokeWidth={3} /></div>
                                    Log Daily Usage
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="date"
                                                value={logForm.date}
                                                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                                                className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Amount Smoke</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={logForm.count || ''}
                                            onChange={(e) => setLogForm({ ...logForm, count: e.target.value })}
                                            className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 text-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Price Per Cigarette (LKR)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {priceTiers.map(price => (
                                                <button
                                                    key={price}
                                                    onClick={() => setLogForm({ ...logForm, unitPrice: price })}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${logForm.unitPrice === price ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                >
                                                    Rs.{price}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveLog}
                                        disabled={isLogging}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLogging ? 'Saving Entry...' : (logForm.id ? 'Update Log Entry' : 'Add Log Entry')}
                                    </button>
                                    {logForm.id && (
                                        <button
                                            onClick={() => setLogForm({ id: null, date: new Date().toISOString().split('T')[0], count: 0, unitPrice: 130 })}
                                            className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Baseline Settings */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-[17px] font-black text-[#1f2937] mb-6">Baseline Settings</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Daily Avg</label>
                                    <input type="number" value={form.cps} onChange={(e) => setForm({ ...form, cps: Number(e.target.value) })} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Pack Price</label>
                                    <input type="number" value={form.packPrice} onChange={(e) => setForm({ ...form, packPrice: Number(e.target.value) })} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none" />
                                </div>
                            </div>
                            <button onClick={() => handleUpdateProjection(false)} className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all">
                                {isSaving ? 'Processing...' : 'Update Baseline'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: INSIGHTS & HISTORY */}
                <div className="xl:col-span-8 space-y-8">

                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Monthly Spending Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-8 shadow-sm">
                                <TrendingDown size={28} />
                            </div>
                            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-1">Monthly Spending</p>
                            <h3 className="text-[3.5rem] font-black text-[#1f2937] tracking-tighter leading-none mb-6">
                                Rs. {monthlySpending.toLocaleString()}
                            </h3>
                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Total logs: {monthLogs.length}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-md text-slate-400">Month: {now.toLocaleString('default', { month: 'long' })}</span>
                            </div>
                        </div>

                        {/* Health Restoration */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 shadow-sm">
                                <Hourglass size={28} />
                            </div>
                            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">Life Regained</p>
                            <h3 className="text-[3.5rem] font-black text-[#1f2937] tracking-tighter leading-none mb-6">
                                {lifeRegainedYears.toFixed(1)} <span className="text-2xl font-bold opacity-30">Years</span>
                            </h3>
                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-500">Lung recovery active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Logging History</h3>
                            <div className="px-5 py-2 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Total Entries: {status?.dailyLogs?.length || 0}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {(status?.dailyLogs || []).sort((a, b) => new Date(b.date) - new Date(a.date)).map((log) => (
                                    <motion.div
                                        key={log.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/20"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-slate-800 leading-none">{new Date(log.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-lg font-black text-slate-800 leading-none">{log.count} <span className="text-xs font-bold text-slate-400">units</span></span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price: Rs.{log.unitPrice}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditLog(log)}
                                                className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all shadow-sm"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="text-right group-hover:hidden transition-all">
                                            <p className="text-lg font-black text-slate-400 leading-none mb-1">Rs. {(log.count * log.unitPrice).toLocaleString()}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total Spent</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(!status?.dailyLogs || status.dailyLogs.length === 0) && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 italic shadow-inner">Empty</div>
                                    <p className="text-sm font-bold text-slate-400">No logs found. Start tracking your daily usage above!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
                    -webkit-appearance: none; margin: 0;
                }
                ::-webkit-scrollbar { width: 10px; }
                ::-webkit-scrollbar-track { background: #fafafc; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 3px solid #fafafc; }
                ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default HabitImpactPage;
