import React, { useState, useEffect } from 'react';

const MindfulnessZone = () => {
  const [isActive, setIsActive] = useState(false);
  const [breathingStatus, setBreathingStatus] = useState('Ready?');
  const [timeLeft, setTimeLeft] = useState(60); 
  const [cycleProgress, setCycleProgress] = useState(0); 

  useEffect(() => {
    let timerId;
    let breathId;

    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      breathId = setInterval(() => {
        setCycleProgress((prev) => {
          const next = (prev + 1) % 8; 
          
          if (next < 4) {
            setBreathingStatus('Inhale...');
          } else {
            setBreathingStatus('Exhale...');
          }
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setBreathingStatus('Session Done!'); // Emoji එක පල්ලෙහාට ගත්තා Center වෙන්න
    }

    return () => {
      clearInterval(timerId);
      clearInterval(breathId);
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setTimeLeft(60); 
    setCycleProgress(0);
    setIsActive(true);
  };

  return (
    <div className="min-h-[550px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-[2.5rem] shadow-2xl border border-white">
      
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-indigo-950 mb-3 tracking-tight">Deep Breathing</h2>
        <p className="text-indigo-400 font-semibold tracking-wide uppercase text-xs">
          {isActive ? 'Follow the rhythm' : '60 seconds to reset your mind'}
        </p>
      </div>

      {/* Main Breathing Circle Container */}
      <div className="relative flex items-center justify-center w-80 h-80 mb-12">
        
        {/* Background Pulsing Glow */}
        <div className={`absolute rounded-full bg-indigo-100 opacity-30 transition-all duration-[4000ms] ease-in-out ${
          isActive && cycleProgress < 4 ? 'w-full h-full' : 'w-40 h-40'
        }`}></div>

        {/* Progress SVG Ring */}
        <svg className="absolute w-full h-full rotate-[-90deg]">
          <circle
            cx="50%" cy="50%" r="42%"
            stroke="#E0E7FF" strokeWidth="6" fill="transparent"
          />
          <circle
            cx="50%" cy="50%" r="42%"
            stroke="#4F46E5" strokeWidth="8" fill="transparent"
            strokeDasharray="530"
            strokeLinecap="round"
            style={{ 
              strokeDashoffset: 530 - (530 * (60 - timeLeft)) / 60,
              transition: 'stroke-dashoffset 1s linear'
            }}
          />
        </svg>

        {/* Inner Content Circle */}
        <div className={`z-10 rounded-full shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-[4000ms] ease-in-out p-4 ${
          isActive && cycleProgress < 4 
          ? 'w-60 h-60 bg-indigo-600 scale-110' 
          : 'w-44 h-44 bg-indigo-500 scale-100'
        }`}>
          {/* Status Text (Centered) */}
          <div className="flex flex-col items-center justify-center w-full">
            <span className="text-white text-2xl font-black leading-tight">
              {breathingStatus}
            </span>
            
            {/* Session Done වුණාම ලස්සනට පේන්න Emoji එක පල්ලෙහාට දැම්මා */}
            {!isActive && timeLeft === 0 && (
              <span className="text-3xl mt-2 animate-bounce">🌟</span>
            )}

            {/* Timer (Active වෙලාවට විතරයි පේන්නේ) */}
            {isActive && (
              <div className="mt-2 px-3 py-1 bg-indigo-800/40 rounded-full">
                <span className="text-indigo-100 text-sm font-mono font-bold">{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-full max-w-sm space-y-8">
        {!isActive ? (
          <button 
            onClick={handleStart}
            className="w-full py-5 bg-indigo-600 rounded-3xl font-black text-white text-lg shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            {timeLeft === 0 ? 'START NEW SESSION' : 'BEGIN JOURNEY'}
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="px-10 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors border border-red-100"
          >
            QUIT SESSION
          </button>
        )}

        {/* Info Cards */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm">
            <p className="text-[10px] text-indigo-300 uppercase font-black mb-1">Inhale</p>
            <p className="text-sm text-indigo-900 font-bold italic">4 Seconds</p>
          </div>
          <div className="flex-1 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm">
            <p className="text-[10px] text-indigo-300 uppercase font-black mb-1">Exhale</p>
            <p className="text-sm text-indigo-900 font-bold italic">4 Seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindfulnessZone;