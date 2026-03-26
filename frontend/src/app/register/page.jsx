"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sun, Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        otp: "",
    });
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSendOTP = async () => {
        if (!formData.email || !formData.first_name || !formData.password) {
            setError("Please fill in all details first.");
            return;
        }
        setOtpLoading(true);
        setError("");
        try {
            await api.post("/otp/request", { email: formData.email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send verification code");
        } finally {
            setOtpLoading(false);
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setError("");

    //     try {
    //        const response = await api.post("/register", formData);


    //         if (response.data.access_token) {
    //             localStorage.setItem("auth_token", response.data.access_token);
    //             localStorage.setItem("refresh_token", response.data.refresh_token);
    //             localStorage.setItem("user_name", response.data.user.first_name);
    //             localStorage.setItem("user_email", formData.email);
    //             setSuccess(true);
    //             setTimeout(() => {
    //                 router.push("/profile");
    //             }, 1500);
    //         }
    //     } catch (err) {
    //         console.error("Registration error:", err);
    //         setError(err.response?.data?.detail ||
    //             err.response?.data?.error ||
    //             "Something went wrong. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Verify OTP first
            await api.post("/otp/verify", { email: formData.email, otp: formData.otp });

            // 2. If verified, proceed to register
            const response = await api.post("/register", formData);

            if (response.data.access_token) {
                localStorage.setItem("auth_token", response.data.access_token);
                localStorage.setItem("refresh_token", response.data.refresh_token);
                localStorage.setItem("user_name", response.data.user.first_name);
                localStorage.setItem("user_email", formData.email);

                setSuccess(true);
                setTimeout(() => router.push("/profile"), 1500);
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pt-20 md:pt-0">
            {/* Left Side - Visual with Puzzle Animation */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-900 group">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-1 p-2 opacity-90">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-sm transition-all duration-1000 ease-out shadow-2xl border border-white/5"
                            style={{
                                backgroundImage: "url('/solar_thermal_scan.png')",
                                backgroundSize: "300% 400%",
                                backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 33.33}%`,
                                transform: `translate(${(Math.random() - 0.5) * 200}%, ${(Math.random() - 0.5) * 200}%) rotate(${Math.random() * 90}deg)`,
                                animation: `puzzleIn 1.5s forwards ${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>

                <style jsx>{`
                    @keyframes puzzleIn {
                        to {
                            transform: translate(0, 0) rotate(0);
                        }
                    }
                `}</style>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/60 z-0"></div>
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
                        <p className="text-slate-500 mt-2 font-medium">Join the revolution of professional solar auditing</p>
                    </div>

                    {success ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-8 rounded-3xl text-center shadow-sm">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="text-emerald-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
                            <p className="text-sm font-medium">Redirecting you to dashboard...</p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={step === 1 ? (e) => { e.preventDefault(); handleSendOTP(); } : handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-800 ml-1">First Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                                <input
                                                    required
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                                    placeholder="John"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-800 ml-1">Last Name</label>
                                            <input
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                type="text"
                                                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-800 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                            <input
                                                required
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                type="email"
                                                className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-800 ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                            <input
                                                required
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                type={showPassword ? "text" : "password"}
                                                className="w-full pl-11 pr-12 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium"
                                                placeholder="••••••••"
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 py-2">
                                        <input required type="checkbox" className="mt-1 w-5 h-5 text-orange-600 border-slate-300 rounded-md focus:ring-orange-500 cursor-pointer" />
                                        <span className="text-xs text-slate-500 leading-relaxed font-medium">
                                            I agree to the <Link href="#" className="underline font-bold hover:text-orange-600">Terms of Service</Link> and <Link href="#" className="underline font-bold hover:text-orange-600">Privacy Policy</Link>.
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpLoading}
                                        className="w-full py-5 bg-orange-600 text-white rounded-xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all group mt-2 flex items-center justify-center gap-2"
                                    >
                                        {otpLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                <span>Send Verification Code</span>
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-orange-50 p-4 rounded-xl mb-4">
                                        <p className="text-sm text-orange-800 font-medium">
                                            A verification code has been sent to <strong>{formData.email}</strong>. Please enter it below to complete your registration.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-800 ml-1">Verification Code</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                            <input
                                                required
                                                name="otp"
                                                value={formData.otp}
                                                onChange={handleChange}
                                                type="text"
                                                className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm font-medium tracking-[0.5em] text-center text-xl"
                                                placeholder="123456"
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 bg-orange-600 text-white rounded-xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all group flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    <span>Complete Registration</span>
                                                    <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-sm font-bold text-slate-500 hover:text-slate-800 py-2 transition-colors"
                                        >
                                            Change Details
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}

                    <p className="text-center mt-12 text-slate-600 font-medium">
                        Already have an account? <Link href="/login" className="text-orange-600 font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
