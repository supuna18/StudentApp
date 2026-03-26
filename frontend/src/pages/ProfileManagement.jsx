import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProfileManagement = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']; // NameIdentifier එක ගන්න

            // === මෙන්න මෙතනයි අලුත් API එක පාවිච්චි කරන්නේ ===
            fetch(`http://localhost:5005/api/auth/me`, { // අලුත් API එක
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                setUser(data); // එන දත්ත ටික User Object එකට දානවා
            })
            .catch(err => {
                console.error("Error fetching user data:", err);
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            });
        } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
    };

    if (!user) {
        return <div>Loading User Profile...</div>;
    }

    return (
        <div className="p-10 flex flex-col items-start">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Profile Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-2xl">
                <h2 className="text-xl font-bold text-blue-600 mb-5">Account Information</h2>
                <div className="flex flex-col md:flex-row gap-5 mb-8">
                    <div className="md:w-1/2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <input type="text" value={user.username} className="w-full p-3 border-2 border-slate-100 rounded-lg" readOnly />
                    </div>
                    <div className="md:w-1/2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input type="email" value={user.email} className="w-full p-3 border-2 border-slate-100 rounded-lg" readOnly />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <p className="text-slate-500">Member Since: {formatDate(user.createdAt)}</p>
                    <span className={`uppercase font-bold px-3 py-1 rounded-full text-xs ${user.role === 'Admin' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-400/10 text-slate-400'}`}>{user.role}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 w-full max-w-2xl mt-10">
                <h2 className="text-xl font-bold text-red-600 mb-5">Danger Zone</h2>
                <p className="text-slate-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                    onClick={() => {
                        if (window.confirm("Are you sure you want to delete your account?")) {
                            fetch(`http://localhost:5005/api/users/profile`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            }).then(res => {
                                if(res.ok) {
                                    localStorage.removeItem('token');
                                    navigate('/login', { replace: true });
                                } else {
                                    alert("Failed to delete account");
                                }
                            }).catch(err => console.error(err));
                        }
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all">
                    Delete My Account
                </button>
            </div>
        </div>
    );
};

export default ProfileManagement;