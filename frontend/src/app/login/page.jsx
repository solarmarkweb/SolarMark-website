"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Sun, Mail, Lock, ArrowRight, Github, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import api from "@/lib/axios";

import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/login", formData);

            if (response.data.access_token) {
                localStorage.setItem("auth_token", response.data.access_token);
                localStorage.setItem("refresh_token", response.data.refresh_token);
                localStorage.setItem("user_name", response.data.user.first_name);
                localStorage.setItem("user_email", formData.email);
                localStorage.setItem("user_role", response.data.user.role);

                setLoggedIn(true);
                setTimeout(() => {
                    const destination = returnTo || "/profile";
                    router.push(destination);
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pt-20 md:pt-0">
            {/* Left Side - Visual */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-900">
                <img
                    src="/solar_panel_inspection.png"
                    alt="Solar Panel Inspection"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-slate-900/60"></div>

                <div className="relative z-10 text-white max-w-md">
                    <div className="mb-8 inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full backdrop-blur-md">
                        <CheckCircle2 size={16} className="text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-200">Trusted Inspection Platform</span>
                    </div>
                    <h2 className="text-5xl font-bold mb-8 leading-tight tracking-tight">Expert Solar Inspection Services.</h2>
                    <p className="text-orange-50/90 text-xl font-medium mb-8">Access your dashboard to monitor your solar assets and track your inspection reports in real-time.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-20">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center mb-8">
                            <img
                                src="/solar_mark_logo.svg"
                                alt="SolarMark Logo"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in to your account</h1>
                        <p className="text-slate-500 mt-2 font-medium">Professional solar management at your fingertips</p>
                    </div>

                    {loggedIn ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-8 rounded-3xl text-center shadow-sm">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="text-emerald-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Welcome Back!</h3>
                            <p className="text-sm font-medium">Signing you in...</p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-800 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-slate-800">Password</label>
                                    <Link href="#" className="text-xs font-bold text-orange-600 hover:text-orange-700">Forgot password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        required
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                        placeholder="••••••••"
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 mt-4 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <span>Continue</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                        </form>
                    )}

                    <p className="text-center mt-12 text-slate-600 font-medium">
                        Don't have an account? <Link href="/register" className="text-orange-600 font-bold hover:underline">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
