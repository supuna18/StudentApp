import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'Social Media': '#3b82f6',
  'Entertainment': '#f59e0b',
  'Education': '#10b981',
  'Productivity': '#8b5cf6',
  'Gaming': '#ef4444',
  'Other': '#6b7280'
};

const CategoryChart = () => {
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

        // Group usage by category using limits to map domain→category
        const domainCategoryMap = {};
        limits.forEach(l => { domainCategoryMap[l.domain] = l.category || 'Other'; });

        const categoryTotals = {};
        usage.forEach(u => {
          const cat = domainCategoryMap[u.domain] || 'Other';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + (u.minutesSpent || 0);
        });

        const formatted = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
        setData(formatted);
      } catch (err) {
        console.error("CategoryChart error:", err);
      }
    };
    fetchData();
  }, []);

  const renderLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Usage by Category 📊</h3>
      <div className="h-[300px] w-full min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderLabel}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} mins`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 mt-24">No usage data yet.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
