import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const UsagePieChart = () => {
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
          value: Math.round(item.minutesSpent || 0),
        }));
        setData(formattedData);
      } catch (error) { console.error("Error fetching usage data:", error); }
    };
    fetchUsage();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 h-full">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Usage Split (Mins) 📊</h3>
      <div className="h-[300px] w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 mt-20">No data available.</p>}
      </div>
    </div>
  );
};

export default UsagePieChart;