import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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
    try {
      const response = await fetch('http://localhost:5005/api/wellbeing/limits/user123');
      if (!response.ok) return;
      const result = await response.json();
      const items = result?.data ?? [];
      setRawLimits(items);
      setData(items.map((item, index) => ({
        name: item.domain.split('.')[0],
        mins: item.limitMinutes,
        color: COLORS[index % COLORS.length]
      })));
    } catch (error) {
      console.error("Error fetching limits:", error);
    }
  }, []);

  useEffect(() => { fetchLimits(); }, [fetchLimits]);

  const handleDelete = async (limit) => {
    setDeletingId(limit.id);
    try {
      const res = await fetch(`http://localhost:5005/api/wellbeing/limits/${limit.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`${limit.domain} limit deleted! 🗑️`, 'success');
        await fetchLimits();
      } else {
        addToast('Delete failed. Try again.', 'error');
      }
    } catch {
      addToast('Server error. Check backend.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (limit) => {
    setEditingId(limit.id);
    setEditMins(limit.limitMinutes.toString());
    setEditCat(limit.category || 'Other');
  };

  const handleSave = async (limit) => {
    const mins = parseInt(editMins);
    if (isNaN(mins) || mins < 1 || mins > 1440) {
      addToast('Please enter minutes between 1 and 1440.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user123', domain: limit.domain, limitMinutes: mins, category: editCat })
      });
      if (res.ok) {
        addToast(`${limit.domain} updated to ${mins} mins! ✅`, 'success');
        setEditingId(null);
        await fetchLimits();
      } else {
        addToast('Update failed. Try again.', 'error');
      }
    } catch {
      addToast('Server error. Check backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 relative">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[70] space-y-2 pointer-events-none w-72">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'
              }`}
            >
              <span>{toast.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-bold text-sm">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Configured Limits 🎯</h3>

      {/* Bar Chart */}
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
        ) : (
          <p className="text-center text-slate-400 mt-16">No limits set yet.</p>
        )}
      </div>

      {/* Limits List */}
      {rawLimits.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-3">Manage Limits</h4>
          <AnimatePresence>
            {rawLimits.map((limit, i) => (
              <motion.div key={limit.id || i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-slate-100 dark:border-slate-600 overflow-hidden"
              >
                {/* Main row */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_EMOJIS[limit.category] || '📦'}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{limit.domain}</p>
                      <p className="text-sm text-slate-400">{limit.category || 'Other'} · {limit.limitMinutes} mins/day</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => editingId === limit.id ? setEditingId(null) : startEdit(limit)}
                      className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-200 transition-all"
                    >
                      {editingId === limit.id ? '✕ Cancel' : '✏️ Edit'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(limit)}
                      disabled={deletingId === limit.id}
                      className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-200 transition-all"
                    >
                      {deletingId === limit.id ? '...' : '🗑️'}
                    </motion.button>
                  </div>
                </div>

                {/* Inline Edit Panel */}
                <AnimatePresence>
                  {editingId === limit.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="bg-white dark:bg-slate-800 p-5 border-t border-slate-100 dark:border-slate-600"
                    >
                      {/* Category Grid */}
                      <p className="text-xs font-black uppercase tracking-wider opacity-50 mb-3">Category</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => setEditCat(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${editCat === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                          >
                            {CATEGORY_EMOJIS[cat]} {cat}
                          </button>
                        ))}
                      </div>

                      {/* Time Presets */}
                      <p className="text-xs font-black uppercase tracking-wider opacity-50 mb-3">Daily Limit</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {TIME_PRESETS.map(t => (
                          <button key={t} onClick={() => setEditMins(t.toString())}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${editMins === t.toString() ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                          >
                            {t < 60 ? `${t}m` : `${t / 60}h`}
                          </button>
                        ))}
                      </div>
                      <input type="number" value={editMins} onChange={e => setEditMins(e.target.value)} placeholder="Custom minutes (1-1440)"
                        className="w-full p-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600 outline-none focus:border-blue-500 mb-4 font-bold"
                      />

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave(limit)} disabled={saving}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/20 transition-all"
                      >
                        {saving ? 'Saving...' : '💾 Save Changes'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LimitsChart;
