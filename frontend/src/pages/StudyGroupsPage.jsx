import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, Hash, Key, User, Mail, ShieldCheck, MessageSquare, Phone, X, ArrowRight, BookOpen, Book, Calendar, Trash2, Pencil } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const StudyGroupsPage = () => {
    const [ownedGroups, setOwnedGroups] = useState([]); 
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [createForm, setCreateForm] = useState({ GroupName: '', Description: '', PhoneNumber: '' });
    const [joinForm, setJoinForm] = useState({ phoneNumber: '', subject: '', batch: '', joinCode: '' });
    const [editForm, setEditForm] = useState({ id: '', GroupName: '', Description: '', PhoneNumber: '' });

    const navigate = useNavigate();
    const API_URL = "http://localhost:5005/api/studygroups"; 
    const token = localStorage.getItem('token'); 

    let userEmail = "";
    let userName = "";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userName = decoded.unique_name || "Student";
            const identity = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email;
            userEmail = (identity && identity.includes('@')) ? identity : `${userName.toLowerCase()}@gmail.com`;
        } catch (e) { console.error("JWT Error"); }
    }

    useEffect(() => { if (userEmail) fetchUserGroups(); }, [userEmail]);

    const fetchUserGroups = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/${userEmail}`, { headers: { Authorization: `Bearer ${token}` } });
            setOwnedGroups(res.data.filter(g => g.createdByEmail === userEmail));
            setJoinedGroups(res.data.filter(g => g.createdByEmail !== userEmail));
        } catch (err) { console.error("API Connection Failed"); } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                GroupName: createForm.GroupName,
                Description: createForm.Description,
                Subject: createForm.GroupName, 
                PhoneNumber: createForm.PhoneNumber,
                CreatedByEmail: userEmail,
                JoinCode: "", 
                Members: [] 
            };
            const res = await axios.post(`${API_URL}/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert(`SUCCESS! Access Code: ${res.data.otp}`);
            setShowCreateModal(false); fetchUserGroups();
        } catch (err) { alert("Error creating circle."); }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/join`, { 
                Email: userEmail, 
                JoinCode: joinForm.joinCode, 
                PhoneNumber: joinForm.phoneNumber, 
                Subject: joinForm.subject 
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Joined Successfully!");
            setShowJoinModal(false); fetchUserGroups();
            navigate(`/chat/${res.data.groupId}`);
        } catch (err) { alert("Invalid Code or Subject Mismatch!"); }
    };

    // --- NEW: DELETE GROUP (Admin) ---
    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchUserGroups();
        } catch (err) { alert("Failed to delete group."); }
    };

    // --- NEW: LEAVE GROUP (Member) ---
    const handleLeaveGroup = async (groupId) => {
        if (!window.confirm("Do you want to leave this hub?")) return;
        try {
            await axios.post(`${API_URL}/leave`, { GroupId: groupId, Email: userEmail }, { headers: { Authorization: `Bearer ${token}` } });
            fetchUserGroups();
        } catch (err) { alert("Failed to leave hub."); }
    };

    // --- NEW: EDIT GROUP ---
    const openEditModal = (group) => {
        setEditForm({ id: group.id, GroupName: group.groupName, Description: group.description, PhoneNumber: group.phoneNumber });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${editForm.id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
            setShowEditModal(false);
            fetchUserGroups();
        } catch (err) { alert("Update failed."); }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800 tracking-tight">
            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shadow-2xl z-10 shrink-0">
                <div className="p-8 border-b border-slate-100 bg-indigo-50/30">
                    <h2 className="text-2xl font-black flex items-center gap-3"><Users className="text-indigo-600" /> My Circles</h2>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase truncate">{userEmail}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scroll">
                    <div>
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Managed by You</h3>
                        <div className="space-y-3">
                            {ownedGroups.map(g => (
                                <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)} className="group p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-400 cursor-pointer transition-all relative">
                                    <h4 className="font-black text-indigo-900 text-base">{g.groupName}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{g.members?.length || 0} Students Joined</p>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-indigo-100 w-fit">
                                            <Key size={12} className="text-indigo-600"/><span className="text-xs font-black text-indigo-700 tracking-widest">{g.joinCode}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(g); }} className="p-2 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors"><Pencil size={16}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2"><MessageSquare size={14}/> Joined Hubs</h3>
                        <div className="space-y-3 pb-10">
                            {joinedGroups.map(g => (
                                <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)} className="group p-5 rounded-3xl bg-white border border-slate-100 hover:border-emerald-400 cursor-pointer transition-all shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-700 text-sm">{g.groupName}</h4>
                                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold flex items-center gap-1"><Phone size={10}/> Admin: {g.phoneNumber}</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }} className="p-2 hover:bg-red-50 rounded-full text-red-400 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="flex-1 p-10 overflow-y-auto bg-slate-50/20 text-center lg:text-left">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[300px]">
                        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
                        <div className="absolute inset-0 bg-indigo-900/90 flex flex-col justify-center px-12 text-white italic uppercase font-black tracking-tighter">
                            <h1 className="text-5xl">Collaboration Hub</h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                        <button onClick={() => setShowCreateModal(true)} className="p-10 bg-white rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all border-b-8 border-b-indigo-500 text-left flex flex-col">
                            <PlusCircle className="text-indigo-600 mb-6" size={40} /><h2 className="text-3xl font-black uppercase italic">Create Circle</h2>
                        </button>
                        <button onClick={() => setShowJoinModal(true)} className="p-10 bg-white rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all border-b-8 border-b-emerald-500 text-left flex flex-col">
                            <LogIn className="text-emerald-600 mb-6" size={40} /><h2 className="text-3xl font-black uppercase italic">Join Peer</h2>
                        </button>
                    </div>
                </div>
            </main>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={32} /></button>
                        <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Circle Setup</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Group Name" onChange={e => setCreateForm({...createForm, GroupName: e.target.value})} />
                            <textarea required maxLength="50" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24 font-medium" placeholder="Description (max 50 chars)" onChange={e => setCreateForm({...createForm, Description: e.target.value})} />
                            <input type="tel" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Contact Number" value={createForm.PhoneNumber} onChange={e => setCreateForm({...createForm, PhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-lg uppercase">Start Hub</button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={32} /></button>
                        <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Update Circle</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editForm.GroupName} onChange={e => setEditForm({...editForm, GroupName: e.target.value})} />
                            <textarea required maxLength="50" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24 font-medium" value={editForm.Description} onChange={e => setEditForm({...editForm, Description: e.target.value})} />
                            <input type="tel" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editForm.PhoneNumber} onChange={e => setEditForm({...editForm, PhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                            <button type="submit" className="w-full py-6 bg-indigo-500 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-600 uppercase">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN MODAL */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative">
                        <button onClick={() => setShowJoinModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={32} /></button>
                        <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Join Circle</h2>
                        <form onSubmit={handleJoin} className="space-y-4 text-slate-800">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="px-5 py-4 bg-slate-100 rounded-2xl text-slate-400 font-bold text-xs border border-slate-200 truncate">{userName}</div>
                                <div className="px-5 py-4 bg-slate-100 rounded-2xl text-slate-400 font-bold text-[9px] border border-slate-200 truncate lowercase">{userEmail}</div>
                            </div>
                            <input type="tel" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Your Phone Number" value={joinForm.phoneNumber} onChange={e => setJoinForm({...joinForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                            <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Subject Name (Must Match)" onChange={e => setJoinForm({...joinForm, subject: e.target.value})} />
                            <div className="pt-4 text-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Access Code</label>
                                <input type="text" maxLength="6" required className="w-full px-5 py-6 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] text-center text-5xl font-black tracking-[1.2rem] focus:border-emerald-500 text-emerald-600 outline-none" placeholder="000000" onChange={e => setJoinForm({ ...joinForm, joinCode: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 uppercase">Enter discussion circle</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyGroupsPage;