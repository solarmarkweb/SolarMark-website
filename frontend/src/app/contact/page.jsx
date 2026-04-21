"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ContactPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        message: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${API_URL}/contacts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send message');
            }

            setStatus({
                type: 'success',
                message: 'Thank you! Your message has been sent successfully. We will get back to you soon.'
            });

            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                message: ""
            });

        } catch (error) {
            console.error("Error sending message:", error);
            setStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again later.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pt-32 pb-20 bg-white min-h-screen">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="fixed top-20 md:top-24 left-4 md:left-6 z-[100] flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 text-slate-700 hover:text-orange-600 hover:border-orange-200 transition-all text-xs md:sm font-bold group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight uppercase"
                    >
                        Get in <span className="text-orange-600">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        Have questions about our technology? Our team is here to help you audit your solar infrastructure.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {[
                            {
                                icon: <Mail className="text-orange-600" />,
                                title: "Email Us",
                                detail: "support@solarmark.in",
                                sub: "Response within 24 hours"
                            },
                            {
                                icon: <Phone className="text-orange-600" />,
                                title: "Call Us",
                                detail: "+91 9150739434",
                                sub: "Mon-Fri, 9am - 6pm EST"
                            },
                            {
                                icon: <MapPin className="text-orange-600" />,
                                title: "Our Office",
                                detail: "Manickampalayam, Tiruchengode, Tamil Nadu, 637202",
                                sub: "India"
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start space-x-5 p-8 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300">
                                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1 tracking-tight">{item.title}</h3>
                                    <p className="text-slate-800 font-bold">{item.detail}</p>
                                    <p className="text-slate-500 text-sm font-medium">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {status.message && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`p-6 rounded-xl flex items-center gap-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}
                                    >
                                        {status.type === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
                                        <p className="font-bold text-sm tracking-tight">{status.message}</p>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-800 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            required
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-slate-50/50 font-medium"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-800 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            required
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-slate-50/50 font-medium"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-800 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-slate-50/50 font-medium"
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-800 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none bg-slate-50/50 font-medium"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-orange-600 text-white rounded-xl font-bold text-xl shadow-xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <Send size={24} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
