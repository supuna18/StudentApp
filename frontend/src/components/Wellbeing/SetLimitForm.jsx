import React, { useState, useEffect } from 'react';
import UsageChart from './UsageChart';
import UsagePieChart from './UsagePieChart';
import { motion } from 'framer-motion';

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
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 z-50 p-4 rounded-3xl shadow-2xl transition-all duration-300 backdrop-blur-sm border-4 ${
          darkMode
            ? 'bg-slate-800 text-blue-300 border-slate-600'
            : 'bg-white text-blue-700 border-blue-200 shadow-blue-200/50'
        }`}
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      <div className={`min-h-screen py-10 px-4 transition-all duration-500 ${
        darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {/* 1. Header Section */}
        <div className="max-w-6xl mx-auto mb-10 text-left">
          <h1 className="text-5xl font-black tracking-tight mb-4">
            Digital <span className="text-blue-600">Wellbeing</span> 🧘‍♂️
          </h1>
          <p className="text-xl font-medium opacity-70">
            Stay focused on your studies by limiting time on distracting websites.
          </p>
        </div>

        {/* 2. Main Content Grid (Tips + Form) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-blue-600 text-white'}`}>
              <h3 className="text-2xl font-black mb-4">💡 Focus Tip</h3>
              <p className="text-lg opacity-90">Set limits to boost concentration and reduce digital eye strain.</p>
            </div>
            
            <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-blue-100'}`}>
              <h4 className="font-bold mb-4">Why set limits?</h4>
              <ul className="space-y-2 opacity-80 font-medium">
                <li>✓ Boost concentration</li>
                <li>✓ Reduce eye strain</li>
                <li>✓ Deep study focus</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`p-10 rounded-[2.5rem] shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* App Selection */}
                <div>
                  <label className="text-sm font-black uppercase tracking-widest block mb-4 opacity-60">1. Choose Application</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                    {popularApps.map((app) => (
                      <button
                        key={app.url}
                        type="button"
                        onClick={() => setDomain(app.url)}
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-black transition-all ${app.color} ${domain === app.url ? 'ring-4 ring-blue-500 ring-offset-4' : 'opacity-80 hover:opacity-100'}`}
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
                    className={`w-full p-5 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}
                  />
                </div>

                {/* Time Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest block opacity-60">2. Set Daily Duration</label>
                  <div className="flex flex-wrap gap-3">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setLimitMinutes(preset.value.toString())}
                        className={`px-6 py-3 rounded-full font-bold transition-all ${limitMinutes === preset.value.toString() ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Custom Minutes"
                    value={limitMinutes}
                    onChange={(e) => setLimitMinutes(e.target.value)}
                    className={`w-full p-5 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {loading ? "Activating..." : "Activate Restriction 🔒"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 3. Analysis Charts Section (බාර් චාර්ට් සහ පයි චාර්ට්) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <UsageChart />
            <UsagePieChart />
        </div>

      </div> {/* මුළු Content එකම වහන ප්‍රධාන Div එක */}
    </>
  );
};

export default SetLimitForm;