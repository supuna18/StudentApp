import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Menu } from "lucide-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll කරන ප්‍රමාණය අනුව state එක මාරු කරනවා
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-8 md:px-12 py-4 flex justify-between items-center ${
        isScrolled 
          ? "bg-white/70 backdrop-blur-xl shadow-lg border-b border-blue-100 py-3" // සුදු පසුබිමට ආවම පෙනෙන ලුක් එක
          : "bg-transparent backdrop-blur-sm border-b border-white/10" // Hero section එකේ තියෙන ලුක් එක
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Trophy className={isScrolled ? "text-blue-600" : "text-blue-400"} size={28} />
        <span className={`text-2xl font-bold tracking-tight transition-colors ${
          isScrolled ? "text-blue-950" : "text-white"
        }`}>
          Sport<span className="text-blue-500">Flow</span>
        </span>
      </div>

      {/* Menu Links */}
      <div className={`hidden md:flex items-center gap-8 font-semibold text-sm uppercase tracking-widest transition-colors ${
        isScrolled ? "text-slate-700" : "text-white/80"
      }`}>
        {["Profiles", "Inventory", "Lending", "Announcements"].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="hover:text-blue-500 transition-colors relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </a>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-5">
        <button className={`hidden sm:block font-bold transition-colors ${
          isScrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-blue-300"
        }`}>
          <Link to="/login">Login</Link>
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
        >
          Get Started
        </motion.button>
        <Menu className={`md:hidden ${isScrolled ? "text-blue-950" : "text-white"}`} />
      </div>
    </motion.nav>
  );
};

export default Navbar;