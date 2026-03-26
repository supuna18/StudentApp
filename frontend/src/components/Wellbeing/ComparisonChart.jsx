import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const ComparisonChart = () => {
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
        
        const limits = (await limitsRes.json()).data || [];
        const usage = (await usageRes.json()).data || [];

        const merged = limits.map(lim => {
          const use = usage.find(u => u.domain === lim.domain);
          return {
            name: lim.domain.split('.')[0],
            limit: lim.limitMinutes,
            used: Math.round(use ? use.minutesSpent : 0)
          };
        });
        
        setData(merged);
      } catch (error) { console.error("Error fetching comparison data:", error); }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 h-full">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Limit vs Actual Usage ⚖️</h3>
      <div className="h-[300px] w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="limit" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="used" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 mt-20">No comparison data found.</p>}
      </div>
    </div>
  );
};

export default ComparisonChart;
