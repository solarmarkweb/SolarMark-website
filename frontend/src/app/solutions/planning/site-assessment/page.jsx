"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Map, Sun, Zap, Shield, FileText } from "lucide-react";

export default function SiteAssessmentPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-slate-950 text-white relative overflow-hidden flex items-center min-h-[70vh]">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="px-4 py-1.5 bg-orange-600 rounded-md text-xs font-bold mb-8 tracking-[0.2em] uppercase inline-block">
                                Precision Planning Phase
                            </div>
                            <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1] uppercase">
                                High-Fidelity <br /><span className="text-orange-400">Site Intelligence</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                                Transform raw terrain into optimized solar assets. Our AI-driven site assessments reduce planning timelines by 60% while maximizing total lifetime yield.
                            </p>
                            <div className="flex flex-wrap gap-5 justify-center">
                                <Link href="/booking" className="px-12 py-6 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/40">
                                    Request a Site Survey
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Capability Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Map, title: "Topographic Mapping", desc: "Centimeter-accurate contour maps to optimize racking placement and minimize site grading." },
                            { icon: Sun, title: "Irradiance Modeling", desc: "Advanced shading analysis using 20 years of ultra-local historical meteorological data." },
                            { icon: Zap, title: "Grid Feasibility", desc: "Instant evaluation of substation proximity and interconnection transformer capacity." },
                            { icon: Shield, title: "Environmental Risk", desc: "AI-driven identification of protected habitats and complex soil stability issues." },
                            { icon: FileText, title: "Hydrological Study", desc: "Simulated drainage and runoff forecasting to prevent multi-year soil erosion." },
                            { icon: CheckCircle, title: "Permit Readiness", desc: "All spatial datasets formatted for immediate regulatory and jurisdictional submission." }
                        ].map((item, i) => (
                             <div key={i} className="p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                                <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors uppercase">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Split Showcase */}
            <section className="py-24 bg-white overflow-hidden border-t border-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-100">
                                <Image src="https://images.pexels.com/photos/8853502/pexels-photo-8853502.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Assessment detail" fill className="object-cover" />
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-slate-950 p-10 rounded-3xl shadow-2xl text-white border border-white/10">
                                <div className="text-5xl font-bold text-orange-400 mb-1 leading-none">60%</div>
                                <div className="text-sm font-bold opacity-60 uppercase tracking-widest">Faster Turnaround</div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight uppercase">Predictive Design <br /><span className="text-orange-600">Decision Engine</span></h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                Stop guessing. Our digital-first approach provides the precise data needed for optimal layout design, ensuring you never leave megawatts on the table.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "LiDAR Integration", desc: "Aerial LiDAR for extreme topographic precision." },
                                    { title: "Geotechnical Sync", desc: "Soil data integration for structural foundation engineering." }
                                ].map((li, i) => (
                                    <div key={i} className="flex gap-4 p-8 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            <CheckCircle size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xl mb-1">{li.title}</h4>
                                            <p className="text-slate-500 text-sm">{li.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantage CTA */}
            <section className="py-24 bg-slate-950 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/5 blur-[100px]"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-white text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight uppercase">Data-Driven From Day One</h2>
                    <p className="text-lg md:text-2xl text-slate-400 mb-16 leading-relaxed font-medium">
                        Assessments that are dynamic datasets, not just PDF reports. Connect your design workflow to true site intelligence.
                    </p>
                    <Link href="/booking" className="px-16 py-8 bg-orange-600 text-white rounded-xl font-bold text-xl hover:bg-orange-700 transition-all shadow-2xl shadow-orange-900/40 active:scale-95 inline-block">
                        Schedule Preliminary Scan
                    </Link>
                </div>
            </section>
        </div>
    );
}

