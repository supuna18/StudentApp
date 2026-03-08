import React, { useState, useEffect } from 'react';

const SetLimitForm = () => {
  const [domain, setDomain] = useState('');
  const [limitMinutes, setLimitMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const popularApps = [
    { name: 'Facebook', url: 'facebook.com', color: 'bg-blue-500 dark:bg-blue-400', icon: 'f' },
    { name: 'YouTube', url: 'youtube.com', color: 'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-400 dark:to-red-500', icon: 'Y' },
    { name: 'Instagram', url: 'instagram.com', color: 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-300 dark:to-purple-400', icon: 'I' },
    { name: 'TikTok', url: 'tiktok.com', color: 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700', icon: 'T' },
    { name: 'Reddit', url: 'reddit.com', color: 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500', icon: 'R' },
    { name: 'X / Twitter', url: 'twitter.com', color: 'bg-gray-900 dark:bg-gray-800', icon: 'X' },
  ];

  const timePresets = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newLimit = {
      userId: "user123", 
      domain: domain.toLowerCase().trim(),
      limitMinutes: parseInt(limitMinutes)
    };

    try {
      const response = await fetch('http://localhost:5005/api/wellbeing/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit)
      });

      if (response.ok) {
        alert("Success! Your focus session is now secured. 🛡️");
        setDomain('');
        setLimitMinutes('');
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Backend Error: Please check if your server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* Dark mode toggle - Fixed top right */}
    <button
      onClick={toggleDarkMode}
      className={`fixed top-6 right-6 z-50 p-4 rounded-3xl shadow-2xl transition-all duration-300 backdrop-blur-sm border-4 ${
        darkMode
          ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-blue-300 border-slate-600 shadow-slate-900/50 hover:shadow-slate-800/60 hover:scale-105 active:scale-95'
          : 'bg-gradient-to-r from-white to-blue-50 text-blue-700 border-blue-200 shadow-blue-200/50 hover:shadow-blue-300/60 hover:scale-105 active:scale-95'
      }`}
      title="Toggle Dark Mode"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>

    <div className={`min-h-screen py-10 px-4 animate-in fade-in duration-1000 transition-all duration-500 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950'
        : 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100'
    }`}>
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-10 text-left">
        <h1 className={`text-5xl lg:text-6xl font-black tracking-tight mb-4 transition-all duration-500 ${
          darkMode
            ? 'bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl'
            : 'bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-700 bg-clip-text text-transparent'
        }`}>
          Digital <span className="text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text">Wellbeing</span> 🧘‍♂️
        </h1>
        <p className={`text-xl max-w-2xl transition-colors duration-300 font-medium ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Stay focused on your studies by limiting time on distracting websites.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tips Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-sm border-4 transition-all duration-500 ${
            darkMode
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 shadow-slate-900/50 border-slate-700/50 text-slate-100'
              : 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-blue-200/50 border-white/20 text-white'
          }`}>
            <h3 className={`text-2xl font-black mb-6 flex items-center gap-3 transition-colors ${
              darkMode ? 'text-slate-200' : 'text-white'
            }`}>
              <span className="text-2xl">💡</span> Focus Tip
            </h3>
            <p className={`text-lg leading-relaxed mb-8 opacity-95 transition-colors ${
              darkMode ? 'text-slate-300' : 'text-blue-50'
            }`}>
              Research shows that students who limit social media to 30 mins a day have 25% higher grades.
            </p>
            <div className={`p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
              darkMode
                ? 'bg-slate-700/50 border-slate-600/50'
                : 'bg-white/20 border border-white/30'
            }`}>
              <span className={`text-sm font-bold uppercase tracking-widest block mb-2 transition-colors ${
                darkMode ? 'text-slate-400' : 'opacity-80 text-white'
              }`}>
                Current Mode
              </span>
              <p className={`text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent ${
                darkMode ? 'drop-shadow-lg' : ''
              }`}>
                Productivity Plus
              </p>
            </div>
          </div>
          
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-sm border-2 transition-all duration-500 ${
            darkMode
              ? 'bg-slate-800/70 shadow-slate-900/50 border-slate-700 text-slate-200'
              : 'bg-white/70 shadow-blue-100/50 border-blue-100'
          }`}>
            <h4 className={`text-2xl font-black mb-6 transition-colors ${
              darkMode ? 'text-slate-100' : 'text-blue-900'
            }`}>
              Why set limits?
            </h4>
            <ul className="text-lg space-y-4 font-semibold">
              <li className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  : 'bg-gradient-to-r from-blue-100 to-sky-100 text-slate-700 hover:shadow-md hover:shadow-blue-200/50'
              }`}>
                <span className={`text-xl transition-colors ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  ✓
                </span>
                Boost concentration
              </li>
              <li className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  : 'bg-gradient-to-r from-blue-100 to-sky-100 text-slate-700 hover:shadow-md hover:shadow-blue-200/50'
              }`}>
                <span className={`text-xl transition-colors ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  ✓
                </span>
                Reduce eye strain
              </li>
              <li className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  : 'bg-gradient-to-r from-blue-100 to-sky-100 text-slate-700 hover:shadow-md hover:shadow-blue-200/50'
              }`}>
                <span className={`text-xl transition-colors ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  ✓
                </span>
                Deep study focus
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: The Form Card */}
        <div className="lg:col-span-2">
          <div className={`backdrop-blur-sm p-12 rounded-4xl shadow-2xl border-2 transition-all duration-500 ${
            darkMode
              ? 'bg-slate-800/80 shadow-slate-900/50 border-slate-700/50'
              : 'bg-white/80 shadow-blue-200/50 border-blue-100'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* 1. Quick Select Apps */}
              <div>
                <label className={`text-sm font-black uppercase tracking-widest block mb-6 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 px-6 py-3 rounded-full inline-flex items-center gap-3 w-fit text-white shadow-lg transition-all ${
                  darkMode ? 'shadow-slate-900/50 hover:shadow-slate-800/60 hover:scale-102' : 'shadow-blue-300/50 hover:shadow-blue-400/60 hover:scale-102'
                }`}>
                  <span className="w-2.5 h-2.5 bg-white rounded-full shadow-md"></span>
                  1. Choose Application
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                  {popularApps.map((app) => (
                    <button
                      key={app.url}
                      type="button"
                      onClick={() => setDomain(app.url)}
                      className={`h-16 w-16 rounded-3xl flex items-center justify-center text-white font-black text-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 backdrop-blur-sm ${app.color} ${domain === app.url ? 'ring-8 ring-blue-400/60 ring-offset-4 dark:ring-offset-slate-900 ring-offset-blue-50 scale-105 shadow-3xl' : 'hover:shadow-blue-300/50 hover:shadow-slate-800/50 dark:hover:shadow-slate-700/50 opacity-95'}`}
                      title={app.name}
                    >
                      {app.icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Or type URL (e.g., netflix.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className={`w-full pl-6 pr-6 py-5 border-2 rounded-3xl font-bold text-lg shadow-inner transition-all outline-none focus:ring-4 focus:shadow-2xl ${
                    darkMode
                      ? 'bg-slate-700/80 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500/80 focus:ring-blue-500/40 focus:bg-slate-700 hover:border-slate-500/70 hover:shadow-slate-700/30'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 text-slate-900 focus:border-blue-400 focus:ring-blue-200/50 focus:bg-white hover:shadow-md hover:border-blue-300/70'
                  }`}
                />
              </div>

              {/* 2. Time Selection Section */}
              <div className="space-y-6">
                <label className={`text-sm font-black uppercase tracking-widest block bg-gradient-to-r from-blue-500/80 to-indigo-500/80 px-6 py-3 rounded-full inline-flex items-center gap-3 w-fit text-white shadow-lg transition-all ${
                  darkMode ? 'shadow-slate-900/50 hover:shadow-slate-800/60 hover:scale-102' : 'shadow-blue-300/50 hover:shadow-blue-400/60 hover:scale-102'
                }`}>
                  <span className="w-2.5 h-2.5 bg-white rounded-full shadow-md"></span>
                  2. Set Daily Duration
                </label>
                
                {/* Time Presets (Chips) */}
                <div className="flex flex-wrap gap-4">
                  {timePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setLimitMinutes(preset.value.toString())}
                      className={`px-8 py-4 rounded-3xl text-base font-black transition-all duration-300 shadow-xl border-4 backdrop-blur-sm ${
                        limitMinutes === preset.value.toString()
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-blue-400/60 hover:shadow-blue-500/70 scale-105'
                          : darkMode
                            ? 'bg-slate-700/80 border-slate-600 text-slate-300 hover:border-blue-500/60 hover:text-blue-300 hover:bg-slate-700 hover:shadow-slate-600/50'
                            : 'bg-white/80 border-blue-200 text-blue-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-200/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Minutes Input */}
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Or enter custom minutes"
                    value={limitMinutes}
                    onChange={(e) => setLimitMinutes(e.target.value)}
                    className={`w-full pl-6 pr-20 py-5 border-2 rounded-3xl font-bold text-lg shadow-inner transition-all outline-none focus:ring-4 focus:shadow-2xl ${
                      darkMode
                        ? 'bg-slate-700/80 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500/80 focus:ring-blue-500/40 focus:bg-slate-700 hover:border-slate-500/70 hover:shadow-slate-700/30'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 text-slate-900 focus:border-blue-400 focus:ring-blue-200/50 focus:bg-white hover:shadow-md hover:border-blue-300/70'
                    }`}
                  />
                  <span className={`absolute right-6 top-1/2 -translate-y-1/2 font-black text-lg transition-colors ${
                    darkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}>
                    min
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group w-full py-8 rounded-3xl text-white font-black text-xl transition-all duration-300 shadow-2xl shadow-blue-300/40 active:scale-[0.98] flex items-center justify-center gap-4 backdrop-blur-sm border-4 border-transparent ${
                  loading 
                    ? 'cursor-not-allowed' 
                    : 'hover:shadow-3xl hover:shadow-blue-400/60 hover:scale-[1.02]'
                } ${darkMode ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-blue-900 shadow-slate-900/50' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-blue-200 hover:shadow-blue-300/60 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700'}`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></span>
                    Activating...
                  </>
                ) : (
                  <>
                    Activate Restriction <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🔒</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SetLimitForm;
