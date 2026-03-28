import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { User, Lock, Bell, Trash2, AlertTriangle, Pencil, Check, X, ShieldCheck, Eye, EyeOff, Mail, Smartphone, BookOpen, BarChart2 } from 'lucide-react';

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
    { id: 'account', label: 'Account Info', icon: <User size={14} strokeWidth={2} /> },
    { id: 'security', label: 'Security', icon: <Lock size={14} strokeWidth={2} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} strokeWidth={2} /> },
];

/* ── component ───────────────────────────────────────────────── */
const ProfileManagement = () => {
    const [user, setUser] = useState(null);
    const [activeNav, setActiveNav] = useState('account');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '' });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // ── Security state ──
    const [otpSent, setOtpSent] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [secForm, setSecForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [secErrors, setSecErrors] = useState({});
    const [secSaving, setSecSaving] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [secSuccess, setSecSuccess] = useState('');

    // ── Notifications state ──
    const [notifs, setNotifs] = useState(() => {
        try { return JSON.parse(localStorage.getItem('notifPrefs')) || {}; } catch { return {}; }
    });
    const defaultNotifs = {
        emailUpdates:    { label: 'Email Updates',       desc: 'Receive important account and product updates via email.',    icon: Mail,       default: true  },
        smsAlerts:       { label: 'SMS Alerts',           desc: 'Get critical security alerts sent to your phone.',             icon: Smartphone, default: false },
        courseReminders: { label: 'Course Reminders',    desc: 'Reminders for upcoming sessions and assignment deadlines.',   icon: BookOpen,   default: true  },
        progressReports: { label: 'Progress Reports',    desc: 'Weekly summaries of your learning progress and activity.',   icon: BarChart2,  default: true  },
    };

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

    /* ── validate form ── */
    const validateForm = () => {
        const errs = {};

        // Validate username
        if (!editForm.username.trim()) {
            errs.username = 'Username is required.';
        } else if (editForm.username.length > 20) {
            errs.username = 'Username must be less than 20 characters.';
        } else if (/[^a-zA-Z\s]/.test(editForm.username)) {
            errs.username = 'Username must contain only letters and spaces.';
        }

        // Validate email
        if (!editForm.email.trim()) {
            errs.email = 'Email is required.';
        } else if (editForm.email.length > 50) {
            errs.email = 'Email must be less than 50 characters.';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editForm.email)) {
                errs.email = 'Please enter a valid email address.';
            }
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── start editing ── */
    const handleEdit = () => {
        setEditForm({ username: user.username || '', email: user.email || '' });
        setFormErrors({});
        setIsEditing(true);
    };

    /* ── cancel editing ── */
    const handleCancel = () => {
        setIsEditing(false);
        setFormErrors({});
    };

    /* ── save profile ── */
    const handleSave = async () => {
        if (!validateForm()) return;
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
                if (data.message && data.message.toLowerCase().includes('email')) {
                    setFormErrors({ email: data.message });
                } else if (data.message && data.message.toLowerCase().includes('username')) {
                    setFormErrors({ username: data.message });
                } else {
                    alert(data.message || 'Failed to update profile.');
                }
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    /* ── Security: request OTP ── */
    const handleRequestOtp = async () => {
        setOtpSending(true);
        setSecErrors({});
        setSecSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5005/api/users/profile/request-password-otp', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { setOtpSent(true); setSecSuccess('OTP sent to your registered email address.'); }
            else { const d = await res.json(); setSecErrors({ otp: d.message || 'Failed to send OTP.' }); }
        } catch { setSecErrors({ otp: 'An error occurred. Please try again.' }); }
        finally { setOtpSending(false); }
    };

    /* ── Security: validate & change password ── */
    const validateSecurity = () => {
        const errs = {};
        if (!secForm.otp.trim()) errs.otp = 'OTP is required.';
        if (!secForm.newPassword) errs.newPassword = 'New password is required.';
        else if (secForm.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
        if (!secForm.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
        else if (secForm.newPassword !== secForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
        setSecErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validateSecurity()) return;
        setSecSaving(true);
        setSecSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5005/api/users/profile/verify-password-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ otp: secForm.otp, newPassword: secForm.newPassword }),
            });
            if (res.ok) {
                setSecSuccess('Password changed successfully!');
                setSecForm({ otp: '', newPassword: '', confirmPassword: '' });
                setOtpSent(false);
            } else {
                const d = await res.json();
                setSecErrors({ otp: d.message || 'Invalid or expired OTP.' });
            }
        } catch { setSecErrors({ otp: 'An error occurred. Please try again.' }); }
        finally { setSecSaving(false); }
    };

    /* ── Notifications: toggle ── */
    const handleNotifToggle = (key) => {
        setNotifs((prev) => {
            const current = prev[key] !== undefined ? prev[key] : defaultNotifs[key].default;
            const updated = { ...prev, [key]: !current };
            localStorage.setItem('notifPrefs', JSON.stringify(updated));
            return updated;
        });
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>My Profile</span>
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

                        {/* ══════ ACCOUNT INFO ══════ */}
                        {activeNav === 'account' && (<>
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
                                        {!isEditing ? (
                                            <button onClick={handleEdit} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[#E8EEFF] bg-white hover:bg-[#EEF2FF] hover:border-blue-300 text-[12px] font-semibold text-slate-500 hover:text-blue-600 transition-all duration-150">
                                                <Pencil size={12} strokeWidth={2.5} /> Edit
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleCancel} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[#E8EEFF] bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-500 transition-all duration-150">
                                                    <X size={12} strokeWidth={2.5} /> Cancel
                                                </button>
                                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold shadow-sm shadow-blue-200 transition-all duration-150 disabled:opacity-60">
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
                                            <input type="text" maxLength={20} value={isEditing ? editForm.username : (user.username || '')} readOnly={!isEditing}
                                                onChange={(e) => { const val = e.target.value; if (/[^a-zA-Z\s]/.test(val)) return; setEditForm((f) => ({ ...f, username: val })); if (formErrors.username) setFormErrors((errs) => ({ ...errs, username: '' })); }}
                                                className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150 ${isEditing ? (formErrors.username ? 'border-red-400 bg-red-50/30 text-[#0F1C4D] focus:ring-2 focus:ring-red-100 cursor-text' : 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100 cursor-text') : 'border-[#E8EEFF] text-slate-500 bg-[#F8FAFF] cursor-default'}`}
                                                style={{ fontFamily: 'DM Sans' }} />
                                            {formErrors.username ? <span className="text-[10.5px] text-red-500 font-medium">{formErrors.username}</span> : <span className="text-[10.5px] text-slate-400">Your unique EduSync identifier</span>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Email Address</label>
                                            <input type="email" maxLength={50} value={isEditing ? editForm.email : (user.email || '')} readOnly={!isEditing}
                                                onChange={(e) => { setEditForm((f) => ({ ...f, email: e.target.value })); if (formErrors.email) setFormErrors((errs) => ({ ...errs, email: '' })); }}
                                                className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150 ${isEditing ? (formErrors.email ? 'border-red-400 bg-red-50/30 text-[#0F1C4D] focus:ring-2 focus:ring-red-100 cursor-text' : 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100 cursor-text') : 'border-[#E8EEFF] text-slate-500 bg-[#F8FAFF] cursor-default'}`}
                                                style={{ fontFamily: 'DM Sans' }} />
                                            {formErrors.email ? <span className="text-[10.5px] text-red-500 font-medium">{formErrors.email}</span> : <span className="text-[10.5px] text-slate-400">Used for login and notifications</span>}
                                        </div>
                                    </div>
                                </div>
                                {/* Meta strip */}
                                <div className="flex items-center justify-between px-6 py-3.5 bg-[#FAFBFF] border-t border-[#E8EEFF]">
                                    <div className="flex items-center gap-2 text-[12px] text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                        Member since {formatDate(user.createdAt)}
                                    </div>
                                    <span className={`text-[9.5px] font-bold tracking-[1px] uppercase px-2.5 py-1 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>{user.role}</span>
                                </div>
                            </div>

                            {/* Danger zone card */}
                            <div className="bg-white border-[1.5px] border-red-200 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-2.5 px-6 py-4 bg-red-50/60 border-b border-red-100">
                                    <div className="w-[34px] h-[34px] rounded-[10px] bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={16} className="text-red-600" strokeWidth={2} />
                                    </div>
                                    <p className="text-[14px] font-bold text-red-600">Danger Zone</p>
                                </div>
                                <div className="px-6 py-5">
                                    <p className="text-[13px] text-slate-500 leading-[1.65] mb-5">Permanently delete your account and all associated data. This action is{' '}<span className="font-semibold text-slate-700">irreversible</span> — once deleted, your account cannot be recovered.</p>
                                    <div className="flex items-center justify-between px-4 py-3.5 border-[1.5px] border-red-100 rounded-[12px] bg-red-50/40">
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#0F1C4D]">Delete Account</p>
                                            <p className="text-[11.5px] text-slate-400 mt-0.5">All your data will be permanently erased</p>
                                        </div>
                                        <button onClick={handleDelete} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-[12.5px] font-semibold rounded-[10px] transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 ml-4" style={{ fontFamily: 'DM Sans' }}>
                                            <Trash2 size={13} strokeWidth={2} /> Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>)}

                        {/* ══════ SECURITY ══════ */}
                        {activeNav === 'security' && (
                            <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 pt-5 pb-0">
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <div className="w-[34px] h-[34px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={16} className="text-blue-600" strokeWidth={2} />
                                        </div>
                                        <p className="text-[14px] font-bold text-[#0F1C4D]">Change Password</p>
                                    </div>
                                    <p className="text-[12px] text-slate-400 mt-1 mb-5">
                                        To change your password, first request a one-time code to your registered email.
                                    </p>
                                </div>
                                <div className="h-px bg-[#E8EEFF]" />

                                <div className="px-6 py-6 flex flex-col gap-5">
                                    {/* Success banner */}
                                    {secSuccess && (
                                        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-[12px]">
                                            <Check size={14} className="text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                                            <span className="text-[12.5px] font-semibold text-emerald-700">{secSuccess}</span>
                                        </div>
                                    )}

                                    {/* Step 1: Request OTP */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                                            <p className="text-[12.5px] font-bold text-[#0F1C4D]">Request OTP</p>
                                        </div>
                                        <p className="text-[11.5px] text-slate-400 mb-2">
                                            We'll send a 6-digit code to <span className="font-semibold text-slate-600">{user.email}</span>.
                                        </p>
                                        <button
                                            onClick={handleRequestOtp}
                                            disabled={otpSending || otpSent}
                                            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold shadow-sm shadow-blue-200 transition-all duration-150 disabled:opacity-55 disabled:cursor-not-allowed"
                                        >
                                            {otpSending ? (<><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>) : otpSent ? (<><Check size={13} strokeWidth={2.5} /> OTP Sent</>) : 'Send OTP to Email'}
                                        </button>
                                        {secErrors.otp && !otpSent && <span className="text-[10.5px] text-red-500 font-medium">{secErrors.otp}</span>}
                                    </div>

                                    <div className="h-px bg-[#E8EEFF]" />

                                    {/* Step 2: Enter OTP & new password */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${otpSent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</span>
                                            <p className={`text-[12.5px] font-bold ${otpSent ? 'text-[#0F1C4D]' : 'text-slate-400'}`}>Enter Code & New Password</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* OTP */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">One-Time Code</label>
                                                <input
                                                    type="text" maxLength={6} placeholder="e.g. 483920"
                                                    value={secForm.otp} disabled={!otpSent}
                                                    onChange={(e) => { setSecForm((f) => ({ ...f, otp: e.target.value.replace(/\D/g, '') })); if (secErrors.otp) setSecErrors((e2) => ({ ...e2, otp: '' })); }}
                                                    className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150 tracking-[.15em] font-bold ${!otpSent ? 'border-[#E8EEFF] bg-[#F8FAFF] text-slate-400 cursor-not-allowed' : secErrors.otp ? 'border-red-400 bg-red-50/30 text-[#0F1C4D] focus:ring-2 focus:ring-red-100' : 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100'}`}
                                                    style={{ fontFamily: 'DM Sans' }}
                                                />
                                                {secErrors.otp && <span className="text-[10.5px] text-red-500 font-medium">{secErrors.otp}</span>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* New Password */}
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                                                            value={secForm.newPassword} disabled={!otpSent}
                                                            onChange={(e) => { setSecForm((f) => ({ ...f, newPassword: e.target.value })); if (secErrors.newPassword) setSecErrors((e2) => ({ ...e2, newPassword: '' })); }}
                                                            className={`w-full px-3.5 pr-10 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150 ${!otpSent ? 'border-[#E8EEFF] bg-[#F8FAFF] text-slate-400 cursor-not-allowed' : secErrors.newPassword ? 'border-red-400 bg-red-50/30 text-[#0F1C4D] focus:ring-2 focus:ring-red-100' : 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100'}`}
                                                            style={{ fontFamily: 'DM Sans' }}
                                                        />
                                                        <button type="button" onClick={() => setShowNewPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors" tabIndex={-1}>
                                                            {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                                                        </button>
                                                    </div>
                                                    {secErrors.newPassword && <span className="text-[10.5px] text-red-500 font-medium">{secErrors.newPassword}</span>}
                                                </div>
                                                {/* Confirm Password */}
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Confirm Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showConfirmPass ? 'text' : 'password'} placeholder="Re-enter password"
                                                            value={secForm.confirmPassword} disabled={!otpSent}
                                                            onChange={(e) => { setSecForm((f) => ({ ...f, confirmPassword: e.target.value })); if (secErrors.confirmPassword) setSecErrors((e2) => ({ ...e2, confirmPassword: '' })); }}
                                                            className={`w-full px-3.5 pr-10 py-2.5 border-[1.5px] rounded-[10px] text-[13px] outline-none transition-all duration-150 ${!otpSent ? 'border-[#E8EEFF] bg-[#F8FAFF] text-slate-400 cursor-not-allowed' : secErrors.confirmPassword ? 'border-red-400 bg-red-50/30 text-[#0F1C4D] focus:ring-2 focus:ring-red-100' : 'border-blue-400 bg-white text-[#0F1C4D] focus:ring-2 focus:ring-blue-100'}`}
                                                            style={{ fontFamily: 'DM Sans' }}
                                                        />
                                                        <button type="button" onClick={() => setShowConfirmPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors" tabIndex={-1}>
                                                            {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                                                        </button>
                                                    </div>
                                                    {secErrors.confirmPassword && <span className="text-[10.5px] text-red-500 font-medium">{secErrors.confirmPassword}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleChangePassword} disabled={!otpSent || secSaving}
                                            className="self-start mt-2 flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold shadow-sm shadow-blue-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {secSaving ? (<><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Changing…</>) : (<><ShieldCheck size={13} strokeWidth={2.5} /> Change Password</>)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══════ NOTIFICATIONS ══════ */}
                        {activeNav === 'notifications' && (
                            <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 pt-5 pb-0">
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <div className="w-[34px] h-[34px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                                            <Bell size={16} className="text-blue-600" strokeWidth={2} />
                                        </div>
                                        <p className="text-[14px] font-bold text-[#0F1C4D]">Notification Preferences</p>
                                    </div>
                                    <p className="text-[12px] text-slate-400 mt-1 mb-5">
                                        Choose which notifications you'd like to receive. Changes are saved instantly.
                                    </p>
                                </div>
                                <div className="h-px bg-[#E8EEFF]" />

                                <div className="divide-y divide-[#E8EEFF]">
                                    {Object.entries(defaultNotifs).map(([key, cfg]) => {
                                        const IconComp = cfg.icon;
                                        const isOn = notifs[key] !== undefined ? notifs[key] : cfg.default;
                                        return (
                                            <div key={key} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFBFF] transition-colors duration-150">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-[36px] h-[36px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                                                        <IconComp size={15} className="text-blue-600" strokeWidth={1.8} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-[#0F1C4D]">{cfg.label}</p>
                                                        <p className="text-[11.5px] text-slate-400 mt-0.5">{cfg.desc}</p>
                                                    </div>
                                                </div>
                                                {/* Toggle switch */}
                                                <button
                                                    onClick={() => handleNotifToggle(key)}
                                                    className={`relative flex-shrink-0 w-10 h-[22px] rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 ${isOn ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                    aria-label={`Toggle ${cfg.label}`}
                                                >
                                                    <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isOn ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer note */}
                                <div className="px-6 py-3.5 bg-[#FAFBFF] border-t border-[#E8EEFF]">
                                    <p className="text-[11px] text-slate-400">
                                        Notification preferences are stored locally on this device.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileManagement;