import React, { useState, useEffect, useCallback } from 'react';
import { Headphones, ArrowUpRight, Brain, Target, Zap, Sparkles, ChevronLeft, Info, Settings, Wind, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// --- DATA ---
const breathingExercises = [
  { id: 'box', name: 'Box', pattern: '4-4-4-4', desc: 'Relaxation', duration: '5 mins', accent: 'bg-purple-500', phases: [
    { type: 'Inhale', duration: 4 }, { type: 'Hold', duration: 4 }, { type: 'Exhale', duration: 4 }, { type: 'Hold', duration: 4 }
  ]},
  { id: 'long', name: 'Long exhale', pattern: '4-7-8', desc: 'Sleep', duration: '5 mins', accent: 'bg-blue-500', phases: [
    { type: 'Inhale', duration: 4 }, { type: 'Hold', duration: 7 }, { type: 'Exhale', duration: 8 }
  ]},
  { id: 'equal', name: 'Equal', pattern: '5-0-5', desc: 'Focus', duration: '5 mins', accent: 'bg-indigo-500', phases: [
    { type: 'Inhale', duration: 5 }, { type: 'Exhale', duration: 5 }
  ]},
  { id: 'custom', name: 'Custom', pattern: 'Set your own', desc: 'Personalized', duration: '5 mins', accent: 'bg-emerald-500', phases: [
    { type: 'Inhale', duration: 4 }, { type: 'Exhale', duration: 4 }
  ]}
];

// --- COMPONENTS ---

const InfoModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8 md:p-12 space-y-10">
            <header className="flex justify-between items-center">
               <h2 className="text-3xl font-black text-slate-800">About Breathing</h2>
               <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                  <X size={24} className="text-slate-400" />
               </button>
            </header>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Brain size={20}/></div>
                     <h3 className="text-xl font-bold text-slate-800">Box Breathing (4-4-4-4)</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                     Known as "Square Breathing," this technique is used by Navy SEALs to stay calm and focused under pressure. It resets your nervous system and improves mental clarity by balancing oxygen levels.
                  </p>
               </div>
 
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Wind size={20}/></div>
                     <h3 className="text-xl font-bold text-slate-800">4-7-8 Breathing (Sleep)</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                     A natural tranquilizer for the nervous system. By making the exhale twice as long as the inhale, you trigger the "rest and digest" response, effectively lowering your heart rate and preparing the body for deep sleep.
                  </p>
               </div>
 
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Target size={20}/></div>
                     <h3 className="text-xl font-bold text-slate-800">Equal Breathing (5-0-5)</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                     Focus on making your inhales and exhales the same length. This technique helps harmonize the brain's hemispheres, providing a steady flow of energy and sharp focus for studying or creative work.
                  </p>
               </div>
            </div>

            <button onClick={onClose} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-white hover:bg-indigo-700 transition-all shadow-lg">GOT IT</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ExerciseCard = ({ exercise, onSelect }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(exercise)}
    className={`relative p-8 rounded-[2rem] bg-white border border-slate-200 cursor-pointer overflow-hidden group h-[200px] flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-200 transition-all`}
  >
    <div className={`absolute top-0 left-0 w-2 h-full ${exercise.accent}`} />
    <div className="relative z-10">
      <h3 className="text-xl font-black text-slate-800 mb-1">{exercise.name}</h3>
      <p className="text-xs font-black tracking-widest text-slate-500 uppercase mb-1">{exercise.pattern}</p>
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{exercise.desc}</p>
    </div>
    
    <div className="relative z-10 flex items-center justify-between text-slate-500">
      <span className="text-[10px] font-black uppercase tracking-widest">Digital Focus</span>
      <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
    </div>

    <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <div className="relative w-24 h-24">
         <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl translate-x-4 translate-y-4" />
         <div className="absolute inset-0 border-2 border-blue-600 rounded-full scale-75" />
         <div className="absolute inset-0 border-2 border-blue-400 rounded-full scale-50 -translate-x-4" />
      </div>
    </div>
  </motion.div>
);

const BreathingTimer = ({ exercise, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [sessionTime, setSessionTime] = useState(300); // 5 mins in seconds

  const currentPhase = exercise.phases[phaseIndex];

  useEffect(() => {
    let timer;
    if (isActive && sessionTime > 0) {
      if (phaseTimeLeft > 0) {
        timer = setTimeout(() => setPhaseTimeLeft(p => p - 1), 1000);
      } else {
        const nextIndex = (phaseIndex + 1) % exercise.phases.length;
        setPhaseIndex(nextIndex);
        setPhaseTimeLeft(exercise.phases[nextIndex].duration);
      }
      return () => clearTimeout(timer);
    } else if (sessionTime === 0) {
      setIsActive(false);
    }
  }, [isActive, phaseTimeLeft, phaseIndex, exercise.phases, sessionTime]);

  useEffect(() => {
    let sessionTimer;
    if (isActive && sessionTime > 0) {
      sessionTimer = setInterval(() => setSessionTime(s => s - 1), 1000);
    }
    return () => clearInterval(sessionTimer);
  }, [isActive, sessionTime]);

  const startSession = () => {
    setPhaseIndex(0);
    setPhaseTimeLeft(exercise.phases[0].duration);
    setIsActive(true);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[600px] w-full"
    >
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-slate-800 hover:text-blue-600 transition-colors group z-20">
        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> <span className="font-black uppercase tracking-widest text-[10px]">Back to Hub</span>
      </button>
 
      <div className="text-center mb-12 drop-shadow-sm">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{exercise.name} <span className="text-blue-600">Sync</span></h2>
        <p className="text-slate-600 font-black tracking-[0.2em] uppercase text-xs">{isActive ? currentPhase.type : exercise.desc}</p>
      </div>

      <div className="relative flex items-center justify-center w-80 h-80 mb-16">
        <AnimatePresence>
          {isActive && (
            <motion.div 
              key={currentPhase.type}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: currentPhase.type === 'Inhale' ? 1.4 : currentPhase.type === 'Exhale' ? 0.8 : 1.1,
                opacity: currentPhase.type === 'Inhale' ? 0.2 : 0.05
              }}
              transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-blue-500 blur-3xl"
            />
          )}
        </AnimatePresence>

        <svg className="absolute w-full h-full rotate-[-90deg]">
          <circle cx="50%" cy="50%" r="42%" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
          <motion.circle 
            cx="50%" cy="50%" r="42%" stroke="#2563eb" strokeWidth="10" fill="transparent" 
            strokeDasharray="530" 
            animate={{ strokeDashoffset: 530 - (530 * phaseTimeLeft) / currentPhase.duration }}
            transition={{ duration: 1, ease: "linear" }}
            className="drop-shadow-[0_0_10px_rgba(37,99,235,0.2)]"
          />
        </svg>

        <motion.div 
          animate={{ 
            scale: isActive ? (currentPhase.type === 'Inhale' ? 1.2 : currentPhase.type === 'Exhale' ? 0.9 : 1.1) : 1,
          }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
          className="z-10 rounded-full shadow-xl flex flex-col items-center justify-center text-center p-8 w-56 h-56 bg-white border border-slate-100"
        >
          <span className="text-slate-800 text-3xl font-black">{isActive ? currentPhase.type : 'Ready?'}</span>
          {isActive && (
             <div className="mt-4 flex flex-col items-center">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">Time Left</span>
                <span className="text-blue-600 font-bold text-lg tabular-nums">{phaseTimeLeft}s</span>
             </div>
          )}
        </motion.div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        {!isActive ? (
          <button onClick={startSession} className="w-full py-5 bg-blue-600 rounded-[2rem] font-black text-white text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transform transition-all uppercase tracking-widest">
            {sessionTime < 300 ? 'Resume Session' : 'Activate Session'}
          </button>
        ) : (
          <button onClick={() => setIsActive(false)} className="w-full py-4 bg-white/80 backdrop-blur-md text-slate-800 rounded-[1.5rem] font-black hover:bg-white transition-all border border-slate-200 shadow-lg">PAUSE FOCUS</button>
        )}
        <div className="text-center text-slate-700 text-xs font-black uppercase tracking-[0.2em] drop-shadow-sm">
           TOTAL FOCUS: {formatTime(sessionTime)}
        </div>
      </div>
    </motion.div>
  );
};

const MindfulnessZone = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const MindfulnessTools = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-16">
      <div onClick={() => navigate('/student-dashboard/music-player')} className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-lg transition-all">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Headphones size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Immersion Beats</h3>
        <p className="text-slate-500 font-bold text-sm mb-4">Curated focus sounds.</p>
        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">Explore Hub <ArrowUpRight size={14}/></div>
      </div>
      <div onClick={() => navigate('/student-dashboard/focus-games')} className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-purple-400 cursor-pointer shadow-sm hover:shadow-lg transition-all">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
          <Target size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Focus Vortex</h3>
        <p className="text-slate-500 font-bold text-sm mb-4">Cognitive training games.</p>
        <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">Enter Vortex <ArrowUpRight size={14}/></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-12 relative overflow-hidden">
 
      {/* CUSTOM VIDEO BACKGROUND WITH LIGHT OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/sea.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 backdrop-blur-[2px]" />
      </div>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -ml-48 -mb-48 opacity-50" />

      <div className="max-w-4xl mx-auto relative z-10 py-8">
        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            <motion.div 
              key="selection" 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <header className="flex justify-between items-start">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-slate-400">
                      <ChevronLeft className="cursor-pointer hover:text-blue-600" onClick={() => navigate(-1)} />
                      <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Breathing Sync</h1>
                   </div>
                   <div className="info-section">
                      <h2 className="text-3xl md:text-4xl font-black text-slate-800 max-w-md leading-tight">Choose an exercise to <span className="text-blue-600">Digital Focus</span>.</h2>
                   </div>
                </div>
                <div 
                  onClick={() => setIsAboutOpen(true)}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 cursor-pointer hover:text-blue-600 hover:border-blue-600 shadow-sm transition-all"
                >
                   <Info size={24} />
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {breathingExercises.map(ex => (
                    <ExerciseCard key={ex.id} exercise={ex} onSelect={setSelectedExercise} />
                 ))}
              </div>

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center gap-8 group shadow-sm">
                 <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-black text-slate-800">Before you get started</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-bold">
                       Learn how each breathing exercise works and get tips to help you focus better.
                    </p>
                    <button 
                      onClick={() => setIsAboutOpen(true)}
                      className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all"
                    >
                      Learn More
                    </button>
                 </div>
                 <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-3xl flex items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                    <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=200&q=80" alt="Dandelion" className="w-full h-full object-cover rounded-2xl opacity-80 transition-all duration-700" />
                    <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
                 </div>
              </motion.div>

              <MindfulnessTools />
            </motion.div>
          ) : (
            <BreathingTimer 
              key="timer" 
              exercise={selectedExercise} 
              onBack={() => setSelectedExercise(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      <InfoModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default MindfulnessZone;