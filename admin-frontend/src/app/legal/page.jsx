'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Save, Loader2, CheckCircle, AlertCircle, FileText, Globe } from 'lucide-react';

const LegalManagementPage = () => {
    const [content, setContent] = useState({
        terms: '',
        privacy: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ terms: false, privacy: false });
    const [status, setStatus] = useState({ type: '', message: '', target: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    useEffect(() => {
        fetchLegalContent();
    }, []);

    const fetchLegalContent = async () => {
        try {
            const response = await fetch(`${API_URL}/legal`);
            if (!response.ok) throw new Error('Failed to fetch legal content');
            const data = await response.json();
            setContent({
                terms: data.terms || '',
                privacy: data.privacy || ''
            });
        } catch (error) {
            console.error('Error:', error);
            setStatus({ type: 'error', message: 'Failed to load content' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (type) => {
        setSaving(prev => ({ ...prev, [type]: true }));
        setStatus({ type: '', message: '', target: '' });

        try {
            const response = await fetch(`${API_URL}/legal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [type]: content[type] })
            });

            if (!response.ok) throw new Error('Failed to save');

            setStatus({
                type: 'success',
                message: `${type === 'terms' ? 'Terms' : 'Privacy'} Updated`,
                target: type
            });

            setTimeout(() => setStatus({ type: '', message: '', target: '' }), 4000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Save Failed', target: type });
        } finally {
            setSaving(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-10 h-10 border-2 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                            <Shield className="text-white" size={18} />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Legal Management</h1>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                        <Globe size={12} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Production Live</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Terms & Conditions Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-orange-600" />
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Terms & Conditions</h2>
                            </div>
                            <button
                                onClick={() => handleSave('terms')}
                                disabled={saving.terms}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${saving.terms
                                        ? 'bg-slate-100 text-slate-400'
                                        : 'bg-slate-900 text-white hover:bg-orange-600 active:scale-95 shadow-sm'
                                    }`}
                            >
                                {saving.terms ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                                {saving.terms ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="relative flex-1 group">
                            {status.target === 'terms' && status.type === 'success' && (
                                <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Changes Saved</span>
                                </div>
                            )}
                            <textarea
                                value={content.terms}
                                onChange={(e) => setContent({ ...content, terms: e.target.value })}
                                className="w-full h-[65vh] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all font-mono text-xs leading-relaxed text-slate-700 hover:border-slate-300 resize-none shadow-inner"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    {/* Privacy Policy Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-blue-600" />
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Privacy Policy</h2>
                            </div>
                            <button
                                onClick={() => handleSave('privacy')}
                                disabled={saving.privacy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${saving.privacy
                                        ? 'bg-slate-100 text-slate-400'
                                        : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm'
                                    }`}
                            >
                                {saving.privacy ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                                {saving.privacy ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="relative flex-1 group">
                            {status.target === 'privacy' && status.type === 'success' && (
                                <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Changes Saved</span>
                                </div>
                            )}
                            <textarea
                                value={content.privacy}
                                onChange={(e) => setContent({ ...content, privacy: e.target.value })}
                                className="w-full h-[65vh] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-xs leading-relaxed text-slate-700 hover:border-slate-300 resize-none shadow-inner"
                                placeholder="..."
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Info */}
                <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
                    <div className="h-[1px] w-8 bg-slate-100"></div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Enterprise Security Protocol Enabled</p>
                    <div className="h-[1px] w-8 bg-slate-100"></div>
                </div>
            </div>
        </div>
    );
};

export default LegalManagementPage;
