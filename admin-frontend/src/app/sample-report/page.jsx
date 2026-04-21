'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Trash2, Eye, Loader2, AlertCircle,
  CheckCircle, RefreshCw, Globe, X, Star, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SampleReportPage() {
  const [sampleReports, setSampleReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

  const getToken = () =>
    localStorage.getItem('token') || localStorage.getItem('auth_token');

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/'); return; }
    fetchSampleReports();
  }, []);

  const fetchSampleReports = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      // Fetch all pdfs that are marked as sample reports
      const res = await fetch(`${API_URL}/drive-links/pdfs/all-sample-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sample reports');
      const data = await res.json();
      setSampleReports(data);
    } catch (err) {
      setError(err.message || 'Failed to load sample reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.html', '.htm', '.xlsx', '.xls', '.csv', '.kml', '.kmz'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowed.includes(ext)) {
      setError(`Unsupported file type. Allowed: ${allowed.join(', ')}`);
      e.target.value = '';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File must be under 50 MB');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      const token = getToken();

      const formData = new FormData();
      formData.append('pdf', file);

      const res = await fetch(`${API_URL}/drive-links/upload-sample-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }

      setSuccess(`✅ "${file.name}" uploaded! All registered users can now view this sample report in their profile.`);
      await fetchSampleReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (pdfId, filename) => {
    if (!confirm(`Delete sample report "${filename}"? It will no longer appear in any user's profile.`)) return;
    try {
      setDeleting(pdfId);
      setError('');
      const token = getToken();
      const res = await fetch(`${API_URL}/drive-links/pdf/${pdfId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setSuccess('Sample report deleted successfully.');
      setSampleReports(prev => prev.filter(r => r.pdf_id !== pdfId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleView = async (pdfId) => {
    const token = getToken();
    const url = `${API_URL}/drive-links/pdf/view/${pdfId}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to open');
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (err) {
      setError('Could not open report: ' + err.message);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d.endsWith('Z') ? d : d + 'Z').toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
  };

  const getExtIcon = (filename) => {
    const ext = filename?.toLowerCase().split('.').pop();
    const map = {
      pdf: 'text-red-500 bg-red-50',
      html: 'text-blue-500 bg-blue-50', htm: 'text-blue-500 bg-blue-50',
      xlsx: 'text-emerald-500 bg-emerald-50', xls: 'text-emerald-500 bg-emerald-50',
      csv: 'text-emerald-500 bg-emerald-50',
      kml: 'text-purple-500 bg-purple-50', kmz: 'text-purple-500 bg-purple-50',
    };
    return map[ext] || 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-2.5 bg-orange-50 rounded-xl">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate">Sample Report</h1>
                <p className="text-[9px] sm:text-[11px] text-gray-400 font-medium truncate">
                  Default report for all registered users
                </p>
              </div>
            </div>
            <button
              onClick={fetchSampleReports}
              disabled={loading}
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-600 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              {loading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 font-medium leading-relaxed">
            Any file uploaded here will appear in the <strong>Reports</strong> section of <strong>every registered user's profile</strong> as a sample report. Upload your latest demo HTML/PDF report to showcase your services.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
            <button onClick={() => setError('')}>
              <X className="w-4 h-4 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-700 text-sm font-medium">{success}</span>
            </div>
            <button onClick={() => setSuccess('')}>
              <X className="w-4 h-4 text-emerald-400 hover:text-emerald-600" />
            </button>
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-1 uppercase tracking-wider">Upload Sample Report</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
              Supported: PDF, HTML, XLSX, CSV, KML/KMZ · Max 50 MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.html,.htm,.xlsx,.xls,.csv,.kml,.kmz"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-4 p-6 sm:p-12 border-2 border-dashed border-orange-100 rounded-2xl bg-orange-50/20 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 animate-spin" />
                <span className="text-[10px] sm:text-sm font-black text-orange-600 uppercase tracking-[0.2em]">Uploading Asset...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 group-hover:shadow-md transition-all">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">Choose sample report file</p>
                  <p className="text-[9px] sm:text-xs text-gray-400 mt-1 uppercase tracking-widest">Tap to browse local storage</p>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Current Sample Reports */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Active Sample Reports</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {sampleReports.length} report{sampleReports.length !== 1 ? 's' : ''} visible to all users
              </p>
            </div>
            <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
              {sampleReports.length} Active
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : sampleReports.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-700 font-bold text-sm mb-1">No sample reports yet</h3>
              <p className="text-gray-400 text-xs">Upload a file above to make it visible to all users.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sampleReports.map((report) => {
                const iconClass = getExtIcon(report.filename);
                return (
                  <div
                    key={report.pdf_id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 hover:bg-gray-50/60 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[150px] xs:max-w-none">
                            {report.filename}
                          </p>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded">
                            SAMPLE
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
                          {formatDate(report.uploaded_at)} · {formatSize(report.file_size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                      <button
                        onClick={() => handleView(report.pdf_id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-[10px] sm:text-xs font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDelete(report.pdf_id, report.filename)}
                        disabled={deleting === report.pdf_id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {deleting === report.pdf_id
                          ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
