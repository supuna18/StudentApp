import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode'; // Idhai install panni irukanum: npm install jwt-decode

export default function ChatPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [connection, setConnection] = useState(null);
    const [file, setFile] = useState(null);
    const [ownerEmail, setOwnerEmail] = useState(""); // Group owner-ah identify panna state

    // 1. FIX: Identity Bug - Token-la irundhu email-ah edupom (Ippo login panna user email correct-aa varum)
    const token = localStorage.getItem('token');
    let userEmail = "user@test.com";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // .NET Identity claims-la email-ah fetch pannuvom
            userEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || decoded.unique_name;
        } catch (e) {
            console.error("Token decode error");
        }
    }

    const chatEndRef = useRef(null);
    const API_BASE = "http://localhost:5005/api"; 

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // 2. Owner-ah kandupidikka Group Details-ah fetch pannuvom
        const fetchGroupDetails = async () => {
            try {
                // Neenga already ezhudhuna API route-ah call panrom
                const res = await fetch(`${API_BASE}/studygroups/user/${userEmail}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const groups = await res.json();
                    const currentGroup = groups.find(g => g.id === groupId);
                    if (currentGroup) {
                        // Owner email-ah set panrom
                        setOwnerEmail(currentGroup.createdByEmail || currentGroup.CreatedByEmail);
                    }
                }
            } catch (err) { console.error("Group details fetch error:", err); }
        };

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/chat/history/${groupId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) { console.error("History fetch error:", err); }
        };

        fetchGroupDetails();
        fetchHistory();

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5005/chathub")
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);

        return () => { if (newConnection) newConnection.stop(); };
    }, [groupId, userEmail]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    connection.invoke("JoinGroup", groupId);
                    connection.on("ReceiveMessage", (user, message, timestamp, fileData, fileName, fileType) => {
                        setMessages(prev => [...prev, { 
                            senderEmail: user, 
                            message, 
                            timestamp, 
                            fileData, 
                            fileName, 
                            fileType 
                        }]);
                    });
                })
                .catch(err => console.error("SignalR Connection failed: ", err));
        }
    }, [connection, groupId]);

    useEffect(scrollToBottom, [messages]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile({ data: reader.result, name: selectedFile.name, type: selectedFile.type });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" && !file) return;
        if (connection) {
            try {
                await connection.invoke("SendMessage", groupId, userEmail, newMessage, file?.data || null, file?.name || null, file?.type || null);
                setNewMessage(""); setFile(null);
                if(document.getElementById('fileInput')) document.getElementById('fileInput').value = "";
            } catch (err) { console.error("Send failed:", err); }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#E5DDD5]"> 
            <div className="bg-[#075E54] p-4 text-white flex items-center gap-4 shadow-lg">
                <button onClick={() => navigate(-1)} className="text-xl">←</button>
                <div>
                    <h2 className="font-bold">Group ID: {groupId}</h2>
                    <p className="text-xs opacity-80">Real-time Study Group</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                    // Logic for Owner vs Member coloring
                    const isOwner = msg.senderEmail === ownerEmail;
                    const isMe = msg.senderEmail === userEmail;

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {/* 3. FIX: Owner-ku GREEN (#DCF8C6), Joined Member-ku GREY (#E1E1E1) */}
                            <div className={`max-w-[75%] p-2 rounded-lg shadow-sm relative ${
                                isOwner ? 'bg-[#DCF8C6]' : 'bg-[#E1E1E1]'
                            }`}>
                                <p className={`text-[10px] font-bold mb-1 ${isOwner ? 'text-emerald-700' : 'text-blue-600'}`}>
                                    {msg.senderEmail} {isOwner && <span className="text-[8px] opacity-70">(Owner)</span>}
                                </p>
                                
                                {msg.message && <p className="text-sm text-gray-800 pr-10">{msg.message}</p>}

                                {msg.fileData && (
                                    <div className="mt-2 border-t pt-2">
                                        {msg.fileType?.startsWith("image/") ? (
                                            <img src={msg.fileData} alt="shared" className="max-w-full rounded" />
                                        ) : (
                                            <div className="bg-white/50 p-2 rounded flex items-center gap-2">
                                                <span className="text-xl">📄</span>
                                                <a href={msg.fileData} download={msg.fileName} className="text-blue-500 text-xs truncate underline">{msg.fileName}</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <p className="text-[9px] text-right text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="bg-[#F0F0F0] p-3 flex items-center gap-2">
                <input type="file" id="fileInput" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => document.getElementById('fileInput').click()} className="text-2xl text-gray-600">📎</button>
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 p-2 rounded-full border-none outline-none px-4"
                />
                <button type="submit" className="bg-[#128C7E] text-white p-2 rounded-full px-5 font-bold">➤</button>
            </form>
        </div>
    );
}