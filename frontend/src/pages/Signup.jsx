import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.root}>
            {/* Decorative background blobs - kept as absolute relative to the root */}
            <div style={styles.blobTop} />
            <div style={styles.blobBottom} />

            <div style={styles.container}>
                {/* Left panel */}
                <div style={styles.leftPanel}>
                    <div style={styles.brandArea}>
                        <div style={styles.logoMark}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.2"/>
                                <path d="M7 14L12 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span style={styles.logoText}>EduSync</span>
                    </div>

                    <div style={styles.leftContent}>
                        <h1 style={styles.heroTitle}>Start your<br />learning journey<br />today.</h1>
                        <p style={styles.heroSub}>Join thousands of students already achieving their goals with EduSync.</p>

                        <div style={styles.featureList}>
                            {['Personalized learning paths', 'Live instructor sessions', 'Track your progress'].map((f, i) => (
                                <div key={i} style={styles.featureItem}>
                                    <div style={styles.featureDot} />
                                    <span style={styles.featureText}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={styles.stat}>
                            <span style={styles.statNum}>50K+</span>
                            <span style={styles.statLabel}>Students</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.stat}>
                            <span style={styles.statNum}>200+</span>
                            <span style={styles.statLabel}>Courses</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.stat}>
                            <span style={styles.statNum}>98%</span>
                            <span style={styles.statLabel}>Satisfaction</span>
                        </div>
                    </div>
                </div>

                {/* Right panel — form */}
                <div style={styles.rightPanel}>
                    <div style={styles.formCard}>
                        <div style={styles.formHeader}>
                            <h2 style={styles.formTitle}>Create Account</h2>
                            <p style={styles.formSub}>Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSignup} style={styles.form}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Full Name</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    ...(focused === 'username' ? styles.inputWrapperFocused : {})
                                }}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    ...(focused === 'email' ? styles.inputWrapperFocused : {})
                                }}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    ...(focused === 'password' ? styles.inputWrapperFocused : {})
                                }}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        style={styles.input}
                                    />
                                </div>
                                <p style={styles.hint}>Must be at least 8 characters</p>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                ...styles.submitBtn,
                                ...(loading ? styles.submitBtnLoading : {})
                            }}>
                                {loading ? (
                                    <span style={styles.spinnerWrap}>
                                        <svg style={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                        </svg>
                                        Creating account…
                                    </span>
                                ) : 'Create Account →'}
                            </button>
                        </form>

                        <div style={styles.divider}>
                            <span style={styles.dividerLine} />
                            <span style={styles.dividerText}>or</span>
                            <span style={styles.dividerLine} />
                        </div>

                        <p style={styles.signinText}>
                            Already have an account?{' '}
                            <Link to="/login" style={styles.signinLink}>Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input::placeholder { color: #a0aec0; }
                input:focus { outline: none; }
                button:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
                button:active:not(:disabled) { transform: translateY(0); }
                button { transition: all 0.2s ease; }

                /* Add these to ensure proper scrolling */
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: auto; /* Allow scrolling for the whole page */
                }
            `}</style>
        </div>
    );
};

const BLUE = '#1A56DB';
const BLUE_DARK = '#1240A8';
const BLUE_LIGHT = '#EBF2FF';

const styles = {
    root: {
        // Changed to allow for flexible height and natural scrolling if content overflows
        // Removed minHeight: '100vh' to let it shrink/grow based on content
        // If you want it to always be at least 100vh, you can keep it, but ensure no parent prevents body scrolling.
        // It's generally better to let the body scroll.
        background: '#F0F6FF',
        display: 'flex',
        alignItems: 'center', // This will vertically center if content fits
        justifyContent: 'center',
        fontFamily: 'inherit',
        position: 'relative', // IMPORTANT: Blobs are absolute relative to this
        overflow: 'hidden', // IMPORTANT: Hide any overflow from the blobs themselves, not the content
        padding: '24px',
        // If content is short, it will center. If content is long, it will stretch.
        // For centering when short, and scrolling when long, you might need a wrapper div.
        // For now, let's remove minHeight and let the padding handle vertical spacing.
        minHeight: '100vh', // Keep this if you always want it to fill the screen
    },
    blobTop: {
        position: 'absolute',
        top: '-120px',
        right: '-120px',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,86,219,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    blobBottom: {
        position: 'absolute',
        bottom: '-140px',
        left: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    container: {
        display: 'flex',
        width: '100%',
        maxWidth: '960px',
        // Removed minHeight here as well, to allow the card to grow with content.
        // minHeight: '580px', // You can keep this if you want a minimum height for the card
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(26,86,219,0.15), 0 4px 16px rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 1,
    },

    /* ---- Left Panel ---- */
    leftPanel: {
        flex: '0 0 42%',
        background: `linear-gradient(145deg, ${BLUE_DARK} 0%, ${BLUE} 55%, #3B82F6 100%)`,
        padding: '44px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    brandArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoMark: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
    },
    logoText: {
        color: 'white',
        fontSize: '22px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
    },
    leftContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '24px',
        paddingBottom: '24px',
    },
    heroTitle: {
        color: 'white',
        fontSize: '30px',
        fontWeight: '700',
        lineHeight: '1.25',
        letterSpacing: '-0.5px',
        marginBottom: '16px',
    },
    heroSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: '14px',
        lineHeight: '1.6',
        marginBottom: '28px',
    },
    featureList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    featureDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)',
        flexShrink: 0,
    },
    featureText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: '14px',
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '16px 20px',
        backdropFilter: 'blur(8px)',
    },
    stat: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
    },
    statNum: {
        color: 'white',
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '-0.3px',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statDivider: {
        width: '1px',
        height: '32px',
        background: 'rgba(255,255,255,0.2)',
    },

    /* ---- Right Panel ---- */
    rightPanel: {
        flex: 1,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
    },
    formCard: {
        width: '100%',
        maxWidth: '380px',
    },
    formHeader: {
        marginBottom: '32px',
    },
    formTitle: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: '-0.5px',
        marginBottom: '6px',
    },
    formSub: {
        fontSize: '14px',
        color: '#64748B',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#334155',
        letterSpacing: '0.1px',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: '1.5px solid #E2E8F0',
        borderRadius: '12px',
        padding: '0 14px',
        background: '#FAFBFF',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputWrapperFocused: {
        borderColor: BLUE,
        boxShadow: `0 0 0 3px rgba(26,86,219,0.1)`,
        background: 'white',
    },
    inputIcon: {
        color: '#94A3B8',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        border: 'none',
        background: 'transparent',
        padding: '13px 0',
        fontSize: '14px',
        color: '#0F172A',
        width: '100%',
    },
    hint: {
        fontSize: '11.5px',
        color: '#94A3B8',
        marginTop: '2px',
    },
    submitBtn: {
        marginTop: '6px',
        background: `linear-gradient(135deg, ${BLUE} 0%, #3B82F6 100%)`,
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        letterSpacing: '0.2px',
        boxShadow: `0 4px 16px rgba(26,86,219,0.35)`,
    },
    submitBtnLoading: {
        opacity: 0.75,
        cursor: 'not-allowed',
    },
    spinnerWrap: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    spinner: {
        animation: 'spin 0.9s linear infinite',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '24px 0 16px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: '#E8EDF5',
    },
    dividerText: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '500',
    },
    signinText: {
        textAlign: 'center',
        fontSize: '14px',
        color: '#64748B',
    },
    signinLink: {
        color: BLUE,
        fontWeight: '600',
        textDecoration: 'none',
    },
};

export default Signup;