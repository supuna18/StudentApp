import { motion } from "framer-motion";
import { Trophy, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 px-8 py-4 flex justify-between items-center"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Trophy className="text-blue-600" size={32} />
        <span className="text-2xl font-bold text-blue-900 tracking-tight">
          Sport<span className="text-blue-600">Flow</span>
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-blue-900 font-medium">
        <a href="#" className="hover:text-blue-600 transition-colors">Profiles</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Inventory</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Lending</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Announcements</a>
      </div>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        <button className="hidden md:block text-blue-600 font-semibold hover:text-blue-800">
          Login
        </button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          Get Started
        </motion.button>
        <Menu className="md:hidden text-blue-900" size={28} />
      </div>
    </motion.nav>
  );
};

export default Navbar;