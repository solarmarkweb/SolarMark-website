"use client";

import React, { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle, ShieldCheck, Zap, Lock, MapPin, Plane, User, Calendar, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function BookingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        // Contact Information
        firstName: "",
        lastName: "",
        workEmail: "",
        jobTitle: "",
        phone: "",
        country: "",
        companyName: "",
        companyType: "",
        solarCapacity: "",
        referralSource: "",

        // Project Details
        projectName: "",
        inspectionPurpose: "",

        // Location Info
        siteAddress: "",
        latitude: "",
        longitude: "",
        areaSize: "",
        airspaceType: "",

        // Drone & Equipment
        droneModel: "",
        droneUIN: "",
        payloadType: "",

        // Pilot Information
        pilotName: "",
        rpcNumber: "",
        pilotOrg: "",

        // Flight Schedule
        flightDate: "",
        flightTime: "",
        altitude: "",

        // Compliance & Safety
        npntRequired: "No",
        weatherConditions: "",
        emergencyPlan: "",

        // Deliverables
        outputType: "",
        resolution: "",

        // Additional
        additionalInfo: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    useEffect(() => {
        // Check for logged in user
        const token = localStorage.getItem("auth_token");
        if (token) {
            setUser({ token });
            const savedRole = localStorage.getItem("user_role");
            if (savedRole) {
                setFormData(prev => ({ ...prev, companyType: savedRole }));
            }
        }

        // Restore pending booking data if exists
        const pendingData = localStorage.getItem("pending_booking");
        if (pendingData) {
            try {
                const parsedData = JSON.parse(pendingData);
                setFormData(prev => ({ ...prev, ...parsedData }));
                localStorage.removeItem("pending_booking");
                setStatus({
                    type: 'info',
                    message: 'Welcome back! Your booking details have been restored.'
                });
            } catch (e) {
                console.error("Error parsing pending booking data", e);
            }
        }

        return () => {};
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return; // Prevent double submission

        setSubmitting(true);
        setStatus({ type: 'info', message: 'Initializing your deployment request...' });

        const token = localStorage.getItem("auth_token");

        if (!token) {
            localStorage.setItem("pending_booking", JSON.stringify(formData));
            router.push("/login?returnTo=/booking");
            return;
        }

        try {
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.workEmail,
                contact_phone: formData.phone,
                location: formData.siteAddress || formData.country,

                service_type: formData.companyType,
                system_size: formData.solarCapacity,

                project_name: formData.projectName,
                inspection_purpose: formData.inspectionPurpose,
                date: formData.flightDate, // Root level date
                time: formData.flightTime, // Root level time

                coordinates: {
                    lat: formData.latitude,
                    lng: formData.longitude
                },

                drone: {
                    model: formData.droneModel,
                    uin: formData.droneUIN,
                    payload: formData.payloadType
                },

                pilot: {
                    name: formData.pilotName,
                    rpc: formData.rpcNumber,
                    org: formData.pilotOrg
                },

                flight: {
                    date: formData.flightDate,
                    time: formData.flightTime,
                    altitude: formData.altitude
                },

                compliance: {
                    npnt: formData.npntRequired,
                    airspace: formData.airspaceType
                },

                output: {
                    type: formData.outputType,
                    resolution: formData.resolution
                },

                notes: `Job Title: ${formData.jobTitle}
Company: ${formData.companyName}
Referral Source: ${formData.referralSource}
Weather Conditions: ${formData.weatherConditions}
Emergency Plan: ${formData.emergencyPlan}

Additional Info: ${formData.additionalInfo}`
            };

            const response = await fetch(`${API_URL}/bookings/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Booking failed. Please check your data.');
            }

            // Booking succeeded
            setStatus({
                type: 'success',
                message: 'Success! Your booking request has been received. Our team will contact you to finalize the deployment.'
            });
            setSubmitting(false);

        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please check your connection and try again.'
            });
            setSubmitting(false);
        }
    };

    // Dropdown Options
    const inspectionPurposes = ["Thermal Imaging", "Visual Inspection", "Maintenance Audit", "System Performance Analysis", "Fault Detection", "Construction Progress"];
    const airspaceTypes = ["Green (Open)", "Yellow (Controlled)", "Red (Restricted)"];
    const payloadTypes = ["Standard RGB", "Thermal (IR)", "Multispectral", "Lidar", "Combined RGB + Thermal"];
    const outputTypes = ["High-Res Orthomosaic", "Level 1 Thermal Report", "AI Defect Identification (PDF)", "3D Digital Twin", "CAD / DXF Layout"];
    const companyTypes = ["Asset Owner", "EPC Contractor", "O&M Team", "Operation & Management", "Drone Service Provider", "Other"];
    const solarCapacities = ["Less than 1 MW", "1-10 MW", "10-50 MW", "50-100 MW", "100-500 MW", "500+ MW"];
    const referralSources = ["Google Search", "LinkedIn", "Industry Event", "Referral", "Social Media", "Other"];
    const countries = ["United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy", "Australia", "India", "Other"];

    const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 group-focus-within:text-orange-600 transition-colors";

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Header */}
            <section className="pt-24 md:pt-32 pb-20 md:pb-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-400 mb-6 uppercase tracking-widest backdrop-blur-md">
                        <Plane size={14} className="animate-pulse" />
                        Aviation Grade Inspections
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Professional <br /><span className="text-orange-500">Service Booking</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                        Complete our detailed deployment request to schedule your professional solar inspection. We handle aviation compliance and technical execution.
                    </motion.p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 md:py-20 bg-slate-50 relative -mt-16 md:-mt-20 z-20 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {!user ? (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-12 md:p-20 border border-slate-200 shadow-2xl flex flex-col items-center text-center text-slate-950">
                            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-8">
                                <Lock size={40} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Registration Required</h3>
                            <p className="text-lg text-slate-500 mb-10 leading-relaxed">Please log in to your SolarMark account to access the professional booking system and aviation compliance forms.</p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <Link href="/login?returnTo=/booking" className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">Login Now <Send size={20} /></Link>
                                <Link href="/register" className="flex-1 px-8 py-5 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center">Create Account</Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-16 border border-slate-200 shadow-2xl relative text-slate-950">

                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 pb-8 border-b border-slate-100 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Inspection Deployment Form</h2>
                                    <p className="text-slate-500 font-medium">All fields marked with * are required for aviation safety compliance.</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                                    <ShieldCheck size={16} /> Secure Transmission
                                </div>
                            </div>

                            {status.message && (
                                <div className={`mb-10 p-5 rounded-2xl text-center font-bold flex items-center justify-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : status.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {status.type === 'info' && <Loader2 className="animate-spin" size={18} />}
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-12">

                                {/* Section 1: Contact Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-orange-600 mb-6 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><User size={20} /></div>
                                        <h3 className="text-xl text-slate-900 uppercase tracking-wider">Contact Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group"><label className={labelClass}>First Name*</label><input name="firstName" required value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Jane" /></div>
                                        <div className="group"><label className={labelClass}>Last Name*</label><input name="lastName" required value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" /></div>
                                        <div className="group"><label className={labelClass}>Work Email*</label><input name="workEmail" type="email" required value={formData.workEmail} onChange={handleChange} className={inputClass} placeholder="jane@company.com" /></div>
                                        <div className="group"><label className={labelClass}>Phone Number*</label><input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+1 (555) 000-0000" /></div>
                                        <div className="group"><label className={labelClass}>Company Name*</label><input name="companyName" required value={formData.companyName} onChange={handleChange} className={inputClass} placeholder="SolarMark Industries" /></div>
                                        <div className="group">
                                            <label className={labelClass}>Company Role*</label>
                                            <select name="companyType" required value={formData.companyType} onChange={handleChange} className={inputClass}>
                                                <option value="">Select Role</option>
                                                {companyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Project Details */}
                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-orange-600 mb-6 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><FileText size={20} /></div>
                                        <h3 className="text-xl text-slate-900 uppercase tracking-wider">Project Specifications</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group"><label className={labelClass}>Project Name*</label><input name="projectName" required value={formData.projectName} onChange={handleChange} className={inputClass} placeholder="Sahara Site Alpha" /></div>
                                        <div className="group">
                                            <label className={labelClass}>Inspection Purpose*</label>
                                            <select name="inspectionPurpose" required value={formData.inspectionPurpose} onChange={handleChange} className={inputClass}>
                                                <option value="">Select Purpose</option>
                                                {inspectionPurposes.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className={labelClass}>Solar Capacity*</label>
                                            <select name="solarCapacity" required value={formData.solarCapacity} onChange={handleChange} className={inputClass}>
                                                <option value="">Select Capacity</option>
                                                {solarCapacities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="group"><label className={labelClass}>Area Size (Acres/MW)*</label><input name="areaSize" required value={formData.areaSize} onChange={handleChange} className={inputClass} placeholder="e.g. 50 Acres" /></div>
                                    </div>
                                </div>

                                {/* Section 3: Site Location */}
                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-orange-600 mb-6 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><MapPin size={20} /></div>
                                        <h3 className="text-xl text-slate-900 uppercase tracking-wider">Site Location & Geodata</h3>
                                    </div>
                                    <div className="group"><label className={labelClass}>Street Address / Access Points*</label><input name="siteAddress" required value={formData.siteAddress} onChange={handleChange} className={inputClass} placeholder="Entry point coordinates or physical address" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="group"><label className={labelClass}>Latitude*</label><input name="latitude" required value={formData.latitude} onChange={handleChange} className={inputClass} placeholder="28.7041" /></div>
                                        <div className="group"><label className={labelClass}>Longitude*</label><input name="longitude" required value={formData.longitude} onChange={handleChange} className={inputClass} placeholder="77.1025" /></div>
                                        <div className="group">
                                            <label className={labelClass}>Airspace Classification*</label>
                                            <select name="airspaceType" required value={formData.airspaceType} onChange={handleChange} className={inputClass}>
                                                <option value="">Select Class</option>
                                                {airspaceTypes.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Schedule */}
                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-orange-600 mb-6 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Calendar size={20} /></div>
                                        <h3 className="text-xl text-slate-900 uppercase tracking-wider">Flight Window</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="group"><label className={labelClass}>Preferred Date*</label><input name="flightDate" type="date" required value={formData.flightDate} onChange={handleChange} className={inputClass} /></div>
                                        <div className="group"><label className={labelClass}>Takeoff Time*</label><input name="flightTime" type="time" required value={formData.flightTime} onChange={handleChange} className={inputClass} /></div>
                                        <div className="group"><label className={labelClass}>Max Altitude (AGL)*</label><input name="altitude" required value={formData.altitude} onChange={handleChange} className={inputClass} placeholder="e.g. 120m" /></div>
                                    </div>
                                </div>

                                {/* Section 6: Outputs */}
                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-orange-600 mb-6 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Activity size={20} /></div>
                                        <h3 className="text-xl text-slate-900 uppercase tracking-wider">Deliverables & Analytics</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className={labelClass}>Primary Output Type*</label>
                                            <select name="outputType" required value={formData.outputType} onChange={handleChange} className={inputClass}>
                                                <option value="">Select Output</option>
                                                {outputTypes.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="group"><label className={labelClass}>GSD / Resolution Requirements</label><input name="resolution" value={formData.resolution} onChange={handleChange} className={inputClass} placeholder="e.g. 1cm/px" /></div>
                                    </div>
                                    <div className="group px-1 pt-4"><label className={labelClass}>Special Instructions / Site Hazards</label><textarea name="additionalInfo" rows="4" value={formData.additionalInfo} onChange={handleChange} className={inputClass + " resize-none"} placeholder="Add details about site obstacles, birds, or specific anomalies you are tracking..."></textarea></div>
                                </div>

                                {/* Final Submit */}
                                <div className="pt-8 border-t border-slate-100">
                                    <button type="submit" disabled={submitting} className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-950/20 hover:bg-orange-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-4 disabled:opacity-50 uppercase tracking-[0.2em]">
                                        {submitting ? <><Loader2 className="animate-spin" /> Processing...</> : <><Send size={24} /> Submit Deployment Request</>}
                                    </button>
                                    <p className="text-center text-slate-400 text-sm mt-6 font-medium italic">By submitting, you confirm that all aviation registration data provided is accurate according to local CAA/FAA regulations.</p>
                                </div>

                            </form>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
