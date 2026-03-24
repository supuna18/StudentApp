import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const ComparisonChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limitsRes, usageRes] = await Promise.all([
          fetch('http://localhost:5005/api/wellbeing/limits/user123'),
          fetch('http://localhost:5005/api/wellbeing/usage/user123')
        ]);

        if (!limitsRes.ok || !usageRes.ok) return;

        const limitsJson = await limitsRes.json();
        const usageJson = await usageRes.json();

        const limits = limitsJson?.data ?? [];
        const usage = usageJson?.data ?? [];

        // Build a map of most recent usage per domain
        const usageMap = {};
        usage.forEach(u => {
          const key = u.domain;
          if (!usageMap[key] || new Date(u.date) > new Date(usageMap[key].date)) {
            usageMap[key] = u;
          }
        });

        const formatted = limits.map(limit => ({
          name: limit.domain.split('.')[0],
          Limit: limit.limitMinutes,
          Used: usageMap[limit.domain]?.minutesSpent ?? 0,
          safe: (usageMap[limit.domain]?.minutesSpent ?? 0) <= limit.limitMinutes
        }));

        setData(formatted);
      } catch (err) {
        console.error("ComparisonChart error:", err);
      }
    };
    fetchData();
  }, []);

  const CustomBar = (props) => {
    const { x, y, width, height, safe } = props;
    return <rect x={x} y={y} width={width} height={height} fill={safe ? '#10b981' : '#ef4444'} radius={8} />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Limit vs Usage ⚖️</h3>
      <p className="text-sm text-slate-400 mb-6">🟢 Under limit &nbsp; 🔴 Over limit</p>
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} unit="m" />
              <Tooltip formatter={(v) => `${v} mins`} />
              <Legend />
              <Bar dataKey="Limit" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={30} />
              <Bar dataKey="Used" radius={[8, 8, 0, 0]} barSize={30}
                shape={(props) => {
                  const { x, y, width, height, value, index } = props;
                  const isOver = data[index] && data[index].Used > data[index].Limit;
                  return <rect x={x} y={y} width={width} height={height} fill={isOver ? '#ef4444' : '#10b981'} rx={8} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 mt-24">No data yet — set a limit and use that site!</p>
        )}
      </div>
    </div>
  );
};

export default ComparisonChart;
