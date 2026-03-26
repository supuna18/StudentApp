import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
const CATEGORY_EMOJIS = {
  'Social Media': '📱', 'Entertainment': '🎬', 'Education': '🎓',
  'Productivity': '🚀', 'Gaming': '🎮', 'Other': '📦'
};
const CATEGORIES = ['Social Media', 'Entertainment', 'Education', 'Productivity', 'Gaming', 'Other'];
const TIME_PRESETS = [15, 30, 45, 60, 120, 180];

const LimitsChart = () => {
  const [data, setData] = useState([]);
  const [rawLimits, setRawLimits] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMins, setEditMins] = useState('');
  const [editCat, setEditCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchLimits = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`);
      if (!response.ok) return;
      const result = await response.json();
      const items = result?.data ?? [];
      setRawLimits(items);
      setData(items.map((item, index) => ({
        name: item.domain.split('.')[0],
        mins: item.limitMinutes,
        color: COLORS[index % COLORS.length]
      })));
    } catch (error) { console.error("Error fetching limits:", error); }
  }, []);

  useEffect(() => { fetchLimits(); }, [fetchLimits]);

  const handleDelete = async (limit) => {
    setDeletingId(limit.id);
    try {
      const res = await fetch(`http://localhost:5005/api/wellbeing/limits/${limit.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`${limit.domain} limit deleted! 🗑️`, 'success');
        await fetchLimits();
      } else addToast('Delete failed.', 'error');
    } catch { addToast('Server error.', 'error'); } 
    finally { setDeletingId(null); }
  };

  const handleSave = async (limit) => {
    const mins = parseInt(editMins);
    if (isNaN(mins) || mins < 1 || mins > 1440) return addToast('Range 1-1440 mins.', 'error');
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId(), domain: limit.domain, limitMinutes: mins, category: editCat })
      });
      if (res.ok) {
        addToast(`${limit.domain} updated! ✅`, 'success');
        setEditingId(null);
        await fetchLimits();
      } else addToast('Update failed.', 'error');
    } catch { addToast('Server error.', 'error'); } 
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 relative">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Configured Limits 🎯</h3>
      <div className="h-[200px] w-full mb-8">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(v) => `${v} mins`} />
              <Bar dataKey="mins" radius={[10, 10, 10, 10]} barSize={35}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 mt-16">No limits set yet.</p>}
      </div>

      <div className="space-y-3">
        {rawLimits.map((limit, i) => (
          <motion.div key={limit.id || i} layout className="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center justify-between p-4">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJIS[limit.category] || '📦'}</span>
                  <div>
                    <p className="font-bold">{limit.domain}</p>
                    <p className="text-xs text-slate-500">{limit.limitMinutes} min/day</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => {setEditingId(editingId === limit.id ? null : limit.id); setEditMins(limit.limitMinutes); setEditCat(limit.category)}} className="p-2 px-4 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">Edit</button>
                  <button onClick={() => handleDelete(limit)} disabled={deletingId === limit.id} className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">🗑️</button>
               </div>
            </div>
            
            <AnimatePresence>
               {editingId === limit.id && (
                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4 overflow-hidden">
                    <div className="flex flex-wrap gap-2">
                       {CATEGORIES.map(c => <button key={c} onClick={() => setEditCat(c)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${editCat === c ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{c}</button>)}
                    </div>
                    <div className="flex gap-4">
                       <input type="number" value={editMins} onChange={e => setEditMins(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 font-bold" />
                       <button onClick={() => handleSave(limit)} disabled={saving} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase text-xs">Save</button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LimitsChart;
