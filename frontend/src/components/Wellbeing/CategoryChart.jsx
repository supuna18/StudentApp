import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#14b8a6', '#a855f7', '#06b6d4'];

const CategoryChart = ({ dark }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`);
        const result = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        const categories = {};
        (result.data || [])
          .filter(u => u.date === today)
          .forEach(item => {
            const cat = item.category || 'Other';
            categories[cat] = (categories[cat] || 0) + (item.minutesSpent || 0);
          });
        setData(Object.keys(categories).map(cat => ({ name: cat, mins: Math.round(categories[cat]) })));
      } catch (error) { console.error('Error fetching category data:', error); }
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 15000);
    return () => clearInterval(interval);
  }, []);

  const grid = dark ? '#334155' : '#f1f5f9';
  const tick = dark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Category Usage <span className="text-amber-500">📂</span></h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>By Category</span>
      </div>
      <div className="h-[260px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }} />
              <Bar dataKey="mins" radius={[8, 8, 8, 8]} barSize={36}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className={`text-center mt-20 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No category data.</p>}
      </div>
    </div>
  );
};

export default CategoryChart;
