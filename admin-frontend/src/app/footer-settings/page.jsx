'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Globe, Facebook, Twitter, Linkedin, Instagram, Link as LinkIcon, Save, Image as ImageIcon } from 'lucide-react';

export default function FooterSettingsPage() {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [order, setOrder] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

    const fetchSocialLinks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/footer-social/`);
            setSocialLinks(response.data);
        } catch (err) {
            console.error('Error fetching social links:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.append('platform', String(platform));
        formData.append('url', String(url));
        formData.append('order', String(order));
        if (file) formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/footer-social/upload/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPlatform('');
            setUrl('');
            setFile(null);
            setOrder(socialLinks.length + 1);
            await fetchSocialLinks();
            alert('Social link added successfully');
        } catch (err) {
            console.error('Error adding social link:', err);
            alert('Failed to add social link');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this social link?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/footer-social/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchSocialLinks();
        } catch (err) {
            console.error('Error deleting social link:', err);
        }
    };

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('facebook')) return <Facebook size={20} className="text-blue-600" />;
        if (p.includes('twitter')) return <Twitter size={20} className="text-sky-400" />;
        if (p.includes('linkedin')) return <Linkedin size={20} className="text-blue-700" />;
        if (p.includes('instagram')) return <Instagram size={20} className="text-pink-600" />;
        return <Globe size={20} className="text-slate-400" />;
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Globe className="text-orange-500" />
                    Footer Social Links
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest text-[10px]">Manage dynamic social media connections</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                            <Plus size={14} className="text-orange-500" /> 
                            New Connection
                        </h2>
                        <form onSubmit={handleAddLink} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Platform Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Facebook" 
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Redirect URL</label>
                                <input 
                                    type="url" 
                                    required 
                                    placeholder="https://..." 
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Custom Icon (Optional)</label>
                                <label className="flex items-center gap-3 w-full px-5 py-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                                    <ImageIcon size={18} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500">{file ? file.name : "Choose SVG/PNG"}</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? "Adding..." : "Add to Footer"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Active Social Ecosystem</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Synchronizing Data...</div>
                            ) : (!Array.isArray(socialLinks) || socialLinks.length === 0) ? (
                                <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">No social links configured</div>
                            ) : (
                                socialLinks.map((link) => (
                                    <div key={link.id || Math.random()} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden">
                                                {link.icon_url ? (
                                                    <img src={`${API_URL.replace('/api', '')}${link.icon_url}`} className="w-6 h-6 object-contain" alt="" />
                                                ) : (
                                                    getIcon(link.platform)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 tracking-tight leading-none mb-1 uppercase text-sm">{link.platform}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 truncate max-w-md flex items-center gap-1">
                                                    <LinkIcon size={10} /> {link.url}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(link.id)}
                                            className="p-3 bg-red-50 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

