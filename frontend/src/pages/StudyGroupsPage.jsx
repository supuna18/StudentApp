import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, LogIn, Key, ShieldCheck, Users,
    Phone, X, Trash2, Pencil, ChevronRight,
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── helpers ────────────────────────────────────────────────── */
const API_URL = 'http://localhost:5005/api/studygroups';

const inputCls =
    'w-full px-4 py-2.5 border-[1.5px] border-[#E8EEFF] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-blue-500';

const labelCls = 'block text-[11.5px] font-bold text-[#0F1C4D] mb-1.5 tracking-[.2px]';

/* ─── modal wrapper ──────────────────────────────────────────── */
const Modal = ({ open, onClose, title, subtitle, accentColor = 'blue', children }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#060D1F]/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className={`bg-white w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl border-t-[3px] ${accentColor === 'green' ? 'border-emerald-500' : accentColor === 'amber' ? 'border-amber-500' : 'border-blue-600'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal header */}
                    <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-[#E8EEFF]">
                        <div>
                            <h2 className="serif-heading text-[20px] text-[#0F1C4D] italic leading-tight">{title}</h2>
                            <p className="text-[12px] text-slate-400 mt-1">{subtitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-all duration-150 flex-shrink-0 ml-4 mt-0.5"
                        >
                            <X size={15} strokeWidth={2} />
                        </button>
                    </div>
                    <div className="px-7 py-6">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ─── main component ─────────────────────────────────────────── */
const StudyGroupsPage = () => {
    const [ownedGroups, setOwnedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [createForm, setCreateForm] = useState({ GroupName: '', Description: '', PhoneNumber: '' });
    const [joinForm, setJoinForm] = useState({ phoneNumber: '', subject: '', joinCode: '' });
    const [editForm, setEditForm] = useState({ id: '', GroupName: '', Description: '', PhoneNumber: '' });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    let userEmail = '';
    let userName = '';
    if (token) {
    try {
        const decoded = jwtDecode(token);
        // Standardize: Email-ah lowecase-ku mathuroam
        const identity = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || decoded.unique_name;
        userEmail = identity.includes('@') ? identity.toLowerCase() : `${decoded.unique_name.toLowerCase()}@gmail.com`;
    } catch (e) { console.error('JWT Error'); }
}

    useEffect(() => { if (userEmail) fetchUserGroups(); }, [userEmail]);

    // 2. fetchUserGroups function-la singular-ah typo irukkannu paarunga
const fetchUserGroups = async () => {
    setLoading(true);
    try {
        // API_URL variable use pannunga, hardcode pannadeenga
        const res = await axios.get(`${API_URL}/user/${userEmail}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        setOwnedGroups(res.data.filter((g) => (g.createdByEmail || g.CreatedByEmail || "").toLowerCase() === userEmail));
        setJoinedGroups(res.data.filter((g) => (g.createdByEmail || g.CreatedByEmail || "").toLowerCase() !== userEmail));
    } catch (err) { console.error('API Error'); }
    finally { setLoading(false); }
};

// 3. handleCreate function
const handleCreate = async (e) => {
    e.preventDefault();
    try {
const payload = { 
    groupName: createForm.GroupName, 
    description: createForm.Description, 
    subject: createForm.GroupName, 
    phoneNumber: createForm.PhoneNumber, 
    createdByEmail: userEmail.toLowerCase() // Standardize here too
};
        const res = await axios.post(`${API_URL}/create`, payload, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        alert(`Circle created! Access Code: ${res.data.otp}`);
        setShowCreateModal(false); 
        fetchUserGroups();
    } catch (err) { 
        alert('Error creating circle.'); 
    }
};

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            const payload = { Email: userEmail, JoinCode: joinForm.joinCode, PhoneNumber: joinForm.phoneNumber, Subject: joinForm.subject };
            const res = await axios.post(`${API_URL}/join`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || 'Joined successfully!');
            setShowJoinModal(false); fetchUserGroups();
            navigate(`/chat/${res.data.groupId}`);
        } catch (err) { alert(err.response?.data?.message || 'Invalid code or subject mismatch!'); }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm('Terminate this circle? This cannot be undone.')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchUserGroups();
        } catch { alert('Delete failed.'); }
    };

    

    const handleLeaveGroup = async (groupId) => {
        if (!window.confirm('Leave this collaboration hub?')) return;
        try {
            await axios.post(`${API_URL}/leave`, { GroupId: groupId, Email: userEmail }, { headers: { Authorization: `Bearer ${token}` } });
            fetchUserGroups();
        } catch { alert('Failed to leave.'); }
    };

    const openEditModal = (group) => {
        setEditForm({ 
            id: group.id || group.Id, // MongoDB ID correctly map panrom
            GroupName: group.groupName || group.GroupName, 
            Description: group.description || group.Description, 
            PhoneNumber: group.phoneNumber || group.PhoneNumber 
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${editForm.id}`, { GroupName: editForm.GroupName, Description: editForm.Description, PhoneNumber: editForm.PhoneNumber }, { headers: { Authorization: `Bearer ${token}` } });
            setShowEditModal(false); fetchUserGroups();
        } catch { alert('Update failed.'); }
    };

    const filteredOwned = ownedGroups.filter((g) => (g.groupName || g.GroupName || '').toLowerCase().includes(search.toLowerCase()));
    const filteredJoined = joinedGroups.filter((g) => (g.groupName || g.GroupName || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            {/* Font import */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .sg-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: #E8EEFF; border-radius: 10px; }
        .main-scroll::-webkit-scrollbar { width: 4px; }
        .main-scroll::-webkit-scrollbar-thumb { background: #E8EEFF; border-radius: 10px; }
      `}</style>

            <div className="sg-root flex h-screen bg-[#F0F4FF] overflow-hidden text-[#0F1C4D]">

                {/* ════════════ SIDEBAR ════════════ */}
                <aside className="w-[260px] bg-white border-r border-[#E8EEFF] flex flex-col flex-shrink-0 z-30">

                    {/* Brand + search */}
                    <div className="px-5 pt-5 pb-4 border-b border-[#E8EEFF]">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-[32px] h-[32px] bg-blue-600 rounded-[9px] flex items-center justify-center shadow-[0_4px_10px_rgba(34,85,210,0.25)] flex-shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div>
                                <p className="serif-heading text-[17px] text-[#0F1C4D] italic leading-none">Study Hub</p>
                                <p className="text-[9.5px] font-bold tracking-[1.8px] uppercase text-blue-600 mt-0.5">Collaboration Circles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F4FF] border border-[#E8EEFF] rounded-[10px]">
                            <Search size={12} className="text-slate-400 flex-shrink-0" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search groups…"
                                className="border-none bg-transparent outline-none text-[12px] text-[#0F1C4D] w-full placeholder:text-slate-400"
                                style={{ fontFamily: 'DM Sans' }}
                            />
                        </div>
                    </div>

                    {/* Nav body */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 sb-scroll">

                        {/* Owned */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between px-2 mb-2.5">
                                <span className="flex items-center gap-1.5 text-[9.5px] font-bold tracking-[1.8px] uppercase text-slate-400">
                                    <ShieldCheck size={11} strokeWidth={2.5} /> Managed by you
                                </span>
                                <span className="bg-[#EEF2FF] text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{ownedGroups.length}</span>
                            </div>

                            {loading ? (
                                <div className="text-[12px] text-slate-400 px-2">Loading…</div>
                            ) : filteredOwned.length === 0 ? (
                                <div className="text-[12px] text-slate-400 px-2 italic">No circles yet</div>
                            ) : filteredOwned.map((g, i) => (
                                <motion.div
                                    key={g.id}
                                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    onClick={() => navigate(`/chat/${g.id}`)}
                                    className="group relative bg-blue-600 text-white rounded-[14px] px-4 py-3.5 mb-2.5 cursor-pointer overflow-hidden hover:-translate-y-0.5 transition-all duration-200 shadow-[0_6px_18px_rgba(34,85,210,0.22)]"
                                >
                                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />
                                    <p className="text-[13px] font-bold leading-tight mb-2.5 relative">{g.groupName || g.GroupName}</p>
                                    <div className="flex items-center justify-between relative">
                                        <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-[8px] px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] uppercase">
                                            <Key size={9} />{g.joinCode || g.JoinCode}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(g); }} className="w-[26px] h-[26px] rounded-[7px] bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all">
                                                <Pencil size={11} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }} className="w-[26px] h-[26px] rounded-[7px] bg-red-400/30 hover:bg-red-400/50 flex items-center justify-center transition-all">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Joined */}
                        <div>
                            <div className="flex items-center justify-between px-2 mb-2.5">
                                <span className="flex items-center gap-1.5 text-[9.5px] font-bold tracking-[1.8px] uppercase text-slate-400" style={{ color: '#059669' }}>
                                    <Users size={11} strokeWidth={2.5} /> Joined peers
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{joinedGroups.length}</span>
                            </div>

                            {filteredJoined.length === 0 && !loading && (
                                <div className="text-[12px] text-slate-400 px-2 italic">No joined groups yet</div>
                            )}
                            {filteredJoined.map((g, i) => (
                                <motion.div
                                    key={g.id}
                                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                                    onClick={() => navigate(`/chat/${g.id}`)}
                                    className="group bg-white border border-[#E8EEFF] rounded-[14px] px-4 py-3.5 mb-2.5 cursor-pointer hover:border-emerald-300 hover:shadow-[0_4px_14px_rgba(5,150,105,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between"
                                >
                                    <div className="truncate pr-2">
                                        <p className="text-[13px] font-semibold text-[#0F1C4D] leading-tight mb-1">{g.groupName || g.GroupName}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                            <Phone size={9} className="text-emerald-500" />
                                            {g.phoneNumber || g.PhoneNumber || 'Unverified'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}
                                        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ════════════ MAIN ════════════ */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Topbar */}
                    <div className="bg-white border-b border-[#E8EEFF] px-7 py-3.5 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h1 className="serif-heading text-[20px] text-[#0F1C4D] italic leading-tight">Study Groups</h1>
                            <p className="text-[12px] text-slate-400 mt-0.5">Collaborate with peers and grow together</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[12.5px] font-semibold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150"
                            >
                                <LogIn size={13} /> Join a Circle
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold rounded-[10px] shadow-[0_4px_14px_rgba(34,85,210,0.25)] hover:shadow-[0_6px_20px_rgba(34,85,210,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <Plus size={13} strokeWidth={2.5} /> Create Circle
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-7 main-scroll">
                        <div className="max-w-3xl mx-auto space-y-5">

                            {/* Hero banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                                className="relative rounded-[20px] bg-[#060D1F] px-10 py-9 overflow-hidden"
                            >
                                {/* Orbs */}
                                <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-blue-600/20 blur-[80px] pointer-events-none" />
                                <div className="absolute bottom-[-40px] left-[40%] w-[200px] h-[200px] rounded-full bg-blue-400/10 blur-[60px] pointer-events-none" />
                                {/* Grid */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase text-blue-300 mb-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px #60A5FA' }} />
                                        Academic Excellence
                                    </div>
                                    <h2 className="serif-heading text-[clamp(26px,3.5vw,40px)] text-white italic leading-[1.05] mb-3">
                                        Collaborate,<br /><em className="text-blue-400">Excel</em>, Repeat.
                                    </h2>
                                    <p className="text-[13px] text-blue-200/60 max-w-[380px] leading-[1.65]">
                                        Join thousands of students already achieving their goals through peer-driven study circles on EduSync.
                                    </p>
                                    <div className="flex items-center gap-0 mt-6 pt-5 border-t border-white/[0.07]">
                                        {[{ val: '50', suf: 'K+', lbl: 'Students' }, { val: '2.4', suf: 'K', lbl: 'Active Circles' }, { val: '98', suf: '%', lbl: 'Satisfaction' }].map((s, i) => (
                                            <div key={i} className={`flex-shrink-0 ${i > 0 ? 'border-l border-white/[0.08] ml-7 pl-7' : ''}`}>
                                                <div className="text-[20px] font-extrabold text-white tracking-tight leading-none">
                                                    {s.val}<span className="text-blue-400">{s.suf}</span>
                                                </div>
                                                <div className="text-[9.5px] font-bold tracking-[1.5px] uppercase text-slate-500 mt-1">{s.lbl}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Action cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    {
                                        onClick: () => setShowJoinModal(true),
                                        topBar: 'from-emerald-400',
                                        iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
                                        hoverBorder: 'hover:border-emerald-200', hoverShadow: 'hover:shadow-emerald-50',
                                        arrowColor: 'text-emerald-600',
                                        icon: <LogIn size={20} strokeWidth={2} />,
                                        title: 'Join a Circle',
                                        desc: 'Enter via a unique 6-digit access code shared by your group admin.',
                                        cta: 'Enter with code',
                                    },
                                    {
                                        onClick: () => setShowCreateModal(true),
                                        topBar: 'from-blue-500',
                                        iconBg: 'bg-[#EEF2FF]', iconColor: 'text-blue-600',
                                        hoverBorder: 'hover:border-blue-200', hoverShadow: 'hover:shadow-blue-50',
                                        arrowColor: 'text-blue-600',
                                        icon: <Plus size={20} strokeWidth={2} />,
                                        title: 'Start a Hub',
                                        desc: 'Create your own study circle, invite peers, and manage your group.',
                                        cta: 'Create & manage',
                                    },
                                ].map((card, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        onClick={card.onClick}
                                        className={`group relative bg-white border border-[#E8EEFF] ${card.hoverBorder} rounded-[18px] p-6 cursor-pointer hover:shadow-xl ${card.hoverShadow} transition-all duration-300 overflow-hidden`}
                                    >
                                        <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] bg-gradient-to-r ${card.topBar} to-transparent`} />
                                        <div className={`w-[46px] h-[46px] rounded-[13px] ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            {card.icon}
                                        </div>
                                        <h3 className="serif-heading text-[19px] text-[#0F1C4D] italic mb-1.5">{card.title}</h3>
                                        <p className="text-[12.5px] text-slate-500 leading-[1.6]">{card.desc}</p>
                                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${card.arrowColor} mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}>
                                            {card.cta}
                                            <ChevronRight size={13} strokeWidth={2.5} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {/* ════════════ CREATE MODAL ════════════ */}
                <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create a Circle" subtitle="Set up your private collaborative study environment" accentColor="blue">
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Group Name</label>
                            <input type="text" required placeholder="e.g. Computer Science Geniuses" className={inputCls} style={{ fontFamily: 'DM Sans' }} onChange={(e) => setCreateForm({ ...createForm, GroupName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Description <span className="text-slate-400 font-normal">(max 50 chars)</span></label>
                            <textarea required maxLength={50} placeholder="What are we studying?" className={`${inputCls} h-[88px] resize-none`} style={{ fontFamily: 'DM Sans' }} onChange={(e) => setCreateForm({ ...createForm, Description: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Number</label>
                            <input type="tel" required placeholder="10-digit phone number" className={inputCls} style={{ fontFamily: 'DM Sans' }} value={createForm.PhoneNumber} onChange={(e) => setCreateForm({ ...createForm, PhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                        <button type="submit" className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[13.5px] font-semibold rounded-full shadow-[0_6px_20px_rgba(34,85,210,0.3)] transition-all duration-200 hover:-translate-y-0.5" style={{ fontFamily: 'DM Sans' }}>
                            Create Discussion Hub →
                        </button>
                    </form>
                </Modal>

                {/* ════════════ JOIN MODAL ════════════ */}
                <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join a Circle" subtitle="Enter a valid access code to join a peer study group" accentColor="green">
                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Your Phone Number</label>
                            <input type="tel" required placeholder="10-digit phone number" className={inputCls} style={{ fontFamily: 'DM Sans' }} value={joinForm.phoneNumber} onChange={(e) => setJoinForm({ ...joinForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                        <div>
                            <label className={labelCls}>Subject</label>
                            <input type="text" required placeholder="Exact subject match (e.g. Maths)" className={inputCls} style={{ fontFamily: 'DM Sans' }} onChange={(e) => setJoinForm({ ...joinForm, subject: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Access Code</label>
                            <input
                                type="text" maxLength={6} required placeholder="000000"
                                className="w-full px-4 py-4 border-[1.5px] border-[#E8EEFF] rounded-[10px] text-[28px] font-extrabold tracking-[0.4em] text-emerald-600 text-center bg-emerald-50/50 outline-none transition-colors duration-150 placeholder:text-slate-300 focus:border-emerald-500"
                                style={{ fontFamily: 'DM Sans' }}
                                onChange={(e) => setJoinForm({ ...joinForm, joinCode: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[13.5px] font-semibold rounded-full shadow-[0_6px_20px_rgba(5,150,105,0.25)] transition-all duration-200 hover:-translate-y-0.5" style={{ fontFamily: 'DM Sans' }}>
                            Join Session →
                        </button>
                    </form>
                </Modal>

                {/* ════════════ EDIT MODAL. ════════════ */}
                <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Circle" subtitle="Update your study circle details" accentColor="amber">
                    <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Group Name</label>
                            <input type="text" required className={inputCls} style={{ fontFamily: 'DM Sans' }} value={editForm.GroupName} onChange={(e) => setEditForm({ ...editForm, GroupName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Description <span className="text-slate-400 font-normal">(max 50 chars)</span></label>
                            <textarea required maxLength={50} className={`${inputCls} h-[88px] resize-none`} style={{ fontFamily: 'DM Sans' }} value={editForm.Description} onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Number</label>
                            <input type="tel" required className={inputCls} style={{ fontFamily: 'DM Sans' }} value={editForm.PhoneNumber} onChange={(e) => setEditForm({ ...editForm, PhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                        <button type="submit" className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-[13.5px] font-semibold rounded-full shadow-[0_6px_20px_rgba(245,158,11,0.25)] transition-all duration-200 hover:-translate-y-0.5" style={{ fontFamily: 'DM Sans' }}>
                            Save Changes →
                        </button>
                    </form>
                </Modal>

            </div>
        </>
    );
};

export default StudyGroupsPage;