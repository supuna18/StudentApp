import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    /* ── Intersection Observer for Active Tabs ── */
    const sections = ["hero", "wellbeing", "safety", "features"]; 
    const observerOptions = { 
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Focus on top-center of viewport
      threshold: 0 
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { title: "Wellbeing", href: "#wellbeing" },
    { title: "Safety", href: "#safety" },
    { title: "Collaboration", href: "#features" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-8 md:px-12 py-4 flex justify-between items-center ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"
      }`}
    >
      <Link to="/" onClick={(e) => handleNavClick(e, "#hero")} className="flex items-center gap-2">
        <ShieldCheck className="text-blue-600" size={32} />
        <span className={`text-2xl font-black tracking-tighter ${isScrolled ? "text-slate-900" : "text-white"}`}>
          Edu<span className="text-blue-500 italic">Sync</span>
        </span>
      </Link>

      <div className={`hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest ${isScrolled ? "text-slate-600" : "text-white/80"}`}>
        {navLinks.map((link) => (
          <a
            key={link.title}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="relative transition-colors hover:text-blue-500 py-1"
          >
            {link.title}
            {activeSection === link.href.replace("#", "") && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <Link to="/login" className={`font-bold transition-colors ${isScrolled ? "text-blue-600" : "text-white"}`}>
          Login
        </Link>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 duration-200">
          Get Extension
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;