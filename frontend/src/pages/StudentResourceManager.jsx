import React, { useState, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, File, Download, 
  Eye, Trash2, Upload, X, Search, CheckCircle, Clock 
} from 'lucide-react';

const StudentResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:5005/api/resources';
  const STATIC_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    fetchMyResources();
  }, []);

  const fetchMyResources = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
          const allRes = await res.json();
          // Filter to show only student's own resources if the API returns all
          // or rely on API to return only relevant ones if updated.
          // For now, let's assume we show what we get.
          setResources(allRes);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('file', formData.file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        setResources([result, ...resources]);
        setSuccess('Resource uploaded successfully! Pending admin approval.');
        setTimeout(() => resetForm(), 2000);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', description: '', file: null });
    setShowUploadForm(false);
    setError('');
    setSuccess('');
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="text-blue-500" />;
    return <File className="text-slate-400" />;
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="serif-heading text-2xl text-[#0F1C4D]">My Resources</h2>
          <p className="text-sm text-slate-400">Upload and share learning materials with the community</p>
        </div>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Upload size={16} /> Upload Resource
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-[#0F1C4D]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="serif-heading text-xl text-[#0F1C4D]">Upload New Resource</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && <div className="p-3.5 bg-red-50 text-red-600 text-[12px] rounded-xl border border-red-100 font-bold">{error}</div>}
              {success && <div className="p-3.5 bg-emerald-50 text-emerald-600 text-[12px] rounded-xl border border-emerald-100 font-bold">{success}</div>}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13.5px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="e.g. Data Structures Cheat Sheet"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  name="category" value={formData.category} onChange={handleInputChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13.5px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows="2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13.5px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Describe what this resource covers..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">File Upload</label>
                <div className="relative group">
                    <input 
                        type="file" onChange={handleFileChange} required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                    />
                    <div className="w-full px-4 py-7 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-blue-500 group-hover:bg-blue-50/30 transition-all">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
                            <Upload size={20} />
                        </div>
                        <span className="text-[12.5px] text-[#0F1C4D] font-bold">
                            {formData.file ? formData.file.name : 'Click to browse files'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">PDF, DOCX, JPG or PNG (Max 10MB)</span>
                    </div>
                </div>
              </div>

              <div className="pt-3 flex gap-4">
                <button 
                  type="button" onClick={resetForm}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-[2] bg-blue-600 text-white px-8 py-3 rounded-xl text-[13px] font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  {loading ? 'Uploading...' : 'Share Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Uploaded Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
              <div key={res.id} className="bg-white border border-[#E8EEFF] rounded-2xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            {getFileIcon(res.fileType)}
                        </div>
                        <div>
                            <h4 className="text-[14.5px] font-bold text-[#0F1C4D] tracking-tight">{res.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{res.category}</span>
                                <span className="text-[10px] text-slate-400 font-medium italic">{(res.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${res.isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {res.isApproved ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {res.isApproved ? 'Approved' : 'Pending'}
                      </div>
                  </div>
                  
                  <p className="text-[12.5px] text-slate-500 line-clamp-2 mb-5 leading-relaxed">{res.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                          <a 
                            href={`${STATIC_BASE_URL}${res.fileUrl}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </a>
                          <a 
                            href={`${STATIC_BASE_URL}${res.fileUrl}`} download
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                      </div>
                      {/* Only allow delete for student's own unapproved resources or any? Let's keep it simple */}
                      <button 
                        onClick={async () => {
                            if(window.confirm('Remove this resource?')) {
                                try {
                                    const del = await fetch(`${API_BASE_URL}/${res.id}`, {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    if(del.ok) setResources(resources.filter(x => x.id !== res.id));
                                } catch(e) {}
                            }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
              </div>
          ))}
          
          {filteredResources.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/40 border-2 border-dashed border-slate-200 rounded-[24px] opacity-60">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                      <File size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-[2px]">No Shared Resources</p>
                  <p className="text-[12px] text-slate-400 mt-1">Start by uploading your first learning material</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default StudentResourceManager;