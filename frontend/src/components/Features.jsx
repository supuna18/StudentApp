import { motion } from "framer-motion";
import { UserCircle, Package, QrCode, AlertCircle } from "lucide-react";

const modules = [
  {
    title: "Sports Profile",
    desc: "Comprehensive student profiles and institutional achievement maintenance.",
    icon: <UserCircle size={30} />,
    color: "bg-blue-500"
  },
  {
    title: "Equipment Tracker",
    desc: "Real-time inventory monitoring and usage-based forecasting.",
    icon: <Package size={30} />,
    color: "bg-indigo-500"
  },
  {
    title: "Live Lending",
    desc: "QR-based seamless borrowing and SignalR live synchronization.",
    icon: <QrCode size={30} />,
    color: "bg-sky-500"
  },
  {
    title: "Accountability",
    desc: "Fine calculation, payment approval, and trust score systems.",
    icon: <AlertCircle size={30} />,
    color: "bg-blue-700"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">Core Management Modules</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((m, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all"
            >
              <div className={`${m.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                {m.icon}
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">{m.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;