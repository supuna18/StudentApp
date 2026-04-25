import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserId } from '../../utils/wellbeingUtils';

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#14b8a6', '#a855f7', '#06b6d4'];
const CATEGORY_EMOJIS = {
  'Social Media': '📱', 'Entertainment': '🎬', 'Education': '🎓',
  'Productivity': '🚀', 'Gaming': '🎮', 'Other': '📦'
};
const CATEGORIES = ['Social Media', 'Entertainment', 'Education', 'Productivity', 'Gaming', 'Other'];

const LimitsChart = ({ dark }) => {
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

  useEffect(() => { 
    fetchLimits(); 
    const interval = setInterval(fetchLimits, 20000); // Remote sync every 20s
    return () => clearInterval(interval);
  }, [fetchLimits]);

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

  const grid = dark ? '#334155' : '#f1f5f9';
  const tick = dark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Configured Limits <span className="text-primary">🎯</span></h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${dark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>Current</span>
      </div>

      <div className="h-[220px] w-full mb-8">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tick }} />
              <Tooltip 
                cursor={{ fill: dark ? '#ffffff05' : '#00000005' }} 
                contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
                formatter={(v) => [`${v} mins`, 'Limit']}
              />
              <Bar dataKey="mins" radius={[8, 8, 8, 8]} barSize={32}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className={`text-center mt-16 text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No limits set yet.</p>}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {rawLimits.map((limit, i) => (
          <motion.div 
            key={limit.id || i} 
            layout 
            className={`rounded-2xl border transition-all ${dark ? 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
          >
            <div className="flex items-center justify-between p-4">
               <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${dark ? 'bg-slate-800' : 'bg-white'}`}>
                    {CATEGORY_EMOJIS[limit.category] || '📦'}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-800'}`}>{limit.domain}</p>
                    <p className={`text-[11px] font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{limit.limitMinutes} min/day</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => {setEditingId(editingId === limit.id ? null : limit.id); setEditMins(limit.limitMinutes); setEditCat(limit.category)}} 
                    className={`p-2 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all
                      ${editingId === limit.id ? 'bg-primary text-white' : dark ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(limit)} 
                    disabled={deletingId === limit.id} 
                    className={`p-2 px-3 rounded-xl transition-all ${dark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                  >
                    🗑️
                  </button>
               </div>
            </div>
            
            <AnimatePresence>
               {editingId === limit.id && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }} 
                   animate={{ height: 'auto', opacity: 1 }} 
                   exit={{ height: 0, opacity: 0 }} 
                   className={`p-4 border-t space-y-4 overflow-hidden ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-white'}`}
                 >
                    <div className="flex flex-wrap gap-2">
                       {CATEGORIES.map(c => (
                         <button 
                           key={c} 
                           onClick={() => setEditCat(c)} 
                           className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all 
                             ${editCat === c 
                               ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                               : dark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                         >
                           {c}
                         </button>
                       ))}
                    </div>
                    <div className="flex gap-4">
                       <input 
                         type="number" 
                         value={editMins} 
                         onChange={e => setEditMins(e.target.value)} 
                         className={`flex-1 p-3 rounded-xl border font-bold text-sm outline-none transition-all
                           ${dark ? 'bg-slate-700 border-slate-600 text-white focus:border-primary' : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-primary'}`}
                       />
                       <button 
                         onClick={() => handleSave(limit)} 
                         disabled={saving} 
                         className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                       >
                         {saving ? '...' : 'Save'}
                       </button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Toasts inside chart context */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`px-4 py-2 rounded-lg border shadow-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/90
                ${t.type === 'success' ? 'border-emerald-200 text-secondary' : 'border-rose-200 text-rose-600'}`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LimitsChart;


