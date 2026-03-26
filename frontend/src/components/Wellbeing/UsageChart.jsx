import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const UsageChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`);
        const result = await response.json();
        const formattedData = (result.data || []).map(item => ({
          name: item.domain ? item.domain.split('.')[0] : 'unknown',
          mins: Math.round(item.minutesSpent || 0),
          color: (item.domain && item.domain.includes('youtube')) ? '#ef4444' : '#3b82f6'
        }));
        setData(formattedData);
      } catch (error) { console.error("Error fetching usage data:", error); }
    };
    fetchUsage();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 h-full">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Real-time Usage (Mins) 📊</h3>
      <div className="h-[300px] w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="mins" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 mt-20">No usage data found.</p>}
      </div>
    </div>
  );
};

export default UsageChart;