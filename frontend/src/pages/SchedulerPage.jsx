import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SchedulerPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    // [ADD] If no group is selected, show a selection screen
    if (!groupId) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[40px] shadow-xl border max-w-lg">
                    <div className="text-6xl mb-6">📅</div>
                    <h1 className="text-3xl font-black text-slate-800 mb-4">Study Scheduler</h1>
                    <p className="text-slate-500 mb-8">You haven't selected a study group yet. Please go to the Study Groups page and select a group to view its calendar and alarms.</p>
                    <Link to="/hub/study-groups" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition">
                        Go to Study Groups
                    </Link>
                </div>
            </div>
        );
    }

    // [KEEP] This is the landing page with the 2 buttons you wanted
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full text-center">
                <Link to="/hub" className="text-blue-600 font-bold mb-8 inline-block">← Back to Hub</Link>
                <h1 className="text-4xl font-black text-slate-800 mb-2">Study Session Scheduler</h1>
                <p className="text-slate-500 mb-12 uppercase text-xs font-bold tracking-widest italic">Group ID: {groupId}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Calendar Button */}
                    <button 
                        onClick={() => navigate(`/hub/calendar/${groupId}`)}
                        className="group bg-white p-10 rounded-[40px] border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">📅</div>
                        <h2 className="text-2xl font-black text-slate-800">Study Calendar</h2>
                        <p className="text-slate-500 mt-2 text-sm">Plan dates and times for collective learning sessions.</p>
                    </button>

                    {/* Alarm Button */}
                    <button 
                        onClick={() => navigate(`/hub/alarms/${groupId}`)}
                        className="group bg-white p-10 rounded-[40px] border-2 border-transparent hover:border-orange-500 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">🔔</div>
                        <h2 className="text-2xl font-black text-slate-800">Session Alarms</h2>
                        <p className="text-slate-500 mt-2 text-sm">Set reminders and alerts for upcoming sessions.</p>
                    </button>
                </div>
            </div>
        </div>
    );
}