import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Zap, Target, RefreshCw, Trophy, Clock, MousePointer2, Sparkles, ChevronLeft, Play, BarChart2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { staggeredChildren: 0.1, duration: 0.5 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  hover: { scale: 1.02, y: -8, transition: { duration: 0.3 } }
};

const FocusGamesPage = () => {
  // --- NAVIGATION STATE ---
  const [activeGame, setActiveGame] = useState(null); // null, 'memory', 'reaction', 'aim'

  // --- UTILS ---
  const emojis = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🥑', '🍔', '🍕', '🍦', '🍩'];

  // --- MEMORY GAME STATE ---
  const [difficulty, setDifficulty] = useState('Medium');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [memoryTimer, setMemoryTimer] = useState(0);
  const [memoryRunning, setMemoryRunning] = useState(false);

  // --- REACTION GAME STATE ---
  const [reactionStatus, setReactionStatus] = useState('waiting');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionHistory, setReactionHistory] = useState([]);
  const reactionTimeoutRef = useRef(null);

  // --- AIM TRAINER STATE ---
  const [aimPos, setAimPos] = useState({ top: 50, left: 50 });
  const [aimScore, setAimScore] = useState(0);
  const [aimClicks, setAimClicks] = useState(0);
  const [aimTimeLeft, setAimTimeLeft] = useState(30);
  const [aimActive, setAimActive] = useState(false);

  // --- CELEBRATION MODAL STATE ---
  const [showWinAlert, setShowWinAlert] = useState(false);
  const [winMessage, setWinMessage] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = async () => {
    const text = `🧠 I just crushed a Focus Session on EduSync!\n🏆 Result: ${winMessage}\nPlay now to train your brain! 🚀`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EduSync Focus Hub', text: text });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const loadStats = useCallback(() => {
    const data = JSON.parse(localStorage.getItem('focusGamesStats') || "{}");
    const today = new Date().toISOString().split('T')[0];
    if (!data[today]) data[today] = { memory: 0, reaction: 0, aim: 0 };
    
    setStatsData([
      { name: 'Memory', plays: data[today].memory || 0, color: '#8b5cf6' },
      { name: 'Reaction', plays: data[today].reaction || 0, color: '#3b82f6' },
      { name: 'Aim', plays: data[today].aim || 0, color: '#10b981' }
    ]);
  }, []);

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener('focusGamesUpdated', handleUpdate);
    return () => window.removeEventListener('focusGamesUpdated', handleUpdate);
  }, [loadStats]);

  const triggerWin = useCallback((msg, gameId) => {
    setWinMessage(msg);
    setShowWinAlert(true);

    if (gameId) {
      const today = new Date().toISOString().split('T')[0];
      const data = JSON.parse(localStorage.getItem('focusGamesStats') || "{}");
      if (!data[today]) data[today] = { memory: 0, reaction: 0, aim: 0 };
      data[today][gameId] = (data[today][gameId] || 0) + 1;
      localStorage.setItem('focusGamesStats', JSON.stringify(data));
      window.dispatchEvent(new Event('focusGamesUpdated'));
    }

    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }, []);

  // --- WIN WATCHERS ---
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length && !memoryRunning) {
      triggerWin(`Linked in ${memoryTimer}s with ${moves} moves!`, 'memory');
    }
  }, [matched.length, cards.length, memoryRunning, memoryTimer, moves, triggerWin]);

  useEffect(() => {
    if (reactionStatus === 'finished' && reactionHistory.length > 0) {
      triggerWin(`Awesome speed! Your reaction time was ${reactionHistory[0]}ms.`, 'reaction');
    }
  }, [reactionStatus, reactionHistory, triggerWin]);

  useEffect(() => {
    if (aimTimeLeft === 0 && !aimActive && aimClicks > 0) {
      triggerWin(`Great aim! You scored ${aimScore} hits with ${Math.round((aimScore / aimClicks) * 100)}% accuracy.`, 'aim');
      setAimClicks(0); // reset to prevent multiple triggers
    }
  }, [aimTimeLeft, aimActive, aimScore, aimClicks, triggerWin]);

  // --- LOGIC ---
  const memoryConfigs = {
    Easy: { pairs: 4, cols: 'grid-cols-4' },
    Medium: { pairs: 8, cols: 'grid-cols-4' },
    Hard: { pairs: 12, cols: 'grid-cols-6' }
  };

  const startMemory = useCallback(() => {
    const numPairs = memoryConfigs[difficulty].pairs;
    const selectedEmojis = emojis.slice(0, numPairs);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(deck);
    setMatched([]);
    setFlipped([]);
    setMoves(0);
    setMemoryTimer(0);
    setMemoryRunning(true);
  }, [difficulty]);

  useEffect(() => {
    if (activeGame === 'memory') startMemory();
    else setMemoryRunning(false);
  }, [activeGame, startMemory]);

  useEffect(() => {
    let interval;
    if (memoryRunning) {
      interval = setInterval(() => setMemoryTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [memoryRunning]);

  const handleCardClick = (idx) => {
    if (!memoryRunning || flipped.length === 2 || matched.includes(idx) || flipped.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        const newMatched = [...matched, ...newFlipped];
        setMatched(newMatched);
        if (newMatched.length === cards.length) setMemoryRunning(false);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  };

  const startReaction = () => {
    setReactionStatus('ready');
    const delay = Math.random() * 3000 + 2000;
    reactionTimeoutRef.current = setTimeout(() => {
      setReactionStartTime(performance.now());
      setReactionStatus('clicking');
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionStatus === 'ready') {
      clearTimeout(reactionTimeoutRef.current);
      setReactionStatus('early');
    } else if (reactionStatus === 'clicking') {
      const time = Math.round(performance.now() - reactionStartTime);
      setReactionHistory(prev => [time, ...prev].slice(0, 5));
      setReactionStatus('finished');
    } else startReaction();
  };

  const startAim = () => {
    setAimScore(0);
    setAimClicks(0);
    setAimTimeLeft(30);
    setAimActive(true);
    moveTarget();
  };

  const moveTarget = useCallback(() => {
    setAimPos({ top: Math.random() * 80 + 10, left: Math.random() * 80 + 10 });
  }, []);

  useEffect(() => {
    if (aimActive && aimTimeLeft > 0) {
      const timer = setInterval(() => setAimTimeLeft(t => t - 1), 1000);
      const moveInterval = setInterval(moveTarget, 1200);
      return () => { clearInterval(timer); clearInterval(moveInterval); };
    } else if (aimTimeLeft === 0) setAimActive(false);
  }, [aimActive, aimTimeLeft, moveTarget]);

  // --- RENDER HELPERS ---
  const renderDashboard = () => (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 md:space-y-12"
    >
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cognitive Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 leading-none">Focus Hub</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl leading-relaxed border-l-3 border-indigo-200 pl-4">
            Master your mind in a spacious, optimized environment.
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-2xl px-6 py-4 md:px-8 md:py-5 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-amber-50 rounded-2xl"><Trophy className="text-amber-500" size={28} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Focus Streak</p>
            <p className="text-xl md:text-2xl font-black text-slate-900">12 <span className="text-[10px] text-slate-400">DAYS</span></p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[
          { id: 'memory', title: 'Cognitive Link', icon: Brain, color: 'purple', text: 'Enhance pattern recognition.' },
          { id: 'reaction', title: 'Kinetic Burst', icon: Zap, color: 'blue', text: 'Sharpen reaction speed.' },
          { id: 'aim', title: 'Focus Vortex', icon: Target, color: 'emerald', text: 'Refine coordination.' }
        ].map((game) => (
          <motion.button
            key={game.id}
            variants={cardVariants}
            whileHover="hover"
            onClick={() => setActiveGame(game.id)}
            className="group bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg shadow-slate-200/40 border border-white flex flex-col items-start text-left relative overflow-hidden h-[280px] md:h-[300px]"
          >
            <div className={`p-3 md:p-4 bg-${game.color}-500 text-white rounded-2xl md:rounded-[1.5rem] shadow-lg shadow-${game.color}-100 mb-4 md:mb-6 transform group-hover:rotate-12 transition-transform duration-500`}>
              <game.icon size={28} />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2">{game.title}</h3>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-4 md:mb-6 flex-grow">{game.text}</p>
            <div className="w-full h-[1px] bg-slate-100 mb-4 md:mb-6" />
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">
              Enter Focus <ChevronLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-lg shadow-slate-200/40 border border-white mt-12 mb-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-500" />
         <div className="flex items-center gap-3 mb-6">
           <BarChart2 size={24} className="text-primary" />
           <div>
             <h3 className="text-lg md:text-xl font-black text-slate-800">Daily Play Analytics</h3>
             <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Completed Sessions</p>
           </div>
         </div>
         <div className="h-[250px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={statsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
               <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: '900', color: '#1e293b' }}
               />
               <Bar dataKey="plays" radius={[8, 8, 8, 8]} barSize={40}>
                 {statsData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>
    </motion.div>
  );

  const renderGame = () => {
    const isMemory = activeGame === 'memory';
    const isReaction = activeGame === 'reaction';
    const isAim = activeGame === 'aim';

    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`${isMemory ? 'max-w-2xl' : 'max-w-4xl'} mx-auto space-y-4 md:space-y-6`}
      >
        <button onClick={() => setActiveGame(null)} className="flex items-center gap-2 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-colors group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className={`bg-white/90 backdrop-blur-2xl ${isMemory ? 'p-5 md:p-8' : 'p-6 md:p-10'} rounded-3xl md:rounded-[3rem] shadow-xl shadow-indigo-100/30 border border-white relative overflow-hidden`}>
          {/* Compact Game Header */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between ${isMemory ? 'mb-4 md:mb-6' : 'mb-6 md:mb-8'} gap-4 md:gap-6`}>
            <div className="flex items-center gap-4 md:gap-6">
              <div className={`p-3 md:p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl md:rounded-[1.5rem] shadow-lg shadow-indigo-100 text-white`}>
                {isMemory && <Brain size={28} />}
                {isReaction && <Zap size={32} />}
                {isAim && <Target size={32} />}
              </div>
              <div>
                <h2 className={`${isMemory ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-black tracking-tighter leading-tight`}>
                  {isMemory && 'Cognitive Link'}
                  {isReaction && 'Kinetic Burst'}
                  {isAim && 'Focus Vortex'}
                </h2>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary">Optimized Focus Area</span>
              </div>
            </div>

            {isMemory && (
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 scale-75 md:scale-90 origin-left md:origin-right">
                {['Easy', 'Medium', 'Hard'].map(lvl => (
                  <button key={lvl} onClick={() => setDifficulty(lvl)} className={`px-4 py-1.5 text-[9px] md:text-[10px] font-black rounded-lg transition-all ${difficulty === lvl ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-primary'}`}>{lvl}</button>
                ))}
              </div>
            )}

            {isAim && (
              <div className="flex items-center gap-2 md:gap-3 bg-secondary/10 px-4 py-2 md:px-5 md:py-2.5 rounded-[1.2rem] border border-emerald-100 shadow-sm self-start md:self-auto">
                <Clock size={16} className="text-secondary" /><span className="text-lg md:text-xl font-black text-emerald-900 tabular-nums">{aimTimeLeft}s</span>
              </div>
            )}
          </div>

          {/* Optimized Game Body */}
          <div className={`${isMemory ? 'min-h-[250px] md:min-h-[300px]' : 'min-h-[350px] md:min-h-[400px]'} flex items-center justify-center`}>
            {isMemory && (
              <div className="w-full max-w-lg space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-[240px] md:max-w-xs mx-auto">
                  <div className="flex items-center justify-between px-4 py-2 bg-primary/10/50 rounded-xl border border-indigo-100/50 text-indigo-900">
                    <Clock size={16} /><span className="text-base md:text-lg font-black">{memoryTimer}s</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-purple-50/50 rounded-xl border border-purple-100/50 text-purple-900">
                    <RefreshCw size={16} /><span className="text-base md:text-lg font-black">{moves}</span>
                  </div>
                </div>
                <div className={`grid ${memoryConfigs[difficulty].cols} gap-2 max-w-md mx-auto`}>
                  {cards.map((card, i) => (
                    <motion.button
                      key={card.id}
                      onClick={() => handleCardClick(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square flex items-center justify-center text-3xl md:text-5xl rounded-lg md:rounded-xl transition-all duration-500 shadow-sm ${flipped.includes(i) || matched.includes(i) ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white' : 'bg-slate-50 border border-slate-100 text-transparent'}`}
                    >
                      {(flipped.includes(i) || matched.includes(i)) ? card.emoji : '?'}
                    </motion.button>
                  ))}
                </div>
                {matched.length === cards.length && cards.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 md:p-4 bg-secondary rounded-xl md:rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="text-center md:text-left"><h3 className="text-base md:text-lg font-black">Success!</h3><p className="text-[10px] md:text-xs opacity-90">Linked in {memoryTimer}s.</p></div>
                    <button onClick={startMemory} className="bg-white text-secondary px-5 py-1.5 md:px-6 md:py-2 rounded-lg font-black text-[10px] md:text-xs hover:scale-105 transition-transform">RETRY</button>
                  </motion.div>
                )}
              </div>
            )}

            {isReaction && (
              <div className="w-full max-w-lg space-y-6 md:space-y-8 flex flex-col items-center">
                <div className="flex gap-2 mb-2 md:mb-4">
                  {reactionHistory.map((h, i) => (
                    <div key={i} className="bg-primary/10/30 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-blue-100 text-center"><p className="text-[7px] md:text-[8px] font-black text-blue-300 uppercase">Last</p><p className="text-xs md:text-sm font-black text-blue-900">{h}ms</p></div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReactionClick}
                  className={`w-full aspect-[16/9] rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${reactionStatus === 'waiting' ? 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-100' :
                      reactionStatus === 'ready' ? 'bg-amber-50 text-amber-500 border-2 border-amber-200' :
                        reactionStatus === 'clicking' ? 'bg-secondary text-white' :
                          reactionStatus === 'early' ? 'bg-rose-500 text-white' :
                            'bg-primary text-white'
                    }`}
                >
                  <p className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tight">
                    {reactionStatus === 'waiting' && 'START'} {reactionStatus === 'ready' && 'WAIT'} {reactionStatus === 'clicking' && 'CLICK'} {reactionStatus === 'early' && 'EARLY'} {reactionStatus === 'finished' && `${reactionHistory[0]}ms`}
                  </p>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                    {reactionStatus === 'waiting' && 'Initialize'} {reactionStatus === 'ready' && 'Detecting'} {reactionStatus === 'finished' && 'Reset'}
                  </p>
                </motion.button>
              </div>
            )}

            {isAim && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="relative w-full h-[350px] md:h-[400px] bg-slate-900/[0.03] rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-100 overflow-hidden flex items-center justify-center p-4" onClick={() => aimActive && setAimClicks(c => c + 1)}>
                  <AnimatePresence mode="wait">
                    {!aimActive ? (
                      <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
                        {aimTimeLeft === 0 && (
                          <div className="mb-4 bg-white/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-emerald-50 shadow-emerald-100/20">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase mb-2">Results</p>
                            <h3 className="text-4xl md:text-5xl font-black text-emerald-950">{aimScore}</h3>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400">Hits | {Math.round((aimScore / aimClicks) * 100)}% Acc</p>
                          </div>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); startAim(); }} className="bg-secondary text-white px-8 py-3.5 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 md:gap-3">
                          <Sparkles size={20} /> {aimTimeLeft === 30 ? 'START' : 'RETRY'}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        layoutId="target" key={aimScore}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); setAimScore(s => s + 1); setAimClicks(c => c + 1); moveTarget(); }}
                        className="absolute w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border-4 md:border-[6px] border-secondary active:scale-90"
                        style={{ top: `${aimPos.top}%`, left: `${aimPos.left}%` }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-6 lg:p-8 font-sans text-slate-900 relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-50 rounded-full blur-[80px] -ml-16 -mb-16" />
      </div>

      <div className="w-full max-w-[1200px] relative z-10 py-4 md:py-8">
        <AnimatePresence mode="wait">
          {activeGame ? renderGame() : renderDashboard()}
        </AnimatePresence>
      </div>

      {/* --- CELEBRATION MODAL --- */}
      <AnimatePresence>
        {showWinAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          >
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-sm border-4 border-indigo-50">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner border border-amber-200 animate-bounce">
                🏆
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Good Job!</h2>
              <p className="text-slate-500 font-bold mb-8 px-4 leading-relaxed">{winMessage}</p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary/10 text-primary border border-indigo-100 rounded-2xl font-black tracking-widest hover:bg-primary/10 active:scale-95 transition-all text-sm uppercase"
                >
                  <Share2 size={18} /> {copySuccess ? 'Copied to Clipboard!' : 'Share Result'}
                </button>
                <button
                  onClick={() => setShowWinAlert(false)}
                  className="w-full py-4 bg-primary outline-none text-white rounded-2xl font-black tracking-widest shadow-xl shadow-indigo-200 hover:bg-primary active:scale-95 transition-all text-sm uppercase"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusGamesPage;

