import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowRight, GraduationCap, Sparkles, LayoutGrid } from 'lucide-react';

const HubPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative overflow-hidden">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                    <div className="bg-indigo-600 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl shadow-indigo-200 mb-6 animate-bounce">
                        <GraduationCap className="text-white" size={32} md:size={40} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 uppercase leading-tight">
                        Collaboration <span className="text-indigo-600">Hub</span>
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg leading-relaxed px-4">
                        Welcome back! Select a module below to start your productive study session. No distractions, just pure learning.
                    </p>
                </div>

                {/* MODULE SELECTION GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    
                    {/* MODULE 01: STUDY GROUPS */}
                    <div 
                        onClick={() => navigate('/hub/study-groups')}
                        className="group relative bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden border-b-8 border-b-indigo-500"
                    >
                        {/* Image Layer */}
                        <div className="h-40 md:h-48 w-full rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-8 overflow-hidden relative shadow-inner">
                            <img 
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
                                alt="Study Groups" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors"></div>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Module 01</span>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic leading-none">Study Groups</h2>
                            </div>
                            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Users size={20} md:size={24} />
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 md:mb-8 leading-relaxed">
                            Create, join, and manage private study circles. Real-time chat and shared knowledge at your fingertips.
                        </p>
                        
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs md:text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                            Enter Hub <ArrowRight size={16} md:size={18} />
                        </div>
                    </div>

                    {/* MODULE 02: SCHEDULER */}
                    <div 
                        onClick={() => navigate('/hub/scheduler')}
                        className="group relative bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden border-b-8 border-b-emerald-500"
                    >
                        {/* Image Layer */}
                        <div className="h-40 md:h-48 w-full rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-8 overflow-hidden relative shadow-inner">
                            <img 
                                src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80" 
                                alt="Scheduler" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-transparent transition-colors"></div>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 block">Module 02</span>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic leading-none">Scheduler</h2>
                            </div>
                            <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Calendar size={20} md:size={24} />
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mb-6 md:mb-8 leading-relaxed">
                            Plan your academic missions. Use the built-in calendar and stay on track with distraction-free focus modes.
                        </p>

                        <div className="flex items-center gap-2 text-emerald-600 font-black text-xs md:text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                            Go to Calendar <ArrowRight size={16} md:size={18} />
                        </div>
                    </div>

                </div>

                {/* TIP SECTION */}
                <div className="mt-12 md:mt-16 flex justify-center px-4">
                    <div className="bg-white/40 backdrop-blur-md px-6 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/50 flex items-center gap-3 shadow-sm group">
                        <Sparkles className="text-yellow-500 group-hover:rotate-12 transition-transform flex-shrink-0" size={18} md:size={20} />
                        <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] leading-tight text-center">
                            Pro Tip: Use the browser extension to enforce focus mode during sessions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HubPage;