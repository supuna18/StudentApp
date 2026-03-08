import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, RefreshCw } from 'lucide-react';

const MindfulnessTools = () => {
  // --- Music Player Logic ---
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

  // --- Memory Game Logic ---
  const emojis = ['🌿', '🌸', '🍃', '☀️', '🌿', '🌸', '🍃', '☀️'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    shuffleCards();
  }, []);

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
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      
      {/* --- Music Player Section --- */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-50">
        <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2">
          <Volume2 className="text-blue-500" /> Relaxing Audio
        </h2>
        
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <button 
              key={index}
              onClick={() => { setCurrentTrack(index); setPlaying(false); audio.pause(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentTrack === index ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-600 hover:bg-blue-100'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{track.icon}</span>
                <span className="font-bold">{track.name}</span>
              </div>
              {currentTrack === index && playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
          ))}
        </div>

        <button 
          onClick={togglePlay}
          className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          {playing ? 'PAUSE MUSIC' : 'PLAY RELAXING SOUND'}
        </button>
      </div>

      {/* --- Memory Game Section --- */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-purple-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-purple-900 flex items-center gap-2">
            🧩 Focus Game
          </h2>
          <button onClick={shuffleCards} className="p-2 bg-purple-100 text-purple-600 rounded-full hover:rotate-180 transition-all duration-500">
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((emoji, index) => (
            <div 
              key={index}
              onClick={() => handleCardClick(index)}
              className={`h-20 flex items-center justify-center text-3xl rounded-2xl cursor-pointer transition-all duration-300 transform ${flipped.includes(index) || matched.includes(index) ? 'bg-purple-500 rotate-0' : 'bg-purple-100 rotate-180 text-transparent'}`}
            >
              {(flipped.includes(index) || matched.includes(index)) ? emoji : '❓'}
            </div>
          ))}
        </div>
        
        {matched.length === emojis.length && (
          <p className="mt-6 text-center text-green-500 font-bold animate-bounce">
            🎉 Great Focus! Mind Reset.
          </p>
        )}
        <p className="mt-4 text-gray-400 text-sm text-center">Match the pairs to clear your mind.</p>
      </div>

    </div>
  );
};

export default MindfulnessTools;