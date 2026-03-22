import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const UsagePieChart = () => {
  // දැනට Mock Data (පසුව API එකෙන් ගමු)
  const data = [
    { name: 'Facebook', value: 45, color: '#3b82f6' },
    { name: 'YouTube', value: 80, color: '#ef4444' },
    { name: 'Instagram', value: 35, color: '#d946ef' },
    { name: 'Other', value: 20, color: '#94a3b8' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-white mt-10">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Time Distribution 🥧</h3>
      <p className="text-slate-500 font-medium mb-6">Percentage of time spent across platforms.</p>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsagePieChart;