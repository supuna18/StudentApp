import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, ShieldCheck, Users, Phone, Lock, Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import * as signalR from '@microsoft/signalr';

const ChatPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);
    const chatEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const API_URL = "http://localhost:5005/api/studygroups";

    // --- IDENTITY LOGIC ---
    let userEmail = "";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const identity = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.unique_name;
            userEmail = (identity && !identity.includes('@')) ? `${identity.toLowerCase()}@gmail.com` : identity;
        } catch (e) { }
    }

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        const initChat = async () => {
            try {
                // Fetch Details & Old History
                const [gRes, hRes] = await Promise.all([
                    axios.get(`${API_URL}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/chat/history/${groupId}`)
                ]);
                setGroup(gRes.data);
                setMessages(hRes.data.map(m => ({ user: m.senderEmail, message: m.message, time: new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) })));
                setLoading(false);
                setTimeout(scrollToBottom, 500);
            } catch (err) { setLoading(false); }
        };

        const newConnection = new signalR.HubConnectionBuilder().withUrl("http://localhost:5005/chatHub").withAutomaticReconnect().build();
        setConnection(newConnection);
        initChat();
    }, [groupId]);

    useEffect(() => {
        if (connection) {
            connection.start().then(() => {
                connection.invoke("JoinGroup", groupId);
                connection.on("ReceiveMessage", (user, message, time) => {
                    setMessages(prev => [...prev, { user, message, time: new Date(time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
                    scrollToBottom();
                });
            });
        }
    }, [connection]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (connection && newMessage.trim()) {
            await connection.invoke("SendMessage", groupId, userEmail, newMessage);
            setNewMessage("");
        }
    };

    const isOwner = userEmail?.toLowerCase() === group?.createdByEmail?.toLowerCase();

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading Hub...</div>;

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
            <div className="flex-1 flex flex-col bg-white shadow-xl">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4 shadow-sm z-10 bg-white">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ArrowLeft size={20}/></button>
                    <div><h2 className="text-xl font-black uppercase">{group?.groupName}</h2><p className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1"><ShieldCheck size={12}/> Secure Study Room</p></div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50/40 custom-scroll">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex flex-col ${m.user === userEmail ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-black text-slate-400 mb-1 px-2 uppercase">{m.user}</span>
                            <div className={`max-w-md p-4 rounded-2xl shadow-sm text-sm font-medium ${m.user === userEmail ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                {m.message}
                                <p className={`text-[8px] mt-1 text-right opacity-50 ${m.user === userEmail ? 'text-white' : 'text-slate-400'}`}>{m.time}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-slate-100 bg-white">
                    <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-4">
                        <input className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Type message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700"><Send size={24}/></button>
                    </form>
                </div>
            </div>

            <div className="w-85 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-indigo-50/20"><h3 className="text-sm font-black uppercase text-indigo-900 tracking-widest leading-none flex items-center gap-2"><Users size={18}/> Hub Members</h3></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isOwner ? group?.members?.map((m, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm">{(m.email || m.Email)?.charAt(0)}</div>
                            <div className="truncate"><p className="text-[10px] font-black text-slate-800 italic uppercase">Student {i+1}</p><p className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1 font-mono tracking-wider"><Phone size={10}/> {m.phone || m.Phone}</p></div>
                        </div>
                    )) : (
                        <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center"><Lock className="text-slate-200 mx-auto mb-2" size={32}/><p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">Member Privacy On.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;