import { Link } from "react-router-dom";

export default function HubPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-2xl font-black">E</span>
          </div>
          <div>
            <p className="text-blue-600 text-sm font-bold tracking-widest uppercase">
              Collaboration Hub
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Choose your module
            </h1>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/hub/study-groups"
            className="group rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 p-8 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-1">
                  Module 01
                </p>
                <h2 className="text-2xl font-bold text-slate-800">Study Groups</h2>
                <p className="text-slate-500 mt-2 leading-relaxed">
                  Create, join, and manage study groups with members and roles.
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="text-blue-600 text-xl group-hover:text-white">→</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2 flex-wrap">
              {['Create', 'Join', 'Manage'].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </Link>

          <Link
            to="/hub/scheduler"
            className="group rounded-3xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 p-8 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-500 text-xs font-bold tracking-widest uppercase mb-1">
                  Module 02
                </p>
                <h2 className="text-2xl font-bold text-slate-800">Scheduler</h2>
                <p className="text-slate-500 mt-2 leading-relaxed">
                  Plan sessions and track progress with scheduling tools.
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="text-emerald-600 text-xl group-hover:text-white">→</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2 flex-wrap">
              {['Sessions', 'Reminders', 'Calendar'].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>

        {/* Footer note */}
        <div className="mt-12 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 inline-block">
          <p className="text-blue-700 text-sm font-medium">
            💡 Tip: Use the back button inside each module to return here.
          </p>
        </div>
      </div>
    </div>
  );
}