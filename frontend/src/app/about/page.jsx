"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    ShieldCheck, Zap, BarChart3, Globe, Award, Rocket,
    Camera, Thermometer, Battery, CloudRain, Activity,
    Target, Users, MapPin, CheckCircle2, ArrowRight
} from "lucide-react";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";

const ICON_MAP = {
    ShieldCheck, Zap, BarChart3, Globe, Award, Rocket,
    Camera, Thermometer, Battery, CloudRain, Activity,
    Target, Users, MapPin, CheckCircle2, ArrowRight
};

export default function AboutPage() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await authAPI.getAboutContent();
                setContent(res.data);
            } catch (err) {
                console.error("Failed to fetch about content:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Fallback data if API fails or is loading
    const defaultData = {
        hero_title: "Next-Generation",
        hero_subtitle: "Solar Intelligence",
        hero_description: "Elevating solar asset management with aerospace-grade drone thermal imaging and AI-driven precision. Fast, reliable, and exceptionally accurate inspections.",
        mission_title: "Pioneering the Future of Asset Management",
        mission_text_1: "At the intersection of aerospace technology and clean energy, our mission is to ensure that large-scale solar farms operate at absolute peak capacity. Traditional manual inspections are slow, hazardous, and prone to human error.",
        mission_text_2: "By deploying automated drone fleets equipped with state-of-the-art radiometric thermal cameras, we scan vast solar arrays in a fraction of the time. The resulting data is processed by our proprietary AI to definitively pinpoint anomalies—down to the individual cell level.",
        mission_highlights: [
            "Rapid deployment across global utility-scale sites",
            "Significant reduction in operations and maintenance (O&M) costs",
            "Zero manual labor risks or hazard exposure",
            "Bankable, auditor-ready digital reporting"
        ],
        stats: [
            { label: "Panels Inspected", value: "2.5M+", icon: "Zap" },
            { label: "Efficiency Gain", value: "18%", icon: "BarChart3" },
            { label: "Global Clients", value: "500+", icon: "Globe" },
            { label: "Accuracy Rate", value: "99.9%", icon: "ShieldCheck" },
        ],
        process: [
            {
                step: "01",
                title: "Pre-Flight Intelligence",
                description: "Certified pilots analyze site layout, weather conditions, and optimal flight paths using advanced 3D mapping and terrain analysis software.",
                icon: "MapPin",
                details: ["Risk assessment", "Weather analysis"]
            },
            {
                step: "02",
                title: "Thermal Data Capture",
                description: "High-resolution thermal cameras mounted on drones capture premium infrared imagery of every panel at optimal angles to detect microscopic defects.",
                icon: "Camera",
                details: ["FLIR resolution", "Multi-angle capture"]
            },
            {
                step: "03",
                title: "AI-Powered Analysis",
                description: "Proprietary machine learning algorithms process thermal data to accurately identify hotspots, cold spots, and anomalies with unmatched precision.",
                icon: "Activity",
                details: ["Machine learning", "Anomaly classification"]
            },
            {
                step: "04",
                title: "Actionable Reporting",
                description: "Comprehensive reports delivered with high-fidelity thermal maps, exact fault locations, and actionable recommendations for maintenance teams.",
                icon: "BarChart3",
                details: ["Visual thermal maps", "ROI calculations"]
            },
        ],
        capabilities: [
            { name: "Hotspot Detection", description: "Identifies overheating cells that reduce efficiency and pose fire risks", icon: "Thermometer" },
            { name: "Cell Degradation", description: "Detects aging or damaged cells showing reduced power output", icon: "Battery" },
            { name: "Diode Failure", description: "Locates faulty diodes causing string performance issues", icon: "Zap" },
            { name: "Soiling & Shading", description: "Maps dirt accumulation and shadow patterns affecting output", icon: "CloudRain" },
        ],
        values: [
            { title: "Precision Engineering", description: "Leveraging military-grade thermal sensors and custom AI algorithms to identify microscopic faults before they become critical failures.", icon: "Target" },
            { title: "Sustainable Future", description: "Every kilowatt-hour saved is a step toward a greener planet. We are deeply committed to maximizing renewable energy potential globally.", icon: "Rocket" },
            { title: "Industry Excellence", description: "Setting the absolute gold standard for thermographic inspections with certified drone pilots and world-class data analysis.", icon: "Award" },
            { title: "Global Reach", description: "Our distributed network of pilots ensures we can deploy teams to any solar farm across the globe within 48 hours of your request.", icon: "Globe" },
        ],
        drone_tech_title: "Purpose-Built Drone Technology",
        drone_tech_description: "Our fleet of enterprise-grade drones are specifically modified for radiometric thermal solar inspection, ensuring every pass captures millimeter-accurate data across your entire solar array.",
        drone_tech_specs: [
            { label: "ALTITUDE", value: "120 FT", status: "ACTIVE", color: "green" },
            { label: "AIRSPEED", value: "15 MPH", status: "ACTIVE", color: "green" },
            { label: "THERMAL SENSOR", value: "ACTIVE", status: "ACTIVE", color: "orange" },
            { label: "PANEL SCAN", value: "IN PROGRESS", status: "ACTIVE", color: "blue" }
        ]
    };

    const data = content || defaultData;
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500/20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 border-b border-slate-100 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/premium-solar-farm.png"
                        alt="Solar panels at sunset"
                        className="w-full h-full object-cover opacity-[0.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={staggerContainer}
                            className="max-w-2xl"
                        >
                            <motion.div variants={fadeUp} className="mb-6">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200 bg-white text-orange-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                                    <ShieldCheck className="w-4 h-4" />
                                    Enterprise Solutions
                                </span>
                            </motion.div>
                            
                            <motion.h1
                                variants={fadeUp}
                                className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 leading-[1.1]"
                            >
                                {data.hero_title} <br />
                                <span className="text-orange-600">{data.hero_subtitle}</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="text-xl text-slate-600 leading-relaxed mb-8 font-medium"
                            >
                                {data.hero_description}
                            </motion.p>
                            
                            <motion.div variants={fadeUp} className="flex gap-4">
                                <Link href="/contact" className="px-8 py-3.5 bg-orange-600 text-white rounded-xl font-bold transition-colors hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                                    Schedule Inspection
                                </Link>
                                <Link href="#process" className="px-8 py-3.5 bg-white border border-slate-300 text-slate-900 rounded-xl font-bold transition-colors hover:bg-slate-50">
                                    Learn More
                                </Link>
                            </motion.div>
                        </motion.div>
                        
                        {/* Hero Image Group */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                                <img
                                    src="/solar_panel_inspection.png"
                                    alt="Drone inspecting solar panels"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-slate-900 shadow-lg border border-white/50 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Live Active Tracking
                                    </div>
                                    <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                                        99.9% Accuracy
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Fast Stats Grid */}
            <section className="relative -mt-12 z-20 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
                    >
                        {data.stats.map((stat, i) => {
                            const Icon = ICON_MAP[stat.icon] || Zap;
                            return (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
                                >
                                    <div className="mb-4 inline-flex w-12 h-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Content Section: Who We Are */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                {data.mission_title}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-6 leading-relaxed">
                                {data.mission_text_1}
                            </motion.p>
                            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {data.mission_text_2}
                            </motion.p>
                            
                            <motion.ul variants={fadeUp} className="space-y-4">
                                {data.mission_highlights.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </motion.ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <img
                                src="/premium-solar-farm.png"
                                alt="Utility Scale Solar Farm"
                                className="rounded-2xl w-full h-full object-cover min-h-[250px] shadow-sm"
                            />
                            <div className="grid grid-rows-2 gap-4">
                                <img
                                    src="/solar_thermal_scan.png"
                                    alt="Close up of solar panels"
                                    className="rounded-2xl w-full h-full object-cover shadow-sm"
                                />
                                <div className="bg-orange-600 rounded-2xl p-6 text-white flex flex-col justify-center items-center text-center shadow-lg">
                                    <Camera className="w-10 h-10 mb-3 opacity-90" />
                                    <div className="font-extrabold text-3xl mb-1">10x</div>
                                    <div className="text-orange-100 text-sm font-medium uppercase tracking-wide">Faster Inspections</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Streamlined <span className="text-orange-600">Integration</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            A fast, reliable 4-step process designed for minimal disruption to your operations and maximum results for your bottom line.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.process.map((process, i) => {
                            const Icon = ICON_MAP[process.icon] || Target;
                            return (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    className="relative p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 group"
                                >
                                    <div className="text-7xl font-black text-slate-50 absolute top-4 right-4 group-hover:text-orange-50 transition-colors pointer-events-none select-none">
                                        {process.step}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-8 shadow-sm group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-300">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{process.title}</h3>
                                        <p className="text-slate-600 text-base mb-8 leading-relaxed font-medium">{process.description}</p>
                                        <div className="pt-6 border-t border-slate-100">
                                            <ul className="space-y-3">
                                                {process.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-slate-800 text-sm font-bold">
                                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Drone Technology Showcase */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            {data.drone_tech_title}
                        </h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            {data.drone_tech_description}
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group border border-slate-200 bg-slate-900"
                    >
                        <img 
                            src="/agri-drone-survey.png" 
                            alt="Professional inspection drone in flight over panels" 
                            className="w-full h-[500px] md:h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 mix-blend-lighten" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90" />
                        
                        <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 max-w-2xl text-white pr-8">
                            <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg inline-flex items-center gap-2 mb-6">
                                <Camera className="w-4 h-4" />
                                Radiometric Thermal Sensors
                            </div>
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">Enterprise Drone Fleet</h3>
                            <p className="text-slate-300 font-medium text-lg leading-relaxed md:max-w-xl drop-shadow">
                                Equipped with dual-payload FLIR high-resolution thermal imaging and RGB cameras operating in tandem for precision hotspot detection and physical damage assessment.
                            </p>
                        </div>
                        
                        {/* Futuristic UI Overlay Elements */}
                        <div className="absolute top-8 right-8 md:top-12 md:right-12 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-white font-mono flex flex-col gap-3 shadow-2xl hidden sm:flex">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Live Telemetry</span>
                            </div>
                            {data.drone_tech_specs.map((spec, idx) => (
                                <div key={idx} className="flex justify-between gap-12 text-sm">
                                    <span className="text-slate-400">{spec.label}</span>
                                    <span className={`text-${spec.color}-400 font-bold`}>{spec.value}</span>
                                </div>
                            ))}
                            <div className="w-full h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-green-500 rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
                            </div>
                        </div>
                        
                        {/* Target reticle overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full hidden md:flex items-center justify-center mix-blend-overlay">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <div className="absolute top-0 w-full h-[1px] bg-white/20" />
                            <div className="absolute left-0 h-full w-[1px] bg-white/20" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Capabilities */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-12 items-center">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                                Flawless <br />
                                <span className="text-orange-500">Detection</span>
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed font-medium">
                                Our radiometric sensors perceive what strictly escapes the human eye. We identify anomalies immediately, ensuring your operations remain predictably efficient.
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:text-orange-400 transition-colors">
                                View Technical Specs <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                            {data.capabilities.map((cap, i) => {
                                const Icon = ICON_MAP[cap.icon] || Activity;
                                return (
                                    <motion.div
                                        key={i}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true }}
                                        variants={fadeUp}
                                        className="p-8 rounded-3xl bg-slate-800 border border-slate-700 hover:border-orange-500 hover:bg-slate-800/80 transition-all duration-300 group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center mb-6 text-orange-500 border border-slate-700 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{cap.name}</h3>
                                        <p className="text-slate-400 text-base leading-relaxed font-medium">{cap.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-24 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            The Values That <span className="text-orange-600">Drive Us</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            We fuse aerospace-grade technology with advanced machine learning to secure your solar investments. Fast delivery, actionable insights, and unparalleled reliability.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {data.values.map((v, i) => {
                            const Icon = ICON_MAP[v.icon] || Rocket;
                            return (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    className="group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{v.title}</h3>
                                    <p className="text-slate-600 leading-relaxed font-medium">{v.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/50 rounded-full blur-[100px]" />
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Ready to Secure Your <br className="hidden sm:block" />
                        <span className="text-orange-600">Energy Future?</span>
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
                        Experience the pinnacle of solar inspection. Connect with our expert teams today to elevate your operational efficiency and maximize ROI.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/contact" className="px-10 py-4 bg-orange-600 text-white rounded-xl font-bold transition-all hover:bg-orange-700 hover:scale-105 shadow-xl shadow-orange-600/30 flex items-center justify-center gap-3 text-lg">
                            <Camera size={22} className="opacity-90" />
                            Book Consultation
                        </Link>
                        <Link href="/contact" className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold transition-all hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-3 text-lg shadow-sm">
                            <Users size={22} className="text-slate-400" />
                            Enterprise Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
