import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, Target, Calendar as CalIcon, BellRing, ShieldCheck,
  Trash2, Pencil, X, Zap, Layers, Plus, LogIn, Gem
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';

const SchedulerPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTimeStr =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');

  const [form, setForm] = useState({
    title: '', subject: '', fromDate: todayStr, startTime: '', duration: '30'
  });

  const token = localStorage.getItem('token');

  let userEmail = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const identity =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        decoded.email ||
        decoded.unique_name;
      userEmail = identity && !identity.includes('@')
        ? `${identity.toLowerCase()}@gmail.com`
        : identity;
    } catch (e) { }
  }
  if (!userEmail) userEmail = localStorage.getItem('userEmail') || 'Guest_Student';

  const API_URL = 'http://localhost:5005/api/scheduler';

  useEffect(() => {
    fetchSessions();
    if ('Notification' in window) Notification.requestPermission();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/${userEmail}`);
      const activeSessions = res.data.filter(s => s.isCompleted === false);
      setSessions(activeSessions);
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.fromDate === todayStr && form.startTime < currentTimeStr) {
        alert('Cannot schedule a session in the past! Please pick a future time.');
        return;
      }
      setLoading(true);
      const finalForm = { ...form, toDate: form.fromDate, userEmail };
      if (isEditing) {
        await axios.put(`${API_URL}/${editId}`, finalForm);
        alert('Study Plan Updated!');
      } else {
        await axios.post(`${API_URL}/create`, finalForm);
        alert('Study Session Scheduled!');
      }
      resetForm();
      fetchSessions();
    } catch (err) {
      alert('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const startFocus = async (session) => {
    if (session.fromDate > todayStr) {
      alert("This is a focused session scheduled for a future date. You can only initiate the protocol on the scheduled day!");
      return;
    }

    const isSeconds = session.duration.toString().includes('s');
    const durationValue = parseInt(session.duration);
    const durationMs = isSeconds ? durationValue * 1000 : durationValue * 60 * 1000;
    const displayLabel = isSeconds ? `${durationValue} Seconds` : `${durationValue} Minutes`;

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification('🚀 Focus Mode Activated!', {
        body: `Target Mission: ${session.title}\nAllocated Time: ${displayLabel}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2593/2593549.png',
        tag: 'focus-start'
      });
    }
    alert(`STUDY PROTOCOL INITIATED: Stay focused for ${displayLabel}!`);

    setTimeout(async () => {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        if (context) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.type = 'sine';
          oscillator.frequency.value = 880;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 800);
        }
      } catch (e) { console.error('Audio error'); }

      if (Notification.permission === 'granted') {
        new Notification('⏰ TIME IS UP!', {
          body: `Your study session for "${session.title}" is complete. Take a break!`,
          requireInteraction: true,
          icon: 'https://cdn-icons-png.flaticon.com/512/2593/2593549.png',
          tag: 'focus-end'
        });
      }

      alert(`🏁 MISSION COMPLETE: "${session.title}" session finished!\nTake a well-deserved break.`);
      try {
        await axios.put(`${API_URL}/complete/${session.id}`);
        fetchSessions(); // Refresh list to remove from agenda AFTER clicking OK
      } catch (e) {
        console.error("Complete Update Error:", e);
      }
    }, durationMs);

    window.postMessage({ type: 'START_FOCUS_MODE', duration: isSeconds ? 1 : durationValue }, '*');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSessions();
    } catch (err) { alert('Delete failed.'); }
  };

  const handleEdit = (session) => {
    setIsEditing(true);
    setEditId(session.id);
    const { toDate, ...rest } = session;
    setForm({ ...rest });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ title: '', subject: '', fromDate: todayStr, startTime: '', duration: '30' });
    setIsEditing(false);
    setEditId(null);
  };

  const formatDuration = (d) => {
    if (d.includes('s')) return d.replace('s', ' sec');
    const mins = parseInt(d);
    if (mins >= 60) return `${mins / 60}h`;
    return `${mins}m`;
  };

  return (
    <div style={styles.page}>
      {/* ── TOP HERO BANNER ── */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.heroDot} />
          STUDY SCHEDULER
        </div>
        <h1 style={styles.heroTitle}>
          Plan, Focus,{' '}
          <span style={styles.heroAccent}>Excel.</span>
        </h1>
        <p style={styles.heroSub}>
          Architect your academic sessions and stay ahead with structured focus blocks.
        </p>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{sessions.length}</span>
            <span style={styles.heroStatLabel}>SESSIONS</span>
          </div>
          <div style={styles.heroStatDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>
              {sessions.filter(s => s.fromDate === todayStr).length}
            </span>
            <span style={styles.heroStatLabel}>TODAY</span>
          </div>
          <div style={styles.heroStatDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>
              {sessions.reduce((acc, s) => {
                if (s.duration.includes('s')) return acc;
                return acc + parseInt(s.duration);
              }, 0)}m
            </span>
            <span style={styles.heroStatLabel}>PLANNED</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.content}>

        {/* ── FORM CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={styles.formCard}
        >
          {/* Card header */}
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <div style={{
                ...styles.cardIconWrap,
                background: isEditing ? '#059669' : '#2563EB'
              }}>
                {isEditing ? <Pencil size={18} color="#fff" /> : <CalIcon size={18} color="#fff" />}
              </div>
              <div>
                <h2 style={styles.cardTitle}>
                  {isEditing ? 'Edit Session' : 'New Session'}
                </h2>
                <p style={styles.cardSub}>
                  {isEditing ? 'Update your study plan' : 'Schedule a focused study block'}
                </p>
              </div>
            </div>
            {isEditing && (
              <button onClick={resetForm} style={styles.cancelBtn}>
                <X size={16} />
              </button>
            )}
          </div>

          <div style={styles.cardDivider} />

          {/* Form */}
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Topic</label>
                <input
                  type="text" required
                  placeholder="e.g. Linear Algebra"
                  style={styles.input}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <input
                  type="text" required
                  placeholder="e.g. Mathematics"
                  style={styles.input}
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, color: '#2563EB' }}>Session Date</label>
              <input
                type="date" required
                min={todayStr}
                style={styles.input}
                value={form.fromDate}
                onChange={e => setForm({ ...form, fromDate: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="time" required
                  min={form.fromDate === todayStr ? currentTimeStr : '00:00'}
                  style={styles.input}
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div style={styles.field}>
                <label style={{ ...styles.label, color: '#2563EB' }}>Duration</label>
                <div style={styles.selectWrap}>
                  <select
                    style={styles.select}
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                  >
                    <optgroup label="Quick Test">
                      <option value="5s">5 seconds (test)</option>
                      <option value="10s">10 seconds</option>
                    </optgroup>
                    <optgroup label="Focus Blocks">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                      <option value="240">4 hours</option>
                      <option value="300">5 hours</option>
                      <option value="360">6 hours</option>
                      <option value="420">7 hours</option>
                      <option value="480">8 hours</option>
                      <option value="540">9 hours</option>
                      <option value="600">10 hours</option>
                    </optgroup>
                  </select>
                  <div style={styles.selectArrow} />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ opacity: 0.92 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                background: isEditing ? '#059669' : '#2563EB'
              }}
            >
              {loading
                ? <Zap size={16} color="#fff" />
                : isEditing
                  ? <ShieldCheck size={16} color="#fff" />
                  : <Plus size={16} color="#fff" />
              }
              {loading
                ? 'Saving…'
                : isEditing
                  ? 'Save Changes'
                  : 'Schedule Session'
              }
            </motion.button>
          </form>
        </motion.div>



        {/* PREMIUM SIDEBAR. AGENDA */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-[460px] space-y-8"
        >
          <div className="bg-indigo-950 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-900/30 border-b-8 border-b-indigo-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Layers size={80} /></div>
            <h2 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter italic relative z-10">
              <BellRing size={28} className="text-indigo-400" /> My Agenda
            </h2>
            <p className="text-indigo-200/50 text-[10px] font-black mt-2 opacity-70 tracking-[0.2em] uppercase relative z-10">Future Study Parameters</p>
          </div>

          <div className="space-y-5 max-h-[750px] overflow-y-auto pr-4 custom-scroll pb-20">
            <AnimatePresence mode="popLayout">
              {sessions.map((s, i) => (
                <motion.div
                  layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, x: 100 }} transition={{ delay: i * 0.1 }}
                  key={s.id}
                  className={`group p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden ${s.fromDate === todayStr ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  {s.fromDate === todayStr && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
                      Active Today
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div className="max-w-[70%]">
                      <h3 className="font-black text-indigo-950 text-xl leading-[1.1] mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={14} /> {s.subject}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(s)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8 text-[11px] font-black text-indigo-400 uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100/50 italic">
                      <Clock size={14} /> {s.startTime}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <Gem size={14} /> {s.duration.includes('s') ? s.duration.replace('s', ' SEC') : `${s.duration} MIN`}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={() => startFocus(s)}
                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2rem] text-[10px] font-black shadow-xl shadow-emerald-200 uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all italic"
                  >
                    Initiate Focus Protocol <ShieldCheck size={18} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            {sessions.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <Target size={80} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-[0.3em]">No Active Missions</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── END OF MAIN CONTENT ── */}
      </div>
    </div>
  );
};

/* ── STYLES ── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#F3F4F6',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#111827',
  },

  /* Hero */
  hero: {
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1E3A5F 100%)',
    padding: '48px 40px 52px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '5px 14px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#93C5FD',
    marginBottom: 20,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#3B82F6',
    display: 'inline-block',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  heroAccent: {
    color: '#60A5FA',
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    maxWidth: 480,
    lineHeight: 1.6,
    marginBottom: 36,
    fontWeight: 400,
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  heroStatNum: {
    fontSize: 28,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.35)',
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    background: 'rgba(255,255,255,0.12)',
  },

  /* Layout */
  content: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '32px 32px 48px',
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  },

  /* Form card */
  formCard: {
    flex: 1,
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    padding: '32px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#111827',
    letterSpacing: '-0.2px',
    margin: 0,
  },
  cardSub: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: 400,
  },
  cancelBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#DC2626',
  },
  cardDivider: {
    height: 1,
    background: '#F3F4F6',
    marginBottom: 24,
  },

  /* Form */
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 11.5,
    fontWeight: 500,
    color: '#6B7280',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  input: {
    height: 44,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  },
  selectWrap: { position: 'relative' },
  select: {
    height: 44,
    padding: '0 36px 0 14px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit',
    appearance: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '5px solid #9CA3AF',
    pointerEvents: 'none',
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
    marginTop: 4,
    letterSpacing: '0.01em',
  },

  /* Agenda */
  agenda: {
    width: 360,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  agendaHeader: {
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
    borderRadius: 16,
    padding: '24px 26px',
  },
  agendaHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFFFFF',
    letterSpacing: '-0.2px',
  },
  agendaBadge: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 9px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  agendaSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 400,
  },

  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 620,
    overflowY: 'auto',
    paddingRight: 2,
  },
  sessionCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: '18px 20px',
    transition: 'box-shadow 0.15s',
  },
  sessionTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 160,
    display: 'block',
  },
  todayBadge: {
    fontSize: 10,
    fontWeight: 600,
    background: '#EFF6FF',
    color: '#2563EB',
    padding: '2px 8px',
    borderRadius: 20,
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  sessionSubject: {
    fontSize: 11.5,
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontWeight: 400,
  },
  sessionActions: { display: 'flex', gap: 6, marginLeft: 10 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  },
  sessionMeta: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  metaPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#6B7280',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '4px 9px',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 400,
  },
  focusBtn: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    border: 'none',
    background: '#111827',
    color: '#fff',
    fontSize: 12.5,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },

  emptyState: {
    textAlign: 'center',
    padding: '52px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: 400,
  },
};

export default SchedulerPage;
