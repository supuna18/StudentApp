import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UsageChart = () => {
  // දැනට මේවා Mock Data (පසුව මේවා DB එකෙන් ගන්නා විදිය හදමු)
  const data = [
    { name: 'Facebook', mins: 45, color: '#3b82f6' },
    { name: 'YouTube', mins: 80, color: '#ef4444' },
    { name: 'Instagram', mins: 35, color: '#d946ef' },
    { name: 'TikTok', mins: 20, color: '#000000' },
    { name: 'Reddit', mins: 15, color: '#f97316' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-blue-100 border border-white mt-10"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Time Consumption 📊</h3>
          <p className="text-slate-500 font-medium">Your daily screen time analytics per platform.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl text-blue-600 font-bold text-sm">
          Today's Total: 195m
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontWeight: 600, fontSize: 12}} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12}} 
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                padding: '15px'
              }}
              itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            />
            <Bar dataKey="mins" radius={[12, 12, 12, 12]} barSize={45}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
         <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Most Used</p>
            <p className="text-lg font-black text-red-500 mt-1">YouTube</p>
         </div>
         <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Efficiency</p>
            <p className="text-lg font-black text-green-500 mt-1">82% High</p>
         </div>
         <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Goal Status</p>
            <p className="text-lg font-black text-blue-500 mt-1">On Track</p>
         </div>
         <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Avg. Session</p>
            <p className="text-lg font-black text-indigo-500 mt-1">12 Mins</p>
         </div>
      </div>
    </motion.div>
  );
};

export default UsageChart;