import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const UsagePieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('http://localhost:5005/api/wellbeing/usage/user123');
        const result = await response.json();
        
        const formattedData = result.data.map(item => ({
          name: item.domain,
          value: Math.round(item.minutesSpent),
          color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random Colors
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching pie data:", error);
      }
    };
    fetchUsage();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Time Distribution 🥧</h3>
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={100} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 mt-20">Waiting for usage data...</p>
        )}
      </div>
    </div>
  );
};

export default UsagePieChart;