import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit2, Trash2, Users, X, Mail, Shield, Calendar, CheckCircle } from 'lucide-react';

const AVATAR_COLORS = ['#2255D2', '#4A70F5', '#1843B8', '#6366F1', '#059669'];

const roleConfig = {
  Admin:     { bg: 'bg-[#EEF2FF]', text: 'text-blue-700'    },
  Student:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
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
  
  // View Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5005/api/users', {
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

    fetchUsers();
  }, []);

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

  if (loading) return <div className="p-20 text-center text-blue-600 font-bold animate-pulse">Connecting to EduSyncDB...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div>
      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700">
              <button 
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute -bottom-10 left-8">
                <div 
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: AVATAR_COLORS[users.indexOf(selectedUser) % AVATAR_COLORS.length] }}
                >
                  {getInitials(selectedUser.username)}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 pt-14 pb-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0F1C4D] tracking-tight">{selectedUser.username}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleConfig[selectedUser.role]?.bg || 'bg-emerald-50'} ${roleConfig[selectedUser.role]?.text || 'text-emerald-700'}`}>
                  {selectedUser.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[13.5px]">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-[#0F1C4D] font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13.5px]">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle size={14} />
                      Active
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13.5px]">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</p>
                    <p className="text-[#0F1C4D] font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowViewModal(false)}
                className="w-full mt-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[13px] rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
        .um-root { font-family: 'DM Sans', sans-serif; }
        .serif-heading { font-family: 'DM Serif Display', serif; }
      `}</style>

      <div className="um-root">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[12px] text-slate-400 mt-1">
              Manage student and admin accounts across EduSync
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E8EEFF] rounded-[10px] min-w-[200px] hover:border-blue-300 transition-colors">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="border-none bg-transparent outline-none text-[12.5px] text-[#0F1C4D] w-full placeholder:text-slate-400"
                style={{ fontFamily: 'DM Sans' }}
              />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8EEFF] rounded-[10px] text-[12.5px] font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-150">
              <Filter size={12} /> Filter
            </button>

            {/* Add user */}
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold rounded-[10px] shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
              <Plus size={14} strokeWidth={2.5} /> Add User
            </button>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden shadow-sm">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EEFF]">
            <div>
              <p className="text-[13.5px] font-bold text-[#0F1C4D]">All Users</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Showing {filtered.length} of {users.length.toLocaleString()} registered users
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <Users size={10} strokeWidth={2.5} />
              {users.length.toLocaleString()} Users
            </span>
          </div>

          {/* Table */}
          <table className="w-full border-collapse">
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
                  const isActive = true; // For now default to active as we don't have this in DB yet
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
                          <span className="text-[13px] font-semibold text-[#0F1C4D]">{user.username}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-[12.5px] text-slate-500">{user.email}</td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold ${role.bg} ${role.text}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold
                          ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
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
                            onClick={() => {
                              setSelectedUser(user);
                              setShowViewModal(true);
                            }}
                            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-[#EEF2FF] hover:text-blue-600 transition-all duration-150"
                          >
                            <Eye size={13}/>
                          </button>
                          <button 
                            onClick={() => handleEditRole(user)}
                            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-[#EEF2FF] hover:text-blue-600 transition-all duration-150"
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

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E8EEFF]">
            <span className="text-[12px] text-slate-400">
              Showing {filtered.length} of {users.length.toLocaleString()} users
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserManagement;
