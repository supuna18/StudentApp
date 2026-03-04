import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, BookOpen, LogOut, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">
            {/* Sidebar - Dark Slate Theme */}
            <div className="w-72 bg-[#1e293b] border-r border-slate-800 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20 italic">E</div>
                    <h2 className="text-2xl font-black tracking-tighter text-white italic">EduSync <span className="text-xs text-blue-500 block not-italic font-bold tracking-widest uppercase">Admin Portal</span></h2>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem icon={<LayoutDashboard size={20}/>} label="Analytics" active />
                    <NavItem icon={<Users size={20}/>} label="User Management" />
                    <NavItem icon={<ShieldAlert size={20}/>} label="Safety Approvals" />
                    <NavItem icon={<BookOpen size={20}/>} label="Resource Manager" />
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold">
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">System Overview</h1>
                        <p className="text-slate-400 font-medium">Real-time monitoring and administrative controls.</p>
                    </div>
                    <div className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full text-sm font-bold border border-blue-500/20 flex items-center gap-2">
                        <Activity size={16} /> System Live
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <StatCard title="Total Students" value="1,248" change="+12%" color="text-blue-500" />
                    <StatCard title="Active Blocks" value="452" change="+5%" color="text-orange-500" />
                    <StatCard title="Pending Reports" value="18" change="-2" color="text-emerald-500" />
                    <StatCard title="System Health" value="99.9%" change="Stable" color="text-purple-500" />
                </div>

                {/* Admin Tasks Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-500" /> Recent Educational Resources
                        </h3>
                        <div className="space-y-4">
                            <ResourceItem title="Mastering Focus in Digital Age" type="Video" status="Approved" />
                            <ResourceItem title="Mental Health for Tech Students" type="Article" status="Pending" />
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldAlert className="text-orange-500" /> Misinformation Reports
                        </h3>
                        <p className="text-slate-400 text-sm italic">No urgent reports to review today.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const NavItem = ({ icon, label, active }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        {icon} <span>{label}</span>
    </div>
);

const StatCard = ({ title, value, change, color }) => (
    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{title}</p>
        <h3 className={`text-4xl font-black mb-2 ${color}`}>{value}</h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{change}</span>
    </div>
);

const ResourceItem = ({ title, type, status }) => (
    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div>
            <p className="text-white font-bold text-sm">{title}</p>
            <span className="text-[10px] uppercase font-black text-slate-500">{type}</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{status}</span>
    </div>
);

export default AdminDashboard;