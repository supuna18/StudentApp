import { useState } from 'react';
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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email field cannot be empty.';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address.';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password field cannot be empty.';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        return '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passErr);

        if (emailErr || passErr) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                const decoded = jwtDecode(data.token);
                const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                alert(`Welcome ${decoded.unique_name}! Role: ${userRole}`);
                // --- FIX APPLIED HERE ---
                // Using { replace: true } to remove the login page from browser history
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
            {/* Viewport Meta Tag for responsiveness */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@1,600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --violet:      #6C5CE7;
                    --violet-dark: #5649C0;
                    --violet-lt:   #8B7FF0;
                    --violet-dim:  rgba(108,92,231,0.12);
                    --teal:        #00CEC9;
                    --coral:       #FF7675;
                    --white:       #FFFFFF;
                    --bg-page:     #7B6FE8;
                    --bg-card:     #F8F9FF;
                    --text:        #2D3436;
                    --text-soft:   #636E72;
                    --text-muted:  #A0A8B8;
                    --border:      #E8EAF6;
                    --border-foc:  #6C5CE7;
                    --field-bg:    #FFFFFF;
                    --sans: 'Plus Jakarta Sans', system-ui, sans-serif;
                    --serif: 'Lora', Georgia, serif;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                }

                html, body, #root {
                    width: 100%;
                    height: 100%; /* Full height for the root elements */
                    font-family: var(--sans);
                    -webkit-font-smoothing: antialiased;
                    overflow: hidden; /* Prevent body scrolling */
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes floatIllo {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33%      { transform: translateY(-10px) rotate(0.5deg); }
                    66%      { transform: translateY(-5px) rotate(-0.5deg); }
                }
                @keyframes floatShard {
                    0%, 100% { transform: translateY(0) rotate(var(--r,0deg)); }
                    50%      { transform: translateY(var(--d,-12px)) rotate(var(--r,0deg)); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes dotPulse {
                    0%,100% { transform: scale(1); opacity:0.7; }
                    50%     { transform: scale(1.3); opacity:1; }
                }
            `}</style>

            <div className="min-h-screen w-full flex items-center justify-center p-7 relative overflow-hidden bg-gradient-to-br from-[#8B7FF0] via-[#6C5CE7] to-[#5649C0]">
                {/* BG dot pattern */}
                <div className="absolute inset-0 bg-radial-gradient-circle bg-[length:28px_28px] from-[rgba(255,255,255,0.12)] to-transparent z-0"></div>

                {/* BG blobs */}
                <div className="absolute rounded-full filter blur-lg pointer-events-none z-0 w-[420px] h-[420px] top-[-160px] left-[-120px] bg-purple-400 opacity-55"></div>
                <div className="absolute rounded-full filter blur-lg pointer-events-none z-0 w-[340px] h-[340px] bottom-[-120px] right-[-80px] bg-purple-700 opacity-50"></div>

                <div className="relative z-10 w-full max-w-[1000px] h-[calc(100vh-56px)] rounded-2xl bg-[#F8F9FF] shadow-lg md:shadow-xl flex flex-col overflow-hidden animate-fadeUp">

                    {/* ── Top bar ── */}
                    <div className="sticky top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-10 bg-[rgba(248,249,255,0.95)] border-b border-[rgba(108,92,231,0.08)] backdrop-blur-sm flex-shrink-0">
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
                            <Link to="/signup" className="py-2 px-4 rounded-full border-2 border-[#2D3436] bg-transparent text-[#2D3436] text-xs font-bold tracking-wide cursor-pointer transition-all duration-200 hover:bg-[#2D3436] hover:text-white">
                                SIGN UP
                            </Link>
                        </div>
                    </div>

                    {/* ── Content Wrapper for scrolling ── */}
                    <div className="flex flex-1 overflow-y-auto md:flex-row flex-col">
                        {/* ── Left illustration ── */}
                        <div className="w-full md:w-[46%] flex-shrink-0 flex items-center justify-center p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-white via-[#F0F1FF] to-[#EAE9FF] border-b md:border-b-0 md:border-r border-gray-200">
                            {/* Floating shards */}
                            <div className="absolute rounded-md animate-floatShard opacity-55" style={{ width: '18px', height: '18px', top: '18%', left: '10%', background: '#8B7FF0', transform: 'rotate(30deg)', '--r': '30deg', '--d': '-14px', '--dur': '4.5s' }}></div>
                            <div className="absolute rounded-md animate-floatShard opacity-55" style={{ width: '12px', height: '12px', top: '30%', left: '82%', background: '#00CEC9', transform: 'rotate(45deg)', '--r': '45deg', '--d': '-10px', '--dur': '6s' }}></div>
                            <div className="absolute rounded-md animate-floatShard opacity-55" style={{ width: '22px', height: '22px', top: '70%', left: '8%', background: '#C5C0FF', transform: 'rotate(15deg)', '--r': '15deg', '--d': '-8px', '--dur': '5.5s' }}></div>
                            <div className="absolute rounded-md animate-floatShard opacity-55" style={{ width: '10px', height: '10px', top: '78%', left: '75%', background: '#FF7675', transform: 'rotate(60deg)', '--r': '60deg', '--d': '-12px', '--dur': '4s' }}></div>
                            <div className="absolute rounded-md animate-floatShard opacity-30" style={{ width: '14px', height: '14px', top: '50%', left: '88%', background: '#6C5CE7', transform: 'rotate(20deg)', '--r': '20deg', '--d': '-16px', '--dur': '7s' }}></div>
                            <div className="absolute rounded-md animate-floatShard opacity-55" style={{ width: '8px', height: '8px', top: '14%', left: '60%', background: '#00CEC9', transform: 'rotate(45deg)', '--r': '45deg', '--d': '-9px', '--dur': '5s' }}></div>

                            {/* Isometric illustration (SVG) */}
                            <div className="animate-floatIllo w-full max-w-[340px] md:max-w-[250px]">
                                <svg className="w-full h-auto" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Shadow */}
                                    <ellipse cx="170" cy="285" rx="110" ry="12" fill="rgba(108,92,231,0.10)" />

                                    {/* Back screen */}
                                    <rect x="60" y="50" width="180" height="140" rx="10" fill="#D9D6FF" />
                                    <rect x="60" y="50" width="180" height="28" rx="10" fill="#B8B4F5" />
                                    <rect x="60" y="64" width="180" height="14" fill="#B8B4F5" />

                                    {/* Screen content lines */}
                                    <rect x="76" y="92" width="80" height="8" rx="4" fill="#9B96EB" opacity="0.7" />
                                    <rect x="76" y="108" width="120" height="6" rx="3" fill="#C4C0F7" opacity="0.8" />
                                    <rect x="76" y="120" width="100" height="6" rx="3" fill="#C4C0F7" opacity="0.6" />
                                    <rect x="76" y="132" width="90" height="6" rx="3" fill="#C4C0F7" opacity="0.5" />
                                    <rect x="76" y="148" width="60" height="6" rx="3" fill="#C4C0F7" opacity="0.4" />

                                    {/* Avatar circle on screen */}
                                    <circle cx="200" cy="115" r="28" fill="#E8E6FF" />
                                    <circle cx="200" cy="108" r="11" fill="#B8B4F5" />
                                    <ellipse cx="200" cy="132" rx="17" ry="10" fill="#B8B4F5" opacity="0.7" />

                                    {/* Teal lock/badge */}
                                    <rect x="188" y="168" width="52" height="62" rx="10" fill="#00CEC9" />
                                    <rect x="200" y="154" width="28" height="26" rx="14" fill="none" stroke="#00CEC9" strokeWidth="6" />
                                    <circle cx="214" cy="189" r="7" fill="white" opacity="0.9" />
                                    <rect x="211" y="190" width="6" height="10" rx="3" fill="white" opacity="0.9" />

                                    {/* Teal checkmark circle */}
                                    <circle cx="95" cy="178" r="24" fill="#00CEC9" />
                                    <polyline points="84,178 92,186 108,168" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Coral/pink document card */}
                                    <rect x="110" y="200" width="72" height="56" rx="8" fill="#FF7675" />
                                    <rect x="120" y="212" width="52" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
                                    <rect x="120" y="224" width="40" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
                                    <rect x="120" y="236" width="46" height="6" rx="3" fill="rgba(255,255,255,0.4)" />

                                    {/* White floating paper */}
                                    <rect x="152" y="195" width="60" height="72" rx="8" fill="white" filter="url(#s1)" />
                                    <rect x="162" y="208" width="40" height="5" rx="2.5" fill="#E8E6FF" />
                                    <rect x="162" y="219" width="30" height="5" rx="2.5" fill="#E8E6FF" opacity="0.8"/>
                                    <rect x="162" y="230" width="35" height="5" rx="2.5" fill="#E8E6FF" opacity="0.6"/>
                                    <rect x="162" y="241" width="25" height="5" rx="2.5" fill="#E8E6FF" opacity="0.5"/>

                                    {/* Small violet diamond decorations */}
                                    <rect x="50" y="95" width="12" height="12" rx="2" fill="#9B96EB" transform="rotate(45 56 101)" opacity="0.6" />
                                    <rect x="268" y="140" width="10" height="10" rx="2" fill="#6C5CE7" transform="rotate(45 273 145)" opacity="0.5" />
                                    <rect x="52" y="220" width="16" height="16" rx="3" fill="#C4C0F7" transform="rotate(45 60 228)" opacity="0.55" />
                                    <rect x="270" y="200" width="12" height="12" rx="2" fill="#00CEC9" transform="rotate(45 276 206)" opacity="0.45" />

                                    <defs>
                                        <filter id="s1" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(108,92,231,0.15)" />
                                        </filter>
                                    </defs>
                                </svg>
                            </div>
                        </div>

                        {/* ── Right form ── */}
                        <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative">
                            <div className="w-full max-w-sm animate-fadeUp animation-delay-300">

                                <h2 className="text-3xl font-extrabold text-[#2D3436] tracking-tight mb-1 leading-tight md:text-2xl">Welcome to EduSync!</h2>
                                <p className="text-sm font-normal text-[#A0A8B8] mb-8 md:mb-6">Sign in to your account</p>

                                <form onSubmit={handleLogin}>
                                    <div className="mb-5 animate-fadeUp animation-delay-400">
                                        <label className="block text-sm font-semibold text-[#2D3436] mb-2">Email</label>
                                        <input
                                            type="email"
                                            placeholder="edusync001@gmail.com"
                                            className={`w-full py-3 px-4 border-2 rounded-lg font-sans text-sm text-[#2D3436] bg-white outline-none transition-all duration-200 placeholder:text-[#A0A8B8] placeholder:font-light ${emailError ? 'border-[#FF7675]' : 'border-[#E8EAF6] focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'}`}
                                            value={email}
                                            onChange={e => {
                                                setEmail(e.target.value);
                                                setEmailError('');
                                            }}
                                            required
                                        />
                                        {emailError && <p className="text-[#FF7675] text-xs mt-1.5">{emailError}</p>}
                                    </div>

                                    <div className="mb-5 animate-fadeUp animation-delay-500">
                                        <label className="block text-sm font-semibold text-[#2D3436] mb-2">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                placeholder="8+ characters"
                                                className={`w-full py-3 px-4 pr-11 border-2 rounded-lg font-sans text-sm text-[#2D3436] bg-white outline-none transition-all duration-200 placeholder:text-[#A0A8B8] placeholder:font-light ${passwordError ? 'border-[#FF7675]' : 'border-[#E8EAF6] focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'}`}
                                                value={password}
                                                onChange={e => {
                                                    setPassword(e.target.value);
                                                    setPasswordError('');
                                                }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#A0A8B8] flex items-center p-0.5 transition-colors duration-200 hover:text-[#6C5CE7]"
                                                onClick={() => setShowPass(p => !p)}
                                                tabIndex={-1}
                                            >
                                                {showPass ? (
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {passwordError && <p className="text-[#FF7675] text-xs mt-1.5">{passwordError}</p>}
                                    </div>

                                    <button type="submit" className="w-full py-3.5 px-6 border-none rounded-full bg-gradient-to-br from-[#5649C0] via-[#6C5CE7] to-[#8B7FF0] text-white font-sans text-base font-bold tracking-tight cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 mt-6 mb-7 disabled:opacity-65 disabled:cursor-not-allowed disabled:transform-none" disabled={loading} style={{ animationDelay: '0.6s' }}>
                                        {loading ? <div className="w-4.5 h-4.5 border-2.5 border-[rgba(255,255,255,0.35)] border-t-white rounded-full animate-spin" /> : 'Login'}
                                    </button>
                                </form>

                                {/* Social */}
                                <div className="flex items-center gap-3 animate-fadeIn animation-delay-700">
                                    <span className="text-sm font-normal text-[#A0A8B8] whitespace-nowrap">Create account with</span>

                                    {/* Facebook */}
                                    <button className="w-10 h-10 rounded-full border-2 border-[#E8EAF6] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#8B7FF0] hover:shadow-md hover:shadow-[rgba(108,92,231,0.18)] hover:-translate-y-0.5 flex-shrink-0" title="Continue with Facebook">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="24" height="24" rx="12" fill="#1877F2"/>
                                            <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.1 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 7.1 11.6 6 13 6H15.5V8Z" fill="white"/>
                                        </svg>
                                    </button>

                                    {/* LinkedIn */}
                                    <button className="w-10 h-10 rounded-full border-2 border-[#E8EAF6] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#8B7FF0] hover:shadow-md hover:shadow-[rgba(108,92,231,0.18)] hover:-translate-y-0.5 flex-shrink-0" title="Continue with LinkedIn">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="24" height="24" rx="12" fill="#0A66C2"/>
                                            <path d="M7 10H9.5V17H7V10ZM8.25 9C7.56 9 7 8.44 7 7.75C7 7.06 7.56 6.5 8.25 6.5C8.94 6.5 9.5 7.06 9.5 7.75C9.5 8.44 8.94 9 8.25 9Z" fill="white"/>
                                            <path d="M11 10H13.4V11.1H13.44C13.79 10.46 14.6 9.8 15.84 9.8C18.38 9.8 18.84 11.48 18.84 13.65V17H16.34V14.16C16.34 13.18 16.32 11.91 14.96 11.91C13.58 11.91 13.38 12.99 13.38 14.08V17H10.88V10H11Z" fill="white"/>
                                        </svg>
                                    </button>

                                    {/* Google */}
                                    <button className="w-10 h-10 rounded-full border-2 border-[#E8EAF6] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#8B7FF0] hover:shadow-md hover:shadow-[rgba(108,92,231,0.18)] hover:-translate-y-0.5 flex-shrink-0" title="Continue with Google">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                        </svg>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div> {/* End card-content-wrapper */}

                </div>
            </div>
        </>
    );
};

export default Login;