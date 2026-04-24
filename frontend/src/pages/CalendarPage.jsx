import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
    const { groupId } = useParams();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");

    const API_URL = "http://localhost:5005/api/scheduler";

    useEffect(() => { fetchSessions(); }, [groupId]);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${API_URL}/group/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const start = new Date(selectedDate);
        const [h, m] = time.split(':');
        start.setHours(h, m);

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                groupId, 
                title, 
                description: "Group Study Session", // Required by backend
                startTime: start, 
                endTime: new Date(start.getTime() + 60 * 60 * 1000), // Add 1 hour
                createdBy: "User" 
            })
        });
        if (res.ok) { setTitle(""); setTime(""); fetchSessions(); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <Link to={`/hub/scheduler/${groupId}`} className="text-blue-600 font-bold mb-4 inline-block">← Back to Scheduler</Link>
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border">
                        <h2 className="text-2xl font-bold mb-6 text-[#0F1C4D]">1. Pick a Date</h2>
                        <Calendar onChange={setSelectedDate} value={selectedDate} className="w-full border-none rounded-2xl" />
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border">
                        <h2 className="text-2xl font-bold mb-6 text-[#0F1C4D]">2. Set Session Info</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Topic Name..." className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" required />
                            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" required />
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all">Save to Calendar</button>
                        </form>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6 text-[#0F1C4D]">Upcoming Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.length === 0 ? (
                            <p className="text-slate-400 italic">No sessions scheduled yet.</p>
                        ) : (
                            sessions.map((s, i) => (
                                <div key={i} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <p className="font-bold text-blue-900">{s.title}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {new Date(s.startTime).toLocaleDateString()} at {new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}