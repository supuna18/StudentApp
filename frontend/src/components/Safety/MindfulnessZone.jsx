import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, RefreshCw } from 'lucide-react';

// --- Sub Component: Mindfulness Tools (Music & Game) ---
const MindfulnessTools = () => {
  // Music Player Logic
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audio] = useState(new Audio());

  const tracks = [
    { name: 'Rainy Day', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', icon: '🌧️' },
    { name: 'Nature Forest', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', icon: '🍃' },
    { name: 'Lo-fi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', icon: '🎧' },
  ];

  const togglePlay = () => {
    if (playing) { audio.pause(); } 
    else { audio.src = tracks[currentTrack].url; audio.play(); }
    setPlaying(!playing);
  };

  // Memory Game Logic
  const emojis = ['🌿', '🌸', '🍃', '☀️', '🌿', '🌸', '🍃', '☀️'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => { shuffleCards(); }, []);

  const shuffleCards = () => {
    const shuffled = [...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setMatched([]);
    setFlipped([]);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || matched.includes(index) || flipped.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) setMatched([...matched, ...newFlipped]);
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Music Player */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-indigo-50">
        <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-2">
          <Volume2 className="text-indigo-500" /> Relaxing Audio
        </h2>
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <button key={index} onClick={() => { setCurrentTrack(index); setPlaying(false); audio.pause(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentTrack === index ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{track.icon}</span>
                <span className="font-bold">{track.name}</span>
              </div>
              {currentTrack === index && playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
          ))}
        </div>
        <button onClick={togglePlay} className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100">
          {playing ? 'PAUSE MUSIC' : 'PLAY RELAXING SOUND'}
        </button>
      </div>

      {/* Focus Game */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-indigo-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-indigo-900">🧩 Focus Game</h2>
          <button onClick={shuffleCards} className="p-2 bg-indigo-50 text-indigo-500 rounded-full hover:rotate-180 transition-all duration-500">
            <RefreshCw size={20} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {cards.map((emoji, index) => (
            <div key={index} onClick={() => handleCardClick(index)}
              className={`h-16 flex items-center justify-center text-2xl rounded-xl cursor-pointer transition-all duration-300 transform ${flipped.includes(index) || matched.includes(index) ? 'bg-indigo-500 rotate-0' : 'bg-indigo-100 rotate-180 text-transparent'}`}>
              {(flipped.includes(index) || matched.includes(index)) ? emoji : '❓'}
            </div>
          ))}
        </div>
        {matched.length === emojis.length && <p className="mt-4 text-center text-green-500 font-bold animate-bounce">Great Focus! ✨</p>}
      </div>
    </div>
  );
};

// --- Main Component: Mindfulness Zone ---
const MindfulnessZone = () => {
  const [isActive, setIsActive] = useState(false);
  const [breathingStatus, setBreathingStatus] = useState('Ready?');
  const [timeLeft, setTimeLeft] = useState(60); 
  const [cycleProgress, setCycleProgress] = useState(0); 

  useEffect(() => {
    let timerId;
    let breathId;
    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      breathId = setInterval(() => {
        setCycleProgress((prev) => {
          const next = (prev + 1) % 8; 
          setBreathingStatus(next < 4 ? 'Inhale...' : 'Exhale...');
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setBreathingStatus('Session Done!');
    }
    return () => { clearInterval(timerId); clearInterval(breathId); };
  }, [isActive, timeLeft]);

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      
      {/* Deep Breathing Section */}
      <div className="min-h-[550px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-[2.5rem] shadow-2xl border border-white">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-indigo-950 mb-3 tracking-tight">Deep Breathing</h2>
          <p className="text-indigo-400 font-semibold tracking-wide uppercase text-xs">
            {isActive ? 'Follow the rhythm' : '60 seconds to reset your mind'}
          </p>
        </div>

        <div className="relative flex items-center justify-center w-80 h-80 mb-12">
          <div className={`absolute rounded-full bg-indigo-100 opacity-30 transition-all duration-[4000ms] ease-in-out ${isActive && cycleProgress < 4 ? 'w-full h-full' : 'w-40 h-40'}`}></div>
          <svg className="absolute w-full h-full rotate-[-90deg]">
            <circle cx="50%" cy="50%" r="42%" stroke="#E0E7FF" strokeWidth="6" fill="transparent" />
            <circle cx="50%" cy="50%" r="42%" stroke="#4F46E5" strokeWidth="8" fill="transparent" strokeDasharray="530" style={{ strokeDashoffset: 530 - (530 * (60 - timeLeft)) / 60, transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className={`z-10 rounded-full shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-[4000ms] ease-in-out p-4 ${isActive && cycleProgress < 4 ? 'w-60 h-60 bg-indigo-600 scale-110' : 'w-44 h-44 bg-indigo-500 scale-100'}`}>
            <span className="text-white text-2xl font-black">{breathingStatus}</span>
            {!isActive && timeLeft === 0 && <span className="text-3xl mt-2 animate-bounce">🌟</span>}
            {isActive && <div className="mt-2 px-3 py-1 bg-indigo-800/40 rounded-full text-white text-sm font-bold">{timeLeft}s</div>}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          {!isActive ? (
            <button onClick={() => { setTimeLeft(60); setCycleProgress(0); setIsActive(true); }} className="w-full py-5 bg-indigo-600 rounded-3xl font-black text-white text-lg shadow-xl hover:bg-indigo-700 transition-all">
              {timeLeft === 0 ? 'START NEW SESSION' : 'BEGIN JOURNEY'}
            </button>
          ) : (
            <button onClick={() => setIsActive(false)} className="w-full py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100">QUIT SESSION</button>
          )}
          <div className="flex gap-4 w-full">
            <div className="flex-1 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm text-center">
              <p className="text-[10px] text-indigo-300 uppercase font-black">Inhale</p>
              <p className="text-sm text-indigo-900 font-bold">4 Secs</p>
            </div>
            <div className="flex-1 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm text-center">
              <p className="text-[10px] text-indigo-300 uppercase font-black">Exhale</p>
              <p className="text-sm text-indigo-900 font-bold">4 Secs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mindfulness Tools Section */}
      <MindfulnessTools />

    </div>
  );
};

export default MindfulnessZone;