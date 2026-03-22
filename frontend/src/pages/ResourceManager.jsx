const ResourceManager = () => {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Resource Manager</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ Add New Resource</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* මෙතනට පස්සේ ලින්ක් ටික එනවා */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800">
                   <p className="text-slate-400">Manage your educational videos and articles here.</p>
                </div>
            </div>
        </div>
    );
};
export default ResourceManager;