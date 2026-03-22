import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Target, Calendar as CalIcon, ArrowRight, BellRing, ShieldCheck, Trash2, Pencil, X, Save, BookOpen } from 'lucide-react';

const SchedulerPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    
    const todayStr = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({ 
        title: '', subject: '', fromDate: todayStr, toDate: todayStr, startTime: '', duration: '30' 
    });
    
    const userEmail = localStorage.getItem('userEmail');
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
            setLoading(true);
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, { ...form, userEmail });
                alert("Study Plan Updated!");
            } else {
                await axios.post(`${API_URL}/create`, { ...form, userEmail });
                alert("Study Session Scheduled!");
            }
            resetForm();
            fetchSessions();
        } catch (err) { alert("Action failed."); }
        finally { setLoading(false); }
    };

    // --- UPDATED ALARM LOGIC (Supports 's' for seconds) ---
    const startFocus = (session) => {
        const isSeconds = session.duration.toString().includes('s');
        const durationValue = parseInt(session.duration);
        const durationMs = isSeconds ? durationValue * 1000 : durationValue * 60 * 1000;
        const displayLabel = isSeconds ? `${durationValue} Seconds` : `${durationValue} Minutes`;

        if (Notification.permission === "granted") {
            new Notification("Focus Mode Started!", {
                body: `Study Session: ${session.title} (${displayLabel})`,
                icon: "https://cdn-icons-png.flaticon.com/512/2593/2593549.png"
            });

            setTimeout(() => {
                new Notification("⏰ TIME IS UP!", {
                    body: `Your ${displayLabel} session is finished!`,
                    requireInteraction: true
                });
                alert(`ALARM: "${session.title}" session completed!`);
            }, durationMs);

            window.postMessage({ type: "START_FOCUS_MODE", duration: isSeconds ? 1 : durationValue }, "*");
            alert(`Focus Mode activated for ${displayLabel}. Stay productive!`);
        } else {
            alert("Please allow notifications first.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this plan?")) {
            await axios.delete(`${API_URL}/${id}`);
            fetchSessions();
        }
    };

    const handleEdit = (session) => {
        setIsEditing(true);
        setEditId(session.id);
        setForm({ ...session });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ title: '', subject: '', fromDate: todayStr, toDate: todayStr, startTime: '', duration: '30' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
                
                {/* FORM SECTION */}
                <div className="flex-1 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 border-b-8 border-b-indigo-500 relative">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><CalIcon size={28}/></div>
                            <h1 className="text-4xl font-black">{isEditing ? "Modify Plan" : "Smart Scheduler"}</h1>
                        </div>
                        {isEditing && <button onClick={resetForm} className="p-2 text-slate-400 hover:text-red-500"><X/></button>}
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" required placeholder="Session Title" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            <input type="text" required placeholder="Subject" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Start Date</label>
                                <input type="date" required min={todayStr} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">End Date</label>
                                <input type="date" required min={form.fromDate} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Start Time</label>
                                <input type="time" required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Session Duration</label>
                                {/* UPDATED DROPDOWN WITH ALL OPTIONS */}
                                <select className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold cursor-pointer" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                                    <optgroup label="Quick Test">
                                        <option value="5s">5 Seconds</option>
                                        <option value="10s">10 Seconds</option>
                                    </optgroup>
                                    <optgroup label="Regular Sessions">
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="120">2 Hours</option>
                                        <option value="180">3 Hours</option>
                                        <option value="240">4 Hours</option>
                                        <option value="300">5 Hours</option>
                                        <option value="360">6 Hours</option>
                                        <option value="420">7 Hours</option>
                                        <option value="480">8 Hours</option>
                                        <option value="540">9 Hours</option>
                                        <option value="600">10 Hours</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full py-6 text-white rounded-3xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${isEditing ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                           {loading ? "Processing..." : isEditing ? "Update study plan" : "Save study mission"}
                        </button>
                    </form>
                </div>

                {/* SIDEBAR LIST (CLEANED UP) */}
                <div className="w-full lg:w-[400px] space-y-6">
                    <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl">
                        <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter"><BellRing size={24}/> My Agenda</h2>
                        <p className="text-indigo-200 text-[10px] font-bold mt-1 opacity-70 tracking-widest uppercase">Upcoming sessions</p>
                    </div>

                    <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scroll pb-20">
                        {sessions.map(s => (
                            <div key={s.id} className="group p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all relative">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-slate-800 text-lg leading-tight">{s.title}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(s)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Pencil size={12}/></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-4">
                                    <BookOpen size={12}/> {s.subject} • <Clock size={12}/> {s.startTime}
                                </div>
                                <button onClick={() => startFocus(s)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-100 uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95">
                                    Start focus session <ShieldCheck size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default SchedulerPage;