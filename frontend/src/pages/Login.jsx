import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/* ── PopText: character-by-character elastic pop ── */
const PopText = ({ text = '', baseDelay = 0, step = 32 }) =>
    text.split('').map((ch, i) => (
        <span
            key={i}
            style={{
                display:        'inline-block',
                animation:      'charPop 0.5s cubic-bezier(0.34,1.9,0.64,1) both',
                animationDelay: `${baseDelay + i * step}ms`,
                whiteSpace:     ch === ' ' ? 'pre' : 'normal',
            }}
        >
            {ch === ' ' ? '\u00A0' : ch}
        </span>
    ));

/* ── WordPop: word-by-word pop for long sentences ── */
const WordPop = ({ text = '', baseDelay = 0, step = 50 }) =>
    text.split(' ').map((word, i) => (
        <span
            key={i}
            style={{
                display:        'inline-block',
                marginRight:    '0.3em',
                animation:      'charPop 0.44s cubic-bezier(0.34,1.8,0.64,1) both',
                animationDelay: `${baseDelay + i * step}ms`,
            }}
        >
            {word}
        </span>
    ));

const Login = () => {
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const navigate                = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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
                alert(data.message || 'Login Failed!');
            }
        } catch (err) {
            console.error('Login Error:', err);
        }
    };

    const stats = [
        { value: '12K+', label: 'Students' },
        { value: '340+', label: 'Courses'  },
        { value: '98%',  label: 'Uptime'   },
    ];

    const pillars = [
        { text: 'Adaptive Learning Engine'   },
        { text: 'Real-time Progress Insight' },
        { text: 'Enterprise-grade Security'  },
    ];

    const trustBadges = [
        { icon: '🔐', label: 'SOC 2 Type II'  },
        { icon: '✦',  label: 'GDPR Compliant' },
        { icon: '🛡',  label: 'ISO 27001'      },
    ];

    const avatars = [
        { bg: '#1D4ED8', initial: 'A' },
        { bg: '#2563EB', initial: 'B' },
        { bg: '#3B82F6', initial: 'C' },
        { bg: '#60A5FA', initial: 'D' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

                /* ── Design Tokens ── */
                :root {
                    --blue-950:  #030B1A;
                    --blue-900:  #061228;
                    --blue-800:  #0A1E42;
                    --blue-700:  #0F2D63;
                    --blue-600:  #1547A0;
                    --blue-500:  #1D63D8;
                    --blue-400:  #3B82F6;
                    --blue-300:  #60A5FA;
                    --blue-200:  #93C5FD;
                    --blue-100:  #DBEAFE;
                    --blue-50:   #EFF6FF;
                    --white:     #FFFFFF;
                    --slate-50:  #F8FAFF;
                    --slate-100: #EEF2FF;
                    --slate-200: #C7D7F4;
                    --slate-400: #7A90B8;
                    --slate-600: #3A4F72;
                    --slate-900: #0C1931;
                    --serif:     'Times New Roman', Times, Georgia, serif;
                    --sans:      'Poppins', sans-serif;
                    --ease-pop:  cubic-bezier(0.34,1.9,0.64,1);
                    --ease-out:  cubic-bezier(0.16,1,0.3,1);
                    --r-xl:  20px;
                    --r-lg:  16px;
                    --r-md:  12px;
                    --r-sm:  8px;
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                html, body, #root {
                    width:    100%;
                    height:   100%;
                    overflow: hidden;
                    font-family: var(--sans);
                }

                /* ── Keyframes ── */
                @keyframes charPop {
                    0%   { opacity:0; transform:scale(0.15) translateY(12px); }
                    65%  { opacity:1; transform:scale(1.14) translateY(-3px); }
                    100% { opacity:1; transform:scale(1)    translateY(0);    }
                }
                @keyframes riseIn {
                    from { opacity:0; transform:translateY(22px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
                @keyframes dot-pulse {
                    0%,100% { transform:scale(1);   box-shadow:0 0 0 0 rgba(96,165,250,0.7); }
                    50%     { transform:scale(1.25); box-shadow:0 0 0 7px rgba(96,165,250,0); }
                }
                @keyframes card-float {
                    0%,100% { transform:translateY(0);   }
                    50%     { transform:translateY(-9px); }
                }
                @keyframes blue-shimmer {
                    0%   { background-position:-280% center; }
                    100% { background-position: 280% center; }
                }
                @keyframes scan-line {
                    0%   { top: 0%;   opacity:0.6; }
                    100% { top: 100%; opacity:0;   }
                }

                /* ════════════════════════════════════
                   ROOT — full viewport, no scroll
                ════════════════════════════════════ */
                .l-root {
                    display:    flex;
                    width:      100vw;
                    height:     100vh;
                    overflow:   hidden;
                    background: var(--blue-950);
                }

                /* ════════════════════════════════════
                   LEFT PANEL
                ════════════════════════════════════ */
                .l-left {
                    flex:           1 1 0;
                    min-width:      0;
                    height:         100vh;
                    display:        flex;
                    flex-direction: column;
                    position:       relative;
                    overflow:       hidden;
                    padding:        48px 56px 40px;
                }

                /* Background layers */
                .l-left-bg {
                    position: absolute; inset: 0; z-index: 0;
                    background:
                        radial-gradient(ellipse 110% 65% at 0%   0%,   rgba(29,99,216,0.30) 0%, transparent 52%),
                        radial-gradient(ellipse 80%  80% at 100% 100%, rgba(10,30,66,0.40)  0%, transparent 55%),
                        radial-gradient(ellipse 60%  55% at 50%  50%,  rgba(15,45,99,0.20)  0%, transparent 70%),
                        linear-gradient(162deg, #071430 0%, #030B1A 45%, #050F25 100%);
                }

                /* Grid */
                .l-left-grid {
                    position: absolute; inset: 0; z-index: 0;
                    background-image:
                        linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px);
                    background-size: 60px 60px;
                }

                /* Scan line effect */
                .l-left-scan {
                    position:   absolute;
                    left:       0; right: 0;
                    height:     120px;
                    background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.04), transparent);
                    z-index:    0;
                    animation:  scan-line 8s linear infinite;
                }

                /* Top accent stripe */
                .l-left-stripe {
                    position:   absolute;
                    top: 0; left: 0; right: 0;
                    height:     2px;
                    z-index:    2;
                    background: linear-gradient(90deg, transparent 0%, var(--blue-400) 35%, var(--blue-200) 65%, transparent 100%);
                }

                .l-left-inner {
                    position:       relative;
                    z-index:        1;
                    display:        flex;
                    flex-direction: column;
                    height:         100%;
                }

                /* Brand */
                .l-brand {
                    display:     flex;
                    align-items: center;
                    gap:         13px;
                }

                .l-brand-mark {
                    width:         42px;
                    height:        42px;
                    border-radius: var(--r-sm);
                    background:    linear-gradient(135deg, var(--blue-500), var(--blue-300));
                    display:       flex;
                    align-items:   center;
                    justify-content: center;
                    box-shadow:    0 0 28px rgba(59,130,246,0.50), inset 0 1px 0 rgba(255,255,255,0.18);
                    flex-shrink:   0;
                }
                .l-brand-mark svg { width:22px; height:22px; }

                .l-brand-name {
                    font-family:    var(--serif);
                    font-size:      23px;
                    font-weight:    700;
                    font-style:     italic;
                    letter-spacing: 0.4px;
                    color:          var(--white);
                    line-height:    1;
                }
                .l-brand-name em {
                    font-style: normal;
                    color:      var(--blue-300);
                }

                /* Hero */
                .l-hero {
                    flex:           1;
                    display:        flex;
                    flex-direction: column;
                    justify-content: center;
                    padding:        28px 0 24px;
                }

                /* Badge */
                .l-badge {
                    display:       inline-flex;
                    align-items:   center;
                    gap:           9px;
                    background:    rgba(59,130,246,0.10);
                    border:        1px solid rgba(59,130,246,0.28);
                    border-radius: 100px;
                    padding:       6px 16px 6px 10px;
                    margin-bottom: 26px;
                    width:         fit-content;
                    animation:     riseIn 0.5s 0.1s var(--ease-out) both;
                }
                .l-badge-dot {
                    width:         8px; height: 8px;
                    border-radius: 50%;
                    background:    var(--blue-400);
                    flex-shrink:   0;
                    animation:     dot-pulse 2.2s ease-in-out infinite;
                }
                .l-badge-text {
                    font-family:    var(--sans);
                    font-size:      10.5px;
                    font-weight:    600;
                    letter-spacing: 1.6px;
                    text-transform: uppercase;
                    color:          var(--blue-300);
                }

                /* Headline — Times New Roman */
                .l-headline {
                    font-family:    var(--serif);
                    font-size:      clamp(36px, 3.6vw, 58px);
                    font-weight:    700;
                    font-style:     italic;
                    line-height:    1.07;
                    letter-spacing: -0.5px;
                    color:          var(--white);
                    margin-bottom:  20px;
                }
                .l-headline .blue-word {
                    font-style:              normal;
                    background:              linear-gradient(100deg, var(--blue-400) 0%, var(--blue-200) 50%, var(--blue-400) 100%);
                    background-size:         250% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip:         text;
                    animation:               blue-shimmer 5s linear infinite;
                }

                /* Sub */
                .l-sub {
                    font-family:   var(--sans);
                    font-size:     14px;
                    font-weight:   300;
                    color:         rgba(255,255,255,0.38);
                    line-height:   1.82;
                    max-width:     390px;
                    margin-bottom: 36px;
                }

                /* Pillars */
                .l-pillars {
                    display:        flex;
                    flex-direction: column;
                    gap:            11px;
                    margin-bottom:  42px;
                }
                .l-pillar {
                    display:     flex;
                    align-items: center;
                    gap:         11px;
                    opacity:     0;
                    animation:   riseIn 0.42s var(--ease-out) both;
                }
                .l-pillar-check {
                    width:         18px; height: 18px;
                    border-radius: 50%;
                    background:    rgba(59,130,246,0.12);
                    border:        1px solid rgba(59,130,246,0.30);
                    display:       flex;
                    align-items:   center;
                    justify-content: center;
                    flex-shrink:   0;
                }
                .l-pillar-check svg { width:10px; height:10px; }
                .l-pillar-text {
                    font-family: var(--sans);
                    font-size:   13px;
                    font-weight: 400;
                    color:       rgba(255,255,255,0.48);
                }

                /* Stats */
                .l-stats {
                    display:    flex;
                    gap:        40px;
                    padding-top: 24px;
                    border-top: 1px solid rgba(59,130,246,0.15);
                }
                .l-stat-val {
                    font-family:    var(--serif);
                    font-size:      27px;
                    font-weight:    700;
                    font-style:     italic;
                    color:          var(--blue-300);
                    letter-spacing: -0.5px;
                    line-height:    1;
                }
                .l-stat-lbl {
                    font-family:    var(--sans);
                    font-size:      10.5px;
                    font-weight:    500;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color:          rgba(255,255,255,0.24);
                    margin-top:     5px;
                }

                /* Footer */
                .l-footer {
                    font-family:    var(--sans);
                    font-size:      11.5px;
                    font-weight:    300;
                    color:          rgba(255,255,255,0.15);
                    letter-spacing: 0.3px;
                    padding-top:    24px;
                }

                /* Float card */
                .l-float {
                    position:        absolute;
                    bottom:          92px;
                    right:           44px;
                    min-width:       196px;
                    background:      rgba(255,255,255,0.04);
                    border:          1px solid rgba(59,130,246,0.22);
                    border-radius:   var(--r-lg);
                    padding:         18px 22px;
                    backdrop-filter: blur(32px);
                    z-index:         3;
                    opacity:         0;
                    animation:       card-float 7s ease-in-out infinite, riseIn 0.6s 1.7s var(--ease-out) both;
                }
                .l-float-header {
                    display:         flex;
                    align-items:     center;
                    justify-content: space-between;
                    margin-bottom:   12px;
                }
                .l-float-title {
                    font-family:    var(--sans);
                    font-size:      10px;
                    font-weight:    600;
                    text-transform: uppercase;
                    letter-spacing: 1.4px;
                    color:          rgba(255,255,255,0.28);
                }
                .l-float-live {
                    display:        flex;
                    align-items:    center;
                    gap:            5px;
                    font-family:    var(--sans);
                    font-size:      9px;
                    font-weight:    600;
                    color:          #4ade80;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .l-float-live-dot {
                    width:         6px; height: 6px;
                    border-radius: 50%;
                    background:    #4ade80;
                    animation:     dot-pulse 1.8s ease-in-out infinite;
                }
                .l-avatars { display: flex; margin-bottom: 10px; }
                .l-avatar {
                    width:         30px; height: 30px;
                    border-radius: 50%;
                    border:        2px solid var(--blue-950);
                    display:       flex;
                    align-items:   center;
                    justify-content: center;
                    font-family:   var(--sans);
                    font-size:     11px;
                    font-weight:   700;
                    color:         var(--white);
                }
                .l-float-count {
                    font-family: var(--sans);
                    font-size:   12px;
                    font-weight: 400;
                    color:       rgba(255,255,255,0.40);
                }
                .l-float-count strong { color: var(--white); font-weight: 700; }

                /* ════════════════════════════════════
                   RIGHT PANEL — white, perfectly fitted
                ════════════════════════════════════ */
                .l-right {
                    width:       460px;
                    flex-shrink: 0;
                    height:      100vh;
                    background:  var(--white);
                    display:     flex;
                    align-items: center;
                    justify-content: center;
                    position:    relative;
                    overflow:    hidden;           /* ← hard clip, nothing escapes */
                }

                /* Top accent */
                .l-right::before {
                    content:    '';
                    position:   absolute;
                    top:0; left:0; right:0;
                    height:     3px;
                    background: linear-gradient(90deg, transparent, var(--blue-500) 50%, transparent);
                    z-index:    2;
                }

                /* Soft background blobs — clipped inside panel */
                .l-right-blob-a {
                    position:      absolute;
                    top:    -120px; right: -120px;
                    width:         320px; height: 320px;
                    border-radius: 50%;
                    background:    radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
                    pointer-events: none;
                }
                .l-right-blob-b {
                    position:      absolute;
                    bottom: -80px; left: -80px;
                    width:         220px; height: 220px;
                    border-radius: 50%;
                    background:    radial-gradient(circle, rgba(29,99,216,0.05) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Scrollable inner container */
                .l-form-scroll {
                    width:      100%;
                    height:     100vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display:    flex;
                    align-items: center;
                    justify-content: center;
                    padding:    40px 48px;
                    position:   relative;
                    z-index:    1;

                    /* hide scrollbar */
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .l-form-scroll::-webkit-scrollbar { display: none; }

                .l-form-wrap { width: 100%; }

                /* Eyebrow */
                .l-eyebrow {
                    display:        flex;
                    align-items:    center;
                    gap:            10px;
                    font-family:    var(--sans);
                    font-size:      10.5px;
                    font-weight:    700;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    color:          var(--blue-500);
                    margin-bottom:  12px;
                }
                .l-eyebrow::before {
                    content:    '';
                    width:      18px; height: 2px;
                    background: var(--blue-500);
                    border-radius: 2px;
                    flex-shrink: 0;
                }

                /* Title — Times New Roman, on ONE clean block */
                .l-form-title {
                    font-family:    var(--serif);
                    font-size:      36px;
                    font-weight:    700;
                    font-style:     italic;
                    letter-spacing: -0.8px;
                    line-height:    1.12;
                    color:          var(--slate-900);
                    margin-bottom:  8px;
                }

                /* Sub */
                .l-form-sub {
                    font-family:   var(--sans);
                    font-size:     13px;
                    font-weight:   300;
                    color:         var(--slate-400);
                    line-height:   1.7;
                    margin-bottom: 28px;
                }

                /* Progress segments */
                .l-progress {
                    display:       flex;
                    gap:           5px;
                    margin-bottom: 26px;
                    opacity:       0;
                    animation:     riseIn 0.4s 0.88s var(--ease-out) both;
                }
                .l-prog {
                    flex:          1;
                    height:        3px;
                    border-radius: 99px;
                    background:    var(--slate-100);
                }
                .l-prog.active {
                    background: linear-gradient(90deg, var(--blue-600), var(--blue-400));
                }

                /* Field */
                .l-field {
                    margin-bottom: 16px;
                    opacity:       0;
                    animation:     riseIn 0.4s var(--ease-out) both;
                }
                .l-label {
                    display:        block;
                    font-family:    var(--sans);
                    font-size:      11.5px;
                    font-weight:    600;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                    color:          var(--slate-600);
                    margin-bottom:  7px;
                }
                .l-input-wrap { position: relative; }
                .l-input-icon {
                    position:    absolute;
                    left:        14px;
                    top:         50%;
                    transform:   translateY(-50%);
                    color:       var(--slate-200);
                    display:     flex;
                    align-items: center;
                    pointer-events: none;
                    transition:  color 0.2s;
                }
                .l-input {
                    width:          100%;
                    padding:        13px 14px 13px 42px;
                    border:         1.5px solid var(--slate-100);
                    border-radius:  var(--r-md);
                    font-family:    var(--sans);
                    font-size:      13.5px;
                    font-weight:    400;
                    color:          var(--slate-900);
                    background:     var(--slate-50);
                    outline:        none;
                    transition:     border-color 0.2s, box-shadow 0.2s, background 0.2s;
                }
                .l-input::placeholder { color: var(--slate-200); font-weight: 300; }
                .l-input:focus {
                    border-color: var(--blue-500);
                    background:   var(--white);
                    box-shadow:   0 0 0 4px rgba(29,99,216,0.10);
                }
                .l-input-wrap:focus-within .l-input-icon { color: var(--blue-500); }

                /* Forgot */
                .l-forgot-row {
                    display:         flex;
                    justify-content: flex-end;
                    margin:          -4px 0 20px;
                    opacity:         0;
                    animation:       riseIn 0.4s 1.1s var(--ease-out) both;
                }
                .l-forgot {
                    font-family:    var(--sans);
                    font-size:      12px;
                    font-weight:    600;
                    color:          var(--blue-500);
                    text-decoration: none;
                    letter-spacing: 0.2px;
                    transition:     opacity 0.2s;
                }
                .l-forgot:hover { opacity: 0.65; }

                /* Button */
                .l-btn {
                    width:           100%;
                    padding:         13px 24px;
                    border:          none;
                    border-radius:   var(--r-md);
                    background:      linear-gradient(130deg, var(--blue-700), var(--blue-500));
                    color:           var(--white);
                    font-family:     var(--sans);
                    font-size:       14px;
                    font-weight:     600;
                    letter-spacing:  0.3px;
                    cursor:          pointer;
                    display:         flex;
                    align-items:     center;
                    justify-content: center;
                    gap:             10px;
                    box-shadow:      0 6px 28px rgba(29,99,216,0.30), inset 0 1px 0 rgba(255,255,255,0.12);
                    position:        relative;
                    overflow:        hidden;
                    transition:      transform 0.15s, box-shadow 0.2s;
                    opacity:         0;
                    animation:       riseIn 0.4s 1.2s var(--ease-out) both;
                }
                /* Shimmer sweep */
                .l-btn::after {
                    content:    '';
                    position:   absolute;
                    top:0; left:-100%;
                    width:      55%;
                    height:     100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
                    transform:  skewX(-22deg);
                    transition: left 0.55s ease;
                }
                .l-btn:hover::after { left: 160%; }
                .l-btn:hover {
                    transform:  translateY(-2px);
                    box-shadow: 0 10px 36px rgba(29,99,216,0.40), inset 0 1px 0 rgba(255,255,255,0.12);
                }
                .l-btn:active { transform: translateY(0); }

                /* Divider */
                .l-sep {
                    display:     flex;
                    align-items: center;
                    gap:         12px;
                    margin:      22px 0;
                    opacity:     0;
                    animation:   riseIn 0.4s 1.3s var(--ease-out) both;
                }
                .l-sep-line { flex:1; height:1px; background: var(--slate-100); }
                .l-sep-text {
                    font-family:    var(--sans);
                    font-size:      11px;
                    font-weight:    500;
                    color:          var(--slate-200);
                    white-space:    nowrap;
                    letter-spacing: 0.3px;
                }

                /* Security */
                .l-secure {
                    display:         flex;
                    align-items:     center;
                    justify-content: center;
                    gap:             7px;
                    opacity:         0;
                    animation:       riseIn 0.4s 1.38s var(--ease-out) both;
                }
                .l-secure-text {
                    font-family:    var(--sans);
                    font-size:      11.5px;
                    font-weight:    400;
                    color:          var(--slate-200);
                    letter-spacing: 0.2px;
                }

                /* Trust */
                .l-trust {
                    display:         flex;
                    align-items:     center;
                    justify-content: center;
                    gap:             20px;
                    margin-top:      18px;
                    padding-top:     18px;
                    border-top:      1px solid var(--slate-100);
                    opacity:         0;
                    animation:       riseIn 0.4s 1.46s var(--ease-out) both;
                }
                .l-trust-badge {
                    display:     flex;
                    align-items: center;
                    gap:         5px;
                }
                .l-trust-label {
                    font-family:    var(--sans);
                    font-size:      10.5px;
                    font-weight:    500;
                    color:          var(--slate-200);
                    letter-spacing: 0.2px;
                }

                /* ── Responsive ── */
                @media (max-width: 960px) {
                    .l-left  { display: none; }
                    .l-right { width: 100%; }
                }
            `}</style>

            <div className="l-root">

                {/* ══════ LEFT PANEL ══════ */}
                <div className="l-left">
                    <div className="l-left-bg"     />
                    <div className="l-left-grid"   />
                    <div className="l-left-scan"   />
                    <div className="l-left-stripe" />

                    <div className="l-left-inner">

                        {/* Brand */}
                        <div className="l-brand">
                            <div className="l-brand-mark">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <div className="l-brand-name">
                                <PopText text="Edu"  baseDelay={80}  step={55} />
                                <em><PopText text="Sync" baseDelay={245} step={55} /></em>
                            </div>
                        </div>

                        {/* Hero */}
                        <div className="l-hero">
                            <div className="l-badge">
                                <div className="l-badge-dot" />
                                <span className="l-badge-text">
                                    <PopText text="Learning Platform" baseDelay={310} step={26} />
                                </span>
                            </div>

                            <h1 className="l-headline">
                                <div><PopText text="Empowering" baseDelay={450} step={32} /></div>
                                <div className="blue-word">
                                    <PopText text="Education" baseDelay={770} step={32} />
                                </div>
                                <div><PopText text="at Scale." baseDelay={1058} step={32} /></div>
                            </h1>

                            <p className="l-sub">
                                <WordPop
                                    text="A unified platform for students and administrators — manage, learn, and grow together."
                                    baseDelay={1250}
                                    step={44}
                                />
                            </p>

                            <div className="l-pillars">
                                {pillars.map(({ text }, i) => (
                                    <div
                                        key={i}
                                        className="l-pillar"
                                        style={{ animationDelay: `${1.56 + i * 0.10}s` }}
                                    >
                                        <div className="l-pillar-check">
                                            <svg viewBox="0 0 12 12" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="2,6 5,9 10,3" />
                                            </svg>
                                        </div>
                                        <span className="l-pillar-text">
                                            <PopText text={text} baseDelay={1620 + i * 100} step={25} />
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="l-stats">
                                {stats.map(({ value, label }, i) => (
                                    <div key={i}>
                                        <div className="l-stat-val">
                                            <PopText text={value} baseDelay={2000 + i * 85} step={46} />
                                        </div>
                                        <div className="l-stat-lbl">
                                            <PopText text={label} baseDelay={2090 + i * 85} step={34} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="l-footer">
                            <PopText text="© 2025 EduSync · All rights reserved." baseDelay={2380} step={14} />
                        </div>
                    </div>

                    {/* Floating card */}
                    <div className="l-float">
                        <div className="l-float-header">
                            <div className="l-float-title">
                                <PopText text="Active Now" baseDelay={1820} step={28} />
                            </div>
                            <div className="l-float-live">
                                <div className="l-float-live-dot" /> Live
                            </div>
                        </div>
                        <div className="l-avatars">
                            {avatars.map(({ bg, initial }, i) => (
                                <div
                                    key={i}
                                    className="l-avatar"
                                    style={{ background: bg, marginLeft: i === 0 ? 0 : '-8px' }}
                                >
                                    {initial}
                                </div>
                            ))}
                        </div>
                        <div className="l-float-count">
                            <strong>248</strong> learners online
                        </div>
                    </div>
                </div>

                {/* ══════ RIGHT PANEL ══════ */}
                <div className="l-right">
                    <div className="l-right-blob-a" />
                    <div className="l-right-blob-b" />

                    <div className="l-form-scroll">
                        <div className="l-form-wrap">

                            {/* Eyebrow */}
                            <div className="l-eyebrow">
                                <PopText text="Welcome back" baseDelay={110} step={32} />
                            </div>

                            {/* Title — Times New Roman, single block, no overflow */}
                            <h2 className="l-form-title">
                                <PopText text="Sign in to your account" baseDelay={280} step={32} />
                            </h2>

                            {/* Sub */}
                            <p className="l-form-sub">
                                <WordPop
                                    text="Enter your credentials to access the EduSync platform."
                                    baseDelay={940}
                                    step={40}
                                />
                            </p>

                            {/* Progress */}
                            <div className="l-progress">
                                <div className="l-prog active" />
                                <div className="l-prog" />
                                <div className="l-prog" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin}>
                                <div className="l-field" style={{ animationDelay: '1.0s' }}>
                                    <label className="l-label">Email Address</label>
                                    <div className="l-input-wrap">
                                        <span className="l-input-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="name@domain.com"
                                            className="l-input"
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="l-field" style={{ animationDelay: '1.1s' }}>
                                    <label className="l-label">Password</label>
                                    <div className="l-input-wrap">
                                        <span className="l-input-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                        </span>
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            className="l-input"
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="l-forgot-row">
                                    <a href="#" className="l-forgot">
                                        <PopText text="Forgot password?" baseDelay={1240} step={24} />
                                    </a>
                                </div>

                                <button type="submit" className="l-btn">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    <PopText text="Login to EduSync" baseDelay={1330} step={26} />
                                </button>
                            </form>

                            {/* Separator */}
                            <div className="l-sep">
                                <div className="l-sep-line" />
                                <span className="l-sep-text">
                                    <PopText text="Secured by EduSync Auth" baseDelay={1530} step={18} />
                                </span>
                                <div className="l-sep-line" />
                            </div>

                            {/* Security */}
                            <div className="l-secure">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C7D7F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                <span className="l-secure-text">
                                    <PopText text="256-bit TLS encrypted connection" baseDelay={1660} step={17} />
                                </span>
                            </div>

                            {/* Trust badges */}
                            <div className="l-trust">
                                {trustBadges.map(({ icon, label }, i) => (
                                    <div key={i} className="l-trust-badge">
                                        <span style={{ fontSize: '12px' }}>{icon}</span>
                                        <span className="l-trust-label">
                                            <PopText text={label} baseDelay={1790 + i * 70} step={19} />
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Login;