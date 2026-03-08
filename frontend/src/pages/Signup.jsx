import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(''); // State to track focused input for styling
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5005/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Account created successfully! Please login.");
                navigate('/login');
            } else {
                alert(data.message || "Signup Failed!");
            }
        } catch (err) {
            console.error("Signup Error:", err);
            alert("An error occurred during signup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

                html, body, #root {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden; /* Prevent body scrolling */
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="min-h-screen w-full bg-[#F0F6FF] flex items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Decorative background blobs */}
                <div className="absolute top-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full bg-radial-gradient-circle from-[rgba(26,86,219,0.12)] to-transparent pointer-events-none"></div>
                <div className="absolute bottom-[-140px] left-[-100px] w-[500px] h-[500px] rounded-full bg-radial-gradient-circle from-[rgba(26,86,219,0.08)] to-transparent pointer-events-none"></div>

                <div className="flex w-full max-w-6xl h-auto md:min-h-[580px] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    {/* Left panel */}
                    <div className="flex-none w-full md:w-[42%] bg-gradient-to-br from-[#1240A8] via-[#1A56DB] to-[#3B82F6] p-8 md:p-11 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 rounded-xl bg-white bg-opacity-15 flex items-center justify-center backdrop-blur-sm">
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-white">
                                    <rect width="28" height="28" rx="8" fill="currentColor" fillOpacity="0.2"/>
                                    <path d="M7 14L12 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="text-white text-2xl font-bold tracking-tight">EduSync</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center py-6">
                            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4">
                                Start your<br />learning journey<br />today.
                            </h1>
                            <p className="text-white text-opacity-75 text-sm leading-relaxed mb-7">
                                Join thousands of students already achieving their goals with EduSync.
                            </p>

                            <div className="flex flex-col gap-3 mb-8">
                                {['Personalized learning paths', 'Live instructor sessions', 'Track your progress'].map((f, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-white bg-opacity-60 flex-shrink-0"></div>
                                        <span className="text-white text-opacity-85 text-sm">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center bg-white bg-opacity-10 rounded-2xl px-5 py-4 backdrop-blur-md">
                            <div className="flex-1 flex flex-col items-center gap-0.5">
                                <span className="text-white text-lg font-bold tracking-tight">50K+</span>
                                <span className="text-white text-opacity-65 text-xs uppercase tracking-wider">Students</span>
                            </div>
                            <div className="w-px h-8 bg-white bg-opacity-20 mx-2"></div>
                            <div className="flex-1 flex flex-col items-center gap-0.5">
                                <span className="text-white text-lg font-bold tracking-tight">200+</span>
                                <span className="text-white text-opacity-65 text-xs uppercase tracking-wider">Courses</span>
                            </div>
                            <div className="w-px h-8 bg-white bg-opacity-20 mx-2"></div>
                            <div className="flex-1 flex flex-col items-center gap-0.5">
                                <span className="text-white text-lg font-bold tracking-tight">98%</span>
                                <span className="text-white text-opacity-65 text-xs uppercase tracking-wider">Satisfaction</span>
                            </div>
                        </div>
                    </div>

                    {/* Right panel — form */}
                    <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-12">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1.5">Create Account</h2>
                                <p className="text-sm text-gray-600">Fill in your details to get started</p>
                            </div>

                            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-700 tracking-wide">Full Name</label>
                                    <div className={`flex items-center gap-2.5 border-1.5 rounded-xl px-3.5 py-0.5 bg-[#FAFBFF] transition-all duration-200 ${focused === 'username' ? 'border-[#1A56DB] shadow-[0_0_0_3px_rgba(26,86,219,0.1)] bg-white' : 'border-gray-300'}`}>
                                        <svg className="text-gray-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            onFocus={() => setFocused('username')}
                                            onBlur={() => setFocused('')}
                                            required
                                            className="flex-1 border-none bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-700 tracking-wide">Email Address</label>
                                    <div className={`flex items-center gap-2.5 border-1.5 rounded-xl px-3.5 py-0.5 bg-[#FAFBFF] transition-all duration-200 ${focused === 'email' ? 'border-[#1A56DB] shadow-[0_0_0_3px_rgba(26,86,219,0.1)] bg-white' : 'border-gray-300'}`}>
                                        <svg className="text-gray-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                        </svg>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onFocus={() => setFocused('email')}
                                            onBlur={() => setFocused('')}
                                            required
                                            className="flex-1 border-none bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-700 tracking-wide">Password</label>
                                    <div className={`flex items-center gap-2.5 border-1.5 rounded-xl px-3.5 py-0.5 bg-[#FAFBFF] transition-all duration-200 ${focused === 'password' ? 'border-[#1A56DB] shadow-[0_0_0_3px_rgba(26,86,219,0.1)] bg-white' : 'border-gray-300'}`}>
                                        <svg className="text-gray-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                        <input
                                            type="password"
                                            placeholder="Create a strong password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onFocus={() => setFocused('password')}
                                            onBlur={() => setFocused('')}
                                            required
                                            className="flex-1 border-none bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">Must be at least 8 characters</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`mt-4 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6] text-white py-3.5 px-6 rounded-xl text-base font-semibold cursor-pointer tracking-tight shadow-md transition-all duration-200 ease-in-out hover:filter hover:brightness-105 hover:-translate-y-px active:translate-y-0 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                            Creating account…
                                        </span>
                                    ) : 'Create Account →'}
                                </button>
                            </form>

                            <div className="flex items-center gap-3 my-6">
                                <span className="flex-1 h-px bg-gray-200"></span>
                                <span className="text-sm text-gray-400 font-medium">or</span>
                                <span className="flex-1 h-px bg-gray-200"></span>
                            </div>

                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#1A56DB] font-semibold no-underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;