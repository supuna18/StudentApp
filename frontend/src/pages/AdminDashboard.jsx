import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, BookOpen, LogOut, Activity, MoreHorizontal, Filter, Search, TrendingUp, TrendingDown, Minus, Edit2, Trash2, ExternalLink, Send } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    const pieData = [
        { name: 'Approved', value: 45 },
        { name: 'Pending',  value: 30 },
        { name: 'Blocked',  value: 25 },
    ];
    const PIE_COLORS = ['#2952E3', '#4A70F5', '#93B4FF'];

    const barData = [
        { month: 'Jan', students: 320, reports: 140 },
        { month: 'Feb', students: 410, reports: 180 },
        { month: 'Mar', students: 380, reports: 210 },
        { month: 'Apr', students: 520, reports: 160 },
        { month: 'May', students: 490, reports: 240 },
        { month: 'Jun', students: 610, reports: 195 },
        { month: 'Jul', students: 580, reports: 220 },
        { month: 'Aug', students: 720, reports: 270 },
        { month: 'Sep', students: 680, reports: 300 },
    ];

    const tableRows = [
        { title: 'Mastering Focus in Digital Age',    status: 'Approved', number: '#EDU-001', person: 'Kristin Watson',   type: 'Video'   },
        { title: 'Mental Health for Tech Students',   status: 'Pending',  number: '#EDU-002', person: 'Jerome Bell',      type: 'Article' },
        { title: 'Cybersafety Fundamentals',          status: 'Approved', number: '#EDU-003', person: 'Leslie Alexander',  type: 'Course'  },
        { title: 'Mindfulness in Learning Spaces',    status: 'Pending',  number: '#EDU-004', person: 'Dianne Russell',   type: 'Video'   },
        { title: 'Digital Wellness for Students',     status: 'Blocked',  number: '#EDU-005', person: 'Wade Warren',      type: 'Article' },
    ];

    const statusConfig = {
        Approved: { bg: 'rgba(5,150,105,0.10)',  color: '#059669', icon: '✓' },
        Pending:  { bg: 'rgba(234,88,12,0.10)',   color: '#EA580C', icon: '→' },
        Blocked:  { bg: 'rgba(239,68,68,0.10)',   color: '#EF4444', icon: '✕' },
    };

    const avatarColors = ['#2952E3','#4A70F5','#1C3BBF','#6366F1','#059669'];
    const initials = name => name.split(' ').map(w => w[0]).join('');

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,600;1,400;1,600&display=swap');

                :root {
                    --blue:        #2952E3;
                    --blue-dark:   #1C3BBF;
                    --blue-light:  #4A70F5;
                    --blue-pale:   #93B4FF;
                    --blue-soft:   #EEF2FF;
                    --blue-dim:    rgba(41,82,227,0.09);
                    --blue-glow:   rgba(41,82,227,0.18);
                    --white:       #FFFFFF;
                    --bg:          #F2F5FD;
                    --text:        #0F1729;
                    --text-soft:   #4A5368;
                    --text-muted:  #8C93A8;
                    --border:      #DDE2EF;
                    --sans:  'Plus Jakarta Sans', system-ui, sans-serif;
                    --serif: 'Lora', Georgia, serif;
                    --ease:  cubic-bezier(0.22, 1, 0.36, 1);
                }

                .ad * { box-sizing: border-box; margin: 0; padding: 0; }
                .ad {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg);
                    font-family: var(--sans);
                    -webkit-font-smoothing: antialiased;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pdot {
                    0%,100% { opacity:.6; transform:scale(1); }
                    50%     { opacity:1;  transform:scale(1.35); }
                }

                /* ══ SIDEBAR ══ */
                .sb {
                    width: 210px;
                    flex-shrink: 0;
                    background: var(--white);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top:0; left:0; bottom:0;
                    z-index: 100;
                }
                .sb-brand {
                    padding: 24px 18px 18px;
                    border-bottom: 1px solid var(--border);
                    display: flex; align-items: center; gap: 10px;
                }
                .sb-mark {
                    width: 34px; height: 34px;
                    background: linear-gradient(135deg, var(--blue-dark), var(--blue-light));
                    border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px var(--blue-glow);
                    flex-shrink: 0;
                }
                .sb-mark svg { width: 17px; height: 17px; }
                .sb-bname {
                    font-family: var(--serif);
                    font-size: 16px; font-style: italic; font-weight: 600;
                    color: var(--text); line-height: 1; display: block;
                }
                .sb-bsub {
                    font-size: 8px; font-weight: 700; letter-spacing: 1.8px;
                    text-transform: uppercase; color: var(--blue); display: block; margin-top: 2px;
                }
                .sb-sec {
                    font-size: 9px; font-weight: 700; letter-spacing: 2px;
                    text-transform: uppercase; color: var(--text-muted);
                    padding: 18px 18px 7px;
                }
                .sb-nav { flex:1; padding: 4px 10px; }
                .sb-gap { height: 18px; }
                .sb-item {
                    display: flex; align-items: center; gap: 9px;
                    padding: 9px 11px; border-radius: 9px;
                    cursor: pointer; font-size: 13px; font-weight: 600;
                    color: var(--text-muted); transition: background .18s, color .18s;
                    margin-bottom: 2px; border: none; background: none;
                    width: 100%; text-align: left; font-family: var(--sans);
                }
                .sb-item:hover { background: var(--blue-dim); color: var(--blue); }
                .sb-item.active {
                    background: var(--blue); color: var(--white);
                    box-shadow: 0 4px 12px var(--blue-glow);
                }
                .sb-item svg { width: 15px; height: 15px; flex-shrink: 0; }
                .sb-bottom { padding: 12px 10px 14px; border-top: 1px solid var(--border); }
                .sb-user {
                    display: flex; align-items: center; gap: 9px;
                    padding: 10px 10px 12px;
                }
                .sb-av {
                    width: 30px; height: 30px; border-radius: 50%;
                    background: linear-gradient(135deg, var(--blue-dark), var(--blue-light));
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 800; color: white; flex-shrink: 0;
                }
                .sb-un { font-size: 12.5px; font-weight: 700; color: var(--text); }
                .sb-ur { font-size: 10px; color: var(--text-muted); }

                /* ══ MAIN ══ */
                .main {
                    flex: 1; margin-left: 210px;
                    display: flex; flex-direction: column; min-height: 100vh;
                }

                /* Topbar */
                .topbar {
                    background: var(--white);
                    border-bottom: 1px solid var(--border);
                    padding: 18px 32px;
                    display: flex; align-items: center; justify-content: space-between;
                    position: sticky; top: 0; z-index: 50;
                    animation: fadeUp .5s var(--ease) both;
                }
                .topbar-greeting {
                    font-family: var(--serif);
                    font-size: 22px; font-style: italic; font-weight: 600;
                    color: var(--text); letter-spacing: -.2px; margin-bottom: 2px;
                }
                .topbar-sub { font-size: 12.5px; color: var(--text-muted); }
                .topbar-right { display: flex; align-items: center; gap: 10px; }
                .live-pill {
                    display: flex; align-items: center; gap: 7px;
                    padding: 7px 15px;
                    background: var(--blue-dim);
                    border: 1px solid rgba(41,82,227,.15);
                    border-radius: 100px;
                    font-size: 12px; font-weight: 700; color: var(--blue);
                }
                .live-dot {
                    width:6px; height:6px; border-radius:50%;
                    background: var(--blue); animation: pdot 2s ease-in-out infinite;
                }
                .edit-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 16px;
                    background: linear-gradient(130deg, var(--blue-dark), var(--blue) 60%, var(--blue-light));
                    color: var(--white); border: none; border-radius: 9px;
                    font-family: var(--sans); font-size: 12.5px; font-weight: 700;
                    cursor: pointer; box-shadow: 0 4px 14px var(--blue-glow);
                    transition: transform .15s, box-shadow .2s;
                }
                .edit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--blue-glow); }
                .edit-btn svg { width: 13px; height: 13px; }

                /* Content */
                .content { padding: 24px 32px 48px; }

                /* ── Stats row ── */
                .stat-row {
                    display: grid; grid-template-columns: repeat(4,1fr);
                    border: 1px solid var(--border); border-radius: 14px;
                    background: var(--white); overflow: hidden;
                    margin-bottom: 22px;
                    animation: fadeUp .55s .08s var(--ease) both;
                }
                .stat-cell {
                    padding: 22px 24px;
                    border-right: 1px solid var(--border);
                    transition: background .2s;
                }
                .stat-cell:last-child { border-right: none; }
                .stat-cell:hover { background: var(--blue-soft); }
                .stat-top {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 10px;
                }
                .stat-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 10.5px; font-weight: 700;
                    padding: 3px 9px; border-radius: 100px;
                }
                .stat-badge.up   { background: rgba(5,150,105,.10); color: #059669; }
                .stat-badge.dn   { background: rgba(239,68,68,.10);  color: #EF4444; }
                .stat-badge.fl   { background: var(--blue-dim); color: var(--text-muted); }
                .stat-val {
                    font-family: var(--serif);
                    font-size: 36px; font-style: italic; font-weight: 600;
                    color: var(--text); letter-spacing: -1px; line-height: 1;
                    margin-bottom: 5px;
                }
                .stat-lbl { font-size: 12px; color: var(--text-muted); }
                .more-btn {
                    color: var(--text-muted); cursor: pointer; background: none;
                    border: none; display: flex; align-items: center; transition: color .15s;
                }
                .more-btn:hover { color: var(--blue); }

                /* ── Charts ── */
                .charts-row {
                    display: grid; grid-template-columns: 1fr 1.65fr;
                    gap: 18px; margin-bottom: 22px;
                    animation: fadeUp .55s .16s var(--ease) both;
                }
                .chart-card {
                    background: var(--white);
                    border: 1px solid var(--border); border-radius: 14px;
                    padding: 20px 22px;
                }
                .chart-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 16px;
                }
                .chart-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
                .bar-tabs { display: flex; gap: 3px; }
                .bar-tab {
                    padding: 4px 9px; border-radius: 6px;
                    font-size: 11px; font-weight: 700; color: var(--text-muted);
                    cursor: pointer; border: none; background: none; font-family: var(--sans);
                    transition: background .15s, color .15s;
                }
                .bar-tab:hover { background: var(--blue-dim); color: var(--blue); }
                .bar-tab.active { background: var(--blue); color: var(--white); }
                .pie-legend {
                    display: flex; justify-content: center; gap: 18px; margin-top: 10px;
                }
                .pleg-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--text-soft); }
                .pleg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .ctt {
                    background: var(--text); border-radius: 8px;
                    padding: 8px 12px; font-family: var(--sans);
                    font-size: 11.5px; color: white;
                }

                /* ── Table ── */
                .table-card {
                    background: var(--white);
                    border: 1px solid var(--border); border-radius: 14px;
                    overflow: hidden;
                    animation: fadeUp .55s .24s var(--ease) both;
                }
                .table-topbar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 18px 22px; border-bottom: 1px solid var(--border);
                }
                .table-ttitle { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
                .table-tsub { font-size: 12px; color: var(--text-muted); }
                .table-tools { display: flex; align-items: center; gap: 8px; }
                .filter-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 13px;
                    border: 1px solid var(--border); border-radius: 8px;
                    font-family: var(--sans); font-size: 12px; font-weight: 600;
                    color: var(--text-soft); background: var(--white); cursor: pointer;
                    transition: border-color .15s, color .15s;
                }
                .filter-btn:hover { border-color: var(--blue); color: var(--blue); }
                .filter-btn svg { width: 13px; height: 13px; }
                .search-box {
                    display: flex; align-items: center; gap: 7px;
                    padding: 7px 13px;
                    border: 1px solid var(--border); border-radius: 8px;
                    background: var(--bg); min-width: 190px;
                }
                .search-box svg { width: 13px; height: 13px; color: var(--text-muted); flex-shrink: 0; }
                .search-box input {
                    border: none; background: none; outline: none;
                    font-family: var(--sans); font-size: 12.5px; color: var(--text); width: 100%;
                }
                .search-box input::placeholder { color: var(--text-muted); }

                .dt { width: 100%; border-collapse: collapse; }
                .dt th {
                    padding: 10px 14px;
                    font-size: 10px; font-weight: 700; letter-spacing: .8px;
                    text-transform: uppercase; color: var(--text-muted);
                    text-align: left; background: var(--bg);
                    border-bottom: 1px solid var(--border);
                    white-space: nowrap;
                }
                .dt th:first-child { padding-left: 22px; }
                .dt th:last-child  { padding-right: 22px; }
                .dt td {
                    padding: 13px 14px; font-size: 13px;
                    color: var(--text); border-bottom: 1px solid var(--border);
                    vertical-align: middle;
                }
                .dt td:first-child { padding-left: 22px; }
                .dt td:last-child  { padding-right: 22px; }
                .dt tr:last-child td { border-bottom: none; }
                .dt tbody tr:hover { background: var(--blue-soft); }

                .td-title { font-weight: 600; font-size: 13px; }
                .td-num { font-size: 11.5px; font-weight: 600; color: var(--text-muted); font-family: 'Courier New', monospace; }
                .td-type { font-size: 10.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--text-muted); }
                .td-person { display: flex; align-items: center; gap: 8px; }
                .td-av {
                    width: 27px; height: 27px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 800; color: white; flex-shrink: 0;
                }
                .td-status {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 4px 10px; border-radius: 100px;
                    font-size: 11px; font-weight: 700; white-space: nowrap;
                }
                .td-actions { display: flex; align-items: center; gap: 3px; }
                .ta-btn {
                    width: 28px; height: 28px; border-radius: 7px; border: none;
                    background: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    color: var(--text-muted); transition: background .15s, color .15s;
                }
                .ta-btn:hover { background: var(--blue-dim); color: var(--blue); }
                .ta-btn svg { width: 13px; height: 13px; }
                .send-btn {
                    display: flex; align-items: center; gap: 5px;
                    padding: 5px 11px;
                    border: 1px solid var(--border); border-radius: 7px;
                    background: var(--white);
                    font-family: var(--sans); font-size: 11px; font-weight: 600;
                    color: var(--text-soft); cursor: pointer; white-space: nowrap;
                    transition: border-color .15s, color .15s;
                }
                .send-btn:hover { border-color: var(--blue); color: var(--blue); }
                .send-btn svg { width: 11px; height: 11px; }

                @media (max-width:1200px) {
                    .charts-row { grid-template-columns: 1fr; }
                    .stat-row   { grid-template-columns: repeat(2,1fr); }
                }
                @media (max-width:768px) {
                    .sb { display:none; }
                    .main { margin-left:0; }
                    .stat-row { grid-template-columns: 1fr 1fr; }
                    .content { padding: 16px; }
                }
            `}</style>

            <div className="ad">

                {/* SIDEBAR */}
                <aside className="sb">
                    <div className="sb-brand">
                        <div className="sb-mark">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <div>
                            <span className="sb-bname">EduSync</span>
                            <span className="sb-bsub">Admin Portal</span>
                        </div>
                    </div>

                    <div className="sb-nav">
                        <div className="sb-sec">General</div>
                        <div className="sb-item active"><LayoutDashboard size={15}/> Analytics</div>
                        <div className="sb-item"><Users size={15}/> User Management</div>
                        <div className="sb-item"><ShieldAlert size={15}/> Safety Approvals</div>
                        <div className="sb-item"><BookOpen size={15}/> Resource Manager</div>
                        <div className="sb-gap"/>
                        <div className="sb-sec">Other</div>
                        <div className="sb-item"><Activity size={15}/> System Health</div>
                    </div>

                    <div className="sb-bottom">
                        <div className="sb-user">
                            <div className="sb-av">AD</div>
                            <div>
                                <div className="sb-un">Admin</div>
                                <div className="sb-ur">admin@edusync.com</div>
                            </div>
                        </div>
                        <button className="sb-item" onClick={handleLogout} style={{ color: '#EF4444' }}>
                            <LogOut size={15}/> Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="main">

                    {/* Topbar */}
                    <div className="topbar">
                        <div>
                            <div className="topbar-greeting">System Overview 👋</div>
                            <div className="topbar-sub">Real-time monitoring and administrative controls.</div>
                        </div>
                        <div className="topbar-right">
                            <div className="live-pill"><div className="live-dot"/> System Live</div>
                            <button className="edit-btn"><Edit2 size={13}/> Edit Dashboard</button>
                        </div>
                    </div>

                    <div className="content">

                        {/* Stats */}
                        <div className="stat-row">
                            {[
                                { val:'1,248', badge:'+12%', dir:'up',  lbl:'Total Students'  },
                                { val:'452',   badge:'+5%',  dir:'up',  lbl:'Active Blocks'   },
                                { val:'18',    badge:'-2',   dir:'dn',  lbl:'Pending Reports' },
                                { val:'99.9%', badge:'Stable',dir:'fl', lbl:'System Health'   },
                            ].map(({ val, badge, dir, lbl }, i) => (
                                <div key={i} className="stat-cell">
                                    <div className="stat-top">
                                        <span className={`stat-badge ${dir}`}>
                                            {dir==='up' ? <TrendingUp size={9}/> : dir==='dn' ? <TrendingDown size={9}/> : <Minus size={9}/>}
                                            {badge}
                                        </span>
                                        <button className="more-btn"><MoreHorizontal size={15}/></button>
                                    </div>
                                    <div className="stat-val">{val}</div>
                                    <div className="stat-lbl">{lbl}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="charts-row">
                            {/* Pie */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <span className="chart-title">Resource Distribution</span>
                                    <button className="more-btn"><MoreHorizontal size={15}/></button>
                                </div>
                                <ResponsiveContainer width="100%" height={190}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                                            {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                                        </Pie>
                                        <Tooltip content={({active,payload}) => active && payload?.length
                                            ? <div className="ctt">{payload[0].name}: {payload[0].value}%</div>
                                            : null}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {pieData.map((d,i) => (
                                        <div key={i} className="pleg-item">
                                            <div className="pleg-dot" style={{ background: PIE_COLORS[i] }}/>
                                            {d.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bar */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <span className="chart-title">Student & Report Activity</span>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                        <div className="bar-tabs">
                                            {['1M','3M','6M','1Y'].map((t,i) => (
                                                <button key={i} className={`bar-tab${t==='1Y'?' active':''}`}>{t}</button>
                                            ))}
                                        </div>
                                        <button className="more-btn"><MoreHorizontal size={15}/></button>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={190}>
                                    <BarChart data={barData} barGap={4} barCategoryGap="28%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                                        <XAxis dataKey="month" tick={{ fontSize:10.5, fill:'#8C93A8', fontFamily:'Plus Jakarta Sans' }} axisLine={false} tickLine={false}/>
                                        <YAxis tick={{ fontSize:10.5, fill:'#8C93A8', fontFamily:'Plus Jakarta Sans' }} axisLine={false} tickLine={false}/>
                                        <Tooltip content={({active,payload,label}) => active && payload?.length
                                            ? <div className="ctt"><div style={{fontWeight:700,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i}>{p.name}: {p.value}</div>)}</div>
                                            : null}
                                        />
                                        <Bar dataKey="students" fill="#2952E3" radius={[4,4,0,0]} name="Students"/>
                                        <Bar dataKey="reports"  fill="#93B4FF" radius={[4,4,0,0]} name="Reports"/>
                                        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:11.5, paddingTop:6 }}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-card">
                            <div className="table-topbar">
                                <div>
                                    <div className="table-ttitle">Educational Resources</div>
                                    <div className="table-tsub">Manage and review all platform resources</div>
                                </div>
                                <div className="table-tools">
                                    <button className="filter-btn"><Filter size={12}/> Filter</button>
                                    <div className="search-box">
                                        <Search size={12}/>
                                        <input placeholder="Search resources…"/>
                                    </div>
                                    <button className="filter-btn"><MoreHorizontal size={13}/></button>
                                </div>
                            </div>

                            <table className="dt">
                                <thead>
                                    <tr>
                                        <th>Title ↕</th>
                                        <th>Status ↕</th>
                                        <th>Number ↕</th>
                                        <th>Responsible Person ↕</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row, i) => {
                                        const s = statusConfig[row.status];
                                        return (
                                            <tr key={i}>
                                                <td><div className="td-title">{row.title}</div></td>
                                                <td>
                                                    <span className="td-status" style={{ background: s.bg, color: s.color }}>
                                                        {s.icon} {row.status}
                                                    </span>
                                                </td>
                                                <td><span className="td-num">{row.number}</span></td>
                                                <td>
                                                    <div className="td-person">
                                                        <div className="td-av" style={{ background: avatarColors[i % avatarColors.length] }}>
                                                            {initials(row.person)}
                                                        </div>
                                                        {row.person}
                                                    </div>
                                                </td>
                                                <td><span className="td-type">{row.type}</span></td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button className="send-btn"><Send size={10}/> Send to revision</button>
                                                        <button className="ta-btn"><Edit2 size={13}/></button>
                                                        <button className="ta-btn"><Trash2 size={13}/></button>
                                                        <button className="ta-btn"><ExternalLink size={13}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;