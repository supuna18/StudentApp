import React, { useState, useEffect } from 'react';

const ReportSite = () => {
    const [reports, setReports] = useState([]);
    const [formData, setFormData] = useState({ url: '', reason: '' });
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Database එකෙන් History එක ගෙන ඒම (READ)
    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/safety/my-reports');
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

    // 2. Submit හෝ Update කිරීම (CREATE / UPDATE)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(editId ? 'Updating...' : 'Submitting...');

        const method = editId ? 'PUT' : 'POST';
        const endpoint = editId ? `http://localhost:5000/api/safety/report/${editId}` : 'http://localhost:5000/api/safety/report';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: editId, 
                    url: formData.url, 
                    reason: formData.reason, 
                    reportedBy: 'Student_User',
                    status: 'Pending'
                })
            });

            if (res.ok) {
                setStatus(editId ? '✅ Report Updated!' : '✅ Report Submitted!');
                setFormData({ url: '', reason: '' });
                setEditId(null);
                await fetchReports(); // History එක refresh කිරීම
                setTimeout(() => setStatus(''), 3000); // තත්පර 3කින් මැසේජ් එක අයින් කිරීම
            }
        } catch (err) {
            setStatus('❌ Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete කිරීම (DELETE)
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/safety/report/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchReports();
                }
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    // 4. Edit mode එකට යාම
    const startEdit = (report) => {
        setEditId(report.id || report.Id);
        setFormData({ 
            url: report.url || report.Url, 
            reason: report.reason || report.Reason 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-10 animate-in fade-in zoom-in duration-700">
            {/* --- INPUT FORM --- */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-red-100 rounded-2xl text-2xl animate-pulse">🛡️</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Security Guard</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Report Suspicious Content</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="url" required placeholder="https://unsafe-link.com"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 transition-all outline-none shadow-inner"
                        value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                    <textarea 
                        required placeholder="What makes this site suspicious?"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl h-24 outline-none focus:ring-2 focus:ring-red-400 transition-all shadow-inner"
                        value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    />
                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'PROCESSING...' : editId ? 'UPDATE REPORT' : 'SUBMIT SECURITY REPORT'}
                    </button>
                    {status && <p className="text-center font-black text-xs text-slate-500 animate-bounce">{status}</p>}
                </form>
            </div>

            {/* --- HISTORY SECTION --- */}
            <div className="px-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest italic">Report History ({reports.length})</h3>
                    <button onClick={fetchReports} className="text-xs font-bold text-blue-500 hover:underline">Refresh</button>
                </div>
                
                <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.id || report.Id} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-black text-blue-600 truncate mb-1">
                                        {report.url || report.Url}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium italic line-clamp-1">
                                        {report.reason || report.Reason}
                                    </p>
                                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-full uppercase">
                                        Status: {report.status || report.Status}
                                    </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <button 
                                        onClick={() => startEdit(report)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >✏️</button>
                                    <button 
                                        onClick={() => handleDelete(report.id || report.Id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >🗑️</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                           <p className="text-slate-300 italic font-bold">No security reports found in EduSyncDB.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportSite;