import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Download, Users, BookOpen, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#2255D2', '#4A70F5', '#1843B8', '#6366F1', '#059669'];

export default function CollaborationManager() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => { fetchGroups(); }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('http://localhost:5005/api/studygroups/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setGroups(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Chart Data logic
    const subjectData = groups.reduce((acc, g) => {
        const sub = g.subject || 'General';
        const existing = acc.find(item => item.name === sub);
        if (existing) existing.value += 1;
        else acc.push({ name: sub, value: 1 });
        return acc;
    }, []);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(15, 28, 77);
        doc.text("Collaboration Hub: Study Group Report", 15, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);

        autoTable(doc, {
            startY: 35,
            head: [['Group Name', 'Subject', 'Owner', 'Members', 'Join Code']],
            body: groups.map(g => [
                g.groupName, g.subject, g.createdByEmail, g.members?.length || 0, g.joinCode
            ]),
            theme: 'striped',
            headStyles: { fillColor: [34, 85, 210] }
        });
        doc.save("Collaboration_Hub_Report.pdf");
    };

    if (loading) return <div className="p-10 text-slate-400 font-bold animate-pulse">Syncing Hub Intelligence...</div>;

    return (
        <div className="anim-up">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Layers size={24}/></div>
                    <div>
                        <p className="text-2xl font-bold text-[#0F1C4D] italic">{groups.length}</p>
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest">Total Circles</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 text-secondary rounded-xl"><Users size={24}/></div>
                    <div>
                        <p className="text-2xl font-bold text-[#0F1C4D] italic">{groups.reduce((a, b) => a + (b.members?.length || 0), 0)}</p>
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest">Global Members</p>
                    </div>
                </div>
                <button onClick={downloadPDF} className="bg-[#0F1C4D] p-6 rounded-2xl text-white shadow-lg flex items-center justify-between hover:bg-blue-900 transition-all">
                    <div className="text-left">
                        <p className="font-bold text-sm">Download Report</p>
                        <p className="text-[10px] opacity-60 italic text-blue-200 uppercase tracking-widest">Export PDF Data</p>
                    </div>
                    <Download size={24}/>
                </button>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <PieIcon size={14}/> Subject Distribution
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <BookOpen size={14}/> Group Popularity
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={groups.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4FF"/>
                                <XAxis dataKey="groupName" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <Tooltip />
                                <Bar dataKey="members.length" fill="#4A70F5" radius={[5,5,0,0]} name="Members" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Group Table */}
            <div className="bg-white rounded-2xl border border-[#E8EEFF] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#E8EEFF] flex justify-between items-center">
                    <p className="text-[13px] font-bold text-[#0F1C4D]">Circle Monitoring Summary</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8FAFF]">
                            <tr>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group</th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Members</th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {groups.map((g, i) => (
                                <tr key={i} className="hover:bg-primary/10/30 transition-colors">
                                    <td className="p-4">
                                        <p className="text-xs font-bold text-slate-700">{g.groupName}</p>
                                        <p className="text-[10px] text-primary font-medium">{g.subject}</p>
                                    </td>
                                    <td className="p-4 text-[11px] text-slate-500 font-mono">{g.createdByEmail}</td>
                                    <td className="p-4">
                                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-md text-[10px] font-bold">
                                            {g.members?.length || 0} active
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-black text-slate-400">{g.joinCode}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

