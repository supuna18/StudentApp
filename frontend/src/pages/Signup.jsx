import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    
    // Validation states
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!username.trim()) newErrors.username = 'Full name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5005/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await res.json();

            if (res.ok) {
                // Success animation or toast could be added here
                navigate('/login');
            } else {
                setErrors({ server: data.message || "Signup Failed!" });
            }
        } catch (err) {
            console.error("Signup Error:", err);
            setErrors({ server: "Connection error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const features = [
        'Personalized learning paths',
        'Live instructor sessions',
        'Track your progress',
    ];

    const stats = [
        { val: '50', suffix: 'K+', label: 'Students' },
        { val: '200', suffix: '+', label: 'Courses' },
        { val: '98', suffix: '%', label: 'Satisfaction' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: i => ({
            opacity: 1,
            x: 0,
            transition: { delay: 0.1 * i, duration: 0.4 }
        })
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
                .signup-root { font-family: 'DM Sans', sans-serif; }
                .serif-heading { font-family: 'DM Serif Display', serif; }
            `}</style>

            <div className="signup-root w-screen h-screen flex items-center justify-center bg-[#2255D2] overflow-hidden">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[980px] h-full max-h-[600px] mx-6 bg-white rounded-[20px] shadow-[0_32px_80px_rgba(15,28,77,0.22)] flex overflow-hidden"
                >
                    {/* ══════════ LEFT PANEL ══════════ */}
                    <div className="relative w-[46%] hidden lg:flex flex-col p-8 bg-[#F0F4FF] border-r border-[#E8EEFF] overflow-hidden">
                        {/* Ambient orbs */}
                        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/[0.08] blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-primary/[0.07] blur-[60px] pointer-events-none" />

                        {/* Brand */}
                        <div className="flex items-center gap-2.5 mb-auto relative z-10">
                            <div className="w-[30px] h-[30px] bg-primary rounded-[8px] flex items-center justify-center shadow-[0_4px_10px_rgba(34,85,210,0.28)] flex-shrink-0">
                                <ShieldCheck size={16} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="serif-heading text-[16px] text-[#0F1C4D] italic">EduSync</span>
                        </div>

                        {/* Hero text */}
                        <div className="relative z-10 mb-7">
                            <h2 className="serif-heading text-[38px] text-[#0F1C4D] leading-[1.12] font-normal">
                                Start your<br />
                                <em className="text-primary not-italic italic">learning journey</em><br />
                                today.
                            </h2>
                            <p className="text-[13px] text-slate-400 mt-3 leading-[1.65] max-w-[280px]">
                                Join thousands of students already achieving their goals with EduSync.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="flex flex-col gap-2.5 relative z-10 mb-7">
                            {features.map((f, i) => (
                                <motion.div 
                                    key={f} 
                                    custom={i}
                                    variants={itemVariants}
                                    className="flex items-center gap-2.5 text-[12.5px] font-medium text-[#4A5570]"
                                >
                                    <div className="w-[22px] h-[22px] rounded-[7px] bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Check size={11} className="text-primary" strokeWidth={3} />
                                    </div>
                                    {f}
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats strip */}
                        <div className="flex items-center border-t border-[#E8EEFF] pt-5 relative z-10">
                            {stats.map((s, i) => (
                                <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-[#E8EEFF]' : ''}`}>
                                    <div className="text-[18px] font-extrabold text-[#0F1C4D] tracking-tight leading-none">
                                        {s.val}<span className="text-primary">{s.suffix}</span>
                                    </div>
                                    <div className="text-[9.5px] font-bold tracking-[1.5px] uppercase text-slate-400 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══════════ RIGHT PANEL ══════════ */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                        {/* Top Nav */}
                        <div className="flex items-center justify-end p-8 pb-4">
                            <span className="text-[12.5px] text-slate-400 mr-3 hidden sm:inline">Already a member?</span>
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-full border-[1.5px] border-[#0F1C4D] text-[11.5px] font-bold tracking-[.5px] uppercase text-[#0F1C4D] hover:bg-[#0F1C4D] hover:text-white transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Form area */}
                        <div className="flex-1 flex flex-col justify-center px-10 pb-10 max-w-[480px] mx-auto w-full">
                            <div className="mb-6">
                                <h1 className="serif-heading text-[26px] text-[#0F1C4D] italic leading-tight mb-1">Create account</h1>
                                <p className="text-[12.5px] text-slate-400">Join thousands of students on their journey.</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-3.5">
                                {errors.server && (
                                    <div className="p-2.5 rounded-[10px] bg-red-50 text-red-500 text-[11px] font-medium border border-red-100 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {errors.server}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Full Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-[#0F1C4D] tracking-[.3px] uppercase">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={username}
                                                onChange={(e) => { setUsername(e.target.value); if(errors.username) delete errors.username; }}
                                                className={`w-full pl-9 pr-3 py-2 border-[1.5px] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-all duration-200 placeholder:text-slate-400
                                                    ${errors.username ? 'border-red-400' : 'border-[#E8EEFF] focus:border-primary'}`}
                                            />
                                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        {errors.username && <p className="text-[10px] text-red-500 font-medium mt-0.5">{errors.username}</p>}
                                    </div>

                                    {/* Account Type */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-[#0F1C4D] tracking-[.3px] uppercase">I am a</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-3 py-2 border-[1.5px] border-[#E8EEFF] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none focus:border-primary transition-all duration-200 cursor-pointer appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-[#0F1C4D] tracking-[.3px] uppercase">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if(errors.email) delete errors.email; }}
                                            className={`w-full pl-9 pr-3 py-2 border-[1.5px] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-all duration-200 placeholder:text-slate-400
                                                ${errors.email ? 'border-red-400' : 'border-[#E8EEFF] focus:border-primary'}`}
                                        />
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    {errors.email && <p className="text-[10px] text-red-500 font-medium mt-0.5">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-[#0F1C4D] tracking-[.3px] uppercase">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); if(errors.password) delete errors.password; }}
                                            className={`w-full pl-9 pr-9 py-2 border-[1.5px] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-all duration-200 placeholder:text-slate-400
                                                ${errors.password ? 'border-red-400' : 'border-[#E8EEFF] focus:border-primary'}`}
                                        />
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                        >
                                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-[10px] text-red-500 font-medium mt-0.5">{errors.password}</p>}
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-primary hover:bg-primary disabled:opacity-70 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-full shadow-[0_6px_20px_rgba(34,85,210,0.3)] hover:shadow-[0_10px_28px_rgba(34,85,210,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Get Started <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <p className="text-center text-[10.5px] text-slate-400 mt-4 px-4 leading-relaxed">
                                    By clicking "Get Started", you agree to our 
                                    <a href="#" className="text-primary font-semibold mx-1 hover:underline">Terms</a> 
                                    and 
                                    <a href="#" className="text-primary font-semibold mx-1 hover:underline">Privacy</a>.
                                </p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Signup;

