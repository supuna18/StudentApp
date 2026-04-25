import React, { useState, useEffect } from 'react';
import { Activity, Database, Clock, Users, Server, HardDrive, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealthData = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5005/api/admin/system-health', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch system health data');
      const data = await res.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching system health:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Polling every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) return (
    <div className="flex flex-col items-center justify-center p-20 text-primary font-bold">
      <RefreshCw className="w-10 h-10 animate-spin mb-4" />
      <p className="animate-pulse">Initializing System Diagnostic...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .sh-root { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .pulse-online { animation: pulse-green 2s infinite; }
        .pulse-offline { animation: pulse-red 2s infinite; }
      `}</style>

      <div className="sh-root">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-[24px] font-bold text-[#0F1C4D] tracking-tight">System Health ⚡</h2>
            <p className="text-[12.5px] text-slate-400 mt-1">Real-time infrastructure monitoring and diagnostic logs.</p>
          </div>
          <button 
            onClick={fetchHealthData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[12.5px] font-bold text-[#0F1C4D] hover:border-blue-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertTriangle size={18} />
            <p className="font-semibold">Connectivity Error: {error}</p>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Database Card */}
          <div className="bg-white border border-[#E8EEFF] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Database size={24} />
              </div>
              <div className={`w-3 h-3 rounded-full ${healthData?.dbStatus === 'Online' ? 'bg-secondary pulse-online' : 'bg-red-500 pulse-offline'}`} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Database Connectivity</p>
            <h3 className="text-2xl font-black text-[#0F1C4D] tracking-tight">{healthData?.dbStatus || 'Unknown'}</h3>
            <p className="text-[12px] text-slate-400 mt-2 flex items-center gap-1">
              <HardDrive size={12} />
              MongoDB Cluster (Atlas)
            </p>
          </div>

          {/* Uptime Card */}
          <div className="bg-white border border-[#E8EEFF] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock size={24} />
              </div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">LIVE</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Server Uptime</p>
            <h3 className="text-2xl font-black text-[#0F1C4D] tracking-tight">{healthData?.uptime || '0d 0h 0m'}</h3>
            <p className="text-[12px] text-slate-400 mt-2 flex items-center gap-1">
              <Server size={12} />
              .NET Core 8.0 Runtime
            </p>
          </div>

          {/* Users Card */}
          <div className="bg-white border border-[#E8EEFF] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded-md">SYNCED</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Users</p>
            <h3 className="text-2xl font-black text-[#0F1C4D] tracking-tight">{healthData?.totalUsers?.toLocaleString() || '0'}</h3>
            <p className="text-[12px] text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle size={12} />
              Verified in EduSyncDB
            </p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E8EEFF] bg-[#F8FAFF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <h3 className="text-[14px] font-bold text-[#0F1C4D]">Recent System Activities</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last 5 Events</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E8EEFF]">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4FF]">
                {(!healthData?.recentLogs || healthData.recentLogs.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-[13px] italic">
                      No system logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  healthData.recentLogs.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-[13px] text-[#0F1C4D]">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            log.severity === 'Error' ? 'bg-red-500' : 
                            log.severity === 'Warning' ? 'bg-amber-500' : 'bg-primary'
                          }`} />
                          {log.activity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12.5px] text-slate-500 max-w-[300px] truncate">{log.details}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.severity === 'Error' ? 'bg-red-50 text-red-600' : 
                          log.severity === 'Warning' ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-slate-400 text-right font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 border-t border-[#E8EEFF] bg-[#F8FAFF] flex items-center justify-between">
            <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
              <Info size={12} />
              Values are fetched automatically every 30 seconds
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Server Time: {healthData?.serverTime ? new Date(healthData.serverTime).toLocaleString() : '---'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;


