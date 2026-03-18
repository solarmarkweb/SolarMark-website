"use client";

import React, { useRef } from "react";
import {
    Zap, Shield, Globe, Sun, ArrowRight,
    BarChart3, Camera, Cloud, Battery, Wrench,
    FileUp, CheckCircle, MousePointer2, Sparkles,
    ShieldCheck, Activity, Thermometer
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";

const FloatingElement = ({ children, delay = 0, duration = 4, className = "" }) => (
  <motion.div
    animate={{
      y: [0, -15, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
    <div className="relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-2">
      {children}
    </div>
  </div>
);

export default function OffersPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const opacity = useTransform(springScroll, [0, 0.1], [1, 0.2]);
    const scale = useTransform(springScroll, [0, 0.1], [1, 0.98]);

    const offers = [
        {
            icon: <Thermometer className="text-orange-600" size={24} />,
            title: "Advanced Thermographic Audit",
            description: "High-resolution spectral diagnostics detecting cell-level defects, hotspots, and string failures with 5cm accuracy.",
            features: ["5cm GSD Precision", "Thermal Delta Mapping", "Critical Fault Detection"]
        },
        {
            icon: <ShieldCheck className="text-blue-600" size={24} />,
            title: "Structural Asset Integrity",
            description: "Detailed civil monitoring and 3D modeling of mounting structures to ensure long-term stability and safety.",
            features: ["Tracker Tilt Verification", "Foundation Health", "Civil Infrastructure Audit"]
        },
        {
            icon: <Activity className="text-emerald-600" size={24} />,
            title: "Performance Optimization",
            description: "Smart data correlation comparing SCADA feeds with aerial visual audits to maximize energy yield per string.",
            features: ["PR Loss Quantification", "Degradation Tracking", "ROI Maximization"]
        },
        {
            icon: <Battery className="text-purple-600" size={24} />,
            title: "BESS Safety Inspection",
            description: "Specialized thermal and structural audits for Battery Energy Storage Systems to prevent thermal runaway.",
            features: ["Thermal Runaway Prevention", "Safety Compliance", "System Health Monitoring"]
        },
        {
            icon: <Globe className="text-sky-600" size={24} />,
            title: "Unified Fleet Oversight",
            description: "Standardized inspection protocols for global portfolios, delivering consistent data across all site locations.",
            features: ["Portfolio Syncing", "Global Reporting", "Standardized Taxonomy"]
        },
        {
            icon: <Zap className="text-yellow-600" size={24} />,
            title: "Swift Site Commissioning",
            description: "Accelerated handover protocols for new utility sites with automated punch-lists and warranty-grade documentation.",
            features: ["Rapid Handover Support", "EPC Quality Compliance", "Warranty Protection"]
        }
    ];

    return (
        <div ref={containerRef} className="bg-white overflow-x-hidden pt-24 min-h-screen">
            {/* Professional Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute top-10 left-1/4 w-80 h-80 bg-orange-100 rounded-full blur-[100px]" />
                    <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-50 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div style={{ opacity, scale }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                            <Sparkles size={12} className="text-orange-500" />
                            Premium Inspection Services
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-tight">
                            MAXIMIZING <br />
                            <span className="text-orange-600 italic">SOLAR ASSET</span> PERFORMANCE
                        </h1>
                        
                        <p className="text-base md:text-lg text-slate-500 font-bold max-w-2xl mx-auto mb-10 leading-relaxed uppercase tracking-widest opacity-80">
                            High-precision aerial intelligence and actionable analytics <br />
                            for utility-scale renewable infrastructure.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact" className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 group">
                                View Full Scope
                                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={14} />
                            </Link>
                            <Link href="/contact" className="px-10 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                                Request Proposal
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Service Grid Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard className="h-full">
                                    <div className="p-10">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                            {offer.icon}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight uppercase">{offer.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6 tracking-wide">
                                            {offer.description}
                                        </p>
                                        <div className="space-y-2.5">
                                            {offer.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <CheckCircle size={10} className="text-emerald-500" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Actionable Insights Section - Refined */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-orange-500 font-black text-[9px] uppercase tracking-[0.4em] mb-4 block">Data Driven Results</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase leading-tight">
                                DELIVERING <span className="text-orange-600 italic">ACTIONABLE</span> <br />
                                SITE INTELLIGENCE
                            </h2>
                            <p className="text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest leading-relaxed max-w-lg">
                                Our platform converts complex aerial signatures into a refined maintenance prioritized list, 
                                enabling O&M teams to act immediately on high-impact faults.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { label: "Thermal Delta Accuracy", val: "±0.5°C" },
                                    { label: "Geolocation GSD", val: "<5.0 cm" },
                                    { label: "Fault Classification", val: "IEC 62446-3" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="relative bg-white/5 rounded-[3rem] p-3 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
                                <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden aspect-video relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-40" />
                                    
                                    <div className="p-8 h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse [animation-delay:0.5s]" />
                                            </div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Live Analysis Mode</span>
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <span className="text-5xl font-black text-white tracking-tighter uppercase">Healthy</span>
                                            <span className="text-emerald-500 font-black mb-2 uppercase tracking-widest text-[10px]">99.1%</span>
                                        </div>

                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "99%" }}
                                                transition={{ duration: 1 }}
                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simplified CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight uppercase">
                        READY TO SCALE <span className="text-orange-600">PRODUCTION?</span>
                    </h2>
                    
                    <p className="text-slate-500 font-bold mb-10 text-xs uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
                        Talk to our engineering team today for a tailored inspection strategy.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-12 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black shadow-xl transition-all">
                            Book Consultant
                        </button>
                        <button className="px-12 py-4 bg-white border border-slate-900 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
