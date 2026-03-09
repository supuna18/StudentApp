import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AlarmPage() {
    const { groupId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [activeAlarms, setActiveAlarms] = useState({});

    useEffect(() => {
        const fetchSessions = async () => {
            const res = await fetch(`http://localhost:5000/api/scheduler/group/${groupId}`);
            const data = await res.json();
            setSessions(data);
        };
        fetchSessions();
        Notification.requestPermission();
    }, [groupId]);

    const toggleAlarm = (id) => {
        setActiveAlarms(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <Link to={`/hub/scheduler/${groupId}`} className="text-blue-600 font-bold mb-4 inline-block">← Back to Scheduler</Link>
                <h1 className="text-3xl font-black mb-8">Session Alarms 🔔</h1>
                
                <div className="space-y-4">
                    {sessions.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{s.title}</h3>
                                <p className="text-sm text-slate-500">{new Date(s.startTime).toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => toggleAlarm(s.id)}
                                className={`px-6 py-2 rounded-full font-bold text-xs transition ${activeAlarms[s.id] ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {activeAlarms[s.id] ? 'ALARM ON' : 'ALARM OFF'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}