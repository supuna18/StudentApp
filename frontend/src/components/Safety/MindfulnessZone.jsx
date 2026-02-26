import React, { useState } from 'react';

const MindfulnessZone = () => {
  const [isBreathing, setIsBreathing] = useState(false);

  return (
    <div className="bg-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">🧘 Mindful Break</h2>
      <p className="text-sm text-blue-500 mb-6 text-center">Take 1 minute to recharge your focus.</p>

      <div className="relative flex items-center justify-center w-40 h-40 mb-6">
        <div className={`absolute w-32 h-32 bg-blue-300 rounded-full opacity-40 transition-all duration-[4000ms] ease-in-out ${isBreathing ? 'scale-[1.8]' : 'scale-100'}`}></div>
        <div className="z-10 bg-blue-600 text-white w-24 h-24 rounded-full flex items-center justify-center font-bold shadow-lg">
          {isBreathing ? 'Breathe' : 'Focus'}
        </div>
      </div>

      <button 
        onClick={() => setIsBreathing(!isBreathing)}
        className={`px-8 py-3 rounded-full font-bold text-white shadow-md transition ${isBreathing ? 'bg-orange-500' : 'bg-blue-700'}`}
      >
        {isBreathing ? 'Stop Exercise' : 'Start Deep Breathing'}
      </button>

      <p className="mt-4 text-xs text-blue-400 italic font-mono text-center">
        Sync with the outer circle: <br/> Inhale as it grows, Exhale as it shrinks.
      </p>
    </div>
  );
};

export default MindfulnessZone;