import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Trash2, Key, CheckCircle, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileManagement = () => {
    const [profile, setProfile] = useState({ username: '', email: '', role: '', createdAt: '' });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5005/api/users/profile';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setFormData({ username: data.username, email: data.email });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setProfile({ ...profile, ...formData });
                setEditMode(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.')) return;

        try {
            const res = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } catch (err) {
            console.error('Error deleting account:', err);
        }
    };

    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/request-password-otp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                setOtpSent(true);
                setMessage({ type: 'success', text: 'OTP sent to your email!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to request OTP.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/verify-password-otp`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: passwordData.otp, newPassword: passwordData.newPassword })
            });

            if (res.ok) {
                setShowPasswordModal(false);
                setOtpSent(false);
                setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
                setMessage({ type: 'success', text: 'Password changed successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Invalid OTP or expired.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="serif-heading text-3xl text-[#0F1C4D]">Profile Settings</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage your account information and security</p>
                </div>
                {!editMode && (
                    <button 
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        <Edit2 size={14} /> Edit Profile
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                    <span className="text-[13px] font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E8EEFF] rounded-[24px] p-8 shadow-sm">
                        {editMode ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input 
                                            type="text" value={formData.username} 
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-[#0F1C4D]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input 
                                            type="email" value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-[#0F1C4D]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" onClick={() => setEditMode(false)}
                                        className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-[13px]"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" disabled={loading}
                                        className="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-[13px] disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="serif-heading text-2xl text-[#0F1C4D]">{profile.username}</h3>
                                        <p className="text-slate-400 font-medium text-sm">{profile.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</p>
                                        <div className="flex items-center gap-2.5 text-[#0F1C4D] font-bold">
                                            <Mail size={16} className="text-blue-500" />
                                            {profile.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role</p>
                                        <div className="flex items-center gap-2.5 text-[#0F1C4D] font-bold">
                                            <Shield size={16} className="text-emerald-500" />
                                            {profile.role}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Member Since</p>
                                        <div className="flex items-center gap-2.5 text-[#0F1C4D] font-bold">
                                            <Calendar size={16} className="text-amber-500" />
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 border border-red-100 rounded-[24px] p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[15px] font-bold text-red-900">Danger Zone</h4>
                                <p className="text-red-700/60 text-[13px] mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="mt-4 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-[12px] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white border border-[#E8EEFF] rounded-[24px] p-6 shadow-sm">
                        <h4 className="text-[14px] font-bold text-[#0F1C4D] mb-4">Security</h4>
                        <p className="text-[12px] text-slate-400 mb-6 leading-relaxed">Keep your account secure by regularly updating your password.</p>
                        <button 
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[12.5px] hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            <Key size={14} /> Change Password
                        </button>
                    </div>

                    <div className="bg-[#0F1C4D] rounded-[24px] p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <h4 className="text-[14px] font-bold mb-2">Need Help?</h4>
                        <p className="text-white/60 text-[12px] leading-relaxed mb-4">Contact our support team if you have issues managing your profile.</p>
                        <button className="text-[12px] font-bold text-blue-400 hover:text-blue-300">Contact Support →</button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-[#0F1C4D]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="serif-heading text-xl text-[#0F1C4D]">Change Password</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Step {otpSent ? '2: Verify & Change' : '1: Verification'}</p>
                            </div>
                            <button onClick={() => { setShowPasswordModal(false); setOtpSent(false); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-8">
                            {!otpSent ? (
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                                        <Shield size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[#0F1C4D] font-bold text-[15px]">Verify your identity</p>
                                        <p className="text-slate-400 text-[13px] mt-1">We'll send an OTP to <b>{profile.email}</b> to ensure it's really you.</p>
                                    </div>
                                    <button 
                                        onClick={handleRequestOtp} disabled={loading}
                                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all"
                                    >
                                        {loading ? 'Sending OTP...' : 'Send Verification Code'}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Enter OTP Code</label>
                                        <input 
                                            type="text" maxLength="6" value={passwordData.otp} 
                                            onChange={(e) => setPasswordData({...passwordData, otp: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-extrabold tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="000000" required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                        <input 
                                            type="password" value={passwordData.newPassword} 
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input 
                                            type="password" value={passwordData.confirmPassword} 
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" disabled={loading}
                                        className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100 transition-all mt-4"
                                    >
                                        {loading ? 'Changing...' : 'Update Password'}
                                    </button>
                                    <p className="text-center text-[12px] text-slate-400 mt-2">
                                        Didn't get the code? <button type="button" onClick={handleRequestOtp} className="text-blue-600 font-bold hover:underline">Resend</button>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileManagement;