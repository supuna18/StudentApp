import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- Helpers ---
function onlyDigits(s) { return (s || "").replace(/\D/g, ""); }
function isValidPhone(phone) { 
  const d = onlyDigits(phone); 
  return d.length >= 9 && d.length <= 12; 
}

export default function StudyGroupsPage() {
  const currentUser = localStorage.getItem("username") || "kavishalenee1302";

  // States
  const [groups, setGroups] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: "success", text: "" });

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phone, setPhone] = useState("");

  const [createErrors, setCreateErrors] = useState({ name: "", desc: "" });
  const [joinErrors, setJoinErrors] = useState({ code: "", phone: "" });

  // --- API Connection ---
  // FIXED: Changed from 8080 to 5000 to match Docker external mapping
  const API_BASE_URL = "http://localhost:5000/api/studygroups";

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setGroups(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id || data[0]._id);
      }
    } catch (err) {
      console.error("Backend connection failed.", err);
      showToast("error", "❌ Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const selected = useMemo(() => 
    groups.find((g) => (g.id === selectedId || g._id === selectedId)) ?? null, 
    [groups, selectedId]
  );

  function showToast(type, text) {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "success", text: "" }), 2500);
  }

  // --- Handlers ---
  async function onCreate(e) {
    e.preventDefault();
    const nameErr = !newName.trim() ? "Please fill the required field" : "";
    const descErr = !newDesc.trim() ? "Please fill the required field" : "";
    setCreateErrors({ name: nameErr, desc: descErr });
    if (nameErr || descErr) return;

    const newGroup = {
      name: newName.trim(),
      description: newDesc.trim(),
      createdBy: currentUser,
      joinCode: Math.floor(100000 + Math.random() * 900000).toString(),
      members: [{ username: currentUser, phone: "Admin" }]
    };

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup)
      });

      if (res.ok) {
        setNewName(""); setNewDesc("");
        loadGroups();
        showToast("success", "✅ Group created in MongoDB!");
      } else {
        showToast("error", "❌ Failed to create group.");
      }
    } catch (err) {
      showToast("error", "❌ Server connection error.");
    }
  }

  function onSendOTP(e) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setJoinErrors(prev => ({ ...prev, phone: "Invalid phone number" }));
      return;
    }
    showToast("info", "📲 OTP Code sent to your phone!");
  }

  async function onJoin(e) {
    e.preventDefault();
    if (!otpCode.trim() || !isValidPhone(phone)) {
      setJoinErrors({ code: !otpCode.trim() ? "Required" : "", phone: !isValidPhone(phone) ? "Invalid" : "" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/join/${otpCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, phone: phone })
      });

      if (res.ok) {
        setOtpCode(""); setPhone(""); loadGroups();
        showToast("success", "✅ Joined successfully via Backend!");
      } else {
        setJoinErrors(p => ({ ...p, code: "Invalid Code" }));
        showToast("error", "❌ Invalid join code.");
      }
    } catch (err) {
      showToast("error", "❌ Server connection error.");
    }
  }

  // --- UI PART ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-blue-600 font-bold animate-pulse text-xl">Connecting to EduSync Server...</p>
        <p className="text-slate-400 text-sm mt-2">Checking Backend on Port 5000</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`rounded-xl border px-6 py-3 shadow-2xl text-sm font-bold bg-white ${toast.type === 'success' ? 'border-emerald-200 text-emerald-600' : 'border-blue-200 text-blue-600'}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link to="/hub" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mb-2">← Back to Hub</Link>
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
          <div className="space-y-4">
            <h2 className="text-lg font-bold px-2">Your Groups ({groups.length})</h2>
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
              {groups.length === 0 ? (
                <p className="text-slate-400 italic px-2">No groups found in database.</p>
              ) : (
                groups.map((g) => (
                  <button key={g.id} onClick={() => setSelectedId(g.id)} className={`w-full text-left rounded-2xl p-5 border transition-all ${ g.id === selectedId ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
                    <p className="font-bold text-lg">{g.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">{g.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-blue-500 uppercase">Code: {g.joinCode}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{g.members?.length || 0} Members</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">Create New Group</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-wider">All fields are required *</p>
              <form onSubmit={onCreate} className="space-y-4">
                <input value={newName} onChange={(e) => {setNewName(e.target.value); setCreateErrors(p=>({...p, name:""}))}} placeholder="Group Name *" className={`w-full rounded-xl border px-4 py-3 outline-none transition-all ${createErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-400'}`} />
                <textarea value={newDesc} onChange={(e) => {setNewDesc(e.target.value); setCreateErrors(p=>({...p, desc:""}))}} placeholder="Description *" rows={2} className={`w-full rounded-xl border px-4 py-3 outline-none resize-none transition-all ${createErrors.desc ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-400'}`} />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Create Group</button>
              </form>
            </div>

            <div className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-100 text-white">
              <h2 className="text-xl font-bold text-white">Join via Code</h2>
              <p className="text-[10px] text-blue-100 font-bold uppercase mb-6 tracking-wider">All fields are required *</p>
              <form onSubmit={onJoin} className="space-y-4">
                <input value={phone} onChange={(e) => {setPhone(e.target.value); setJoinErrors(p=>({...p, phone:""}))}} placeholder="Phone Number *" className={`w-full rounded-xl bg-blue-500 border px-4 py-3 text-white placeholder-blue-200 outline-none ${joinErrors.phone ? 'border-red-300' : 'border-blue-400'}`} />
                <button type="button" onClick={onSendOTP} className="w-full bg-blue-400/40 border border-blue-300 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-400/60 transition">Send OTP Code</button>
                <input value={otpCode} onChange={(e) => {setOtpCode(e.target.value); setJoinErrors(p=>({...p, code:""}))}} placeholder="ENTER 6-DIGIT CODE *" className={`w-full rounded-xl bg-blue-500 border px-4 py-3 text-white placeholder-blue-200 outline-none uppercase font-bold tracking-widest text-center ${joinErrors.code ? 'border-red-300' : 'border-blue-400'}`} />
                <button type="submit" className="w-full bg-white text-blue-600 font-black py-4 rounded-xl hover:bg-slate-50 transition shadow-lg">Join Group</button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-fit sticky top-10">
             {selected ? (
               <div className="space-y-8">
                 <div>
                   <h2 className="text-3xl font-black text-slate-800">{selected.name}</h2>
                   <p className="text-slate-500 mt-3 leading-relaxed">{selected.description}</p>
                   <div className="mt-6 flex items-center gap-4">
                      <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
                        Code: {selected.joinCode}
                      </div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">By: {selected.createdBy}</p>
                   </div>
                 </div>
                 <div className="border-t border-slate-100 pt-6">
                   <h3 className="font-bold text-slate-700 mb-4 tracking-wider text-sm uppercase">Members ({selected.members?.length || 0})</h3>
                   <div className="space-y-3">
                     {selected.members?.map((m, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <span className="font-bold text-slate-700">{m.username}</span>
                         <span className="text-xs text-slate-400 font-medium italic">{m.phone}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic">
                 Select a group to view members
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}