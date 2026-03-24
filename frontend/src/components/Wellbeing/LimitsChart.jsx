import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LimitsChart = () => {
  const [data, setData] = useState([]); 

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch('http://localhost:5005/api/wellbeing/limits/user123');
        
        if (!response.ok) {
          console.warn("LimitsChart: API returned", response.status);
          return; // Silently stop - don't crash
        }
        
        const result = await response.json();
        const items = result?.data ?? [];
        
        const formattedData = items.map((item, index) => ({
          name: item.domain.split('.')[0], 
          mins: item.limitMinutes,
          color: ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'][index % 5]
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching limits data:", error);
      }
    };

    fetchLimits();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Configured Limits (Mins) 🎯</h3>
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="mins" radius={[10, 10, 10, 10]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 mt-20">No limits set yet.</p>
        )}
      </div>
    </div>
  );
};

export default LimitsChart;
