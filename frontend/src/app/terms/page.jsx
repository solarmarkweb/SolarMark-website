'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Calendar, ShieldCheck, ScrollText } from 'lucide-react';

const TermsPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_URL}/legal`);
                const data = await response.json();
                setContent(data.terms);
            } catch (error) {
                console.error('Error:', error);
                setContent('Error loading terms and conditions. Please try again later.');
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
                    <Loader2 className="animate-spin text-orange-600 mb-4 mx-auto" size={32} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Preparing Document</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Elegant Minimal Header */}
            <div className="pt-44 pb-12 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-12 h-[1px] bg-orange-600"></span>
                                <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.4em]">Legal Framework</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-none tracking-tight mb-8 uppercase">
                                Terms of <br /><span className="text-slate-300">Service</span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Please read these terms carefully before using the SolarMark platform.
                                They constitute a legally binding agreement between you and SolarMark.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-w-[280px]">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-orange-600">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Left Side: Index/ToC (Subtle) */}
                    <aside className="lg:w-1/4 hidden lg:block sticky top-32 h-fit">
                        <div className="space-y-8">
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
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
