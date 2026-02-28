import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// ... [Keep your helper functions: makeJoinCode, onlyDigits, isValidPhone] ...
function makeJoinCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}
function onlyDigits(s) { return (s || "").replace(/\D/g, ""); }
function isValidPhone(phone) { const d = onlyDigits(phone); return d.length >= 9 && d.length <= 12; }

export default function StudyGroupsPage() {
  // --- Demo data ---
  const [groups, setGroups] = useState([
    {
      id: "1",
      name: "DSA Night Riders",
      description: "Daily 8–10PM problem solving + mock interviews.",
      createdBy: "supuna",
      createdAt: new Date().toISOString(),
      joinCode: "K8R2QX",
      members: [{ username: "supuna", phone: "0771234567" }],
    },
  ]);

  const currentUser = "kavishalenee1302";
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? null);
  const selected = useMemo(() => groups.find((g) => g.id === selectedId) ?? null, [groups, selectedId]);
  const [toast, setToast] = useState({ show: false, type: "success", text: "" });

  function showToast(type, text) {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "success", text: "" }), 2500);
  }

  // Form States
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [phone, setPhone] = useState("");
  const [createErrors, setCreateErrors] = useState({ name: "" });
  const [joinErrors, setJoinErrors] = useState({ code: "", phone: "" });

  // --- Handlers (Keep your existing logic, just update the UI below) ---
  function onCreate(e) {
    e.preventDefault();
    if (!newName.trim()) { setCreateErrors({ name: "Group name is required." }); return; }
    const created = { id: crypto.randomUUID(), name: newName.trim(), description: newDesc.trim(), createdBy: currentUser, createdAt: new Date().toISOString(), joinCode: makeJoinCode(), members: [{ username: currentUser, phone: "" }] };
    setGroups(prev => [created, ...prev]);
    setSelectedId(created.id);
    setNewName(""); setNewDesc("");
    showToast("success", "✅ Group created successfully!");
  }

  function onJoin(e) {
    e.preventDefault();
    // ... [keep your existing logic for onJoin] ...
    const code = joinCode.trim().toUpperCase();
    if (!code || !phone.trim()) { setJoinErrors({ code: !code ? "Code required" : "", phone: !phone.trim() ? "Phone required" : "" }); return; }
    const g = groups.find(x => x.joinCode === code);
    if(!g) { setJoinErrors(p => ({...p, code: "Invalid code"})); return; }
    setGroups(prev => prev.map(x => x.id === g.id ? { ...x, members: [...x.members, { username: currentUser, phone }] } : x));
    setSelectedId(g.id); setJoinCode(""); setPhone("");
    showToast("success", "✅ You joined the group!");
  }

  function onLeave(groupId) {
    setGroups(prev => prev.map(x => x.id === groupId ? { ...x, members: x.members.filter(m => m.username !== currentUser) } : x));
    showToast("info", "ℹ️ You left the group.");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`rounded-xl border px-6 py-3 shadow-2xl text-sm font-bold bg-white ${toast.type === 'success' ? 'border-emerald-200 text-emerald-600' : 'border-blue-200 text-blue-600'}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link to="/hub" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mb-2">
              ← Back to Hub
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Study Groups</h1>
            <p className="text-slate-500">Collaborate and manage your learning community.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">{currentUser[0]}</div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400">User Account</p>
               <p className="font-bold text-slate-700">{currentUser}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Group List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold px-2">Your Groups ({groups.length})</h2>
            <div className="space-y-3">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedId(g.id)}
                  className={`w-full text-left rounded-2xl p-5 border transition-all ${g.id === selectedId ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}
                >
                  <p className="font-bold text-lg">{g.name}</p>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-1">{g.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>{g.members.length} Members</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">#{g.joinCode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Actions */}
          <div className="space-y-8">
            {/* Create */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Create New Group</h2>
              <form onSubmit={onCreate} className="space-y-4">
                <input
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Group Name (e.g. React Pros)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
                <textarea
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description..." rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                  + Create Group
                </button>
              </form>
            </div>

            {/* Join */}
            <div className="bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-100 text-white">
              <h2 className="text-xl font-bold mb-4 text-white">Join via Code</h2>
              <form onSubmit={onJoin} className="space-y-4">
                <input
                  value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter 6-digit Code"
                  className="w-full rounded-xl bg-blue-500 border border-blue-400 px-4 py-3 text-white placeholder-blue-200 outline-none uppercase font-bold tracking-widest"
                />
                <input
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-xl bg-blue-500 border border-blue-400 px-4 py-3 text-white placeholder-blue-200 outline-none"
                />
                <button type="submit" className="w-full bg-white text-blue-600 font-black py-3 rounded-xl hover:bg-slate-50 transition">
                  Join Group
                </button>
              </form>
            </div>
          </div>

          {/* Right: Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
             {selected ? (
               <div className="space-y-6">
                 <div className="border-b border-slate-100 pb-4">
                   <h2 className="text-2xl font-black text-slate-800">{selected.name}</h2>
                   <p className="text-slate-500 mt-2">{selected.description || "No description provided."}</p>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Invite Code</p>
                      <p className="text-xl font-black text-blue-600 tracking-widest">{selected.joinCode}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(selected.joinCode)} className="text-xs font-bold text-blue-600 hover:underline">Copy</button>
                 </div>

                 <div>
                   <h3 className="font-bold text-slate-700 mb-3">Members ({selected.members.length})</h3>
                   <div className="space-y-2">
                     {selected.members.map(m => (
                       <div key={m.username} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                         <span className="font-bold text-slate-700">{m.username}</span>
                         <span className="text-xs text-slate-400">{m.phone || "Admin"}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {selected.members.some(m => m.username === currentUser) && (
                   <button onClick={() => onLeave(selected.id)} className="w-full text-red-500 font-bold py-3 hover:bg-red-50 rounded-xl transition">
                     Leave Group
                   </button>
                 )}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p>Select a group to see details</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}