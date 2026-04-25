import { motion } from "framer-motion";
import { Play, Sparkles, Brain, Clock } from "lucide-react";
import wellbeingHero from "../assets/wellbeing_hero.png";
import mindfulBreak from "../assets/mindful_break.png";

const WellbeingSection = () => {
  return (
    <section id="wellbeing" className="relative py-24 overflow-hidden bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .wb-root { font-family: 'DM Sans', sans-serif; }
        .wb-heading { font-family: 'DM Serif Display', serif; }
      `}</style>
      <div className="wb-root">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="text-primary" size={18} />
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Digital Wellbeing</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="wb-heading text-3xl md:text-6xl font-normal text-slate-900 leading-[1.2] md:leading-[1.1] mb-6 tracking-tight"
          >
            Nurture your mind in a <br className="md:hidden" /><em className="text-primary">distracted world.</em>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base md:text-xl font-medium leading-relaxed"
          >
            EduSync goes beyond productivity. We build tools that protect your mental space, 
            encourage deep focus, and remind you to breathe.
          </motion.p>
        </div>

        {/* --- Media/Content Grid 1 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative group order-1"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-transparent rounded-[2rem] md:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video lg:aspect-square flex items-center justify-center bg-slate-50">
              <img 
                src={wellbeingHero} 
                alt="Serene Workspace" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white shadow-2xl group/btn"
              >
                <Play fill="currentColor" size={20} className="ml-1 group-hover/btn:text-primary transition-colors" />
              </motion.button>
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 p-3 md:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl">
                <p className="text-white font-bold text-[10px] md:text-sm tracking-wide">VIDEO: Creating a Focus Sanctuary (2:45)</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6 md:space-y-8 order-2">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Brain size={24} />
              </div>
              <h3 className="wb-heading text-2xl md:text-3xl font-normal text-slate-800 tracking-tight">Psychology-Backed Focus</h3>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                Our features are designed using cognitive load theory to minimize context switching. 
                By silencing non-essential notifications and gently nudging you back to your tasks, 
                EduSync helps you enter the 'flow state' faster and stay there longer.
              </p>
            </div>
            
            <ul className="space-y-3 md:space-y-4">
              {['Smart Notification Filtering', 'Context-Aware Focus Modes', 'Visual Decluttering Tools'].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-3 text-slate-700 font-bold text-sm md:text-base"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Media/Content Grid 2 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="wb-heading text-2xl md:text-3xl font-normal text-slate-800 tracking-tight">The Art of the Mindful Break</h3>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                Research shows that short, structured breaks significantly boost long-term retention 
                and prevent burnout. EduSync intelligently tracks your intensity and suggests the 
                perfect moment for a 5-minute cognitive reset.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors text-center">
                <h4 className="text-primary font-black text-xl md:text-2xl mb-1">20%</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Productivity Boost</p>
              </div>
              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors text-center">
                <h4 className="text-primary font-black text-xl md:text-2xl mb-1">45m</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Avg. Focus Session</p>
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
            <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-100 to-transparent rounded-[2rem] md:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video lg:aspect-square bg-primary/10 flex items-center justify-center p-6 md:p-12">
               <img 
                src={mindfulBreak} 
                alt="Mindful Breaks" 
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>

      </div>
      </div>
    </section>
  );
};

export default WellbeingSection;


