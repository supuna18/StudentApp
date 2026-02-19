import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ටෝකන් එක කියවන්න

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
                // 1. Save the token in the browser 
                localStorage.setItem('token', data.token);

                // 2. select the role from the token
                const decoded = jwtDecode(data.token);
                const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                alert(`Welcome ${decoded.unique_name}! Role: ${userRole}`);

                // 3. According to the role data sent to the database 
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
                <h2 className="text-4xl font-black mb-8 text-slate-900 text-center tracking-tight">Sign In</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input type="email" placeholder="name@domain.com" className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition" onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition" onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        Login to EduSync
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;