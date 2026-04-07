import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, Target, Calendar as CalIcon, BellRing, ShieldCheck,
  Trash2, Pencil, X, Zap, Layers, Plus, LogIn
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
    } catch (e) {}
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

    setTimeout(async() => {
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

        {/* ── AGENDA SIDEBAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={styles.agenda}
        >
          {/* Agenda header */}
          <div style={styles.agendaHeader}>
            <div style={styles.agendaHeaderTop}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BellRing size={18} color="#93C5FD" />
                <span style={styles.agendaTitle}>My Agenda</span>
              </div>
              <span style={styles.agendaBadge}>{sessions.length}</span>
            </div>
            <p style={styles.agendaSub}>Upcoming study sessions</p>
          </div>

          {/* Session list */}
          <div style={styles.sessionList}>
            <AnimatePresence mode="popLayout">
              {sessions.length === 0 ? (
                <div style={styles.emptyState}>
                  <Target size={32} color="#D1D5DB" />
                  <p style={styles.emptyText}>No sessions scheduled yet</p>
                </div>
              ) : (
                sessions.map((s, i) => {
                  const isToday = s.fromDate === todayStr;
                  return (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60, scale: 0.95 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        ...styles.sessionCard,
                        borderLeft: isToday ? '3px solid #2563EB' : '3px solid transparent'
                      }}
                    >
                      {/* Top row */}
                      <div style={styles.sessionTop}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={styles.sessionTitle}>{s.title}</span>
                            {isToday && (
                              <span style={styles.todayBadge}>Today</span>
                            )}
                          </div>
                          <div style={styles.sessionSubject}>
                            <Layers size={11} color="#9CA3AF" />
                            {s.subject}
                          </div>
                        </div>
                        <div style={styles.sessionActions}>
                          <button
                            onClick={() => handleEdit(s)}
                            style={styles.iconBtn}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#EFF6FF';
                              e.currentTarget.style.borderColor = '#BFDBFE';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#F9FAFB';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                          >
                            <Pencil size={13} color="#2563EB" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            style={styles.iconBtn}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FEF2F2';
                              e.currentTarget.style.borderColor = '#FECACA';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#F9FAFB';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                          >
                            <Trash2 size={13} color="#DC2626" />
                          </button>
                        </div>
                      </div>

                      {/* Meta pills */}
                      <div style={styles.sessionMeta}>
                        <span style={styles.metaPill}>
                          <Clock size={11} color="#6B7280" />
                          {s.startTime}
                        </span>
                        <span style={styles.metaPill}>
                          <Target size={11} color="#6B7280" />
                          {formatDuration(s.duration.toString())}
                        </span>
                        <span style={styles.metaPill}>
                          <CalIcon size={11} color="#6B7280" />
                          {s.fromDate}
                        </span>
                      </div>

                      {/* Focus button */}
                      <motion.button
                        whileHover={{ opacity: 0.88 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startFocus(s)}
                        style={styles.focusBtn}
                      >
                        <ShieldCheck size={14} color="#fff" />
                        Start Focus Session
                      </motion.button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>

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
