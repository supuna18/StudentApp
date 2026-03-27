import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#14b8a6', '#a855f7', '#06b6d4'];

const UsagePieChart = ({ dark }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`);
        const result = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        const formattedData = (result.data || [])
          .filter(u => u.date === today)
          .map(item => ({
            name: item.domain ? item.domain.split('.')[0] : 'unknown',
            value: Math.round(item.minutesSpent || 0),
          }));
        setData(formattedData);
      } catch (error) { console.error('Error fetching usage data:', error); }
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Usage Split <span className="text-pink-500">🍩</span></h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${dark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>By Site</span>
      </div>
      <div className="h-[260px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className={`text-center mt-20 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No data available.</p>}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className={`text-[10px] font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsagePieChart;