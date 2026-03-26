import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-8 md:px-12 py-4 flex justify-between items-center ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"
      }`}
    >
      <Link to="/" className="flex items-center gap-2">
        <ShieldCheck className="text-blue-600" size={32} />
        <span className={`text-2xl font-black tracking-tighter ${isScrolled ? "text-slate-900" : "text-white"}`}>
          Edu<span className="text-blue-500 italic">Sync</span>
        </span>
      </Link>

      <div className={`hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest ${isScrolled ? "text-slate-600" : "text-white/80"}`}>
        <a href="#wellbeing" className="hover:text-blue-500 transition-colors">Wellbeing</a>
        <a href="#safety" className="hover:text-blue-500 transition-colors">Safety</a>
        <a href="#collaboration" className="hover:text-blue-500 transition-colors">Collaboration</a>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/login" className={`font-bold transition-colors ${isScrolled ? "text-blue-600" : "text-white"}`}>
          Login
        </Link>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
          Get Extension
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;