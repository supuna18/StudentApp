import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const UsageChart = ({ dark }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`);
        const result = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        // Filter for today's usage only
        const dailyData = (result.data || []).filter(u => u.date === today);

        const formattedData = dailyData.map(item => ({
          name: item.domain ? item.domain.split('.')[0] : 'unknown',
          mins: Math.round(item.minutesSpent || 0),
        }));
        setData(formattedData);
      } catch (error) { console.error('Error fetching usage data:', error); }
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const grid = dark ? '#334155' : '#f1f5f9';
  const tick = dark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Real-time Usage <span className="text-indigo-500">📊</span></h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${dark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>Minutes</span>
      </div>
      <div className="h-[260px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }} />
              <Area type="monotone" dataKey="mins" stroke="#6366f1" fill="url(#usageGrad)" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className={`text-center mt-20 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No usage data found.</p>}
      </div>
    </div>
  );
};

export default UsageChart;