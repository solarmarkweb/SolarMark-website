"use client";

import React, { useState, useEffect } from "react";
import { Send, Loader2, Star, CheckCircle, ShieldCheck, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";


export default function BookingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);

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
                setFormData(parsedData);
                localStorage.removeItem("pending_booking"); // Clear it so it doesn't persist forever

                // Show a helpful tip
                setStatus({
                    type: 'info',
                    message: 'Welcome back! Your booking details have been restored. You can now submit your request.'
                });
            } catch (e) {
                console.error("Error parsing pending booking data", e);
            }
        }

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const [formData, setFormData] = useState({
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
        additionalInfo: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        const token = localStorage.getItem("auth_token");

        if (!token) {
            // Save form data to local storage
            localStorage.setItem("pending_booking", JSON.stringify(formData));
            // Redirect to login with return parameter
            router.push("/login?returnTo=/booking");
            return;
        }

        try {
            // Combine first and last name for the API
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.workEmail,
                contact_phone: formData.phone,
                location: formData.country,
                service_type: formData.companyType,
                system_size: formData.solarCapacity,
                notes: `Job Title: ${formData.jobTitle}\nCompany: ${formData.companyName}\nReferral Source: ${formData.referralSource}\n\nAdditional Info: ${formData.additionalInfo}`,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour12: false })
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
                throw new Error(errorData.detail || 'Failed to submit booking');
            }

            const data = await response.json();
            console.log("Booking successful:", data);

            setStatus({
                type: 'success',
                message: 'Thank you! Your request has been received. Someone from our team will be in touch with you shortly.'
            });
            // Reset form
            setFormData({
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
                additionalInfo: ""
            });

            // Trigger Subscription after successful booking
            // Your actual Plan ID from Razorpay Dashboard
            const PLAN_ID = "plan_SW8QqyydKfxjra";
            await handleSubscription(PLAN_ID);

        } catch (error) {
            console.error("Error submitting booking:", error);
            setStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again later.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubscription = async (planId) => {
        try {
            setStatus({ type: 'info', message: 'Initiating secure subscription...' });

            // 1. Create Subscription on Backend
            const subRes = await authAPI.createSubscription(planId);
            const subscription = subRes.data;

            // 2. Open Razorpay Checkout for Subscription
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SMd37A0ZIau7vE",
                subscription_id: subscription.id,
                name: "SolarMark Subscription",
                description: "Monthly Inspection Plan",
                image: "https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=200",
                handler: async (response) => {
                    // 3. Verify Subscription on Backend
                    try {
                        setSubmitting(true);
                        const verifyRes = await authAPI.verifySubscription({
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.data.status === "success") {
                            setStatus({
                                type: 'success',
                                message: 'Subscription successful! Your account is now active.'
                            });
                        }
                    } catch (err) {
                        setStatus({ type: 'error', message: 'Subscription verification failed. Please contact support.' });
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.workEmail,
                    contact: formData.phone,
                },
                theme: { color: "#f97316" },
                modal: {
                    ondismiss: function () {
                        setStatus({ type: 'info', message: 'Subscription step skipped. Some features may be locked.' });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Subscription initiation failed:", error);
            setStatus({ type: 'error', message: 'Could not initiate subscription. Request received, but payment failed.' });
        }
    };

    const companyTypes = [
        "Asset Owner",
        "EPC Contractor",
        "O&M Team",
        "Drone Service Provider",
        "Developer",
        "Other"
    ];

    const solarCapacities = [
        "Less than 1 MW",
        "1-10 MW",
        "10-50 MW",
        "50-100 MW",
        "100-500 MW",
        "500+ MW"
    ];

    const referralSources = [
        "Google Search",
        "LinkedIn",
        "Industry Event",
        "Referral",
        "Social Media",
        "Other"
    ];

    const countries = [
        "United States",
        "Canada",
        "United Kingdom",
        "Germany",
        "France",
        "Spain",
        "Italy",
        "Australia",
        "India",
        "Other"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <section className="pt-24 md:pt-32 pb-20 md:pb-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-400 mb-6 uppercase tracking-widest backdrop-blur-md"
                    >
                        <Zap size={12} className="fill-orange-400" />
                        Priority Access
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight leading-[1.1]"
                    >
                        Schedule Your <br /><span className="text-orange-500">Inspection Today</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto px-4 md:px-0"
                    >
                        Join the hundreds of asset owners maximizing their yield with our AI-powered inspection platform.
                    </motion.p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 md:py-20 bg-slate-50 relative -mt-16 md:-mt-20 z-20 rounded-t-[2.5rem] md:rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 md:p-16 border border-slate-200 shadow-2xl shadow-slate-200/50">

                            <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900">Project Details</h3>
                                    <p className="text-slate-500 text-xs md:text-sm mt-1">Tell us about your needs</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheck size={14} />
                                    Secure SSL Form
                                </div>
                            </div>

                            {status.message && (
                                <div className={`mb-10 p-6 rounded-xl text-center shadow-sm ${status.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : status.type === 'info'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <p className="font-bold text-sm tracking-tight flex items-center justify-center gap-2">
                                        {status.type === 'success' && <CheckCircle size={18} />}
                                        {status.message}
                                    </p>
                                </div>
                            )}

                            {!user ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 md:py-20 px-4 md:px-8 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-100 flex flex-col items-center max-w-2xl mx-auto"
                                >
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-orange-100/50 rounded-2xl md:rounded-3xl flex items-center justify-center text-orange-600 mb-6 md:mb-8 relative">
                                        <div className="absolute inset-0 bg-orange-500/20 blur-xl md:blur-2xl rounded-full"></div>
                                        <Lock size={32} className="md:w-12 md:h-12 relative z-10" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">Login Required</h3>
                                    <p className="text-base md:text-lg text-slate-500 font-medium mb-8 md:mb-12 leading-relaxed">
                                        To ensure high-quality service and proper tracking of your reports, <br className="hidden md:block" />
                                        please <span className="text-orange-600 font-bold underline">sign in</span> or <span className="text-orange-600 font-bold underline">create an account</span> to book an inspection.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                                        <Link
                                            href="/login?returnTo=/booking"
                                            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                                        >
                                            Sign In Now
                                            <Send size={18} />
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="w-full sm:w-auto px-10 py-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl font-bold text-lg hover:bg-orange-100 transition-all flex items-center justify-center"
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* First Name & Last Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                First Name*
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                placeholder="Jane"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                Last Name*
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Work Email & Job Title */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                Work Email*
                                            </label>
                                            <input
                                                type="email"
                                                name="workEmail"
                                                required
                                                placeholder="jane@company.com"
                                                value={formData.workEmail}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                Job Title*
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                required
                                                placeholder="Operations Manager"
                                                value={formData.jobTitle}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number & Country */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                Phone Number*
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                                Country*
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="country"
                                                    required
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                                                >
                                                    <option value="">Please Select</option>
                                                    {countries.map((country) => (
                                                        <option key={country} value={country}>{country}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Name */}
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                            Company Name*
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            placeholder="SolarMark Industries"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                        />
                                    </div>

                                    {/* Company Type */}
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                            Which of the following best describes your company?*
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="companyType"
                                                required
                                                value={formData.companyType}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                                            >
                                                <option value="">Please Select</option>
                                                {companyTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solar Capacity */}
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                            How much solar do you have today and/or in your pipeline?*
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="solarCapacity"
                                                required
                                                value={formData.solarCapacity}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                                            >
                                                <option value="">Please Select</option>
                                                {solarCapacities.map((capacity) => (
                                                    <option key={capacity} value={capacity}>{capacity}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Referral Source */}
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                            Where did you last hear about us?*
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="referralSource"
                                                required
                                                value={formData.referralSource}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                                            >
                                                <option value="">Please Select</option>
                                                {referralSources.map((source) => (
                                                    <option key={source} value={source}>{source}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                                            Additional Information you want to share with us
                                        </label>
                                        <textarea
                                            name="additionalInfo"
                                            rows="5"
                                            placeholder=""
                                            value={formData.additionalInfo}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                                        ></textarea>
                                    </div>

                                    <div className="pt-6">
                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-5 bg-orange-600 text-white rounded-xl font-bold text-xl shadow-2xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="animate-spin w-6 h-6" />
                                                    Processing Request...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Request
                                                    <Send size={24} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Privacy Note */}
                            <p className="text-xs text-slate-400 text-center mt-8 font-medium">
                                By submitting this form, you agree to our{" "}
                                <Link href="/privacy" className="text-orange-600 hover:underline font-bold">Privacy Policy</Link>
                                {" "}and{" "}
                                <Link href="/terms" className="text-orange-600 hover:underline font-bold">Terms of Service</Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
