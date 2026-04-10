import { ShieldCheck, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-12 md:py-20 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="text-blue-500" size={32} />
            <span className="text-2xl font-bold tracking-tight">Edu<span className="text-blue-500">Sync</span></span>
          </div>
          <p className="text-slate-400 max-w-sm leading-relaxed text-sm md:text-base">
            Empowering students to reclaim their focus and protect their digital wellbeing in an interconnected world.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-0">
          <div>
            <h4 className="font-bold mb-6 text-blue-400 uppercase tracking-widest text-[10px] md:text-xs">Platform</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Usage Control</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Content Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Study Hub</a></li>
            </ul>
          </div>

          <div className="md:mt-12">
            <h4 className="font-bold mb-6 text-blue-400 uppercase tracking-widest text-[10px] md:text-xs">Connect</h4>
            <div className="flex gap-4">
              <Github size={20} className="cursor-pointer hover:text-blue-500 transition-colors" />
              <Twitter size={20} className="cursor-pointer hover:text-blue-500 transition-colors" />
              <Linkedin size={20} className="cursor-pointer hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-white/5 text-center text-slate-500 text-[10px] md:text-xs">
        © 2024 EduSync SLIIT Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;