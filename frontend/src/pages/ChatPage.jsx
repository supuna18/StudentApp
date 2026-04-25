import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';

export default function ChatPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [connection, setConnection] = useState(null);
    const [file, setFile] = useState(null);
    const [ownerEmail, setOwnerEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState(null); 

    // --- FORWARD & REPLY STATES ---
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [userGroups, setUserGroups] = useState([]);
    const [forwardLoading, setForwardLoading] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]); 
    const [replyingTo, setReplyingTo] = useState(null); // NEW: Reply state

    const token = localStorage.getItem('token');

    const getMyEmail = () => {
        if (!token) return "";
        try {
            const decoded = jwtDecode(token);
            const identity = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || decoded.unique_name;
            if (identity && !identity.includes('@')) {
                return `${identity.toLowerCase()}@gmail.com`;
            }
            return identity ? identity.toLowerCase() : "";
        } catch (e) { return ""; }
    };

    const myEmail = getMyEmail();
    const chatEndRef = useRef(null);
    const API_BASE = "http://localhost:5005/api";

    useEffect(() => {
        if (!myEmail || !groupId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const gRes = await fetch(`${API_BASE}/studygroups/user/${myEmail}`, { headers: { Authorization: `Bearer ${token}` } });
                if (gRes.ok) {
                    const groups = await gRes.json();
                    setUserGroups(groups);
                    const group = groups.find(g => (g.id || g.Id) === groupId);
                    if (group) setOwnerEmail((group.createdByEmail || group.CreatedByEmail || "").toLowerCase());
                }

                const hRes = await fetch(`${API_BASE}/studygroups/chat/history/${groupId}/${myEmail}`, { headers: { Authorization: `Bearer ${token}` } });
                if (hRes.ok) {
                    const data = await hRes.json();
                    const mapped = data.map(m => ({
                        id: m.id || m.Id,
                        senderEmail: (m.senderEmail || m.SenderEmail || "").toLowerCase(),
                        message: m.message || m.Message,
                        timestamp: m.timestamp || m.Timestamp,
                        fileData: m.fileData || m.FileData,
                        fileName: m.fileName || m.FileName,
                        fileType: m.fileType || m.FileType
                    }));
                    setMessages(mapped);
                }
            } catch (err) { console.error("Load error", err); }
            finally { setLoading(false); }
        };
        loadData();

        const newConn = new signalR.HubConnectionBuilder().withUrl("http://localhost:5005/chathub").withAutomaticReconnect().build();
        setConnection(newConn);
        return () => { if (newConn) newConn.stop(); };
    }, [groupId, myEmail]);

    useEffect(() => {
        if (connection) {
            connection.start().then(() => {
                connection.invoke("JoinGroup", groupId);
                connection.on("ReceiveMessage", (user, msg, time, fData, fName, fType, msgId) => {
                    setMessages(prev => [...prev, { 
                        id: msgId,
                        senderEmail: user.toLowerCase(),
                        message: msg, 
                        timestamp: time, 
                        fileData: fData, 
                        fileName: fName, 
                        fileType: fType 
                    }]);
                });
                connection.on("MessageDeleted", (messageId) => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                });
            });
        }
    }, [connection, groupId]);

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        const screenWidth = window.innerWidth;
        const menuWidth = 180;
        let xPos = e.pageX;
        if (xPos + menuWidth > screenWidth) { xPos = xPos - menuWidth; }
        setContextMenu({ x: xPos, y: e.pageY, msg });
    };

    // --- REPLY ACTION ---
    const handleReply = () => {
        setReplyingTo(contextMenu.msg);
        setContextMenu(null);
    };

    const deleteForEveryone = async () => {
        if (!contextMenu) return;
        try {
            const res = await fetch(`${API_BASE}/studygroups/chat/delete-for-everyone/${contextMenu.msg.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { await connection.invoke("DeleteMessage", groupId, contextMenu.msg.id); setContextMenu(null); }
        } catch (e) { alert("Delete failed"); }
    };

    const deleteForMe = async () => {
        if (!contextMenu) return;
        try {
            await fetch(`${API_BASE}/studygroups/chat/delete-for-me?messageId=${contextMenu.msg.id}&userEmail=${myEmail}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            setMessages(prev => prev.filter(m => m.id !== contextMenu.msg.id));
            setContextMenu(null);
        } catch (e) { alert("Action failed"); }
    };

    const openForwardModal = () => {
        if (!contextMenu?.msg) return;
        setSelectedGroups([]); 
        setShowForwardModal(true);
    };

    const toggleGroupSelection = (id) => {
        if (selectedGroups.includes(id)) {
            setSelectedGroups(prev => prev.filter(gid => gid !== id));
        } else {
            if (selectedGroups.length < 5) {
                setSelectedGroups(prev => [...prev, id]);
            } else {
                alert("Maximum 5 groups is allowed");
            }
        }
    };

    const handleMultiForward = async () => {
        if (!contextMenu?.msg || selectedGroups.length === 0 || !connection) return;
        setForwardLoading(true);
        const msgToForward = { ...contextMenu.msg };
        try {
            for (const targetId of selectedGroups) {
                await connection.invoke("SendMessage", targetId, myEmail.toLowerCase(), `[Forwarded]: ${msgToForward.message || ""}`, msgToForward.fileData || null, msgToForward.fileName || null, msgToForward.fileType || null);
            }
            alert(`Message forwarded successfully!`);
            setShowForwardModal(false);
            setContextMenu(null);
        } catch (e) { alert("Forward failed"); }
        finally { setForwardLoading(false); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !file) return;
        if (connection) {
            try {
                let finalMsg = newMessage;
                // Pack reply info into the string if replying
                if (replyingTo) {
                    const rUser = replyingTo.senderEmail.split('@')[0];
                    const rSnippet = replyingTo.message ? replyingTo.message.substring(0, 40) : "File Attached";
                    finalMsg = `|REPLY|${rUser}|${rSnippet}|${newMessage}`;
                }

                await connection.invoke("SendMessage", groupId, myEmail.toLowerCase(), finalMsg, file?.data || null, file?.name || null, file?.type || null);
                setNewMessage(""); setFile(null); setReplyingTo(null); // Reset
                if(document.getElementById('fIn')) document.getElementById('fIn').value = "";
            } catch (err) { console.error("Send failed"); }
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#E5DDD5] font-bold">Syncing Study Hub History...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#E5DDD5] relative" onClick={() => setContextMenu(null)}> 
            <div className="bg-[#075E54] p-4 text-white flex items-center justify-between shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-xl">←</button>
                    <div><h2 className="font-bold">Study Circle</h2><p className="text-[10px] opacity-70">Logged as: {myEmail}</p></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
                {messages.map((m, idx) => {
                    const isMe = m.senderEmail.toLowerCase() === myEmail.toLowerCase();
                    const isOwner = m.senderEmail.toLowerCase() === ownerEmail.toLowerCase();
                    const senderDisplayName = m.senderEmail ? m.senderEmail.split('@')[0] : "User";

                    // --- PARSE REPLY ---
                    const isReply = m.message && m.message.startsWith("|REPLY|");
                    let quotedUser = "", quotedText = "", actualMsg = m.message;
                    if (isReply) {
                        const parts = m.message.split("|");
                        quotedUser = parts[2]; quotedText = parts[3]; actualMsg = parts[4];
                    }

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div onContextMenu={(e) => handleContextMenu(e, m)} className={`max-w-[75%] p-2 rounded-lg shadow-sm ${isMe ? 'bg-[#DCF8C6]' : 'bg-white'} cursor-context-menu select-none`}>
                                <p className={`text-[9px] font-bold mb-1 ${isMe ? 'text-secondary' : 'text-primary'}`}>
                                    {senderDisplayName} {isOwner && "⭐"}
                                </p>

                                {isReply && (
                                    <div className="bg-black/5 border-l-4 border-[#075E54] p-1.5 mb-2 rounded text-[10px] opacity-80">
                                        <p className="font-bold text-[#075E54]">{quotedUser}</p>
                                        <p className="truncate italic text-gray-500">{quotedText}</p>
                                    </div>
                                )}
                                
                                {actualMsg && <p className="text-sm text-gray-800 pr-4">{actualMsg}</p>}
                                
                                {m.fileData && (
                                    <div className="mt-2 border-t pt-2">
                                        {m.fileType?.startsWith("image/") ? (
                                            <img src={m.fileData} className="max-w-full rounded max-h-64" alt="shared" />
                                        ) : (
                                            <div className="bg-gray-100 p-2 rounded flex items-center gap-2">
                                                <span className="text-lg">📄</span>
                                                <a href={m.fileData} download={m.fileName} className="text-primary text-xs truncate underline">{m.fileName}</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-[8px] text-right text-gray-400 mt-1">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            {contextMenu && (
                <div className="fixed bg-white shadow-xl border rounded-lg z-[9999] py-1 w-[180px]" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleReply} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><span>↩️</span> Reply</button>
                    <button onClick={deleteForMe} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-t"><span>🗑️</span> Delete for me</button>
                    {contextMenu.msg.senderEmail.toLowerCase() === myEmail.toLowerCase() && (
                        <button onClick={deleteForEveryone} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><span>🚫</span> Delete for everyone</button>
                    )}
                    <button onClick={openForwardModal} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t flex items-center gap-2"><span>➡️</span> Forward</button>
                </div>
            )}

            {/* --- REPLY PREVIEW BAR --- */}
            {replyingTo && (
                <div className="bg-white/90 border-l-4 border-[#075E54] mx-3 mb-1 p-2 rounded shadow-md flex justify-between items-center animate-in slide-in-from-bottom-2">
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-[#075E54]">Replying to {replyingTo.senderEmail.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 truncate">{replyingTo.message || "File Attached"}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 p-2">✕</button>
                </div>
            )}

            {showForwardModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#075E54] p-4 text-white flex justify-between items-center">
                            <div><h3 className="font-bold">Forward to...</h3><p className="text-[10px] opacity-80">Selected: {selectedGroups.length} / 5</p></div>
                            <button onClick={() => setShowForwardModal(false)}>✕</button>
                        </div>
                        <div className="p-2 max-h-[350px] overflow-y-auto bg-gray-50">
                            {userGroups.filter(g => (g.id || g.Id) !== groupId).map((g, i) => {
                                const isSelected = selectedGroups.includes(g.id || g.Id);
                                return (
                                    <button key={i} onClick={() => toggleGroupSelection(g.id || g.Id)} className={`w-full text-left p-3 mb-1 rounded-lg flex items-center gap-3 transition-all ${isSelected ? 'bg-secondary/10 border-emerald-300 shadow-inner' : 'hover:bg-white border-transparent'} border`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-secondary text-white' : 'bg-secondary/10 text-secondary'}`}>{isSelected ? '✓' : (g.groupName || g.GroupName || "S").charAt(0)}</div>
                                        <div className="flex-1"><p className="text-sm font-bold text-gray-800">{g.groupName || g.GroupName}</p><p className="text-[10px] text-gray-500 italic">{g.subject || g.Subject}</p></div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-3 bg-white border-t flex justify-between items-center">
                            <button onClick={() => setShowForwardModal(false)} className="text-sm font-bold text-gray-500 px-4 py-2">Cancel</button>
                            <button onClick={handleMultiForward} disabled={selectedGroups.length === 0 || forwardLoading} className={`px-6 py-2 rounded-full text-sm font-bold shadow-md ${selectedGroups.length > 0 ? 'bg-[#128C7E] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                                {forwardLoading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={sendMessage} className="bg-[#F0F0F0] p-3 flex items-center gap-2 z-10">
                <input type="file" id="fIn" className="hidden" onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { const r = new FileReader(); r.onloadend = () => setFile({ data: r.result, name: f.name, type: f.type }); r.readAsDataURL(f); }
                }} />
                <button type="button" onClick={() => document.getElementById('fIn').click()} className="text-xl p-1 hover:bg-gray-200 rounded-full">📎</button>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 rounded-full outline-none text-sm bg-white px-4 shadow-sm" />
                <button type="submit" className={`p-2.5 rounded-full shadow-md transition-all ${ (newMessage.trim() || file) ? 'bg-[#128C7E] text-white' : 'bg-gray-300 text-gray-500' }`}>➤</button>
            </form>
        </div>
    );
}

