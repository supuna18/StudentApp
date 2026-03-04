import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                const decoded  = jwtDecode(data.token);
                const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                alert(`Welcome ${decoded.unique_name}! Role: ${userRole}`);
                navigate(userRole === 'Admin' ? '/admin-dashboard' : '/student-dashboard');
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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
                    width: 100%; height: 100%;
                    font-family: var(--sans);
                    -webkit-font-smoothing: antialiased;
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

                /* ── Page ── */
                .page {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 28px 20px;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #8B7FF0 0%, #6C5CE7 40%, #5649C0 70%, #7B6FE8 100%);
                }

                /* BG dot pattern */
                .page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
                    background-size: 28px 28px;
                    z-index: 0;
                }

                /* BG blobs */
                .page-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    pointer-events: none;
                    z-index: 0;
                }
                .page-blob-a {
                    width: 420px; height: 420px;
                    top: -160px; left: -120px;
                    background: rgba(139,127,240,0.55);
                }
                .page-blob-b {
                    width: 340px; height: 340px;
                    bottom: -120px; right: -80px;
                    background: rgba(86,73,192,0.50);
                }

                /* ── Card ── */
                .card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 1000px;
                    min-height: 580px;
                    border-radius: 20px;
                    background: var(--bg-card);
                    box-shadow:
                        0 4px 8px rgba(0,0,0,0.06),
                        0 20px 60px rgba(0,0,0,0.18),
                        0 0 0 1px rgba(255,255,255,0.6);
                    display: flex;
                    overflow: hidden;
                    animation: fadeUp 0.65s var(--ease) both;
                }

                /* ── Top nav bar ── */
                .topbar {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    z-index: 10;
                    background: rgba(248,249,255,0.95);
                    border-bottom: 1px solid rgba(108,92,231,0.08);
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }
                .nav-brand-icon {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }
                .nav-diamond {
                    width: 8px; height: 8px;
                    background: var(--violet);
                    transform: rotate(45deg);
                    border-radius: 2px;
                }
                .nav-diamond.sm {
                    width: 5px; height: 5px;
                    background: var(--violet-lt);
                }
                .nav-brand-name {
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    color: var(--violet);
                }

                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .nav-hint {
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--text-soft);
                }
                .nav-btn {
                    padding: 7px 18px;
                    border: 1.5px solid var(--text);
                    border-radius: 100px;
                    background: transparent;
                    font-family: var(--sans);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                    color: var(--text);
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                }
                .nav-btn:hover {
                    background: var(--text);
                    color: var(--white);
                }

                /* ── Left illustration panel ── */
                .panel-left {
                    width: 46%;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 32px 40px;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(160deg, #FFFFFF 0%, #F0F1FF 60%, #EAE9FF 100%);
                }

                /* Floating decorative shards */
                .shard {
                    position: absolute;
                    border-radius: 4px;
                    animation: floatShard var(--dur, 5s) ease-in-out infinite;
                    opacity: 0.55;
                }
                .shard-1 { width:18px;height:18px; top:18%; left:10%; background:var(--violet-lt); transform:rotate(30deg); --r:30deg; --d:-14px; --dur:4.5s; }
                .shard-2 { width:12px;height:12px; top:30%; left:82%; background:var(--teal); transform:rotate(45deg); --r:45deg; --d:-10px; --dur:6s; }
                .shard-3 { width:22px;height:22px; top:70%; left:8%; background:#C5C0FF; transform:rotate(15deg); --r:15deg; --d:-8px; --dur:5.5s; }
                .shard-4 { width:10px;height:10px; top:78%; left:75%; background:var(--coral); transform:rotate(60deg); --r:60deg; --d:-12px; --dur:4s; }
                .shard-5 { width:14px;height:14px; top:50%; left:88%; background:var(--violet); transform:rotate(20deg); --r:20deg; --d:-16px; --dur:7s; opacity:0.3; }
                .shard-6 { width:8px; height:8px; top:14%; left:60%; background:var(--teal); transform:rotate(45deg); --r:45deg; --d:-9px; --dur:5s; }

                /* Isometric illustration */
                .illo-wrap {
                    animation: floatIllo 6s ease-in-out infinite;
                    width: 100%;
                    max-width: 340px;
                }

                .illo-svg {
                    width: 100%;
                    height: auto;
                }

                /* ── Right form panel ── */
                .panel-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 52px 48px;
                    position: relative;
                }

                .form-wrap {
                    width: 100%;
                    max-width: 360px;
                    animation: fadeUp 0.6s 0.18s var(--ease) both;
                }

                .form-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text);
                    letter-spacing: -0.5px;
                    margin-bottom: 4px;
                    line-height: 1.2;
                }
                .form-sub {
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--text-muted);
                    margin-bottom: 30px;
                }

                /* Fields */
                .field {
                    margin-bottom: 20px;
                    animation: fadeUp 0.5s var(--ease) both;
                }
                .label {
                    display: block;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 8px;
                }
                .input-wrap { position: relative; }
                .input {
                    width: 100%;
                    padding: 13px 16px;
                    border: 1.5px solid var(--border);
                    border-radius: 10px;
                    font-family: var(--sans);
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--text);
                    background: var(--field-bg);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .input.has-icon { padding-right: 46px; }
                .input::placeholder { color: var(--text-muted); font-weight: 300; }
                .input:focus {
                    border-color: var(--border-foc);
                    box-shadow: 0 0 0 3px var(--violet-dim);
                }

                /* Password toggle */
                .eye-btn {
                    position: absolute;
                    right: 14px; top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    padding: 2px;
                    transition: color 0.2s;
                }
                .eye-btn:hover { color: var(--violet); }

                /* Submit button */
                .btn {
                    width: 100%;
                    padding: 14px 24px;
                    border: none;
                    border-radius: 100px;
                    background: linear-gradient(130deg, var(--violet-dark) 0%, var(--violet) 60%, var(--violet-lt) 100%);
                    color: var(--white);
                    font-family: var(--sans);
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 6px 24px rgba(108,92,231,0.38);
                    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
                    margin-top: 6px;
                    margin-bottom: 28px;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 32px rgba(108,92,231,0.48);
                }
                .btn:active { transform: translateY(0); }
                .btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

                .spinner {
                    width: 17px; height: 17px;
                    border: 2.5px solid rgba(255,255,255,0.35);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                /* Social row */
                .social-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    animation: fadeIn 0.5s 0.7s both;
                }
                .social-label {
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--text-muted);
                    white-space: nowrap;
                }
                .social-btn {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    border: 1.5px solid var(--border);
                    background: var(--white);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
                    flex-shrink: 0;
                }
                .social-btn:hover {
                    border-color: var(--violet-lt);
                    box-shadow: 0 4px 14px rgba(108,92,231,0.18);
                    transform: translateY(-2px);
                }
                .social-btn svg { width: 18px; height: 18px; }
            `}</style>

            <div className="page">
                <div className="page-blob page-blob-a" />
                <div className="page-blob page-blob-b" />

                <div className="card">

                    {/* ── Top bar ── */}
                    <div className="topbar">
                        <div className="nav-brand">
                            <div className="nav-brand-icon">
                                <div className="nav-diamond sm" style={{ marginRight: 1 }} />
                                <div className="nav-diamond" />
                                <div className="nav-diamond sm" style={{ marginLeft: 1 }} />
                            </div>
                            <span className="nav-brand-name">EduSync</span>
                        </div>
                        <div className="nav-right">
                            <span className="nav-hint">Already have an account?</span>
                            <button className="nav-btn">SIGN IN</button>
                        </div>
                    </div>

                    {/* ── Left illustration ── */}
                    <div className="panel-left">
                        {/* Floating shards */}
                        <div className="shard shard-1" />
                        <div className="shard shard-2" />
                        <div className="shard shard-3" />
                        <div className="shard shard-4" />
                        <div className="shard shard-5" />
                        <div className="shard shard-6" />

                        {/* Isometric illustration (SVG) */}
                        <div className="illo-wrap">
                            <svg className="illo-svg" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <div className="panel-right">
                        <div className="form-wrap">

                            <h2 className="form-title">Welcome to EduSync!</h2>
                            <p className="form-sub">Sign in to your account</p>

                            <form onSubmit={handleLogin}>
                                <div className="field" style={{ animationDelay: '0.28s' }}>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        placeholder="edusync001@gmail.com"
                                        className="input"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="field" style={{ animationDelay: '0.36s' }}>
                                    <label className="label">Password</label>
                                    <div className="input-wrap">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="8+ characters"
                                            className="input has-icon"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
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
                                </div>

                                <button type="submit" className="btn" disabled={loading} style={{ animationDelay: '0.44s' }}>
                                    {loading ? <div className="spinner" /> : 'Login'}
                                </button>
                            </form>

                            {/* Social */}
                            <div className="social-row">
                                <span className="social-label">Create account with</span>

                                {/* Facebook */}
                                <button className="social-btn" title="Continue with Facebook">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" rx="12" fill="#1877F2"/>
                                        <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.1 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 7.1 11.6 6 13 6H15.5V8Z" fill="white"/>
                                    </svg>
                                </button>

                                {/* LinkedIn */}
                                <button className="social-btn" title="Continue with LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" rx="12" fill="#0A66C2"/>
                                        <path d="M7 10H9.5V17H7V10ZM8.25 9C7.56 9 7 8.44 7 7.75C7 7.06 7.56 6.5 8.25 6.5C8.94 6.5 9.5 7.06 9.5 7.75C9.5 8.44 8.94 9 8.25 9Z" fill="white"/>
                                        <path d="M11 10H13.4V11.1H13.44C13.79 10.46 14.6 9.8 15.84 9.8C18.38 9.8 18.84 11.48 18.84 13.65V17H16.34V14.16C16.34 13.18 16.32 11.91 14.96 11.91C13.58 11.91 13.38 12.99 13.38 14.08V17H10.88V10H11Z" fill="white"/>
                                    </svg>
                                </button>

                                {/* Google */}
                                <button className="social-btn" title="Continue with Google">
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

                </div>
            </div>
        </>
    );
};

export default Login;