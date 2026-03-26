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

    const API_URL = "http://localhost:5000/api/scheduler";

    useEffect(() => { fetchSessions(); }, [groupId]);

    const fetchSessions = async () => {
        const res = await fetch(`${API_URL}/group/${groupId}`);
        const data = await res.json();
        setSessions(data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const start = new Date(selectedDate);
        const [h, m] = time.split(':');
        start.setHours(h, m);

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId, title, startTime: start, createdBy: "User" })
        });
        if (res.ok) { setTitle(""); setTime(""); fetchSessions(); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <Link to={`/hub/scheduler/${groupId}`} className="text-blue-600 font-bold mb-4 inline-block">← Back to Scheduler</Link>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6">1. Pick a Date</h2>
                    <Calendar onChange={setSelectedDate} value={selectedDate} className="w-full border-none rounded-2xl" />
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6">2. Set Session Info</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Topic Name..." className="w-full border p-4 rounded-xl" required />
                        <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full border p-4 rounded-xl" required />
                        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">Save to Calendar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}