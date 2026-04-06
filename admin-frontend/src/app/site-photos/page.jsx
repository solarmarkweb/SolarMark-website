'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, Upload, Trash2, CheckCircle, AlertCircle,
  Loader2, Image as ImageIcon, Plus, X, Layout,
  FileImage, Sliders, Save, ChevronDown
} from 'lucide-react';

// FIREBASE STORAGE IMPORTS
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function SitePhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Form State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'anomaly-hotspot'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/site-photos`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Could not load photos' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus({ type: 'info', message: 'Uploading photo...' });

    const token = localStorage.getItem('token');
    
    try {
      // 1. UPLOAD TO FIREBASE STORAGE
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storageRef = ref(storage, `site-photos/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Wait for upload to complete
      const downloadURL = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Can add progress bar logic here if needed
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setStatus({ type: 'info', message: `Uploading color... ${Math.round(progress)}%` });
          },
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => resolve(url));
          }
        );
      });

      // 2. SEND METADATA AND URL TO BACKEND
      const response = await fetch(`${API_URL}/site-photos/create-from-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: downloadURL,
          title: formData.title,
          description: formData.description,
          category: formData.category
        })
      });

      if (!response.ok) throw new Error('Failed to save metadata to backend');

      setStatus({ type: 'success', message: 'Photo uploaded and published successfully!' });
      setFile(null);
      setPreview(null);
      setFormData({ title: '', description: '', category: 'homepage' });
      fetchPhotos();
    } catch (err) {
      console.error('Firebase Upload Error:', err);
      setStatus({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/site-photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setPhotos(photos.filter(p => p.id !== id));
      setStatus({ type: 'success', message: 'Photo deleted' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Site Content Management</h1>
            <p className="text-slate-500 font-medium">Manage dynamic photos for the frontend portal</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
              <Layout className="text-blue-500" size={18} />
              <span className="text-sm font-bold text-slate-700">{photos.length} Total Assets</span>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
            {status.type === 'success' ? <CheckCircle size={20} /> :
              status.type === 'error' ? <AlertCircle size={20} /> : <Loader2 className="animate-spin" size={20} />}
            <p className="text-sm font-bold uppercase tracking-wider">{status.message}</p>
            <button onClick={() => setStatus({ type: '', message: '' })} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Plus size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Upload New Asset</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Hero Banner"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category / Section</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium appearance-none"
                    >
                      <optgroup label="General Sections">
                        <option value="Main Hero">Main Hero Image</option>
                        <option value="Spectral View">Spectral View Widget</option>
                        <option value="Site Survey">Site Survey Widget</option>
                        <option value="Precision Intelligence">Precision Intelligence Section</option>
                        <option value="Global Deployment">Global Deployment Section</option>
                        <option value="Main Gallery">Main Gallery</option>
                        <option value="homepage">Other Homepage Asset</option>
                      </optgroup>
                      <optgroup label="Anomaly Types">
                        <option value="anomaly-hotspot">Anomaly: Hotspot</option>
                        <option value="anomaly-multi-hotspot">Anomaly: Multi Hotspot</option>
                        <option value="anomaly-bypassed">Anomaly: Bypassed Substring</option>
                        <option value="anomaly-diode">Anomaly: Diode Failure</option>
                        <option value="anomaly-pid">Anomaly: PID Effect</option>
                        <option value="anomaly-soiling">Anomaly: Soiling</option>
                        <option value="anomaly-broken-glass">Anomaly: Broken Glass</option>
                        <option value="anomaly-delamination">Anomaly: Delamination</option>
                        <option value="anomaly-vegetation">Anomaly: Vegetation</option>
                        <option value="anomaly-shadowing">Anomaly: Shadowing</option>
                      </optgroup>
                      <optgroup label="Service Sections">
                        <option value="Thermography">Thermography</option>
                        <option value="Work Management">Work Management</option>
                        <option value="Asset Management">Asset Management</option>
                        <option value="Progress Tracking">Progress Tracking</option>
                        <option value="Quality Control">Quality Control</option>
                        <option value="Commissioning">Commissioning</option>
                        <option value="Site Assessment">Site Assessment</option>
                        <option value="Drones & Robotics">Drones & Robotics</option>
                        <option value="AI & Analytics">AI & Analytics</option>
                        <option value="Forms & Ticketing">Forms & Ticketing</option>
                        <option value="Integrations">Integrations</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="Brief description..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Photo</label>
                  <div className="relative group/upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${preview ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 group-hover/upload:border-orange-300 group-hover/upload:bg-orange-50/30'
                      }`}>
                      {preview ? (
                        <img src={preview} alt="Preview" className="h-32 w-auto rounded-lg shadow-md mb-2" />
                      ) : (
                        <>
                          <FileImage className="text-slate-400 mb-2 group-hover/upload:text-orange-500 transition-colors" size={32} />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Image</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={uploading || !file}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {uploading ? 'Uploading...' : 'Publish to Site'}
                </button>
              </form>
            </div>
          </div>

          {/* Photos List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-orange-500/20 rounded-full animate-spin border-t-orange-500"></div>
                </div>
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Assets...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center px-10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <ImageIcon size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No active assets found</h3>
                <p className="text-slate-500 font-medium max-w-sm">Upload your first photo to see it appear here and on the main website portal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                        src={photo.url.startsWith('http') ? photo.url : `${API_URL.replace('/api', '')}${photo.url}`}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {photo.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">{photo.title || 'Untitled Asset'}</h3>
                      <p className="text-slate-500 text-xs font-medium mb-4 line-clamp-2">{photo.description || 'No description provided.'}</p>
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          ID: {photo.id.substring(0, 8)}...
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {new Date(photo.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
