import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';

export default function ChatPage() {
    const { groupId } = useParams(); // Get ID from URL
    const currentUser = localStorage.getItem("username") || "User";
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [connection, setConnection] = useState(null);
    const chatEndRef = useRef(null);

    // [ADD] Auto-scroll to bottom when new message arrives
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // [ADD] Initialize SignalR Connection
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/chatHub") // Backend port
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connected to Chat Hub!");
                    connection.invoke("JoinGroup", groupId); // Join specific group room

                    connection.on("ReceiveMessage", (user, message) => {
                        setMessages(prev => [...prev, { user, message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                    });
                })
                .catch(e => console.log("Connection failed: ", e));
        }
    }, [connection, groupId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() && connection) {
            await connection.invoke("SendMessage", groupId, currentUser, input);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
                
<Link to="/hub/study-groups" className="text-blue-600 font-bold">← Leave Chat</Link>
                <h2 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Study Group Chat</h2>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">{currentUser[0]}</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.user === currentUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase">{m.user}</span>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${m.user === currentUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border rounded-tl-none'}`}>
                            <p className="text-sm">{m.message}</p>
                            <p className={`text-[9px] mt-1 ${m.user === currentUser ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Send</button>
            </form>
        </div>
    );
}