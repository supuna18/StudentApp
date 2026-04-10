import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4 flex justify-between items-center ${
          isScrolled || isMobileMenuOpen ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"
        }`}
      >
        <Link to="/" onClick={(e) => handleNavClick(e, "#hero")} className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={32} />
          <span className={`text-2xl font-black tracking-tighter ${isScrolled || isMobileMenuOpen ? "text-slate-900" : "text-white"}`}>
            Edu<span className="text-blue-500 italic">Sync</span>
          </span>
        </Link>

        {/* Desktop Links */}
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

        <div className="flex items-center gap-3 md:gap-5">
          <Link to="/login" className={`font-bold transition-colors hidden sm:block ${isScrolled || isMobileMenuOpen ? "text-blue-600" : "text-white"}`}>
            Login
          </Link>
          <button className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 duration-200">
            Get Extension
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 rounded-lg ${isScrolled || isMobileMenuOpen ? "text-slate-900" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 w-full bg-white z-40 border-b border-slate-100 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-lg font-bold text-slate-600 hover:text-blue-600 transition-colors py-2 border-b border-slate-50 last:border-0"
                >
                  {link.title}
                </a>
              ))}
              <Link 
                to="/login" 
                className="text-lg font-bold text-blue-600 py-2 sm:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;