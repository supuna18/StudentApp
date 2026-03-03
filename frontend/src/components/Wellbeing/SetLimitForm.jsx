import React, { useState } from 'react';

const SetLimitForm = () => {
  const [domain, setDomain] = useState('');
  const [limitMinutes, setLimitMinutes] = useState('');
  const [loading, setLoading] = useState(false);

  const popularApps = [
    { name: 'Facebook', url: 'facebook.com', color: 'bg-blue-600', icon: 'f' },
    { name: 'YouTube', url: 'youtube.com', color: 'bg-red-600', icon: 'Y' },
    { name: 'Instagram', url: 'instagram.com', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', icon: 'I' },
    { name: 'TikTok', url: 'tiktok.com', color: 'bg-black', icon: 'T' },
    { name: 'Reddit', url: 'reddit.com', color: 'bg-orange-600', icon: 'R' },
    { name: 'X / Twitter', url: 'twitter.com', color: 'bg-slate-900', icon: 'X' },
  ];

  // Predefined Time Limits (විනාඩි වලින්)
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
      const response = await fetch('http://localhost:5000/api/wellbeing/limits', {
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
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Digital <span className="text-blue-600">Wellbeing</span> 🧘‍♂️
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Stay focused on your studies by limiting time on distracting websites.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tips Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200">
            <h3 className="text-xl font-bold mb-4">Focus Tip 💡</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              "Research shows that students who limit social media to 30 mins a day have 25% higher grades."
            </p>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Current Mode</span>
              <p className="text-lg font-black mt-1">Productivity Plus +</p>
            </div>
          </div>
          
          <div className="p-6 bg-slate-100 rounded-[2rem] border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2">Why set limits?</h4>
            <ul className="text-sm text-slate-600 space-y-2 font-medium">
              <li className="flex items-center gap-2 text-green-600">✓ Boost concentration</li>
              <li className="flex items-center gap-2 text-green-600">✓ Reduce eye strain</li>
              <li className="flex items-center gap-2 text-green-600">✓ Deep study focus</li>
            </ul>
          </div>
        </div>

        {/* Right Side: The Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-50">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* 1. Quick Select Apps */}
              <div>
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">
                  1. Choose Application
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {popularApps.map((app) => (
                    <button
                      key={app.url}
                      type="button"
                      onClick={() => setDomain(app.url)}
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl transition-all transform hover:scale-110 active:scale-90 shadow-lg ${app.color} ${domain === app.url ? 'ring-4 ring-offset-4 ring-blue-500' : 'opacity-80'}`}
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
                    className="w-full mt-4 pl-6 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-0 text-slate-900 font-bold transition-all outline-none"
                />
              </div>

              {/* 2. Time Selection Section */}
              <div className="space-y-6">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                  2. Set Daily Duration
                </label>
                
                {/* Time Presets (Chips) */}
                <div className="flex flex-wrap gap-3">
                  {timePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setLimitMinutes(preset.value.toString())}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
                        limitMinutes === preset.value.toString()
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Minutes Input */}
                <div className="relative group">
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Or enter custom minutes"
                      value={limitMinutes}
                      onChange={(e) => setLimitMinutes(e.target.value)}
                      className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-0 text-slate-900 font-bold transition-all outline-none"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">min</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[1.5rem] text-white font-black text-lg transition-all shadow-xl shadow-blue-100 transform active:scale-95 flex items-center justify-center gap-3 ${
                  loading 
                  ? 'bg-slate-300' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-300'
                }`}
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                ) : (
                  <>Activate Restriction <span className="text-2xl">🔒</span></>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetLimitForm;