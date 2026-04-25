import { motion } from "framer-motion";
import { ShieldCheck, Globe, Lock, Zap, Eye, AlertCircle } from "lucide-react";
import safetyHero from "../assets/safety_hero.png";
import safeBrowsing from "../assets/safe_browsing.png";

const SafetySection = () => {
  return (
    <section id="safety" className="relative py-32 overflow-hidden bg-slate-50/50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .safety-root { font-family: 'DM Sans', sans-serif; }
        .safety-heading { font-family: 'DM Serif Display', serif; }
      `}</style>
      <div className="safety-root">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30 px-6">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <ShieldCheck className="text-cyan-500" size={20} />
              <span className="text-cyan-600 font-extrabold uppercase tracking-[0.3em] text-[10px] md:text-[11px]">Advanced Security</span>
            </motion.div>
            
              <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="safety-heading text-3xl md:text-6xl font-normal text-slate-900 leading-[1.2] md:leading-[1.1] tracking-tight"
            >
              Browsing that protects <br className="hidden md:block" />
              <em className="text-primary">your integrity.</em>
            </motion.h2>
          </div>

          <motion.p
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-sm"
          >
            EduSync uses AI-driven intelligence to analyze every site in real-time, 
            detecting misinformation and toxic content before it hits your screen.
          </motion.p>
        </div>

        {/* --- Feature Block 1: AI Shield --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center mb-24 md:mb-40">
          
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 relative group"
          >
            <div className="absolute -inset-10 bg-cyan-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative rounded-[2rem] md:rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-4">
               {/* 3D Visual */}
               <img 
                 src={safetyHero} 
                 alt="Digital Protection Shield" 
                 className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-[2s]"
               />
               <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white/40 flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-mono tracking-widest">
                  <Zap size={12} className="text-cyan-400" /> SYSTEM.ACTIVE // THREAT_SCAN_RUNNING
               </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
               <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-50 text-cyan-600 rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center shadow-sm">
                  <Eye size={24} md:size={28} />
               </div>
               <h3 className="safety-heading text-2xl md:text-3xl font-normal text-slate-800">AI-Powered Misinformation Detection</h3>
               <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                  Our neural network scans the structure and language of articles you read, 
                  flagging potential fallacies and biases in real-time. It's not about 
                  blocking content—it's about empowering critical thinking.
               </p>
            </div>

            <div className="flex items-center gap-4 p-4 md:p-5 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
               <div className="bg-amber-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-amber-600">
                  <AlertCircle size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-800">Real-time Verified</h4>
                  <p className="text-[11px] md:text-xs text-slate-400">99.9% accuracy in malicious URL detection.</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- Feature Block 2: Secure Hub --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-12">
            <div className="bg-slate-900/5 backdrop-blur-md rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 lg:p-20 border border-white/50 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 md:gap-16">
               
               <div className="flex-1 space-y-8 md:space-y-10 relative z-20">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Globe size={24} md:size={28} />
                  </div>
                  <h3 className="safety-heading text-2xl md:text-4xl font-normal text-slate-900 tracking-tight leading-tight">
                    A Global Safety Net <br className="hidden md:block" /> 
                    <em className="text-primary">for Modern Educators.</em>
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    Every report from our community of students and admins feeds back into our 
                    safety engine. When one user reports a malicious site, millions are protected 
                    instantly across the entire network.
                  </p>
                  
                  <div className="flex gap-8 md:gap-10">
                    <div>
                      <h5 className="text-[9px] md:text-[10px] uppercase tracking-[2.5px] font-bold text-primary mb-2">Network Scans</h5>
                      <p className="text-xl md:text-2xl font-black text-slate-800">2.4M+</p>
                    </div>
                    <div>
                      <h5 className="text-[9px] md:text-[10px] uppercase tracking-[2.5px] font-bold text-primary mb-2">Safeguards</h5>
                      <p className="text-xl md:text-2xl font-black text-slate-800">180K+</p>
                    </div>
                  </div>
               </div>

               <motion.div 
                 initial={{ opacity: 0, x: 100 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, type: "spring" }}
                 className="flex-1 relative w-full"
               >
                 <img 
                    src={safeBrowsing} 
                    alt="Global Security Map" 
                    className="w-full max-w-[320px] md:max-w-lg mx-auto drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-in slide-in-from-right-10 duration-1000"
                 />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[120px] rounded-full -z-10" />
               </motion.div>

            </div>
          </div>

        </div>

      </div>
      </div>
    </section>
  );
};

export default SafetySection;


