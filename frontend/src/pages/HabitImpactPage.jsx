import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Banknote, Hourglass, CheckCircle2, Leaf, ArrowLeft, RotateCcw, Flame } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const HabitImpactPage = () => {
    const navigate = useNavigate();

    // Basic User Session State
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Baseline Form State
    const [form, setForm] = useState({
        habitType: 'Smoking', // 'Smoking' or 'Drinking'
        cps: 15,          // Cigarettes/Drinks per day
        years: 8,         // Years habited
        packPrice: 1500  // Price per pack/drink in LKR
    });

    const isSmoking = form.habitType === 'Smoking';

    // Real-time calculated values
    const dailyCost = isSmoking ? (form.cps / 20) * form.packPrice : form.cps * form.packPrice;
    const yearlySavings = dailyCost * 365.25;
    
    // Abstract standardized formula for UI demonstration of Life Regained
    const lifeRegainedYears = isSmoking 
        ? (form.cps * form.years * 1.5) / 100 + 0.2 
        : (form.cps * form.years * 1.2) / 100 + 0.1;
    
    // Auth Token Handling
    const token = localStorage.getItem('token');
    let userEmail = "Guest";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userEmail = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.email || decoded.unique_name || "Guest";
        } catch (e) { console.error("Error decoding token:", e); }
    }

    const API_URL = "http://localhost:5005/api/habit";

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/${userEmail}`);
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
                habitType: form.habitType,
                dailyAmount: form.cps,
                yearsActive: form.years,
                unitPrice: form.packPrice,
                userId: userEmail,
                quitDate: (isStarting || !status) ? new Date().toISOString() : status.quitDate
            };
            await axios.post(API_URL, newStatus);
            setStatus(newStatus);
            setTimeout(() => setIsSaving(false), 500);
        } catch (err) {
            alert("Failed to update projection.");
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset your streak? This will erase your current active progress!")) return;
        try {
            await axios.delete(`${API_URL}/${userEmail}`);
            setStatus(null);
            fetchStatus();
        } catch(err) {
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
    const streakHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    // Only accumulate actual savings if journey is active
    const actualSavings = isJourneyActive ? (diffMs / (1000 * 60 * 60 * 24)) * dailyCost : 0;

    return (
        <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans selection:bg-blue-100 pb-20">
            {/* Top Navigation */}
            <div className="w-full bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
                    {/* Header Details */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-100/80 rounded-full hover:bg-slate-200 transition-colors">
                            <ArrowLeft size={18} className="text-slate-600" strokeWidth={2.5}/>
                        </button>
                        <div className="flex flex-col justify-center">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Community Wellness</span>
                            <span className="text-xl font-extrabold text-[#1f2937] leading-none tracking-tight">Freedom Path</span>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
                            <Bell size={20} />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                            <img src={`https://ui-avatars.com/api/?name=${userEmail}&background=eff6ff&color=1d4ed8`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
                
                {/* LEFT COLUMN: YOUR BASELINE */}
                <div className="xl:col-span-3">
                    <div className="sticky top-28 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] hidden lg:block mb-8">
                         {isJourneyActive ? (
                            <div className="flex flex-col items-center justify-center p-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F4C81] bg-blue-50 px-3 py-1 rounded-md mb-4">Active Streak</span>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-5xl font-black text-[#1f2937] tracking-tight">{streakDays}</span>
                                    <span className="text-xl font-bold text-slate-400">Days</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Free</span>
                                <button onClick={handleReset} className="mt-8 text-[11px] font-bold uppercase text-rose-500 flex items-center gap-1.5 hover:text-rose-700 transition">
                                    <RotateCcw size={14}/> Reset Journey
                                </button>
                            </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center p-2 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full text-slate-300 flex items-center justify-center mb-4"><Flame size={24}/></div>
                                <h4 className="text-lg font-black text-slate-800 mb-2">Ready to quit?</h4>
                                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">Adjust your baseline below, and hit 'Start Journey' when you are ready.</p>
                             </div>
                         )}
                    </div>

                    <div className="sticky top-[380px]">
                        <h2 className="text-[22px] font-extrabold text-[#1f2937] tracking-tight mb-2">Your Baseline</h2>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 w-11/12">
                            Quantify your current journey to visualize your transformation.
                        </p>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Habit Type</label>
                                <select 
                                    value={form.habitType}
                                    onChange={(e) => setForm({...form, habitType: e.target.value})}
                                    className="w-full h-14 bg-white border border-[#e2e8f0] rounded-[1.2rem] px-5 text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Smoking">Smoking (Cigarettes)</option>
                                    <option value="Drinking">Drinking (Alcohol)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">{isSmoking ? 'Cigarettes per day' : 'Drinks per day'}</label>
                                <input 
                                    type="number" 
                                    value={form.cps} 
                                    onChange={(e) => setForm({...form, cps: Number(e.target.value)})}
                                    className="w-full h-14 bg-white border border-[#e2e8f0] rounded-[1.2rem] px-5 text-xl font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">{isSmoking ? 'Years smoked' : 'Years drinking'}</label>
                                <input 
                                    type="number" 
                                    value={form.years} 
                                    onChange={(e) => setForm({...form, years: Number(e.target.value)})}
                                    className="w-full h-14 bg-white border border-[#e2e8f0] rounded-[1.2rem] px-5 text-xl font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">{isSmoking ? 'Pack price (LKR)' : 'Price per drink (LKR)'}</label>
                                <input 
                                    type="number" step="50"
                                    value={form.packPrice} 
                                    onChange={(e) => setForm({...form, packPrice: Number(e.target.value)})}
                                    className="w-full h-14 bg-white border border-[#e2e8f0] rounded-[1.2rem] px-5 text-xl font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <button 
                                onClick={() => handleUpdateProjection(false)}
                                className="w-full h-14 mt-2 bg-slate-800 hover:bg-black active:scale-[0.98] text-white rounded-[1.2rem] font-bold text-[14px] shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Updating...' : 'Update Projection'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: MAIN CONTENT */}
                <div className="xl:col-span-9 flex flex-col gap-8">
                    
                    {/* TOP STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Savings Card */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Banknote size={24} strokeWidth={2} />
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-widest rounded-md">
                                    LKR Currency
                                </div>
                            </div>
                            
                            {isJourneyActive && actualSavings > 0 ? (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-6">
                                    <p className="text-xs font-bold text-emerald-500 mb-1 uppercase tracking-widest">Actual Saved So Far</p>
                                    <h3 className="text-[3rem] font-black text-emerald-600 tracking-tighter leading-none">
                                        Rs. {actualSavings.toLocaleString('en-LK', {maximumFractionDigits: 0})}
                                    </h3>
                                </motion.div>
                            ) : null}

                            <p className="text-xs font-bold text-slate-400 mb-1">Projected Yearly Savings</p>
                            <h3 className="text-[2.2rem] font-black text-[#0F4C81] tracking-tighter leading-none mb-6">
                                Rs. {yearlySavings.toLocaleString('en-LK', {maximumFractionDigits: 0})}
                            </h3>
                            <div className="mt-auto pt-6 border-t border-slate-100">
                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[90%]">
                                    {isSmoking ? 'Equivalent to a luxury vacation or 350 premium wellness subscriptions.' : 'Massive reduction in non-essential leisure spending.'}
                                </p>
                            </div>
                        </div>

                        {/* Life Expectancy Card */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0F4C81] flex items-center justify-center">
                                    <Hourglass size={24} strokeWidth={2} />
                                </div>
                                <div className="px-4 py-1.5 bg-blue-100 text-[#0F4C81] text-[9px] font-black uppercase tracking-widest rounded-md">
                                    Restoration
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mb-1">Life Expectancy Regained</p>
                            <h3 className="text-[3.5rem] font-black text-[#0F4C81] tracking-tighter leading-none mb-6">
                                {lifeRegainedYears.toFixed(1)} <span className="text-3xl text-slate-400 font-bold ml-1">yrs</span>
                            </h3>
                            <div className="mt-auto pt-6 border-t border-slate-100">
                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[90%]">
                                    {isSmoking 
                                        ? 'Based on clinical recovery of lung elasticity and cardiovascular efficiency.'
                                        : 'Based on restored liver enzymes, kidney function, and brain plasticity.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 24-HOUR TRANSFORMATION CARD */}
                    <div className="bg-white rounded-[2rem] p-10 lg:p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-blue-50 flex flex-col md:flex-row items-center gap-14 hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
                        {/* Circular Progress */}
                        {(() => {
                            // Compute dynamic % based on hours elapsed if active, max 100%
                            const targetPct = isJourneyActive ? Math.min(100, (streakHours / 24) * 100) : 75; // fake 75% for preview
                            
                            return (
                                <div className="relative w-52 h-52 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                                        <motion.circle 
                                            cx="50%" cy="50%" r="42%" fill="none" stroke="#166534" strokeWidth="18"
                                            strokeLinecap="round" strokeDasharray="314"
                                            initial={{ strokeDashoffset: 314 }}
                                            animate={{ strokeDashoffset: 314 - (314 * (targetPct/100)) }} 
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                        <span className="text-4xl justify-center items-center flex font-black tracking-tight text-[#166534]">
                                            {Math.floor(targetPct)}<span className="text-2xl mt-1">%</span>
                                        </span>
                                        <span className="text-[9px] font-bold text-[#166534] tracking-widest uppercase mt-1">Recovery</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Transformation Details */}
                        <div className="flex-1">
                            <h3 className="text-[26px] font-extrabold text-[#1f2937] mb-4">The 24-Hour Transformation</h3>
                            <p className="text-[15px] text-slate-500 leading-[1.7] mb-8 font-medium">
                                {isSmoking 
                                    ? 'Carbon monoxide levels in your blood drop to normal within hours. Oxygen levels increase, allowing your heart to pump more efficiently.'
                                    : 'Your blood sugar begins to normalize and hydration levels restore, rapidly flushing neurotoxins from your system.'}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f0fdf4] rounded-xl">
                                    <div className="w-6 h-6 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600 bg-white shadow-sm">
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-[12px] font-bold uppercase tracking-wide text-emerald-800">
                                        {isSmoking ? 'Heart Stabilized' : 'Liver Detoxifying'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f0fdf4] rounded-xl">
                                    <div className="w-6 h-6 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600 bg-white shadow-sm">
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-[12px] font-bold uppercase tracking-wide text-emerald-800">
                                        {isSmoking ? 'Pulse Normalized' : 'Hydration Restored'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TIMELINE OF VITALITY */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-20">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4 mb-10">
                    <h2 className="text-2xl font-extrabold text-[#1f2937] tracking-tight">Timeline of Vitality</h2>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest cursor-pointer hover:text-blue-800 transition-colors">View Full Scientific Roadmap</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-8 lg:p-10 border border-[#f1f5f9] rounded-[2rem] shadow-sm hover:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full">
                        <div className="flex flex-col mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 mb-5">
                                <Leaf fill="currentColor" size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest">20 Minute</span>
                            </div>
                            <h4 className="text-lg font-extrabold text-[#1f2937] mb-3">
                                {isSmoking ? 'Heart Rate Recovery' : 'Digestion Settling'}
                            </h4>
                            <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                                {isSmoking 
                                    ? 'Your blood pressure and pulse rate drop back to normal levels almost immediately after your last cigarette.'
                                    : 'Your digestive tract begins to rest as the acute toxicity subsides and stomach lining initiates repair.'}
                            </p>
                        </div>
                        <div className="mt-auto pt-8">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: (!isJourneyActive || streakHours >= 0.33) ? '100%' : `${(streakHours/0.33)*100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-8 lg:p-10 border border-[#f1f5f9] rounded-[2rem] shadow-sm hover:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full">
                        <div className="flex flex-col mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 mb-5">
                                <Leaf fill="currentColor" size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest">12 Hours</span>
                            </div>
                            <h4 className="text-lg font-extrabold text-[#1f2937] mb-3">
                                {isSmoking ? 'Oxygen Saturation' : 'Deep Sleep Cycles'}
                            </h4>
                            <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                                {isSmoking 
                                    ? 'Carbon monoxide levels in your blood drop to normal, increasing the oxygen-carrying capacity of your red blood cells.'
                                    : 'The absence of depressants allows your brain to re-enter REM phases, dramatically improving sleep quality.'}
                            </p>
                        </div>
                        <div className="mt-auto pt-8 flex items-center gap-3">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex-1">
                                <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: (!isJourneyActive) ? '85%' : `${Math.min(100, (streakHours/12)*100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-8 lg:p-10 border border-[#f1f5f9] rounded-[2rem] shadow-sm hover:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full">
                        <div className="flex flex-col mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 mb-5">
                                <Leaf fill="currentColor" size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest">48 Hours</span>
                            </div>
                            <h4 className="text-lg font-extrabold text-[#1f2937] mb-3">
                                {isSmoking ? 'Nerve Ending Repair' : 'Cognitive Clarity'}
                            </h4>
                            <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                                {isSmoking 
                                    ? 'Damaged nerve endings start to regrow. Your sense of smell and taste begin to sharpen and return to vivid clarity.'
                                    : 'Brain fog completely lifts as neuro-transmitters recalibrate, restoring your capacity for deep focus and stable moods.'}
                            </p>
                        </div>
                        <div className="mt-auto pt-8">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: (!isJourneyActive) ? '45%' : `${Math.min(100, (streakHours/48)*100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOMENTUM BANNER */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
                <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[400px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
                    {/* Left content */}
                    <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center">
                        <div className="inline-block px-4 py-1.5 bg-[#0F4C81] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md mb-8 w-max">
                            Momentum
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1f2937] tracking-tight leading-tight mb-6">
                            Freedom is a series of <br/>choices.
                        </h2>
                        <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-lg mb-10">
                            Every {isSmoking ? 'cigarette not smoked' : 'drink ignored'} is a victory for your future self. Use these numbers as your north star when the path feels steep.
                        </p>
                        
                        {!isJourneyActive ? (
                            <div className="flex flex-wrap items-center gap-4">
                                <button 
                                    onClick={() => handleUpdateProjection(true)}
                                    className="h-14 px-8 bg-[#1f2937] hover:bg-black text-white text-[13px] font-bold rounded-full transition-all flex items-center gap-2"
                                >
                                    Start My Journey Now
                                </button>
                                <button className="h-14 px-8 bg-transparent border-2 border-[#e2e8f0] hover:border-slate-400 text-slate-700 text-[13px] font-bold rounded-full transition-all">
                                    Learn More
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-xl inline-block max-w-sm">
                                    <p className="text-sm font-bold text-emerald-700">Journey Active</p>
                                    <p className="text-xs text-emerald-600/80 font-medium leading-relaxed mt-1">You are currently on a streak for {streakDays} days! Keep the momentum going.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Image */}
                    <div className="w-full md:w-5/12 min-h-[300px] md:min-h-full bg-slate-100 relative overflow-hidden">
                        <img 
                            src="/momentum-plant.png" 
                            alt="Plant growing in sand" 
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                        {/* Soft inner shadow for blending */}
                        <div className="absolute inset-0 shadow-[inset_20px_0_40px_rgba(255,255,255,0.8)] pointer-events-none md:block hidden" />
                    </div>
                </div>
            </div>

            <style>{`
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
                    -webkit-appearance: none; margin: 0;
                }
            `}</style>
        </div>
    );
};

export default HabitImpactPage;
