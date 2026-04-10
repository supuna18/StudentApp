import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Headphones, Sparkles, Heart, Music2, 
  CheckCircle2, AlertCircle, Save, Play, Pause, 
  Volume2, Maximize2, Minimize2, Clock, Zap, Coffee, Wind, Compass
} from 'lucide-react';

const MusicPlayerPage = () => {
  const navigate = useNavigate();
  
  // --- Enhanced Track List with Generated Art ---
  const allTracks = [
    { 
      id: 1, 
      title: "Lofi Girl - Study Radio", 
      url: "https://www.youtube.com/embed/jfKfPfyJRdk", 
      genre: "Lo-fi", 
      mood: "Focused",
      art: "/music.jpg"
    },
    { 
      id: 2, 
      title: "Quiet Night - Chill Piano", 
      url: "https://www.youtube.com/embed/7NOSDKb0HlU", 
      genre: "Piano", 
      mood: "Calm",
      art: "/music.jpg"
    },
    { 
      id: 3, 
      title: "Tropical Rain & Thunder", 
      url: "https://www.youtube.com/embed/H0GkP29s2z0", 
      genre: "Nature", 
      mood: "Relaxed",
      art: "/music.jpg"
    },
    { 
      id: 4, 
      title: "Synthwave for Coding", 
      url: "https://www.youtube.com/embed/4xDzrJKXOOY", 
      genre: "Electronic", 
      mood: "Energetic",
      art: "/music.jpg"
    },
    { 
      id: 5, 
      title: "Deep Focus White Noise", 
      url: "https://www.youtube.com/embed/nMfPq_0G568", 
      genre: "Nature", 
      mood: "Focused",
      art: "/music.jpg"
    },
    { 
      id: 6, 
      title: "Quantum Focus", 
      url: "https://www.youtube.com/embed/K-pj0mMYi9o", 
      genre: "Electronic", 
      mood: "Focused",
      art: "/music.jpg"
    }
  ];

  // --- States ---
  const [selectedTrack, setSelectedTrack] = useState(allTracks[0]);
  const [showForm, setShowForm] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Discover');
  const [preferences, setPreferences] = useState({ genres: [], mood: "" });
  const [errors, setErrors] = useState({});
  const [suggestedTracks, setSuggestedTracks] = useState(allTracks);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([allTracks[0]]);

  // --- Effects & Helpers ---
  const toggleFavorite = (track) => {
    if (favorites.find(fav => fav.id === track.id)) {
      setFavorites(favorites.filter(fav => fav.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    if (!recentlyPlayed.find(p => p.id === track.id)) {
      setRecentlyPlayed([track, ...recentlyPlayed].slice(0, 5));
    }
  };

  const currentMoodTheme = useMemo(() => {
    const mood = selectedTrack.mood;
    if (mood === "Focused") return "from-cyan-900/40 to-blue-900/40 border-cyan-500/30 glow-cyan-500";
    if (mood === "Calm") return "from-indigo-900/40 to-slate-900/40 border-indigo-500/30 glow-indigo-500";
    if (mood === "Relaxed") return "from-emerald-900/40 to-teal-900/40 border-emerald-500/30 glow-emerald-500";
    if (mood === "Energetic") return "from-fuchsia-900/40 to-rose-900/40 border-fuchsia-500/30 glow-fuchsia-500";
    return "from-slate-900/40 to-blue-900/40 border-blue-500/30 glow-blue-500";
  }, [selectedTrack.mood]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (preferences.genres.length === 0) newErrors.genres = "Select at least one music genre.";
    if (preferences.genres.length > 3) newErrors.genres = "Maximum 3 genres allowed.";
    if (!preferences.mood) newErrors.mood = "Select your current mood.";
    
    if (Object.keys(newErrors).length === 0) {
      const filtered = allTracks.filter(track => 
        preferences.genres.includes(track.genre) || track.mood === preferences.mood
      );
      setSuggestedTracks(filtered.length > 0 ? filtered : allTracks);
      setShowForm(false);
    } else {
      setErrors(newErrors);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        
        .mesh-gradient {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                      radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%), 
                      radial-gradient(at 100% 0%, hsla(339,49%,30%,0.2) 0, transparent 50%);
          filter: blur(80px);
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        @keyframes subtle-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.2); }
        }
        .animate-glow { animation: subtle-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Background Mesh */}
      <div className="mesh-gradient" />

      {/* Background Shapes */}
      <motion.div 
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -50, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="fixed -bottom-60 -left-60 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
        
        {/* Header Section */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between mb-12"
            >
              <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-4 glass-panel rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white group">
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    Music <span className="text-blue-500">Sanctuary</span>
                    <Sparkles className="text-blue-400 animate-pulse" size={24} />
                  </h1>
                  <p className="text-slate-400 text-sm font-medium">Immersive focus environment for deep learning.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsZenMode(true)}
                  className="px-6 py-4 glass-panel rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all border-white/10"
                >
                  <Minimize2 size={18} /> Zen Mode
                </button>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                >
                  <Sparkles size={20} /> Personalize
                </button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative glass-panel w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-8 border border-white/10">
                <div>
                  <h3 className="text-3xl font-black mb-1 text-blue-400 flex items-center gap-3"><Music2 /> Fine-tune Your Vibe</h3>
                  <p className="text-slate-400 font-medium">We'll adjust the recommendations based on your current study goals.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Favorite Genres</p>
                    <div className="flex flex-wrap gap-3">
                      {["Lo-fi", "Piano", "Nature", "Electronic"].map(g => (
                        <button key={g} type="button" onClick={() => {
                          const newGenres = preferences.genres.includes(g) ? preferences.genres.filter(i => i !== g) : [...preferences.genres, g];
                          setPreferences({...preferences, genres: newGenres});
                        }} className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${preferences.genres.includes(g) ? 'bg-blue-600 shadow-lg shadow-blue-900/40 text-white' : 'glass-panel text-slate-400'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Mood</p>
                    <div className="grid grid-cols-2 gap-4">
                      {["Focused", "Calm", "Relaxed", "Energetic"].map(m => (
                        <button key={m} type="button" onClick={() => setPreferences({...preferences, mood: m})} className={`p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${preferences.mood === m ? 'bg-blue-600 shadow-lg shadow-blue-900/40 text-white' : 'glass-panel text-slate-400'}`}>
                          {m === "Focused" && <Zap size={18} />}
                          {m === "Calm" && <Compass size={18} />}
                          {m === "Relaxed" && <Wind size={18} />}
                          {m === "Energetic" && <Sparkles size={18} />}
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-white text-blue-950 py-5 rounded-2xl font-black text-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-3">
                    <Save size={20} /> SYNCHRONIZE EXPERIENCE
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow ${isZenMode ? 'items-center' : ''}`}>
          
          {/* Track Player Section */}
          <motion.div 
            layout
            className={`${isZenMode ? 'lg:col-span-12 max-w-5xl mx-auto' : 'lg:col-span-8'} flex flex-col gap-8`}
          >
            <motion.div 
              layout
              className={`relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 glass-panel group ${currentMoodTheme} transition-all duration-700 p-1`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
              <div className="w-full h-full rounded-[2.8rem] overflow-hidden border border-white/5 bg-black relative">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={selectedTrack.url + "?autoplay=1&modestbranding=1&rel=0"} 
                    title="Music Player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="relative z-10"
                  ></iframe>
              </div>

              {/* Zen Mode Escape */}
              {isZenMode && (
                <motion.button 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setIsZenMode(false)}
                  className="absolute top-8 right-8 z-[20] p-4 glass-panel rounded-full hover:bg-white/10 transition-all text-white"
                >
                  <Maximize2 size={24} />
                </motion.button>
              )}
            </motion.div>

            <motion.div layout className={`flex items-end justify-between ${isZenMode ? 'px-8' : ''}`}>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/30">
                      Now playing • {selectedTrack.mood}
                    </span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{selectedTrack.genre}</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter mb-2 bloom-serif italic">{selectedTrack.title}</h2>
                  <p className="text-slate-500 font-medium text-lg">Curated frequency for optimal synaptic output.</p>
               </div>
               
               <div className="flex gap-4">
                  <button onClick={() => toggleFavorite(selectedTrack)} className={`p-6 glass-panel rounded-[2rem] transition-all group ${favorites.find(f => f.id === selectedTrack.id) ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'text-slate-400 hover:text-white'}`}>
                    <Heart size={28} fill={favorites.find(f => f.id === selectedTrack.id) ? "currentColor" : "none"} className="group-active:scale-125 transition-transform" />
                  </button>
               </div>
            </motion.div>
          </motion.div>

          {/* Right Sidebar - Playlist & Favorites */}
          <AnimatePresence>
            {!isZenMode && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:col-span-4 flex flex-col gap-8 h-full min-h-[600px]"
              >
                <div className="glass-panel rounded-[3rem] flex-grow flex flex-col p-8 overflow-hidden">
                  
                  {/* Tabs */}
                  <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                    {['Discover', 'Recent', 'Liked'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* List Container */}
                  <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {activeTab === 'Discover' && suggestedTracks.map((track, i) => (
                      <TrackCard 
                        key={track.id} 
                        track={track} 
                        active={selectedTrack.id === track.id} 
                        index={i}
                        onSelect={() => handleTrackSelect(track)}
                        onFavorite={() => toggleFavorite(track)}
                        isFavorite={!!favorites.find(f => f.id === track.id)}
                      />
                    ))}
                    {activeTab === 'Recent' && recentlyPlayed.map((track, i) => (
                      <TrackCard key={`recent-${track.id}`} track={track} active={selectedTrack.id === track.id} index={i} onSelect={() => handleTrackSelect(track)} isFavorite={!!favorites.find(f => f.id === track.id)} onFavorite={() => toggleFavorite(track)} />
                    ))}
                    {activeTab === 'Liked' && (
                      favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50 py-20">
                          <Heart size={48} />
                          <p className="font-bold uppercase tracking-widest text-xs">No favorites saved</p>
                        </div>
                      ) : favorites.map((track, i) => (
                        <TrackCard key={`liked-${track.id}`} track={track} active={selectedTrack.id === track.id} index={i} onSelect={() => handleTrackSelect(track)} isFavorite={true} onFavorite={() => toggleFavorite(track)} />
                      ))
                    )}
                  </div>

                  {/* Now Playing Mini-bar */}
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <img src={selectedTrack.art} alt="Cover" className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20" />
                       <div>
                          <p className="text-xs font-black tracking-tight line-clamp-1">{selectedTrack.title}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedTrack.genre}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Pause size={16} /></button>
                      <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Volume2 size={16} /></button>
                    </div>
                  </div>
                </div>

                {/* Zen Quote Card */}
                <div className="glass-panel rounded-[2.5rem] p-8 border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full" />
                  <p className="text-slate-400 text-sm font-medium italic relative z-10 leading-relaxed">
                    "Music creates a bridge between silence and knowledge. Let the frequencies guide your focus."
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        {!isZenMode && (
          <footer className="mt-auto pt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[3px] text-slate-600">
            <span>Adaptive Focus Engine v2.0</span>
            <div className="flex gap-8">
              <span className="hover:text-blue-500 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-blue-500 transition-colors cursor-pointer">Deep Focus Mode</span>
              <span className="hover:text-blue-500 transition-colors cursor-pointer">Support</span>
            </div>
            <span>© 2026 StudentApp Space</span>
          </footer>
        )}
      </div>
    </div>
  );
};

// --- Sub-component: Track Card ---
const TrackCard = ({ track, active, onSelect, onFavorite, isFavorite, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group p-4 rounded-2xl flex items-center gap-4 border cursor-pointer transition-all duration-300 ${active ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'}`}
      onClick={onSelect}
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
         <img src={track.art} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
         {active && (
           <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
              <Play size={16} fill="white" />
           </div>
         )}
      </div>
      <div className="flex-grow min-w-0">
        <p className={`font-bold text-sm truncate ${active ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{track.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{track.genre}</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span className="text-[9px] font-bold text-blue-400/80">{track.mood}</span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className={`p-2 transition-all rounded-lg hover:bg-white/10 ${isFavorite ? 'text-rose-500' : 'text-slate-600 hover:text-slate-400'}`}
      >
        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </motion.div>
  );
};

export default MusicPlayerPage;