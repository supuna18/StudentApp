import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, CheckCircle, Clock, ExternalLink, User, Calendar, Search, Filter } from 'lucide-react';

const SafetyApprovals = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5005/api/admin/safety-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch safety reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this safety report? This marks it as verified.")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5005/api/admin/safety-reports/${id}/approve`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to approve report');
        
        setReports(prev => prev.map(r => (r.id || r._id) === id ? { ...r, status: 'Approved' } : r));
        alert("Report approved successfully.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5005/api/admin/safety-reports/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to delete report');
        
        setReports(prev => prev.filter(r => (r.id || r._id) !== id));
        alert("Report deleted successfully.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const filtered = reports.filter(r => 
    (r.url || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.reason || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.reportedBy || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-blue-600 font-bold animate-pulse">Loading Safety Reports...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .sa-root { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="sa-root">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            
            <p className="text-[12.5px] text-slate-400 mt-1">Review and manage reported sites to keep students safe.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E8EEFF] rounded-[10px] min-w-[240px] hover:border-blue-300 transition-colors">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports…"
                className="border-none bg-transparent outline-none text-[12.5px] text-[#0F1C4D] w-full placeholder:text-slate-400"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[12.5px] font-semibold text-slate-500 hover:border-blue-400 transition-all">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFF]">
                <th className="py-4 pl-6 pr-4 text-left text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Reported URL</th>
                <th className="py-4 px-4 text-left text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Reason</th>
                <th className="py-4 px-4 text-left text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Reported By</th>
                <th className="py-4 px-4 text-left text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Date</th>
                <th className="py-4 px-4 text-left text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Status</th>
                <th className="py-4 pr-6 pl-4 text-right text-[10px] font-bold tracking-[1px] uppercase text-slate-400 border-b border-[#E8EEFF]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-[13.5px]">
                    No safety reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((report, idx) => (
                  <tr key={report.id || report._id} className="border-b border-[#E8EEFF] last:border-0 hover:bg-[#F8FAFF] transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <a 
                          href={report.url.startsWith('http') ? report.url : `https://${report.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[13px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {report.url} <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[13px] text-[#0F1C4D] max-w-[200px] truncate" title={report.reason}>
                        {report.reason}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[12.5px] text-slate-600">
                        <User size={13} className="text-slate-400" />
                        {report.reportedBy}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[12px] text-slate-400">
                        <Calendar size={13} />
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide
                        ${report.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'}`}>
                        {report.status === 'Approved' ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4">
                      <div className="flex items-center justify-end gap-2">
                        {report.status !== 'Approved' && (
                          <button 
                            onClick={() => handleApprove(report.id || report._id)}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Approve Report"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(report.id || report._id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SafetyApprovals;
