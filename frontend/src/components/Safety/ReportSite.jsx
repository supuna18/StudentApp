import React, { useState } from 'react';

const ReportSite = () => {
  const [url, setUrl] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');

  const handleReport = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      //  port  5000(Docker Mapping )
      const response = await fetch('http://localhost:5000/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, reason, reportedBy: 'Student_User' })
      });

      if (response.ok) {
        setStatus('✅ Successfully reported to StudentDB!');
        setUrl(''); setReason('');
      } else {
        setStatus('❌ Failed to submit report.');
      }
    } catch (err) {
      setStatus('⚠️ Server Error. Is Backend running?');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
      <h2 className="text-2xl font-bold text-red-600 mb-4">🛡️ Security Guard</h2>
      <p className="text-sm text-gray-500 mb-4">Report suspicious links or fake news here.</p>
      
      <form onSubmit={handleReport} className="space-y-4">
        <input 
          type="url" required placeholder="Paste suspicious URL here..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={url} onChange={(e) => setUrl(e.target.value)}
        />
        <textarea 
          required placeholder="Why is this site unsafe?"
          className="w-full p-3 border rounded-lg h-24 outline-none focus:ring-2 focus:ring-red-500"
          value={reason} onChange={(e) => setReason(e.target.value)}
        />
        <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
          Submit Safety Report
        </button>
      </form>
      {status && <p className="mt-3 text-sm font-medium text-center">{status}</p>}
    </div>
  );
};

export default ReportSite;