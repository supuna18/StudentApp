import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, Hash, Key, User, Mail, ShieldCheck, MessageSquare, Phone, X, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const StudyGroupsPage = () => {
    const [ownedGroups, setOwnedGroups] = useState([]); 
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Field Errors State
    const [errors, setErrors] = useState({});

    const [createForm, setCreateForm] = useState({ GroupName: '', Description: '', Subject: '', PhoneNumber: '' });
    const [joinForm, setJoinForm] = useState({ phoneNumber: '', subject: '', joinCode: '' });

    const navigate = useNavigate();
    const API_URL = "http://localhost:5005/api/studygroups";
    const token = localStorage.getItem('token'); 

    // --- IDENTITY LOGIC ---
    let userEmail = "";
    let userName = "";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userName = decoded.unique_name || "Student";
            const identity = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email;
            userEmail = (identity && identity.includes('@')) ? identity : `${userName.toLowerCase()}@gmail.com`;
        } catch (e) { }
    }

    useEffect(() => { if (userEmail) fetchUserGroups(); }, [userEmail]);

    const fetchUserGroups = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/${userEmail}`, { headers: { Authorization: `Bearer ${token}` } });
            setOwnedGroups(res.data.filter(g => g.createdByEmail === userEmail));
            setJoinedGroups(res.data.filter(g => g.createdByEmail !== userEmail));
        } catch (err) { } finally { setLoading(false); }
    };

    // --- VALIDATION LOGIC ---
    const validateCreateForm = () => {
        let tempErrors = {};
        if (!createForm.GroupName.trim()) tempErrors.GroupName = "Name is required";
        if (!createForm.Subject.trim()) tempErrors.Subject = "Subject is required";
        
        // Description: Max 50 Characters
        if (!createForm.Description.trim()) tempErrors.Description = "Description is required";
        else if (createForm.Description.length > 50) tempErrors.Description = "Limit exceeded (Max 50 characters)";

        // Phone: Exact 10 digits
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(createForm.PhoneNumber)) tempErrors.PhoneNumber = "Enter a valid 10-digit number";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validateJoinForm = () => {
        let tempErrors = {};
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(joinForm.phoneNumber)) tempErrors.joinPhone = "10-digit phone required";
        if (!joinForm.subject.trim()) tempErrors.joinSubject = "Subject is required";
        if (joinForm.joinCode.length !== 6) tempErrors.joinCode = "6-digit OTP required";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!validateCreateForm()) return;

        try {
            const payload = { 
                GroupName: createForm.GroupName,
                Description: createForm.Description,
                Subject: createForm.Subject,
                PhoneNumber: createForm.PhoneNumber,
                CreatedByEmail: userEmail,
                Members: [ { Email: userEmail, Phone: createForm.PhoneNumber } ]
            };

            const res = await axios.post(`${API_URL}/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert(`SUCCESS! Group Created. OTP sent to: ${userEmail}`);
            setShowCreateModal(false);
            setCreateForm({ GroupName: '', Description: '', Subject: '', PhoneNumber: '' });
            fetchUserGroups();
        } catch (err) { alert("Error creating circle."); }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!validateJoinForm()) return;

        try {
            const res = await axios.post(`${API_URL}/join`, { 
                Email: userEmail, 
                JoinCode: joinForm.joinCode, 
                PhoneNumber: joinForm.phoneNumber,
                Subject: joinForm.subject 
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("Successfully Joined!");
            setShowJoinModal(false);
            fetchUserGroups();
            navigate(`/chat/${res.data.groupId}`);
        } catch (err) { alert("Invalid Access Code or Subject Mismatch!"); }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
            {/* SIDEBAR */}
            <div className="w-85 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-10">
                <div className="p-8 border-b border-slate-100 bg-indigo-50/30">
                    <h2 className="text-2xl font-black flex items-center gap-3"><Users className="text-indigo-600" /> My Circles</h2>
                    <div className="mt-4 p-3 bg-white rounded-2xl shadow-sm border border-indigo-100 truncate text-[10px] font-bold text-slate-400">
                        USER: {userEmail}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Managed by You</h3>
                        <div className="space-y-3">
                            {ownedGroups.map(g => (
                                <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)} className="group p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-400 cursor-pointer transition-all">
                                    <h4 className="font-black text-indigo-900 text-base">{g.groupName}</h4>
                                    <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-xl border border-indigo-100 w-fit">
                                        <Key size={12} className="text-indigo-600"/><span className="text-xs font-black text-indigo-700 tracking-widest">{g.joinCode}</span>
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
                                    <h4 className="font-bold text-slate-700 text-sm">{g.groupName}</h4>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold flex items-center gap-1"><Phone size={10}/> Admin: {g.phoneNumber}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[300px]">
                        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
                        <div className="absolute inset-0 bg-indigo-900/85 flex flex-col justify-center px-12 text-white font-sans uppercase italic">
                            <h1 className="text-5xl font-black tracking-tighter">Collaboration Hub</h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-800">
                        <button onClick={() => { setErrors({}); setShowCreateModal(true); }} className="p-10 bg-white rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all border-b-8 border-b-indigo-500 text-left">
                            <PlusCircle className="text-indigo-600 mb-6" size={40} /><h2 className="text-3xl font-black uppercase tracking-tight italic">Create Circle</h2>
                        </button>
                        <button onClick={() => { setErrors({}); setShowJoinModal(true); }} className="p-10 bg-white rounded-[3.5rem] shadow-xl border border-slate-50 hover:shadow-2xl transition-all border-b-8 border-b-emerald-500 text-left">
                            <LogIn className="text-emerald-600 mb-6" size={40} /><h2 className="text-3xl font-black uppercase tracking-tight italic">Join Peer</h2>
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE MODAL with Character Limit */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative text-slate-800">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={32} /></button>
                        <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Setup Circle</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <input type="text" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold ${errors.GroupName ? 'border-red-400' : 'border-slate-100 focus:border-indigo-500'}`} placeholder="Group Name" onChange={e => setCreateForm({...createForm, GroupName: e.target.value})} />
                                {errors.GroupName && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.GroupName}</p>}
                            </div>
                            <div>
                                <input type="text" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold ${errors.Subject ? 'border-red-400' : 'border-slate-100 focus:border-indigo-500'}`} placeholder="Subject Name" onChange={e => setCreateForm({...createForm, Subject: e.target.value})} />
                                {errors.Subject && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.Subject}</p>}
                            </div>
                            <div className="relative">
                                <textarea maxLength="50" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none h-24 font-medium resize-none ${errors.Description ? 'border-red-400' : 'border-slate-100 focus:border-indigo-500'}`} placeholder="Description (Max 50 chars)" onChange={e => setCreateForm({...createForm, Description: e.target.value})} />
                                <div className={`absolute bottom-3 right-4 text-[9px] font-black uppercase ${createForm.Description.length >= 50 ? 'text-red-500' : 'text-slate-300'}`}>{createForm.Description.length} / 50</div>
                                {errors.Description && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.Description}</p>}
                            </div>
                            <div>
                                <input type="tel" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold ${errors.PhoneNumber ? 'border-red-400' : 'border-slate-100 focus:border-indigo-500'}`} placeholder="Phone Number (10 digits)" onChange={e => setCreateForm({...createForm, PhoneNumber: e.target.value})} />
                                {errors.PhoneNumber && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.PhoneNumber}</p>}
                            </div>
                            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-lg uppercase mt-2">Start Hub</button>
                        </form>
                    </div>
                </div>
            )}

            {/* JOIN MODAL with 6-Digit Limit */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in zoom-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative text-slate-800 text-center">
                        <button onClick={() => setShowJoinModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={32} /></button>
                        <h2 className="text-3xl font-black mb-8 uppercase italic">Join Peer Circle</h2>
                        <form onSubmit={handleJoin} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="px-5 py-4 bg-slate-100 rounded-2xl text-slate-400 font-bold text-xs border border-slate-200 truncate">{userName}</div>
                                <div className="px-5 py-4 bg-slate-100 rounded-2xl text-slate-400 font-bold text-[9px] border border-slate-200 truncate font-sans lowercase">{userEmail}</div>
                            </div>
                            <div>
                                <input type="tel" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold ${errors.joinPhone ? 'border-red-400' : 'border-slate-100 focus:border-emerald-500'}`} placeholder="Your Phone Number" onChange={e => setJoinForm({...joinForm, phoneNumber: e.target.value})} />
                                {errors.joinPhone && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.joinPhone}</p>}
                            </div>
                            <div>
                                <input type="text" className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold ${errors.joinSubject ? 'border-red-400' : 'border-slate-100 focus:border-emerald-500'}`} placeholder="Subject Name (Must Match)" onChange={e => setJoinForm({...joinForm, subject: e.target.value})} />
                                {errors.joinSubject && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1">{errors.joinSubject}</p>}
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block text-center">Access Code (6 Digits)</label>
                                <input type="text" maxLength="6" className={`w-full px-5 py-6 bg-slate-50 border-4 rounded-[2.5rem] text-center text-5xl font-black tracking-[1.2rem] outline-none ${errors.joinCode ? 'border-red-400 text-red-500' : 'border-slate-100 focus:border-emerald-500 text-emerald-600'}`} placeholder="000000" onChange={e => setJoinForm({ ...joinForm, joinCode: e.target.value })} />
                                {errors.joinCode && <p className="text-red-500 text-[10px] font-bold text-center mt-2">{errors.joinCode}</p>}
                            </div>
                            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 uppercase shadow-xl mt-4">Join Circle</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyGroupsPage;