import { motion } from "framer-motion";
import { Play, Sparkles, Brain, Clock } from "lucide-react";
import wellbeingHero from "../assets/wellbeing_hero.png";
import mindfulBreak from "../assets/mindful_break.png";

const WellbeingSection = () => {
  return (
    <section id="wellbeing" className="relative py-24 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-indigo-50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="text-blue-500" size={18} />
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Digital Wellbeing</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight"
          >
            Nurture your mind in a <span className="text-blue-600 italic">distracted world.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed"
          >
            EduSync goes beyond productivity. We build tools that protect your mental space, 
            encourage deep focus, and remind you to breathe.
          </motion.p>
        </div>

        {/* --- Media/Content Grid 1 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video lg:aspect-square flex items-center justify-center bg-slate-50">
              <img 
                src={wellbeingHero} 
                alt="Serene Workspace" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white shadow-2xl group/btn"
              >
                <Play fill="currentColor" size={24} className="ml-1 group-hover/btn:text-blue-500 transition-colors" />
              </motion.button>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <p className="text-white font-bold text-sm tracking-wide">VIDEO: Creating a Focus Sanctuary (2:45)</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Brain size={24} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Psychology-Backed Focus</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Our features are designed using cognitive load theory to minimize context switching. 
                By silencing non-essential notifications and gently nudging you back to your tasks, 
                EduSync helps you enter the 'flow state' faster and stay there longer.
              </p>
            </div>
            
            <ul className="space-y-4">
              {['Smart Notification Filtering', 'Context-Aware Focus Modes', 'Visual Decluttering Tools'].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-3 text-slate-700 font-bold"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Media/Content Grid 2 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">The Art of the Mindful Break</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Research shows that short, structured breaks significantly boost long-term retention 
                and prevent burnout. EduSync intelligently tracks your intensity and suggests the 
                perfect moment for a 5-minute cognitive reset.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors">
                <h4 className="text-indigo-600 font-black text-2xl mb-1">20%</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Productivity Boost</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors">
                <h4 className="text-indigo-600 font-black text-2xl mb-1">45m</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg. Focus Session</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="order-1 lg:order-2 relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-100 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video lg:aspect-square bg-indigo-50 flex items-center justify-center p-8 lg:p-12">
               <img 
                src={mindfulBreak} 
                alt="Mindful Breaks" 
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default WellbeingSection;
