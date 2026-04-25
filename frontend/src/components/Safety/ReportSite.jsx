import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Link as LinkIcon, ShieldAlert, HeartHandshake, ShieldCheck, RefreshCw, FileText, CheckSquare, Edit2, Trash2 } from 'lucide-react';

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
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5005/api/safety/my-reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data.reverse()); // Show newest first
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Validation
    const validateForm = () => {
        let errors = {};
        if (!formData.url.trim()) errors.url = "URL is required";
        else if (!formData.url.startsWith('http')) errors.url = "Invalid URL format (start with http)";
        
        if (!formData.reason.trim()) errors.reason = "Reason is required";
        else if (formData.reason.length > 100) errors.reason = "Max 100 characters allowed";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 2. Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setStatus(editId ? 'Updating...' : 'Submitting...');

        const payload = {
            Url: formData.url, 
            Reason: formData.reason, 

            ReportedBy: 'Student_User',
            Status: 'UNDER REVIEW',
            Status: 'Pending',

        };
        if (editId) payload.Id = editId;

        const method = editId ? 'PUT' : 'POST';
        const endpoint = editId ? `http://localhost:5005/api/safety/report/${editId}` : 'http://localhost:5005/api/safety/report';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoint, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus(editId ? 'Report Updated!' : 'Report Submitted!');
                setFormData({ url: '', reason: '' });
                setEditId(null);
                setFormErrors({});
                await fetchReports();
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('Server Error');
                setTimeout(() => setStatus(''), 3000);
            }
        } catch (err) {
            setStatus('Error connecting to server');
            setTimeout(() => setStatus(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (statusStr) => {
        const s = (statusStr || '').toUpperCase();
        if (s === 'APPROVED' || s === 'RESOLVED') return 'bg-green-100 text-green-700';
        if (s === 'PENDING') return 'bg-primary/10 text-primary';
        if (s === 'UNDER REVIEW' || s === 'REJECTED') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    // 3. Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5005/api/safety/report/${id}`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    fetchReports();
                }
            } catch (err) {
                alert("Delete failed");
            }
        }
 
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Just now";
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="w-full min-h-screen bg-[#F8F9FB] p-8 lg:p-12 font-sans text-slate-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-3">News Validator</h1>
                <p className="text-slate-500 font-medium max-w-4xl text-[15px] leading-relaxed">
                    Maintain the academic integrity of our community. Report suspicious links, misinformation, or predatory educational platforms to our security team.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                
                {/* Left Column: Form */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Security Guard</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time link scrutiny</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-2">Suspicious URL</label>
                            <div className="relative">
                                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="https://example.com/suspicious-article"
                                    className={`w-full bg-[#F8F9FA] pl-12 pr-4 py-4 rounded-xl text-sm outline-none font-medium transition-all ${formErrors.url ? 'border border-red-300 ring-2 ring-red-100' : 'border border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-50'}`}
                                    value={formData.url} 
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                />
                            </div>
                            {formErrors.url && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.url}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest">Reason for Suspicion</label>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max 100 Characters</span>
                            </div>
                            <textarea 
                                placeholder="e.g., Claims to be a certified peer-reviewed journal but contains numerous spelling errors and unverified data..."
                                maxLength={100}
                                className={`w-full bg-[#F8F9FA] p-4 rounded-xl text-sm outline-none font-medium h-32 resize-none transition-all ${formErrors.reason ? 'border border-red-300 ring-2 ring-red-100' : 'border border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-50'}`}
                                value={formData.reason} 
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            />
                            {formErrors.reason && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.reason}</p>}
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-[#1A65E6] hover:bg-primary active:bg-blue-800 text-white py-4 rounded-full font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            <ShieldCheck size={20} /> 
                            {loading ? 'Processing...' : editId ? 'Update Security Report' : 'Submit Security Report'}
                        </button>
                        {status && (
                            <p className="text-center text-sm font-bold text-primary mt-2">{status}</p>
                        )}
                    </form>
                </div>

                {/* Right Column: Info Cards */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Why Reporting Matters */}
                    <div className="bg-[#E8EDFD] p-8 rounded-[2rem] border border-blue-100/50">
                        <h3 className="text-[#3A5B8A] text-xl font-bold mb-6">Why Reporting Matters</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-[#1A65E6]"><CheckSquare size={20} /></div>
                                <p className="text-sm text-[#3A5B8A] font-medium leading-relaxed">Every report is reviewed by academic curators within 24 hours.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-[#1A65E6]"><ShieldAlert size={20} /></div>
                                <p className="text-sm text-[#3A5B8A] font-medium leading-relaxed">Prevents predatory publishers from accessing student data.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-[#1A65E6]"><HeartHandshake size={20} /></div>
                                <p className="text-sm text-[#3A5B8A] font-medium leading-relaxed">Contributes to the EduSync global trust database.</p>
                            </div>
                        </div>
                    </div>

                    {/* Image/Video Card */}
                    <div className="relative h-40 rounded-[2rem] overflow-hidden shadow-sm flex items-end p-6 bg-slate-900 border border-slate-800">
                        <video 
                            src="/secvideo.mp4" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#010C24] via-transparent to-transparent opacity-90" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                            <span className="text-white font-bold text-sm">System integrity: 99.9% secured</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* History Section */}
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold mb-3">Report History</h2>
                        <div className="flex items-center gap-3">
                            <span className="bg-[#E6EBED] text-slate-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
                                Active Reports: {reports.length}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[11px] font-bold text-slate-800">
                                Last updated: Just now
                            </span>
                        </div>
                    </div>
                    <button onClick={fetchReports} className="bg-[#EEEFF2] hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                        <RefreshCw size={14} /> Refresh List
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-[#FAFAFB]">
                        <div className="col-span-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resource URL</div>
                        <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Submission Date</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</div>
                    </div>

                    {/* List Items */}
                    <div className="divide-y divide-slate-50">
                        {reports.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-medium text-sm">No reports found in your history.</div>
                        ) : (
                            reports.map(report => {
                                const urlObj = report.url || report.Url;
                                // Simple trim for display
                                const displayUrl = urlObj && urlObj.length > 40 ? urlObj.substring(0, 40) + '...' : urlObj;
                                const statusValue = (report.status || report.Status || 'UNDER REVIEW').toUpperCase();

                                return (
                                    <div key={report.id || report.Id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/50 transition-all">
                                        
                                        <div className="col-span-5 pr-4">
                                            <p className="font-bold text-sm text-slate-800 truncate mb-1">
                                                {displayUrl || "Unknown URL"}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                Reason: {report.reason || report.Reason}
                                            </p>
                                        </div>

                                        <div className="col-span-3 flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusColor(statusValue)}`}>
                                                <span className="mr-1.5">•</span>{statusValue}
                                            </span>
                                        </div>

                                        <div className="col-span-2 text-center">
                                            <span className="text-[13px] font-bold text-slate-700">
                                                {formatDate(report.createdAt || report.CreatedAt)}
                                            </span>
                                        </div>

                                        <div className="col-span-2 flex justify-end gap-2">
                                            {statusValue === 'APPROVED' ? (
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">Locked</span>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setEditId(report.id || report.Id);
                                                            setFormData({ url: report.url || report.Url, reason: report.reason || report.Reason });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="text-[#1A65E6] p-2 hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(report.id || report.Id)}
                                                        className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSite;

