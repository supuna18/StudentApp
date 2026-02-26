import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Account created successfully! Please login.");
                navigate('/login'); // Signup වුණාම Login පේජ් එකට යවනවා
            } else {
                alert(data.message || "Signup Failed!");
            }
        } catch (err) {
            console.error("Signup Error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 font-sans">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
                <h2 className="text-4xl font-black mb-2 text-slate-900 text-center tracking-tight italic">EduSync</h2>
                <p className="text-slate-500 text-center mb-8 font-medium italic underline">Create your student account</p>
                
                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition" onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input type="email" placeholder="name@domain.com" className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition" onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition" onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1">
                        Create Account
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline italic underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;