import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const ComparisonChart = ({ dark }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const [limitsRes, usageRes] = await Promise.all([
          fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`),
          fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`)
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const limits = (await limitsRes.json()).data || [];
        const allUsage = (await usageRes.json()).data || [];

        // Filter for today's usage only
        const usage = allUsage.filter(u => u.date === today);

        const merged = limits.map(lim => {
          const use = usage.find(u => u.domain === lim.domain);
          return {
            name: lim.domain.split('.')[0],
            limit: lim.limitMinutes,
            used: Math.round(use ? use.minutesSpent : 0)
          };
        });
        setData(merged);
      } catch (error) { console.error('Error fetching comparison data:', error); }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000); // Sync every 15s
    return () => clearInterval(interval);
  }, []);

  const grid = dark ? '#334155' : '#f1f5f9';
  const tick = dark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Limit vs Usage <span className="text-teal-500">⚖️</span></h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className={`text-[10px] font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className={`text-[10px] font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Used</span>
          </div>
        </div>
      </div>
      <div className="h-[260px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }} />
              <Bar dataKey="limit" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={22} />
              <Bar dataKey="used" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className={`text-center mt-20 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No comparison data found.</p>}
      </div>
    </div>
  );
};

export default ComparisonChart;


