import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, Check } from 'lucide-react';

const Login = () => {
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [showPass,      setShowPass]      = useState(false);
  const [emailError,    setEmailError]    = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  /* ── redirect already-logged-in users ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded  = jwtDecode(token);
        const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        navigate(userRole === 'Admin' ? '/admin-dashboard' : '/student-dashboard', { replace: true });
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  /* ── validation ── */
  const validateEmail = (v) => {
    if (!v) return 'Email field cannot be empty.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
    return '';
  };
  const validatePassword = (v) => {
    if (!v) return 'Password field cannot be empty.';
    if (v.length < 8) return 'Password must be at least 8 characters long.';
    return '';
  };

  /* ── submit ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        const decoded  = jwtDecode(data.token);
        const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const username = decoded.unique_name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User';
        localStorage.setItem('username', username);
        localStorage.setItem('role', userRole);
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

  const features = [
    'Personalized learning paths',
    'Live instructor sessions',
    'Track your progress',
  ];

  const stats = [
    { val: '50', suffix: 'K+', label: 'Students'     },
    { val: '200', suffix: '+', label: 'Courses'      },
    { val: '98',  suffix: '%', label: 'Satisfaction' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .login-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* ── Page background: full-screen, no padding gaps ── */}
      <div className="login-root w-screen h-screen flex items-center justify-center bg-[#2255D2] overflow-hidden">

        {/* ── Card shell ── */}
        <div className="w-full max-w-[980px] h-full sm:h-auto sm:max-h-[600px] mx-4 sm:mx-6 bg-white rounded-[20px] shadow-[0_32px_80px_rgba(15,28,77,0.22)] flex flex-col md:flex-row overflow-hidden">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="relative w-full md:w-[46%] flex-shrink-0 hidden md:flex flex-col p-8 bg-[#F0F4FF] border-r border-[#E8EEFF] overflow-hidden">

            {/* Ambient orbs */}
            <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-blue-500/[0.08] blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-blue-400/[0.07] blur-[60px] pointer-events-none" />

            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-auto relative z-10">
              <div className="w-[30px] h-[30px] bg-blue-600 rounded-[8px] flex items-center justify-center shadow-[0_4px_10px_rgba(34,85,210,0.28)] flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span className="serif-heading text-[16px] text-[#0F1C4D] italic">EduSync</span>
            </div>

            {/* Hero text */}
            <div className="relative z-10 mb-7">
              <h2 className="serif-heading text-[clamp(26px,3vw,38px)] text-[#0F1C4D] leading-[1.12] font-normal">
                Start your<br />
                <em className="text-blue-600 not-italic italic">learning journey</em><br />
                today.
              </h2>
              <p className="text-[13px] text-slate-400 mt-3 leading-[1.65] max-w-[280px]">
                Join thousands of students already achieving their goals with EduSync.
              </p>
            </div>

            {/* Feature list */}
            <div className="flex flex-col gap-2.5 relative z-10 mb-7">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[12.5px] font-medium text-[#4A5570]">
                  <div className="w-[22px] h-[22px] rounded-[7px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-blue-600" strokeWidth={2.5} />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="flex items-center border-t border-[#E8EEFF] pt-5 relative z-10">
              {stats.map((s, i) => (
                <div key={i} className={`flex-1 text-center ${i > 0 ? 'border-l border-[#E8EEFF]' : ''}`}>
                  <div className="text-[18px] font-extrabold text-[#0F1C4D] tracking-tight leading-none">
                    {s.val}<span className="text-blue-600">{s.suffix}</span>
                  </div>
                  <div className="text-[9.5px] font-bold tracking-[1.5px] uppercase text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="flex-1 flex flex-col px-10 py-8">

            {/* Top nav */}
            <div className="flex items-center justify-end mb-8">
              <span className="text-[12.5px] text-slate-400 mr-3">Don't have an account?</span>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full border-[1.5px] border-[#0F1C4D] text-[11.5px] font-bold tracking-[.5px] uppercase text-[#0F1C4D] hover:bg-[#0F1C4D] hover:text-white transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>

            {/* Form area */}
            <div className="flex-1 flex flex-col justify-center max-w-[320px]">
              <h1 className="serif-heading text-[26px] text-[#0F1C4D] italic leading-tight mb-1.5">Welcome back!</h1>
              <p className="text-[12.5px] text-slate-400 mb-7">Sign in to your EduSync account</p>

              <form onSubmit={handleLogin}>

                {/* Email */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-colors duration-150 placeholder:text-slate-400
                      ${emailError ? 'border-red-400 focus:border-red-400' : 'border-[#E8EEFF] focus:border-blue-500'}`}
                    style={{ fontFamily: 'DM Sans' }}
                    required
                  />
                  {emailError && <p className="text-[10.5px] text-red-500 mt-0.5">{emailError}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11.5px] font-bold text-[#0F1C4D] tracking-[.2px]">Password</label>
                    <Link to="/forgot-password" className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-3.5 pr-10 py-2.5 border-[1.5px] rounded-[10px] text-[13px] text-[#0F1C4D] bg-[#FAFBFF] outline-none transition-colors duration-150 placeholder:text-slate-400
                        ${passwordError ? 'border-red-400 focus:border-red-400' : 'border-[#E8EEFF] focus:border-blue-500'}`}
                      style={{ fontFamily: 'DM Sans' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-[10.5px] text-red-500 mt-0.5">{passwordError}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-full shadow-[0_6px_20px_rgba(34,85,210,0.35)] hover:shadow-[0_10px_28px_rgba(34,85,210,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Signing in…
                    </span>
                  ) : 'Sign In →'}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;