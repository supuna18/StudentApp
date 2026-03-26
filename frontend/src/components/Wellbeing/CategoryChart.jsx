import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const CategoryChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/usage/${userId}`);
        const result = await response.json();
        
        const categories = {};
        (result.data || []).forEach(item => {
          const cat = item.category || 'Other';
          categories[cat] = (categories[cat] || 0) + (item.minutesSpent || 0);
        });

        const formattedData = Object.keys(categories).map(cat => ({
          name: cat,
          mins: Math.round(categories[cat])
        }));
        
        setData(formattedData);
      } catch (error) { console.error("Error fetching category data:", error); }
    };
    fetchUsage();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 h-full">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Category Usage (Mins) 📂</h3>
      <div className="h-[300px] w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="mins" radius={[10, 10, 10, 10]} barSize={40}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 mt-20">No category data.</p>}
      </div>
    </div>
  );
};

export default CategoryChart;
