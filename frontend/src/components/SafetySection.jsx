import { motion } from "framer-motion";
import { ShieldCheck, Globe, Lock, Zap, Eye, AlertCircle } from "lucide-react";
import safetyHero from "../assets/safety_hero.png";
import safeBrowsing from "../assets/safe_browsing.png";

const SafetySection = () => {
  return (
    <section id="safety" className="relative py-32 overflow-hidden bg-slate-50/50">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30 px-6">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <ShieldCheck className="text-cyan-500" size={20} />
              <span className="text-cyan-600 font-extrabold uppercase tracking-[0.3em] text-[11px]">Advanced Security</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
            >
              Browsing that protects <br />
              <span className="text-indigo-600 italic">your integrity.</span>
            </motion.h2>
          </div>

          <motion.p
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm"
          >
            EduSync uses AI-driven intelligence to analyze every site in real-time, 
            detecting misinformation and toxic content before it hits your screen.
          </motion.p>
        </div>

        {/* --- Feature Block 1: AI Shield --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-40">
          
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 relative group"
          >
            <div className="absolute -inset-10 bg-cyan-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-4">
               {/* 3D Visual */}
               <img 
                 src={safetyHero} 
                 alt="Digital Protection Shield" 
                 className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-[2s]"
               />
               <div className="absolute bottom-10 left-10 text-white/40 flex items-center gap-3 text-[10px] font-mono tracking-widest">
                  <Zap size={14} className="text-cyan-400" /> SYSTEM.ACTIVE // THREAT_SCAN_RUNNING
               </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
               <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                  <Eye size={28} />
               </div>
               <h3 className="text-3xl font-black text-slate-800">AI-Powered misinformation Detection</h3>
               <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Our neural network scans the structure and language of articles you read, 
                  flagging potential fallacies and biases in real-time. It's not about 
                  blocking content—it's about empowering critical thinking.
               </p>
            </div>

            <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
               <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <AlertCircle size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-800">Real-time Verified</h4>
                  <p className="text-xs text-slate-400">99.9% accuracy in malicious URL detection.</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- Feature Block 2: Secure Hub --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-12">
            <div className="bg-slate-900/5 backdrop-blur-md rounded-[4rem] p-12 lg:p-20 border border-white/50 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
               
               <div className="flex-1 space-y-10 relative z-20">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Globe size={28} />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    A Global Safety Net <br /> 
                    <span className="text-indigo-600">for Modern Educators.</span>
                  </h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">
                    Every report from our community of students and admins feeds back into our 
                    safety engine. When one user reports a malicious site, millions are protected 
                    instantly across the entire network.
                  </p>
                  
                  <div className="flex gap-10">
                    <div>
                      <h5 className="text-[10px] uppercase tracking-[2.5px] font-bold text-indigo-500 mb-2">Network Scans</h5>
                      <p className="text-2xl font-black text-slate-800">2.4M+</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase tracking-[2.5px] font-bold text-indigo-500 mb-2">Safeguards</h5>
                      <p className="text-2xl font-black text-slate-800">180K+</p>
                    </div>
                  </div>
               </div>

               <motion.div 
                 initial={{ opacity: 0, x: 100 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, type: "spring" }}
                 className="flex-1 relative"
               >
                 <img 
                    src={safeBrowsing} 
                    alt="Global Security Map" 
                    className="w-full max-w-lg mx-auto drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-in slide-in-from-right-10 duration-1000"
                 />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
               </motion.div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default SafetySection;
