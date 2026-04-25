import { motion } from "framer-motion";
import { Clock, ShieldAlert, Users, LayoutDashboard } from "lucide-react";

const features = [
  {
    title: "Usage Control",
    desc: "Set daily limits for distracting sites and monitor your screen time with detailed analytics.",
    icon: <Clock size={26} />,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    border: "hover:border-blue-200",
    glow: "hover:shadow-blue-100",
  },
  {
    title: "Content Safety",
    desc: "AI-powered fake news detection and mindful break reminders within your browser.",
    icon: <ShieldAlert size={26} />,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    border: "hover:border-emerald-200",
    glow: "hover:shadow-emerald-100",
  },
  {
    title: "Study Hub",
    desc: "Real-time collaboration with peers through synchronized study groups and live chat.",
    icon: <Users size={26} />,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    border: "hover:border-violet-200",
    glow: "hover:shadow-violet-100",
  },
  {
    title: "Admin Insights",
    desc: "Comprehensive dashboard for administrators to manage resources and monitor system wellbeing.",
    icon: <LayoutDashboard size={26} />,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    border: "hover:border-sky-200",
    glow: "hover:shadow-sky-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-50 py-24 px-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        #features { font-family: 'DM Sans', sans-serif; }
        .heading-serif { font-family: 'DM Serif Display', serif; }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
            Core Modules
          </span>
        </motion.div>

        {/* Heading Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="heading-serif text-3xl md:text-5xl text-slate-900 leading-tight max-w-xl"
          >
            Everything you need to{" "}
            <br className="md:hidden" />
            <span className="text-primary italic">stay productive.</span>
          </motion.h2>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary active:bg-blue-800 text-white text-sm font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5"
          >
            Explore All Features
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`
                group relative bg-white rounded-2xl p-8
                border border-slate-100 ${f.border}
                shadow-sm hover:shadow-xl ${f.glow}
                transition-all duration-300 cursor-default overflow-hidden
              `}
            >
              {/* Icon */}
              <div className={`${f.iconBg} ${f.iconColor} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>

              {/* Text */}
              <h4 className="text-slate-900 font-bold text-[17px] mb-3 tracking-tight">
                {f.title}
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-normal">
                {f.desc}
              </p>

              {/* Arrow on hover */}
              <div className={`mt-6 flex items-center gap-1 text-xs font-semibold ${f.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}>
                Learn more
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

