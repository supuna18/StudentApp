import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Monitor } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden bg-slate-900 font-sans">
      {/* Background Image with Dark Professional Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sliit-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      <div className="container mx-auto px-12 z-10">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl text-left"
        >
          <div className="flex items-center gap-2 mb-6 bg-blue-500/20 w-fit px-4 py-1 rounded-full border border-blue-400/30">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-xs font-bold tracking-widest text-blue-300 uppercase">
              Digital Wellbeing for Students
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
            Master Your <br />
            <span className="text-blue-500 italic">Focus.</span>
          </h1>

          <p className="text-xl text-blue-50/70 mb-10 leading-relaxed max-w-lg font-medium">
            Stop mindless scrolling and start meaningful learning. EduSync helps you manage screen time, 
            block distractions, and collaborate with peers—all in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-900/50">
              Start Focusing <ArrowRight size={20} />
            </button>
            <button className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Monitor size={20} /> Install Extension
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;