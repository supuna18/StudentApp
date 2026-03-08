import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    // --- FIX 1: ලොග් වෙලා ඉන්න යූසර්ව පන්නන ලොජික් එක (Forward Arrow ප්‍රශ්නයට) ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                navigate(userRole === 'Admin' ? '/admin-dashboard' : '/student-dashboard', { replace: true });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    }, [navigate]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email field cannot be empty.';
        if (!emailRegex.test(email)) return 'Please enter a valid email address.';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password field cannot be empty.';
        if (password.length < 8) return 'Password must be at least 8 characters long.';
        return '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        setEmailError(emailErr);
        setPasswordError(passErr);

        if (emailErr || passErr) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5005/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                const decoded = jwtDecode(data.token);
                
                // --- FIX 2: Role එක undefined වීම වැළැක්වීම ---
                const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                
                alert(`Welcome ${decoded.unique_name || 'User'}! Role: ${userRole}`);
                
                // replace: true මගින් history එකෙන් ලොගින් පේජ් එක මකනවා
                navigate(userRole === 'Admin' ? '/admin-dashboard' : '/student-dashboard', { replace: true });
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login Error:', err);
            alert('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@1,600&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --violet: #6C5CE7; --violet-dark: #5649C0; --violet-lt: #8B7FF0;
                    --violet-dim: rgba(108,92,231,0.12); --teal: #00CEC9; --coral: #FF7675;
                    --white: #FFFFFF; --bg-page: #7B6FE8; --bg-card: #F8F9FF;
                    --text: #2D3436; --text-soft: #636E72; --text-muted: #A0A8B8;
                    --border: #E8EAF6; --border-foc: #6C5CE7; --field-bg: #FFFFFF;
                    --sans: 'Plus Jakarta Sans', system-ui, sans-serif; --serif: 'Lora', Georgia, serif;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                }
                html, body, #root { width: 100%; height: 100%; font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow: hidden; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes floatIllo { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-10px) rotate(0.5deg); } 66% { transform: translateY(-5px) rotate(-0.5deg); } }
                @keyframes floatShard { 0%, 100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(var(--d,-12px)) rotate(var(--r,0deg)); } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="min-h-screen w-full flex items-center justify-center p-7 relative overflow-hidden bg-gradient-to-br from-[#8B7FF0] via-[#6C5CE7] to-[#5649C0]">
                <div className="absolute inset-0 bg-radial-gradient-circle bg-[length:28px_28px] from-[rgba(255,255,255,0.12)] to-transparent z-0"></div>
                
                {/* BG blobs */}
                <div className="absolute rounded-full filter blur-lg pointer-events-none z-0 w-[420px] h-[420px] top-[-160px] left-[-120px] bg-purple-400 opacity-55"></div>
                <div className="absolute rounded-full filter blur-lg pointer-events-none z-0 w-[340px] h-[340px] bottom-[-120px] right-[-80px] bg-purple-700 opacity-50"></div>

                <div className="relative z-10 w-full max-w-[1000px] h-[calc(100vh-56px)] rounded-2xl bg-[#F8F9FF] shadow-xl flex flex-col overflow-hidden animate-fadeUp">
                    
                    {/* Top bar */}
                    <div className="sticky top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-10 bg-[rgba(248,249,255,0.95)] border-b border-[rgba(108,92,231,0.08)] backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-[#8B7FF0] transform rotate-45 rounded-sm mr-px"></div>
                                <div className="w-2 h-2 bg-[#6C5CE7] transform rotate-45 rounded-sm"></div>
                                <div className="w-1.5 h-1.5 bg-[#8B7FF0] transform rotate-45 rounded-sm ml-px"></div>
                            </div>
                            <span className="text-sm font-extrabold tracking-wider uppercase text-[#6C5CE7]">EduSync</span>
                        </div>
                        <div className="flex items-center gap-3.5">
                            <span className="text-sm font-normal text-[#636E72] hidden sm:block">Don't have an account?</span>
                            <Link to="/signup" className="py-2 px-4 rounded-full border-2 border-[#2D3436] text-xs font-bold tracking-wide transition-all duration-200 hover:bg-[#2D3436] hover:text-white">
                                SIGN UP
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-y-auto md:flex-row flex-col">
                        {/* Left illustration */}
                        <div className="w-full md:w-[46%] flex-shrink-0 flex items-center justify-center p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-white via-[#F0F1FF] to-[#EAE9FF] border-b md:border-b-0 md:border-r border-gray-200">
                            {/* Floating shards */}
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="absolute rounded-md animate-floatShard opacity-55" style={{ 
                                    width: i%2===0?'18px':'12px', height: i%2===0?'18px':'12px', 
                                    top: `${10+i*12}%`, left: `${10+i*15}%`, 
                                    background: i%3===0?'#8B7FF0':i%3===1?'#00CEC9':'#FF7675',
                                    '--r': `${i*20}deg`, '--d': '-12px' 
                                }}></div>
                            ))}

                            <div className="animate-floatIllo w-full max-w-[340px] md:max-w-[250px]">
                                <svg className="w-full h-auto" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="170" cy="285" rx="110" ry="12" fill="rgba(108,92,231,0.10)" />
                                    <rect x="60" y="50" width="180" height="140" rx="10" fill="#D9D6FF" />
                                    <rect x="60" y="50" width="180" height="28" rx="10" fill="#B8B4F5" />
                                    <circle cx="200" cy="115" r="28" fill="#E8E6FF" />
                                    <rect x="188" y="168" width="52" height="62" rx="10" fill="#00CEC9" />
                                    <circle cx="95" cy="178" r="24" fill="#00CEC9" />
                                    <polyline points="84,178 92,186 108,168" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="110" y="200" width="72" height="56" rx="8" fill="#FF7675" />
                                    <rect x="152" y="195" width="60" height="72" rx="8" fill="white" />
                                </svg>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative">
                            <div className="w-full max-w-sm">
                                <h2 className="text-3xl font-extrabold text-[#2D3436] tracking-tight mb-1 leading-tight md:text-2xl italic">Welcome to EduSync!</h2>
                                <p className="text-sm font-normal text-[#A0A8B8] mb-8 md:mb-6">Sign in to your account</p>

                                <form onSubmit={handleLogin}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-[#2D3436] mb-2">Email</label>
                                        <input
                                            type="email"
                                            className={`w-full py-3 px-4 border-2 rounded-lg font-sans text-sm outline-none transition-all duration-200 ${emailError ? 'border-[#FF7675]' : 'border-[#E8EAF6] focus:border-[#6C5CE7]'}`}
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                                            required
                                        />
                                        {emailError && <p className="text-[#FF7675] text-xs mt-1.5">{emailError}</p>}
                                    </div>

                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-[#2D3436] mb-2">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                className={`w-full py-3 px-4 pr-11 border-2 rounded-lg font-sans text-sm outline-none transition-all duration-200 ${passwordError ? 'border-[#FF7675]' : 'border-[#E8EAF6] focus:border-[#6C5CE7]'}`}
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A8B8] hover:text-[#6C5CE7] transition-colors"
                                                onClick={() => setShowPass(p => !p)}
                                            >
                                                {showPass ? '👁️' : '🔒'}
                                            </button>
                                        </div>
                                        {passwordError && <p className="text-[#FF7675] text-xs mt-1.5">{passwordError}</p>}
                                    </div>

                                    <button type="submit" className="w-full py-3.5 border-none rounded-full bg-gradient-to-br from-[#5649C0] via-[#6C5CE7] to-[#8B7FF0] text-white font-bold tracking-tight shadow-md hover:shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 mt-6 mb-7 disabled:opacity-65" disabled={loading}>
                                        {loading ? 'Processing...' : 'Login'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;