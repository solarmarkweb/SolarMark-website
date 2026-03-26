'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Shield, Calendar, Lock, Fingerprint } from 'lucide-react';

const PrivacyPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_URL}/legal`);
                const data = await response.json();
                setContent(data.privacy);
            } catch (error) {
                console.error('Error:', error);
                setContent('Error loading privacy policy. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={32} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Authenticating Secure Layer</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Elegant Minimal Header */}
            <div className="pt-44 pb-12 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-12 h-[1px] bg-blue-600"></span>
                                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Privacy Governance</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-none tracking-tight mb-8">
                                Privacy <br /><span className="text-slate-300">Directive</span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Your data security is our highest priority. This document outlines our data collection,
                                protection, and processing standards to ensure your total transparency.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-w-[280px]">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective Date</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encryption Level</p>
                                        <p className="text-sm font-bold text-blue-600">AES-256 / Full Cloud</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-8 py-24">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Left Side: Index/ToC (Subtle) */}
                    <aside className="lg:w-1/4 hidden lg:block sticky top-32 h-fit">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">In this directive</h4>
                                <nav className="space-y-4">
                                    {['Data Collection', 'Storage Protocols', 'Third-Party Sharing', 'User Rights', 'Cookie Policy', 'Security Measures'].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                                            <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-600 transition-colors">0{idx + 1}</span>
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{item}</span>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <div className="p-6 bg-slate-950 rounded-3xl text-white">
                                    <Fingerprint className="text-blue-500 mb-4" size={24} />
                                    <h5 className="font-bold text-sm mb-2">Secure Access</h5>
                                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Request a full audit log of your personal data collected on our platform.</p>
                                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl text-[10px] font-black uppercase tracking-widest">Request Log</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Side: The Content */}
                    <main className="lg:w-3/4">
                        <div className="prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap font-medium text-slate-600 leading-9 text-lg md:text-xl space-y-8">
                                {content}
                            </div>
                        </div>

                        {/* Professional Footer Sign-off */}
                        <div className="mt-32 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                    <Shield size={16} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Reference: SM-SEC-2026-X1</p>
                            </div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Military Grade Data Protection</p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
