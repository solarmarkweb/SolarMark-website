"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Sun, Menu, X, LogOut, User as UserIcon, ChevronDown,
    Thermometer, ClipboardList, Database, TrendingUp, CheckCircle,
    Zap, Globe, Eye, Brain, FileText, Settings, Activity, Wrench, Target,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Some pages might not have a dark hero, we should check
    const isDarkHeroPage = ["/solutions/operation/thermography", "/solutions/operation/work-management", "/solutions/operation/asset-management", "/solutions/construction/progress-tracking", "/solutions/construction/quality-control", "/solutions/construction/commissioning", "/solutions/planning/site-assessment", "/platform/drones", "/platform/ai-analytics", "/platform/forms", "/platform/integrations"].includes(pathname);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const token = localStorage.getItem("auth_token");
        setIsLoggedIn(!!token);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");
        setIsLoggedIn(false);
        router.push("/login");
    };

/*
    const solutionsMenu = [
        {
            phase: "Operation Phase",
            items: [
                { name: "Thermography", href: "/solutions/operation/thermography" },
                { name: "Work Management", href: "/solutions/operation/work-management" },
                { name: "Asset Management", href: "/solutions/operation/asset-management" },
            ]
        },
        {
            phase: "Construction Phase",
            items: [
                { name: "Progress Tracking", href: "/solutions/construction/progress-tracking" },
                { name: "Quality Control", href: "/solutions/construction/quality-control" },
                { name: "Commissioning", href: "/solutions/construction/commissioning" },
            ]
        },
        {
            phase: "Planning Phase",
            items: [
                { name: "Site Assessment", href: "/solutions/planning/site-assessment" },
            ]
        },
    ];

    const platformMenu = [
        { name: "Drones & Robotics", href: "/platform/drones" },
        { name: "AI & Analytics", href: "/platform/ai-analytics" },
        { name: "Forms & Ticketing", href: "/platform/forms" },
        { name: "Integrations", href: "/platform/integrations" },
    ];
*/

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    // Style logic
    const navBg = isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/20 py-2"
        : isDarkHeroPage ? "bg-transparent py-4" : "bg-white/80 backdrop-blur-md py-4";

    const textColor = (isScrolled || !isDarkHeroPage) ? "text-slate-600" : "text-white/80";
    const activeTextColor = (isScrolled || !isDarkHeroPage) ? "text-orange-600" : "text-white";
    const logoTextColor = (isScrolled || !isDarkHeroPage) ? "text-slate-900" : "text-white";
    const hoverTextColor = (isScrolled || !isDarkHeroPage) ? "hover:text-orange-600" : "hover:text-white";

    if (pathname.startsWith("/profile")) return null;

    return (
        <nav className={`fixed w-full top-0 z-50 border-b border-slate-100 transition-all duration-300 ${navBg}`}>
            <div className="max-w-full px-6 md:px-12">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo - Top Left Corner */}
                    <div className="flex items-center">
                        <Link href={isLoggedIn ? "/profile" : "/"} className="flex items-center group">
                            <img
                                src="/solar_mark_logo.svg"
                                alt="SolarMark Logo"
                                className={`h-10 w-auto transition-all duration-300 ${(isScrolled || !isDarkHeroPage) ? "" : "brightness-0 invert"}`}
                            />
                        </Link>
                    </div>



                    {/* Desktop Navigation & Actions - Far Right */}
                    <div className="hidden lg:flex items-center justify-end">
                        {!isLoggedIn && (
                            <>
                                <div className="flex items-center gap-1">
                                    {[
                                        { name: "Home", href: "/" },
                                        { name: "Bookings", href: "/booking" },
                                        { name: "Contact", href: "/contact" },
                                    ].map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg ${pathname === link.href ? "text-orange-600 bg-orange-50/50" : "text-slate-600 hover:text-orange-600 hover:bg-slate-50/50"}`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="h-6 w-[1px] bg-slate-200 mx-4"></div>
                            </>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50"
                                >
                                    <UserIcon size={16} />
                                    <span className="text-sm font-bold">Your Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/register"
                                    className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-8 py-3 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-slate-200/50"
                                >
                                    Log In
                                </Link>
                            </div>
                        )}
                    </div>


                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden p-2 transition-all duration-500 ${(isScrolled || !isDarkHeroPage) ? "text-slate-700 hover:text-orange-600" : "text-white hover:text-orange-400"}`}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu - Professional Deep Drawer */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="lg:hidden mt-4 pb-8 border border-slate-100 p-8 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl absolute top-full left-4 right-4 text-slate-900 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="space-y-2">
                                {(isLoggedIn
                                    ? [{ name: "Profile", href: "/profile" }]
                                    : [
                                        { name: "Home", href: "/" },
                                        { name: "Bookings", href: "/booking" },
                                        { name: "Contact", href: "/contact" }
                                    ]
                                ).map((link) => (
                                    <Link 
                                        key={link.name}
                                        href={link.href} 
                                        className="block px-6 py-4 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-all" 
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                                {isLoggedIn ? (
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full py-5 text-center text-red-500 text-sm font-bold">Logout</button>
                                ) : (
                                    <>
                                        <Link href="/register" className="block w-full py-5 text-center text-slate-400 text-sm font-bold" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                                        <Link href="/login" className="block w-full py-5 text-center bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
