import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { User, Lock, Bell, Trash2, AlertTriangle, Pencil, Check, X } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2) || 'U';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return isNaN(d) ? 'Invalid Date' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

/* ── left nav items ──────────────────────────────────────────── */
const navItems = [
  { id: 'account',       label: 'Account Info',  icon: <User      size={14} strokeWidth={2} /> },
  { id: 'security',      label: 'Security',       icon: <Lock      size={14} strokeWidth={2} /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell      size={14} strokeWidth={2} /> },
];

/* ── component ───────────────────────────────────────────────── */
const ProfileManagement = () => {
  const [user, setUser]           = useState(null);
  const [activeNav, setActiveNav] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm]   = useState({ username: '', email: '' });
  const [saving, setSaving]       = useState(false);
  const navigate                  = useNavigate();

  /* ── fetch profile ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login', { replace: true }); return; }

    try {
      jwtDecode(token); // validate token structure
      fetch('http://localhost:5005/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => {
          console.error('Error fetching user data:', err);
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        });
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  /* ── start editing ── */
  const handleEdit = () => {
    setEditForm({ username: user.username || '', email: user.email || '' });
    setIsEditing(true);
  };

  /* ── cancel editing ── */
  const handleCancel = () => setIsEditing(false);

  /* ── save profile ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5005/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setUser((prev) => ({ ...prev, ...editForm }));
        localStorage.setItem('username', editForm.username);
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── delete account ── */
  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    fetch('http://localhost:5005/api/users/profile', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => {
        if (res.ok) { localStorage.removeItem('token'); navigate('/login', { replace: true }); }
        else alert('Failed to delete account. Please try again.');
      })
      .catch((err) => console.error(err));
  };

  /* ── loading ── */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400" style={{ fontFamily: 'DM Sans' }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  const roleBadge = user.role === 'Admin'
    ? { bg: 'bg-[#EEF2FF]', text: 'text-blue-700' }
    : { bg: 'bg-emerald-50', text: 'text-emerald-700' };

  return (
    <>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .pm-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
      `}</style>

      <div className="pm-root px-2 py-1">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 mb-5">
          <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer" style={{ fontFamily: 'DM Sans' }}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Profile Settings</span>
        </div>

        {/* ── Page header ── */}
        <div className="mb-7">
          <h1 className="serif-heading text-[26px] text-[#0F1C4D] italic leading-tight">Profile Settings</h1>
          <p className="text-[12px] text-slate-400 mt-1">Manage your account information and preferences</p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-[200px_1fr] gap-5 items-start">

          {/* ── Left nav ── */}
          <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">

            {/* Profile summary */}
            <div className="flex flex-col items-center text-center px-4 py-5 border-b border-[#E8EEFF]">
              <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-[18px] font-extrabold text-white mb-2.5">
                {getInitials(user.username)}
              </div>
              <p className="text-[13px] font-bold text-[#0F1C4D] leading-tight">{user.username}</p>
              <p className="text-[11px] text-slate-400 mt-1 truncate max-w-full">{user.email}</p>
              <span className={`inline-block ${roleBadge.bg} ${roleBadge.text} text-[9.5px] font-bold tracking-[1px] uppercase px-2.5 py-1 rounded-full mt-2`}>
                {user.role}
              </span>
            </div>

            {/* Nav items */}
            <div className="p-2.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-[12.5px] font-medium transition-all duration-150 mb-0.5 text-left
                    ${activeNav === item.id
                      ? 'bg-[#EEF2FF] text-blue-700 font-semibold'
                      : 'text-slate-500 hover:bg-[#F0F4FF] hover:text-blue-600'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right content ── */}
          <div className="flex flex-col gap-4">

            {/* Account info card */}
            <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-6 pt-5 pb-0">
                <div className="flex items-center justify-between gap-2.5 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-blue-600" strokeWidth={2} />
                    </div>
                    <p className="text-[14px] font-bold text-[#0F1C4D]">Account Information</p>
                  </div>
                  {/* Edit / Save / Cancel buttons */}
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[#E8EEFF] bg-white hover:bg-[#EEF2FF] hover:border-blue-300 text-[12px] font-semibold text-slate-500 hover:text-blue-600 transition-all duration-150"
                    >
                      <Pencil size={12} strokeWidth={2.5} /> Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[#E8EEFF] bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-500 transition-all duration-150"
                      >
                        <X size={12} strokeWidth={2.5} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold shadow-sm shadow-blue-200 transition-all duration-150 disabled:opacity-60"
                      >
                        <Check size={12} strokeWidth={2.5} /> {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[12px] text-slate-400 mt-1 mb-5">
                  {isEditing ? 'Edit your username and email address below.' : 'Your personal details — click Edit to make changes.'}
                </p>
              </div>

              <div className="h-px bg-[#E8EEFF]" />

              {/* Fields */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Username</label>
                    <input
                      type="text"
                      value={isEditing ? editForm.username : (user.username || '')}
                      readOnly={!isEditing}
                      onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150
                        ${isEditing
                          ? 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100 cursor-text'
                          : 'border-[#E8EEFF] text-slate-500 bg-[#F8FAFF] cursor-default'}`}
                      style={{ fontFamily: 'DM Sans' }}
                    />
                    <span className="text-[10.5px] text-slate-400">Your unique EduSync identifier</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Email Address</label>
                    <input
                      type="email"
                      value={isEditing ? editForm.email : (user.email || '')}
                      readOnly={!isEditing}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150
                        ${isEditing
                          ? 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100 cursor-text'
                          : 'border-[#E8EEFF] text-slate-500 bg-[#F8FAFF] cursor-default'}`}
                      style={{ fontFamily: 'DM Sans' }}
                    />
                    <span className="text-[10.5px] text-slate-400">Used for login and notifications</span>
                  </div>
                </div>
              </div>

              {/* Meta strip */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-[#FAFBFF] border-t border-[#E8EEFF]">
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  Member since {formatDate(user.createdAt)}
                </div>
                <span className={`text-[9.5px] font-bold tracking-[1px] uppercase px-2.5 py-1 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* ── Danger zone card ── */}
            <div className="bg-white border-[1.5px] border-red-200 rounded-2xl overflow-hidden">

              {/* Danger header */}
              <div className="flex items-center gap-2.5 px-6 py-4 bg-red-50/60 border-b border-red-100">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-red-600" strokeWidth={2} />
                </div>
                <p className="text-[14px] font-bold text-red-600">Danger Zone</p>
              </div>

              {/* Danger body */}
              <div className="px-6 py-5">
                <p className="text-[13px] text-slate-500 leading-[1.65] mb-5">
                  Permanently delete your account and all associated data. This action is{' '}
                  <span className="font-semibold text-slate-700">irreversible</span> — once deleted, your account cannot be recovered.
                </p>

                {/* Delete row */}
                <div className="flex items-center justify-between px-4 py-3.5 border-[1.5px] border-red-100 rounded-[12px] bg-red-50/40">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0F1C4D]">Delete Account</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">All your data will be permanently erased</p>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-[12.5px] font-semibold rounded-[10px] transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 ml-4"
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileManagement;