import { motion } from "framer-motion";
import { ArrowRight, Monitor, Play } from "lucide-react";

const stats = [
  { value: "50K+", label: "Students" },
  { value: "200+", label: "Courses" },
  { value: "98%",  label: "Satisfaction" },
];

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen w-full flex items-center overflow-hidden bg-[#060D1F]">
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .hero-root { font-family: 'DM Sans', sans-serif; }
        .hero-heading { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* Background image layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/HeroPic.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#060D1F] via-[#0B1535]/85 to-[#0B1535]/30" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient blue orb — top right */}
      <div className="absolute top-[-80px] right-[5%] w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none z-[1]" />
      {/* Ambient indigo orb — bottom right */}
      <div className="absolute bottom-[-60px] right-[20%] w-[280px] h-[280px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none z-[1]" />

      {/* Content */}
      <div className="hero-root container mx-auto px-8 md:px-12 z-10">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-[640px] text-left"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/25 px-4 py-1.5 rounded-full mb-7"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60A5FA] inline-block" />
            <span className="text-[10.5px] font-bold tracking-[2px] text-blue-300 uppercase">
              Digital Wellbeing for Students
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="hero-heading text-[clamp(52px,7vw,82px)] text-white leading-[1.02] tracking-[-1px] mb-6 font-normal"
          >
            Master Your <br />
            <em className="text-blue-500 not-italic italic">Focus.</em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[16px] text-blue-100/60 mb-10 leading-[1.75] max-w-[460px] font-normal"
          >
            Stop mindless scrolling and start meaningful learning. EduSync helps
            you manage screen time, block distractions, and collaborate with
            peers — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[14px] font-semibold px-7 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(34,85,210,0.4)] hover:shadow-[0_12px_32px_rgba(34,85,210,0.5)] transition-all duration-200 hover:-translate-y-0.5">
              <Play size={15} fill="white" strokeWidth={0} />
              Start Focusing
              <ArrowRight size={15} /> 
            </button>

            <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] backdrop-blur-md text-white border border-white/15 text-[14px] font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5">
              <Monitor size={15} />
              Install Extension
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex items-center gap-0 mt-14 pt-9 border-t border-white/[0.07]"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="pr-9">
                  <div className="text-[26px] font-extrabold text-white tracking-tight leading-none">
                    {s.value.replace(/[K+%]/g, "")}
                    <span className="text-blue-400">{s.value.replace(/[0-9]/g, "")}</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-400/70 uppercase tracking-[1.5px] mt-1.5">
                    {s.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-9 bg-white/[0.08] mr-9" />
                )}
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;