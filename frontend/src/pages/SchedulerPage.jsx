import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, Target, Calendar as CalIcon, BellRing, ShieldCheck,
  Trash2, Pencil, X, Zap, Layers, Plus, Gem
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
        fetchSessions(); 
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
    if (d.toString().includes('s')) return d.replace('s', ' sec');
    const mins = parseInt(d);
    if (mins >= 60) return `${mins / 60}h`;
    return `${mins}m`;
  };

  return (
    <div style={styles.page}>
      {/* Hero Banner */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.heroDot} />
          STUDY SCHEDULER
        </div>
        <h1 style={styles.heroTitle}>Plan, Focus, <span style={styles.heroAccent}>Excel.</span></h1>
        <p style={styles.heroSub}>Architect your academic sessions and stay ahead with structured focus blocks.</p>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{sessions.length}</span>
            <span style={styles.heroStatLabel}>SESSIONS</span>
          </div>
          <div style={styles.heroStatDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{sessions.filter(s => s.fromDate === todayStr).length}</span>
            <span style={styles.heroStatLabel}>TODAY</span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Form Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <div style={{ ...styles.cardIconWrap, background: isEditing ? '#059669' : '#2563EB' }}>
                {isEditing ? <Pencil size={18} color="#fff" /> : <CalIcon size={18} color="#fff" />}
              </div>
              <div>
                <h2 style={styles.cardTitle}>{isEditing ? 'Edit Session' : 'New Session'}</h2>
                <p style={styles.cardSub}>{isEditing ? 'Update your study plan' : 'Schedule a focused study block'}</p>
              </div>
            </div>
            {isEditing && (
              <button onClick={resetForm} style={styles.cancelBtn}><X size={16} /></button>
            )}
          </div>
          <div style={styles.cardDivider} />
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Topic</label>
                <input type="text" required placeholder="Topic" style={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <input type="text" required placeholder="Subject" style={styles.input} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Session Date</label>
              <input type="date" required min={todayStr} style={styles.input} value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} />
            </div>
            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Start Time</label>
                <input type="time" required min={form.fromDate === todayStr ? currentTimeStr : '00:00'} style={styles.input} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Duration</label>
                <select style={styles.select} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                  <option value="5s">5 seconds (test)</option>
                  <option value="10s">10 seconds</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
            <motion.button whileHover={{ opacity: 0.92 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ ...styles.submitBtn, background: isEditing ? '#059669' : '#2563EB' }}>
              {loading ? <Zap size={16} color="#fff" /> : isEditing ? <ShieldCheck size={16} /> : <Plus size={16} />}
              {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Schedule Session'}
            </motion.button>
          </form>
        </motion.div>

        {/* Agenda Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.agenda}>
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
          <div style={styles.sessionList}>
            <AnimatePresence mode="popLayout">
              {sessions.map((s, i) => (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ ...styles.sessionCard, borderLeft: s.fromDate === todayStr ? '4px solid #10B981' : '4px solid #E5E7EB' }}>
                  <div style={styles.sessionTop}>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.sessionTitle}>{s.title}</h3>
                      <div style={styles.sessionSubject}><Layers size={11} /> {s.subject}</div>
                    </div>
                    <div style={styles.sessionActions}>
                      <button onClick={() => handleEdit(s)} style={styles.iconBtn}><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(s.id)} style={styles.iconBtn}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={styles.sessionMeta}>
                    <span style={styles.metaPill}><Clock size={11} /> {s.startTime}</span>
                    <span style={styles.metaPill}><Target size={11} /> {formatDuration(s.duration)}</span>
                  </div>
                  <button onClick={() => startFocus(s)} style={styles.focusBtn}>
                    <ShieldCheck size={14} /> Start Focus
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#F3F4F6', fontFamily: 'sans-serif' },
  hero: { background: '#0F172A', padding: '40px', color: 'white' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px', fontSize: '11px', marginBottom: '20px' },
  heroDot: { width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' },
  heroTitle: { fontSize: '40px', fontWeight: 'bold', margin: '0 0 10px 0' },
  heroAccent: { color: '#60A5FA' },
  heroSub: { opacity: 0.6, maxWidth: '500px', fontSize: '14px' },
  heroStats: { display: 'flex', gap: '30px', marginTop: '20px' },
  heroStat: { display: 'flex', flexDirection: 'column' },
  heroStatNum: { fontSize: '24px', fontWeight: 'bold' },
  heroStatLabel: { fontSize: '10px', opacity: 0.5 },
  heroStatDivider: { width: '1px', background: 'rgba(255,255,255,0.1)' },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '40px', display: 'flex', gap: '30px' },
  formCard: { flex: 1, background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardHeaderLeft: { display: 'flex', gap: '15px' },
  cardIconWrap: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  cardSub: { fontSize: '12px', opacity: 0.5 },
  cardDivider: { height: '1px', background: '#eee', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  fieldRow: { display: 'flex', gap: '15px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold', opacity: 0.6, textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' },
  select: { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' },
  submitBtn: { padding: '15px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  agenda: { width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' },
  agendaHeader: { background: '#1E293B', padding: '25px', borderRadius: '20px', color: 'white' },
  agendaHeaderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  agendaTitle: { fontWeight: 'bold' },
  agendaBadge: { background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '10px', fontSize: '12px' },
  agendaSub: { fontSize: '11px', opacity: 0.5, marginTop: '5px' },
  sessionList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sessionCard: { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' },
  sessionTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  sessionTitle: { fontSize: '15px', fontWeight: 'bold', margin: 0 },
  sessionSubject: { fontSize: '12px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '5px' },
  sessionActions: { display: 'flex', gap: '5px' },
  iconBtn: { padding: '5px', border: '1px solid #eee', borderRadius: '5px', background: 'none', cursor: 'pointer' },
  sessionMeta: { display: 'flex', gap: '10px', marginBottom: '15px' },
  metaPill: { fontSize: '11px', background: '#f8f9fa', padding: '3px 8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' },
  focusBtn: { width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#0F172A', color: 'white', fontSize: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }
};

export default SchedulerPage;