import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit2, Trash2, Users, X, Mail, Shield, Calendar, CheckCircle, Lock, UserPlus, AlertCircle } from 'lucide-react';

const AVATAR_COLORS = ['#2255D2', '#4A70F5', '#1843B8', '#6366F1', '#059669'];

const roleConfig = {
  Admin:     { bg: 'bg-[#EEF2FF]', text: 'text-primary'    },
  Student:   { bg: 'bg-secondary/10', text: 'text-secondary' },
};

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5005/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch users from server');
        }
        
        const data = await res.json();
        setUsers(data);
    } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!formData.username.trim()) {
      errors.username = "Full name is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Name must be at least 3 characters";
    } else if (!nameRegex.test(formData.username.trim())) {
      errors.username = "Full name can only contain alphabetic characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5005/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            setUsers((prev) => prev.filter((u) => (u.id || u._id) !== id));
            alert("User deleted successfully.");
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Error: " + err.message);
        }
    }
  };

  const handleEditRole = async (user) => {
    const newRole = user.role === 'Admin' ? 'Student' : 'Admin';
    if (window.confirm(`Change ${user.username}'s role to ${newRole}?`)) {
        try {
            const token = localStorage.getItem('token');
            const id = user.id || user._id;
            const res = await fetch(`http://localhost:5005/api/admin/users/${id}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update user role');
            }

            setUsers((prev) => prev.map((u) => (u.id || u._id) === id ? { ...u, role: newRole } : u));
            alert(`User role updated to ${newRole}.`);
        } catch (err) {
            console.error("Error updating user role:", err);
            alert("Error: " + err.message);
        }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5005/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to register user');
        }

        // Successfully registered, re-fetch list to get full user object with metadata
        await fetchUsers();
        
        // Reset and close
        setIsAddModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'Student' });
        setFormErrors({});
        alert("User added successfully!");
    } catch (err) {
        console.error("Error adding user:", err);
        setFormErrors({ server: err.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading && users.length === 0) return <div className="p-20 text-center text-primary font-bold animate-pulse">Connecting to EduSyncDB...</div>;
  if (error && users.length === 0) return <div className="p-20 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .um-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
      `}</style>

      <div className="um-root">

        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="serif-heading text-[24px] text-[#0F1C4D] italic leading-tight">User Management</h2>
            <p className="text-[12px] text-slate-400 mt-1">
              Manage student and admin accounts across EduSync
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E8EEFF] rounded-[10px] min-w-0 sm:min-w-[200px] hover:border-blue-300 transition-colors">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="border-none bg-transparent outline-none text-[12.5px] text-[#0F1C4D] w-full placeholder:text-slate-400"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[12.5px] font-semibold text-slate-500 hover:border-primary hover:text-primary transition-all duration-150">
                <Filter size={12} /> Filter
              </button>

              {/* Add user */}
              <button 
                onClick={() => {
                  setIsAddModalOpen(true);
                  setFormErrors({});
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary text-white text-[12.5px] font-semibold rounded-[10px] shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Plus size={14} strokeWidth={2.5} /> Add User
              </button>
            </div>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden shadow-sm">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EEFF]">
            <div>
              <p className="text-[13.5px] font-bold text-[#0F1C4D]">All Users</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Showing {filtered.length} of {users.length.toLocaleString()} users
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-primary text-[11px] font-bold px-3 py-1.5 rounded-full">
              <Users size={10} strokeWidth={2.5} />
              {users.length.toLocaleString()} <span className="hidden sm:inline">Users</span>
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#F8FAFF]">
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2.5 text-[9.5px] font-bold tracking-[.9px] uppercase text-slate-400 border-b border-[#E8EEFF]
                        ${i === 0 ? 'pl-5 pr-4 text-left' : i === 5 ? 'pr-5 pl-4 text-right' : 'px-4 text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => {
                    const role   = roleConfig[user.role] ?? roleConfig.Student;
                    const isActive = true; // For now default to active
                    return (
                      <tr
                        key={user.id || user._id}
                        className="border-b border-[#E8EEFF] last:border-b-0 hover:bg-[#EEF2FF] transition-colors duration-150"
                      >
                        {/* User */}
                        <td className="pl-5 pr-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                            >
                              {getInitials(user.username)}
                            </div>
                            <span className="text-[13px] font-semibold text-[#0F1C4D] truncate max-w-[120px]">{user.username}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 text-[12.5px] text-slate-500">
                          <span className="truncate max-w-[150px] block">{user.email}</span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold ${role.bg} ${role.text}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold
                            ${isActive ? 'text-secondary' : 'text-slate-400'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-secondary' : 'bg-slate-400'}`}/>
                            Active
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 text-[12px] text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="pr-5 pl-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setViewUser(user)}
                              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-[#EEF2FF] hover:text-primary transition-all duration-150"
                            >
                              <Eye size={13}/>
                            </button>
                            <button 
                              onClick={() => handleEditRole(user)}
                              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-[#EEF2FF] hover:text-primary transition-all duration-150"
                            >
                              <Edit2 size={13}/>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id || user._id)}
                              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
                            >
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E8EEFF]">
            <span className="text-[12px] text-slate-400">
              Showing {filtered.length} of {users.length.toLocaleString()} users
            </span>
          </div>
        </div>

        {/* View User Modal */}
        {viewUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ fontFamily: 'DM Sans' }}>
            <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-[#E8EEFF] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F1C4D]">User Details</h3>
                <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[16px] font-extrabold text-white"
                    style={{ background: AVATAR_COLORS[users.findIndex(u => (u.id || u._id) === (viewUser.id || viewUser._id)) % AVATAR_COLORS.length] || '#2255D2' }}
                  >
                    {getInitials(viewUser.username)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[16px] font-bold text-[#0F1C4D] truncate">{viewUser.username}</h4>
                    <p className="text-[13px] text-slate-500 truncate">{viewUser.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role</label>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${roleConfig[viewUser.role]?.bg || roleConfig.Student.bg} ${roleConfig[viewUser.role]?.text || roleConfig.Student.text}`}>
                      {viewUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0"/>
                      Active
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Joined Date</label>
                    <p className="text-[13px] font-medium text-[#0F1C4D]">
                      {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-[#F8FAFF] border-t border-[#E8EEFF] flex justify-end">
                <button onClick={() => setViewUser(null)} className="px-4 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[13px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between text-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <UserPlus size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold tracking-tight">Add New User</h3>
                    <p className="text-xs text-white/70">Create a new account for EduSync</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormErrors({});
                  }}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddUser} className="p-6 sm:p-8">
                {formErrors.server && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-[12px] font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={14} />
                    {formErrors.server}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Full Name</label>
                    <div className="relative group">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${formErrors.username ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
                        <Users size={16} />
                      </div>
                      <input 
                        type="text"
                        placeholder="John Doe"
                        value={formData.username}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/[^A-Za-z\s]/.test(val)) {
                            setFormErrors({...formErrors, username: "Full name can only contain alphabetic characters"});
                            return;
                          }
                          setFormData({...formData, username: val});
                          if (formErrors.username) setFormErrors({...formErrors, username: null});
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:bg-white focus:ring-4 transition-all text-sm text-[#0F1C4D] 
                          ${formErrors.username 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                            : 'border-slate-200 focus:border-primary focus:ring-blue-500/10'}`}
                      />
                    </div>
                    {formErrors.username && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-top-1">{formErrors.username}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                    <div className="relative group">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${formErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          if (formErrors.email) setFormErrors({...formErrors, email: null});
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:bg-white focus:ring-4 transition-all text-sm text-[#0F1C4D]
                          ${formErrors.email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                            : 'border-slate-200 focus:border-primary focus:ring-blue-500/10'}`}
                      />
                    </div>
                    {formErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-top-1">{formErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Password</label>
                    <div className="relative group">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${formErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
                        <Lock size={16} />
                      </div>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value});
                          if (formErrors.password) setFormErrors({...formErrors, password: null});
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:bg-white focus:ring-4 transition-all text-sm text-[#0F1C4D]
                          ${formErrors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                            : 'border-slate-200 focus:border-primary focus:ring-blue-500/10'}`}
                      />
                    </div>
                    {formErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-top-1">{formErrors.password}</p>}
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Assign Role</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Shield size={16} />
                      </div>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-[#0F1C4D] appearance-none cursor-pointer"
                      >
                        <option value="Student">Student</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Filter size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormErrors({});
                    }}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[13px] rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-1 py-3.5 bg-primary hover:bg-primary text-white font-bold text-[13px] rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Registering...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;

