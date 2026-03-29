import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Users, ShieldCheck, Phone, Lock, Loader2, Paperclip, FileText, Download, X, Image as ImageIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import * as signalR from '@microsoft/signalr';

const ChatPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // Attachment state
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);
    const [status, setStatus] = useState("Connecting..."); // Added status tracking
    const chatEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const API_URL = "http://localhost:5005/api/studygroups";

    // --- SMART IDENTITY FINDER ---
    let userEmail = "";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const identity = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.unique_name;
            userEmail = (identity && !identity.includes('@')) ? `${identity.toLowerCase()}@gmail.com` : identity;
        } catch (e) { }
    }
    if (!userEmail) userEmail = "Anonymous_User"; // Safe fallback

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    // --- FILE HANDLING LOGIC ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("File too large! (Max 2MB allowed)");
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile({ data: reader.result, name: file.name, type: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                // Fetch Group Details & History simultaneously
                const [gRes, hRes] = await Promise.all([
                    axios.get(`${API_URL}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/chat/history/${groupId}`)
                ]);
                setGroup(gRes.data);
                
                // Load historical messages from DB
                setMessages(hRes.data.map(m => ({ 
                    user: m.senderEmail, 
                    message: m.message, 
                    time: new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                    fileData: m.fileData,
                    fileName: m.fileName,
                    fileType: m.fileType
                })));
                
                setLoading(false);
                setTimeout(scrollToBottom, 500);
            } catch (err) { console.error("Connection failed"); setLoading(false); }
        };

        // SignalR Setup
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5005/chatHub")
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
        initChat();
    }, [groupId]);

    useEffect(() => {
        if (connection) {
            connection.start().then(() => {
                setStatus("Connected"); // Live status
                connection.invoke("JoinGroup", groupId);
                
                // Real-time message listener
                connection.on("ReceiveMessage", (user, message, time, fileData, fileName, fileType) => {
                    setMessages(prev => [...prev, { 
                        user, message, 
                        time: new Date(time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                        fileData, fileName, fileType
                    }]);
                    scrollToBottom();
                });
            }).catch(e => {
                setStatus("Connection Failed");
                console.error("SignalR Connection Error:", e);
            });

            connection.onreconnecting(() => setStatus("Reconnecting..."));
            connection.onreconnected(() => setStatus("Connected"));
            connection.onclose(() => setStatus("Disconnected"));
        }
    }, [connection, groupId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        
        // Guard for connection and required IDs
        if (connection && groupId && (newMessage.trim() || selectedFile)) {
            try {
                console.log(`Sending message to group: ${groupId} as ${userEmail}`); // Added trace logging
                
                // Invoke backend SendMessage with all attachment fields
                await connection.invoke("SendMessage", groupId, userEmail, newMessage, 
                    selectedFile?.data || null, selectedFile?.name || null, selectedFile?.type || null);
                
                setNewMessage("");
                setSelectedFile(null);
            } catch (err) { 
                console.error("SendMessage Invocation Error:", err); 
                setStatus("Send Failed");
            }
        } else if (!groupId) {
            console.error("Critical Error: GroupId is missing!");
        }
    };

    const isOwner = userEmail?.toLowerCase() === group?.createdByEmail?.toLowerCase();

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse bg-white">Entering Circle...</div>;

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden text-slate-800 tracking-tight">
            {/* CHAT AREA (LEFT) */}
            <div className="flex-1 flex flex-col bg-white shadow-xl">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4 shadow-sm z-10 bg-white">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ArrowLeft size={20}/></button>
                    <div>
                        <h2 className="text-xl font-black uppercase">{group?.groupName}</h2>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1 tracking-widest"><ShieldCheck size={12}/> Academic Discussion Hub</p>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                                ● {status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/40 custom-scroll">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex flex-col ${m.user === userEmail ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-black text-slate-400 mb-1 px-2 uppercase">{m.user}</span>
                            <div className={`max-w-md p-4 rounded-3xl shadow-sm text-sm font-medium ${m.user === userEmail ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                
                                {/* ATTACHMENT RENDERING LOGIC */}
                                {m.fileData && (
                                    <div className="mb-3">
                                        {m.fileType?.startsWith('image/') ? (
                                            <img src={m.fileData} className="rounded-2xl max-w-full border border-white/20 shadow-sm" alt="img" />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-black/5 rounded-2xl">
                                                <FileText size={24} className={m.user === userEmail ? 'text-white' : 'text-indigo-600'} />
                                                <div className="flex-1 truncate"><p className="text-[10px] font-bold truncate uppercase">{m.fileName}</p></div>
                                                <a href={m.fileData} download={m.fileName} className="p-2 bg-white/20 rounded-xl hover:bg-white/40 transition-all"><Download size={16}/></a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {m.message && <p className="leading-relaxed">{m.message}</p>}
                                <p className={`text-[8px] mt-1 text-right opacity-50 ${m.user === userEmail ? 'text-white' : 'text-slate-400'}`}>{m.time}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* ATTACHMENT PREVIEW & INPUT */}
                <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3">
                    {selectedFile && (
                        <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-2xl border border-indigo-100 animate-in slide-in-from-bottom-2">
                            <ImageIcon size={18} className="text-indigo-600"/>
                            <span className="flex-1 text-xs font-black text-indigo-700 truncate uppercase">{selectedFile.name}</span>
                            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
                        </div>
                    )}
                    <form onSubmit={sendMessage} className="max-w-4xl w-full mx-auto flex gap-4">
                        <label className="p-4 bg-slate-50 text-slate-400 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-inner">
                            <Paperclip size={24}/>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Message or attach notes..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"><Send size={24}/></button>
                    </form>
                </div>
            </div>

            {/* PRIVACY SIDEBAR (RIGHT) */}
            <div className="w-85 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-indigo-50/20">
                    <h3 className="text-sm font-black uppercase text-indigo-900 tracking-widest flex items-center gap-2"><Users size={18}/> Members</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isOwner ? group?.members?.map((m, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm">{(m.email || m.Email)?.charAt(0)}</div>
                            <div className="truncate"><p className="text-[10px] font-black text-slate-800 italic uppercase">Student {i+1}</p><p className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1 font-mono tracking-wider"><Phone size={10}/> {m.phone || m.Phone}</p></div>
                        </div>
                    )) : (
                        <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center"><Lock className="text-slate-200 mx-auto mb-2" size={32}/><p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed text-center">Member Privacy is ON. Only Admin can see contacts.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;