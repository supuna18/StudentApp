import { motion } from "framer-motion";
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 text-center"
      >
        <motion.span 
          variants={itemVariants}
          className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full"
        >
          Smart University Sports Management
        </motion.span>
        
        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold text-blue-950 mb-6 leading-tight"
        >
          Streamline Your Sports <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            Operations with Ease
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 leading-relaxed"
        >
          Manage player profiles, track equipment inventory, and sync QR transactions in real-time. The ultimate unified platform for modern university sports.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
            Get Started Now <ArrowRight size={20} />
          </button>
          <button className="bg-white text-blue-900 border-2 border-blue-100 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all">
            View Live Demo
          </button>
        </motion.div>

        {/* Stats / Mini Features */}
        <motion.div 
          variants={itemVariants}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left"
        >
          <div className="flex items-start gap-4 p-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Zap size={24} /></div>
            <div>
              <h3 className="font-bold text-blue-950">Real-time Sync</h3>
              <p className="text-sm text-gray-500">Instant updates via SignalR technology.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-blue-950">Secure QR</h3>
              <p className="text-sm text-gray-500">Encrypted QR authentication for lending.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Activity size={24} /></div>
            <div>
              <h3 className="font-bold text-blue-950">Analytics</h3>
              <p className="text-sm text-gray-500">Automated ranking and performance tracking.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;