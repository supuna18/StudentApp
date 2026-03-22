import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Sparkles, Heart, Music2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const MusicPlayerPage = () => {
  const navigate = useNavigate();
  
  // සියලුම සංගීත ලැයිස්තුව
  const allTracks = [
    { id: 1, title: "Lofi Girl - Study Radio", url: "https://www.youtube.com/embed/jfKfPfyJRdk", genre: "Lo-fi", mood: "Focused" },
    { id: 2, title: "Quiet Night - Chill Piano", url: "https://www.youtube.com/embed/7NOSDKb0HlU", genre: "Piano", mood: "Calm" },
    { id: 3, title: "Tropical Rain & Thunder", url: "https://www.youtube.com/embed/H0GkP29s2z0", genre: "Nature", mood: "Relaxed" },
    { id: 4, title: "Synthwave for Coding", url: "https://www.youtube.com/embed/4xDzrJKXOOY", genre: "Electronic", mood: "Energetic" },
    { id: 5, title: "Deep Focus White Noise", url: "https://www.youtube.com/embed/nMfPq_0G568", genre: "Nature", mood: "Focused" },
    { id: 6, title: "Quantum Focus", url: "https://www.youtube.com/embed/K-pj0mMYi9o9vx18", genre: "Electroic", mood: "Focused" }
  ];

  // States
  const [selectedVideo, setSelectedVideo] = useState(allTracks[0].url);
  const [showForm, setShowForm] = useState(false);
  const [preferences, setPreferences] = useState({ genres: [], mood: "" });
  const [errors, setErrors] = useState({});
  const [suggestedTracks, setSuggestedTracks] = useState(allTracks);
  
  // New State for Favorites
  const [favorites, setFavorites] = useState([]);

  // Heart Toggle Logic
  const toggleFavorite = (track) => {
    if (favorites.find(fav => fav.id === track.id)) {
      setFavorites(favorites.filter(fav => fav.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  // --- FORM VALIDATION ---
  const validateForm = () => {
    let newErrors = {};
    if (preferences.genres.length === 0) newErrors.genres = "Select at least one music genre.";
    if (preferences.genres.length > 3) newErrors.genres = "You can select a maximum of 3 genres only.";
    if (!preferences.mood) newErrors.mood = "Please select your current mood.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const filtered = allTracks.filter(track => 
        preferences.genres.includes(track.genre) || track.mood === preferences.mood
      );
      setSuggestedTracks(filtered.length > 0 ? filtered : allTracks);
      setShowForm(false);
      alert("Your preferences have been saved! Now the music list has been tailored to suit you. ✨");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40"
        >
          <Sparkles size={20} /> {showForm ? "Close Form" : "Personalize My Beats"}
        </button>
      </div>

      {showForm && (
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-blue-900/20 to-slate-900/40 border border-blue-500/30 p-10 rounded-[3rem] backdrop-blur-md animate-in fade-in slide-in-from-top-5 duration-500">
          <h3 className="text-3xl font-black mb-2 text-blue-400 flex items-center gap-3"><Music2 /> Music Preferences</h3>
          <p className="text-slate-400 mb-8 font-medium italic">Better insights mean better suggestions for your focus session.</p>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <p className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight">Favorite Genres (1-3):</p>
              <div className="flex flex-wrap gap-4">
                {["Lo-fi", "Piano", "Nature", "Electronic"].map(g => (
                  <label key={g} className={`px-8 py-4 rounded-[2rem] cursor-pointer border-2 transition-all font-black text-sm tracking-wider uppercase ${preferences.genres.includes(g) ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <input type="checkbox" className="hidden" onChange={() => {
                      const newGenres = preferences.genres.includes(g) ? preferences.genres.filter(i => i !== g) : [...preferences.genres, g];
                      setPreferences({...preferences, genres: newGenres});
                    }} />
                    {g}
                  </label>
                ))}
              </div>
              {errors.genres && <p className="text-red-400 text-sm mt-3 font-bold flex items-center gap-2 animate-pulse"><AlertCircle size={16}/> {errors.genres}</p>}
            </div>

            <div>
              <p className="text-lg font-bold mb-4 tracking-tight">Your Current Mood:</p>
              <select 
                value={preferences.mood}
                className="bg-white/5 border-2 border-white/10 p-5 rounded-[2rem] w-full max-w-sm focus:border-blue-500 outline-none transition-all font-bold"
                onChange={(e) => setPreferences({...preferences, mood: e.target.value})}
              >
                <option value="" className="bg-[#020617]">-- How do you feel? --</option>
                <option value="Focused" className="bg-[#020617]">Deep Focus Required 🧠</option>
                <option value="Calm" className="bg-[#020617]">Feeling Calm & Peace 😌</option>
                <option value="Relaxed" className="bg-[#020617]">Ready to Relax 🌿</option>
                <option value="Energetic" className="bg-[#020617]">Need Energy Boost ⚡</option>
              </select>
              {errors.mood && <p className="text-red-400 text-sm mt-3 font-bold flex items-center gap-2 animate-pulse"><AlertCircle size={16}/> {errors.mood}</p>}
            </div>

            <button type="submit" className="bg-white text-blue-950 px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-100 transition-all flex items-center gap-3">
              <Save size={20} /> APPLY & PERSONALIZE
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
        <div className="lg:col-span-8">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.15)] border border-white/10 bg-black">
            <iframe width="100%" height="100%" src={selectedVideo + "?autoplay=1&modestbranding=1&rel=0"} title="Music Player" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">Immersive Beats</h2>
              <p className="text-slate-500 font-medium">Your sanctuary for undistracted studying.</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500">
              <CheckCircle2 size={32} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Suggestions */}
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-blue-400"><Sparkles size={24} /> Suggestions</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {suggestedTracks.map((track) => (
                <div key={track.id} className={`p-4 rounded-[2rem] flex items-center gap-4 border ${selectedVideo === track.url ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-transparent'}`}>
                  <div className="cursor-pointer flex-grow" onClick={() => setSelectedVideo(track.url)}>
                    <p className="font-bold text-sm">{track.title}</p>
                  </div>
                  <button onClick={() => toggleFavorite(track)} className={`p-2 transition-all ${favorites.find(f => f.id === track.id) ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}>
                    <Heart size={20} fill={favorites.find(f => f.id === track.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Favorites List */}
          <div className="bg-white/5 p-8 rounded-[3rem] border border-pink-500/20 backdrop-blur-sm">
            <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-pink-500"><Heart size={22} /> My Favorites</h3>
            {favorites.length === 0 ? <p className="text-slate-500 text-sm">No favorites added yet.</p> :
              <div className="space-y-2">
                {favorites.map(fav => (
                  <div key={fav.id} className="bg-pink-900/20 px-4 py-3 rounded-xl border border-pink-500/20 text-sm font-bold text-pink-200">
                    {fav.title}
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;