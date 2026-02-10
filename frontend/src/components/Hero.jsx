import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sliit-bg.jpg')" }} // public folder එකේ තියෙන රූපය
      >
        {/* Blue Gradient Overlay - මේකෙන් තමයි professional look එක එන්නේ */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-transparent" />
      </div>

      <div className="container mx-auto px-8 z-10 grid md:grid-cols-2 gap-10 items-center">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-[0.2em] text-blue-300 uppercase border-l-2 border-blue-500"
          >
            Unified Sports Management
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1]">
            Elevating <br />
            <span className="text-blue-400">University Athletics</span>
          </h1>

          <p className="text-lg text-blue-50/80 mb-10 leading-relaxed max-w-lg">
            An integrated digital platform designed to streamline SLIIT sports management, 
            player profiling, and real-time equipment tracking.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold shadow-2xl hover:bg-blue-500 transition-all flex items-center gap-2"
            >
              Explore Modules <ArrowRight size={20} />
            </motion.button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
              Inventory Sync
            </button>
          </div>
        </motion.div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

export default Hero;