import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                const decoded = jwtDecode(data.token);
                const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                alert(`Welcome ${decoded.unique_name}! Role: ${userRole}`);
                if (userRole === "Admin") {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            } else {
                alert(data.message || "Login Failed!");
            }
        } catch (err) {
            console.error("Login Error:", err);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'DM Sans', sans-serif;
                    background: #05070f;
                    overflow: hidden;
                }

                /* ── Left panel ── */
                .login-left {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 52px 60px;
                    position: relative;
                    overflow: hidden;
                }

                .login-left::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(56,132,255,0.18) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 90%, rgba(100,60,255,0.14) 0%, transparent 55%),
                        linear-gradient(160deg, #07111e 0%, #05070f 50%, #0d0620 100%);
                    z-index: 0;
                }

                /* grid lines */
                .login-left::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                    background-size: 60px 60px;
                    z-index: 0;
                }

                .left-content { position: relative; z-index: 1; }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, #3884ff, #6034d4);
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 24px rgba(56,132,255,0.5);
                }

                .brand-icon svg { width: 22px; height: 22px; }

                .brand-name {
                    font-family: 'Syne', sans-serif;
                    font-weight: 800;
                    font-size: 22px;
                    color: #fff;
                    letter-spacing: -0.5px;
                }

                .brand-name span { color: #3884ff; }

                .hero-text {
                    margin-top: 80px;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(56,132,255,0.1);
                    border: 1px solid rgba(56,132,255,0.3);
                    border-radius: 100px;
                    padding: 6px 14px;
                    margin-bottom: 32px;
                }

                .badge-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: #3884ff;
                    box-shadow: 0 0 8px #3884ff;
                    animation: pulse-dot 2s ease-in-out infinite;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }

                .badge-text {
                    font-size: 12px;
                    font-weight: 500;
                    color: #7aabff;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .hero-headline {
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(38px, 4vw, 58px);
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.08;
                    letter-spacing: -2px;
                }

                .hero-headline .accent {
                    background: linear-gradient(90deg, #3884ff, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-sub {
                    margin-top: 20px;
                    font-size: 16px;
                    color: rgba(255,255,255,0.42);
                    line-height: 1.7;
                    max-width: 360px;
                    font-weight: 300;
                }

                .stats-row {
                    display: flex;
                    gap: 48px;
                    margin-top: 64px;
                }

                .stat { }
                .stat-num {
                    font-family: 'Syne', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -1px;
                }
                .stat-label {
                    font-size: 12px;
                    color: rgba(255,255,255,0.35);
                    margin-top: 2px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .left-footer {
                    position: relative; z-index: 1;
                    font-size: 13px;
                    color: rgba(255,255,255,0.2);
                }

                /* floating card */
                .float-card {
                    position: absolute;
                    bottom: 120px;
                    right: 40px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 20px 24px;
                    backdrop-filter: blur(20px);
                    z-index: 2;
                    animation: float 5s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .float-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 10px;
                }

                .float-avatars {
                    display: flex;
                    gap: -6px;
                }

                .avatar {
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    border: 2px solid #05070f;
                    margin-left: -6px;
                    font-size: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700;
                    color: #fff;
                }

                .float-count {
                    font-size: 13px;
                    color: rgba(255,255,255,0.6);
                    margin-top: 8px;
                }

                .float-count strong { color: #fff; }

                /* ── Right panel ── */
                .login-right {
                    width: 480px;
                    min-height: 100vh;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 52px;
                    position: relative;
                }

                .login-right::before {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 220px; height: 220px;
                    background: radial-gradient(circle, rgba(56,132,255,0.08) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .form-wrapper { width: 100%; }

                .form-eyebrow {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #3884ff;
                    margin-bottom: 10px;
                }

                .form-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 36px;
                    font-weight: 800;
                    color: #0a0e1a;
                    letter-spacing: -1.5px;
                    line-height: 1.1;
                    margin-bottom: 8px;
                }

                .form-sub {
                    font-size: 14px;
                    color: #8b93a7;
                    margin-bottom: 40px;
                    line-height: 1.6;
                }

                .field-group { margin-bottom: 20px; }

                .field-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #3a4057;
                    margin-bottom: 8px;
                    letter-spacing: 0.2px;
                }

                .field-wrap {
                    position: relative;
                }

                .field-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #b0b8cc;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                }

                .field-input {
                    width: 100%;
                    padding: 14px 16px 14px 44px;
                    border: 1.5px solid #eaecf0;
                    border-radius: 12px;
                    font-size: 14.5px;
                    font-family: 'DM Sans', sans-serif;
                    color: #0a0e1a;
                    background: #fafbfc;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }

                .field-input::placeholder { color: #b8bfcf; }

                .field-input:focus {
                    border-color: #3884ff;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(56,132,255,0.1);
                }

                .field-input:focus ~ .field-icon,
                .field-wrap:focus-within .field-icon { color: #3884ff; }

                .forgot-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: -10px;
                    margin-bottom: 28px;
                }

                .forgot-link {
                    font-size: 13px;
                    color: #3884ff;
                    text-decoration: none;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }

                .forgot-link:hover { opacity: 0.7; }

                .submit-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #1e6fff, #3884ff);
                    color: #fff;
                    font-family: 'Syne', sans-serif;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
                    box-shadow: 0 8px 24px rgba(56,132,255,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .submit-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 32px rgba(56,132,255,0.45);
                    background: linear-gradient(135deg, #1a63e8, #3178f0);
                }

                .submit-btn:active { transform: translateY(0); }

                .divider {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin: 28px 0;
                }

                .divider-line { flex: 1; height: 1px; background: #eaecf0; }
                .divider-text { font-size: 12px; color: #b0b8cc; font-weight: 500; white-space: nowrap; }

                .security-note {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 24px;
                }

                .security-note span {
                    font-size: 12px;
                    color: #b0b8cc;
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .login-left { display: none; }
                    .login-right { width: 100%; }
                }
            `}</style>

            <div className="login-root">
                {/* ── Left Brand Panel ── */}
                <div className="login-left">
                    <div className="left-content">
                        {/* Brand */}
                        <div className="brand">
                            <div className="brand-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <span className="brand-name">Edu<span>Sync</span></span>
                        </div>

                        {/* Hero */}
                        <div className="hero-text">
                            <div className="hero-badge">
                                <div className="badge-dot" />
                                <span className="badge-text">Learning Platform</span>
                            </div>
                            <h1 className="hero-headline">
                                Empowering<br />
                                <span className="accent">Education</span><br />
                                at Scale
                            </h1>
                            <p className="hero-sub">
                                A unified platform for students and administrators to manage, learn, and grow together.
                            </p>

                            <div className="stats-row">
                                <div className="stat">
                                    <div className="stat-num">12K+</div>
                                    <div className="stat-label">Students</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-num">340+</div>
                                    <div className="stat-label">Courses</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-num">98%</div>
                                    <div className="stat-label">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating presence card */}
                    <div className="float-card">
                        <div className="float-label">Active Now</div>
                        <div className="float-avatars">
                            {['#3884ff','#6034d4','#22c55e','#f59e0b'].map((c, i) => (
                                <div key={i} className="avatar" style={{ background: c, marginLeft: i === 0 ? 0 : '-6px' }}>
                                    {['A','B','C','D'][i]}
                                </div>
                            ))}
                        </div>
                        <div className="float-count"><strong>248</strong> users online</div>
                    </div>

                    <div className="left-footer">© 2025 EduSync. All rights reserved.</div>
                </div>

                {/* ── Right Form Panel ── */}
                <div className="login-right">
                    <div className="form-wrapper">
                        <div className="form-eyebrow">Welcome back</div>
                        <h2 className="form-title">Sign in to<br />your account</h2>
                        <p className="form-sub">Enter your credentials to access the EduSync platform.</p>

                        <form onSubmit={handleLogin}>
                            <div className="field-group">
                                <label className="field-label">Email Address</label>
                                <div className="field-wrap">
                                    <span className="field-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="name@domain.com"
                                        className="field-input"
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="field-label">Password</label>
                                <div className="field-wrap">
                                    <span className="field-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="field-input"
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="forgot-row">
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>

                            <button type="submit" className="submit-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                    <polyline points="10 17 15 12 10 7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                Login to EduSync
                            </button>
                        </form>

                        <div className="divider">
                            <div className="divider-line" />
                            <span className="divider-text">Secured by EduSync Auth</span>
                            <div className="divider-line" />
                        </div>

                        <div className="security-note">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0b8cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>256-bit encrypted connection</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;