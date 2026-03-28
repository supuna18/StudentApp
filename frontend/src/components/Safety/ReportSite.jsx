import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportSite = () => {
    const [reports, setReports] = useState([]);
    const [formData, setFormData] = useState({ url: '', reason: '' });
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // 1. Fetch data
    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:5005/api/safety/my-reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    // Validation Logic
    const validateForm = () => {
        let errors = {};
        if (!formData.url.trim()) errors.url = "URL is required";
        else if (!formData.url.startsWith('http')) errors.url = "Invalid URL format (start with http)";
        
        if (!formData.reason.trim()) errors.reason = "Reason is required";
        else if (formData.reason.length < 10) errors.reason = "Min 10 characters needed";
        else if (formData.reason.length > 100) errors.reason = "Max 100 characters allowed";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 2. Submit or Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setStatus(editId ? 'Updating...' : 'Submitting...');

        const payload = {
            Url: formData.url, 
            Reason: formData.reason, 
            ReportedBy: 'Student_User',
            Status: 'Pending'
        };
        if (editId) payload.Id = editId;

        const method = editId ? 'PUT' : 'POST';
        const endpoint = editId ? `http://localhost:5005/api/safety/report/${editId}` : 'http://localhost:5005/api/safety/report';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus(editId ? '✅ Report Updated!' : '✅ Report Submitted!');
                setFormData({ url: '', reason: '' });
                setEditId(null);
                setFormErrors({});
                await fetchReports();
                setTimeout(() => setStatus(''), 3000);
            } else {
                const errData = await res.text();
                setStatus('❌ Server Error: ' + errData.substring(0, 30));
            }
        } catch (err) {
            setStatus('❌ Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                const res = await fetch(`http://localhost:5005/api/safety/report/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchReports();
                }
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    // 4. Edit mode
    const startEdit = (report) => {
        setEditId(report.id || report.Id);
        setFormData({ 
            url: report.url || report.Url, 
            reason: report.reason || report.Reason 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full min-h-screen py-16 px-6 lg:px-12 overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
            {/* Custom Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }} 
                    animate={{ scale: 1.05, opacity: 1 }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src="/fake.jpg" 
                    alt="Cyber Security Background" 
                    className="w-full h-full object-cover opacity-60 blur-md"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-950/90 mix-blend-multiply" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="relative z-10 w-full max-w-4xl space-y-10"
            >
                {/* --- INPUT FORM --- */}
                <div className="bg-slate-900/40 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/10 relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-8 relative z-10">
                        <div className="p-4 bg-gradient-to-br from-red-500/20 to-rose-500/5 border border-red-500/30 rounded-[1.5rem] text-3xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="block drop-shadow-lg">🛡️</motion.span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase drop-shadow-sm">Security Guard</h2>
                            <p className="text-[11px] text-red-300/80 font-black uppercase tracking-[0.2em] mt-1">Report Suspicious Content</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <input 
                            type="url" placeholder="https://unsafe-link.com"
                            className={`w-full p-5 bg-slate-950/60 border rounded-[1.5rem] text-white font-medium outline-none transition-all shadow-inner ${formErrors.url ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700/50 focus:border-red-500/50'}`}
                            value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                        />
                        {formErrors.url && <p className="text-red-500 text-[10px] font-bold pl-2">{formErrors.url}</p>}
                        
                        <textarea 
                            placeholder="What makes this site suspicious? (Max 100)"
                            maxLength={100}
                            className={`w-full p-5 bg-slate-950/60 border rounded-[1.5rem] h-32 outline-none text-white font-medium shadow-inner resize-none ${formErrors.reason ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700/50 focus:border-red-500/50'}`}
                            value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        />
                        <div className="flex justify-between px-2">
                            {formErrors.reason && <p className="text-red-500 text-[10px] font-bold">{formErrors.reason}</p>}
                            <p className="text-[10px] text-slate-400 font-bold ml-auto">{formData.reason.length}/100</p>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-gradient-to-r from-red-600 to-rose-700 shadow-[0_0_30px_rgba(225,29,72,0.4)] border border-red-500/50 text-white py-5 rounded-[1.5rem] font-black tracking-widest uppercase transition-all disabled:opacity-50 text-sm"
                        >
                            {loading ? 'PROCESSING...' : editId ? 'UPDATE REPORT' : 'SUBMIT SECURITY REPORT'}
                        </motion.button>
                        <AnimatePresence>
                            {status && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="text-center font-black text-[10px] text-red-100 uppercase tracking-[0.2em] bg-red-950/90 backdrop-blur-md py-2.5 rounded-full border border-red-500/30 w-max mx-auto px-8 shadow-2xl"
                                >
                                    {status}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* --- HISTORY SECTION --- */}
                <div className="px-2">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-white/90 uppercase tracking-widest italic flex items-center gap-3 drop-shadow-sm">
                            Report History 
                            <span className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1 rounded-full text-sm not-italic font-black shadow-sm">{reports.length}</span>
                        </h3>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={fetchReports} 
                            className="text-[10px] font-black tracking-widest uppercase text-slate-300 hover:text-white bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-700 transition-all"
                        >
                            🔄 Refresh
                        </motion.button>
                    </div>
                    
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar pb-10"
                    >
                        <AnimatePresence mode="popLayout">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <motion.div 
                                    variants={itemVariants}
                                    layout
                                    key={report.id || report.Id} 
                                    className="group bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2rem] shadow-lg border border-slate-700/50 hover:border-red-500/30 hover:bg-slate-800/60 flex flex-col md:flex-row md:items-center justify-between transition-all duration-300 gap-4"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-[15px] font-black text-white truncate tracking-tight">
                                                {report.url || report.Url}
                                            </p>
                                        </div>
                                        <p className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2 pl-5">
                                            {report.reason || report.Reason}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => startEdit(report)} className="p-3.5 bg-slate-800 text-blue-400 border border-slate-700 rounded-2xl hover:bg-blue-500/20">✏️</button>
                                        <button onClick={() => handleDelete(report.id || report.Id)} className="p-3.5 bg-slate-800 text-rose-400 border border-slate-700 rounded-2xl hover:bg-rose-500/20">🗑️</button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-24 text-center bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-700/50">
                               <p className="text-slate-400 font-bold">No reports found in EduSyncDB.</p>
                            </div>
                        )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ReportSite;