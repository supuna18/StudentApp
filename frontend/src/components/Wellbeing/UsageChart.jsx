import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UsageChart = () => {
  const [data, setData] = useState([]); // මුලින් දත්ත හිස්ව තබයි

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // Backend එකෙන් සැබෑ Usage දත්ත ලබා ගැනීම
        const response = await fetch('http://localhost:5005/api/wellbeing/usage/user123');
        const result = await response.json();
        
        // Backend එකෙන් එන දත්ත Recharts වලට ගැලපෙන විදියට සකස් කිරීම
        const formattedData = result.data.map(item => ({
          name: item.domain.split('.')[0], // facebook.com -> facebook
          mins: Math.round(item.minutesSpent),
          color: item.domain.includes('youtube') ? '#ef4444' : '#3b82f6'
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };

    fetchUsage();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Real-time Usage (Mins) 📊</h3>
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="mins" radius={[10, 10, 10, 10]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 mt-20">No usage data found yet. Start browsing!</p>
        )}
      </div>
    </div>
  );
};

export default UsageChart;