import React, { useState, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon, File, Download, 
  Eye, Edit2, Trash2, Upload, X, Search, Filter,
  CheckCircle
} from 'lucide-react';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:5005/api/resources';
  const STATIC_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setResources(await res.json());
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources.');
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

    // --- Validations ---
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      setLoading(false); return;
    }
    if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(formData.title)) {
      setError('Title contains invalid special characters.');
      setLoading(false); return;
    }
    if (!formData.category) {
      setError('Please select a valid category.');
      setLoading(false); return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      setLoading(false); return;
    }
    if (!editingResource) {
      if (!formData.file) {
        setError('Please upload a document or image file.');
        setLoading(false); return;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.file.size > maxSize) {
        setError('File size must not exceed 10MB.');
        setLoading(false); return;
      }
    }
    // --- End Validations ---

    if (editingResource) {
        await handleUpdate();
        return;
    }

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
        setResources([...resources, result]);
        resetForm();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/${editingResource.id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: formData.title,
                category: formData.category,
                description: formData.description
            })
        });

        if (res.ok) {
            const updated = await res.json();
            setResources(resources.map(r => r.id === updated.id ? updated : r));
            resetForm();
        } else {
            const err = await res.json();
            setError(err.message || 'Update failed');
        }
    } catch (err) {
        setError('An error occurred during update.');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved: true })
      });

      if (res.ok) {
        const updated = await res.json();
        setResources(resources.map(r => r.id === updated.id ? updated : r));
      } else {
        const err = await res.json();
        setError(err.message || 'Approval failed');
      }
    } catch (err) {
      console.error('Error approving resource:', err);
      setError('An error occurred during approval.');
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
        title: resource.title,
        category: resource.category,
        description: resource.description,
        file: null
    });
    setShowUploadForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', description: '', file: null });
    setEditingResource(null);
    setShowUploadForm(false);
    setError('');
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="text-blue-500" />;
    return <File className="text-slate-400" />;
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0F1C4D]">Resource Management</h2>
          <p className="text-sm text-slate-400">Upload and manage educational materials</p>
        </div>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Upload size={16} /> {editingResource ? 'Edit Resource' : 'Add New Resource'}
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#0F1C4D] text-lg">{editingResource ? 'Edit Resource' : 'Upload New Resource'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1.5 rounded-full border border-slate-200"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/>{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                  <input 
                    type="text" name="title" value={formData.title} onChange={handleInputChange} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. Introduction to React"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                  <select 
                    name="category" value={formData.category} onChange={handleInputChange} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[#0F1C4D]"
                  >
                    <option value="">Select Category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 resize-none"
                  placeholder="Provide a brief description of the resource (minimum 10 characters)..."
                />
              </div>

              {!editingResource && (
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">File Upload</label>
                    <div className="relative group">
                        <input 
                            type="file" onChange={handleFileChange} required={!editingResource}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            accept=".pdf,.docx,.jpg,.jpeg,.png"
                        />
                        <div className="w-full px-4 py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-blue-400 transition-all">
                            <Upload className="text-slate-400 group-hover:text-blue-500" size={24} />
                            <span className="text-xs text-slate-500 font-500">
                                {formData.file ? formData.file.name : 'Click to browse or drag and drop'}
                            </span>
                            <span className="text-[10px] text-slate-400">PDF, DOCX, JPG, PNG (Max 10MB)</span>
                        </div>
                    </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" onClick={resetForm}
                  className="flex-1 py-3.5 border border-slate-200 bg-slate-50 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-100 transition-all focus:ring-2 focus:ring-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 py-3.5 bg-blue-600 rounded-xl text-[13px] font-bold text-white hover:bg-blue-700 hover:shadow-lg transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  {loading ? <span className="animate-pulse">Processing...</span> : editingResource ? 'Save Changes' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-[#E8EEFF] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EEFF] bg-slate-50/50">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-64 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Filter size={18}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Resource</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Size</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#E8EEFF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEFF]">
              {filteredResources.length > 0 ? filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                        {getFileIcon(res.fileType)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F1C4D]">{res.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{res.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-blue-100">
                      {res.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-600 text-slate-500 uppercase">{res.fileType.replace('.', '')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-600 text-slate-400">{(res.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      res.isApproved 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {res.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        {!res.isApproved && (
                            <button 
                                onClick={() => handleApprove(res.id)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Approve Resource"
                            >
                                <CheckCircle size={16} />
                            </button>
                        )}
                      <a 
                        href={`${STATIC_BASE_URL}${res.fileUrl}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Resource"
                      >
                        <Eye size={16} />
                      </a>
                      <button 
                        onClick={() => handleEdit(res)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit Resource"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Resource"
                      >
                        <Trash2 size={16} />
                      </button>
                      <a 
                        href={`${STATIC_BASE_URL}${res.fileUrl}`} download
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No resources found. Try uploading some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;