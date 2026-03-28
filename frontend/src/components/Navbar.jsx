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
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
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

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <img
                            src="/solar_mark_logo.svg"
                            alt="SolarMark Logo"
                            className={`h-7 w-auto transition-all duration-300 ${(isScrolled || !isDarkHeroPage) ? "" : "brightness-0 invert"}`}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link
                            href="/"
                            className={`px-3 py-2 text-xs font-bold transition-all duration-300 ${pathname === "/" ? "text-orange-600" : `${textColor} ${hoverTextColor}`}`}
                        >
                            Home
                        </Link>

                        {/*  
                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setOpenDropdown('solutions')}
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            <button
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-300 ${openDropdown === 'solutions' ? 'text-orange-600' : `${textColor} ${hoverTextColor}`}`}
                            >
                                Solutions
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                            </button>

                            <div
                                className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 w-[720px] transition-all duration-500 z-50 ${openDropdown === 'solutions' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}
                            >
                                <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-10">
                                    <div className="grid grid-cols-3 gap-12 text-left">
                                        {solutionsMenu.map((phase) => (
                                            <div key={phase.phase}>
                                                <div className="text-base font-extrabold text-slate-900 mb-6 border-b border-slate-50 pb-2">
                                                    {phase.phase}
                                                </div>
                                                <div className="space-y-4">
                                                    {phase.items.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="block text-base font-medium text-slate-600 hover:text-orange-600 transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setOpenDropdown('platform')}
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            <button
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-300 ${openDropdown === 'platform' ? 'text-orange-600' : `${textColor} ${hoverTextColor}`}`}
                            >
                                Platform
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === 'platform' ? 'rotate-180' : ''}`} />
                            </button>

                            <div
                                className={`absolute top-full left-0 mt-0 pt-2 w-64 transition-all duration-500 z-50 ${openDropdown === 'platform' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}
                            >
                                <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-6 text-left">
                                    <div className="space-y-4">
                                        {platformMenu.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block text-base font-medium text-slate-600 hover:text-orange-600 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        */}

                        <Link href="/about" className={`px-3 py-2 text-xs font-bold transition-all duration-300 ${pathname === "/about" ? "text-orange-600" : `${textColor} ${hoverTextColor}`}`}>About</Link>
                        <Link href="/offers" className={`px-3 py-2 text-xs font-bold transition-all duration-300 ${pathname === "/offers" ? "text-orange-600" : `${textColor} ${hoverTextColor}`}`}>Offers</Link>
                        <Link href="/booking" className={`px-3 py-2 text-xs font-bold transition-all duration-300 ${pathname === "/booking" ? "text-orange-600" : `${textColor} ${hoverTextColor}`}`}>Bookings</Link>
                        <Link href="/contact" className={`px-3 py-2 text-xs font-bold transition-all duration-300 ${pathname === "/contact" ? "text-orange-600" : `${textColor} ${hoverTextColor}`}`}>Contact</Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/profile"
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${(isScrolled || !isDarkHeroPage) ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white/10 text-white hover:bg-white/20"}`}
                                >
                                    <UserIcon size={20} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${(isScrolled || !isDarkHeroPage) ? "text-slate-600 hover:text-red-600" : "text-white/80 hover:text-red-400"}`}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={`text-xs font-bold transition-colors ${(isScrolled || !isDarkHeroPage) ? "text-slate-600 hover:text-orange-600" : "text-white hover:text-orange-400"}`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 shadow-xl ${(isScrolled || !isDarkHeroPage) ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200" : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/20"}`}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden p-2 transition-colors ${(isScrolled || !isDarkHeroPage) ? "text-slate-700 hover:text-orange-600" : "text-white hover:text-orange-400"}`}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden mt-6 pb-8 border-t border-slate-100 pt-6 space-y-2 bg-white rounded-3xl p-6 shadow-2xl absolute top-full left-4 right-4 text-slate-900 max-h-[80vh] overflow-y-auto">
                        <Link href="/" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl" onClick={() => setIsMenuOpen(false)}>Home</Link>

                        {/*  
                        <button
                            onClick={() => toggleDropdown('solutions-mobile')}
                            className="flex items-center justify-between w-full px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl"
                        >
                            Solutions
                            <ChevronDown size={18} className={`transition-transform duration-300 ${openDropdown === 'solutions-mobile' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'solutions-mobile' && (
                            <div className="pl-6 space-y-4 py-2 border-l-2 border-orange-100 ml-4 mt-1">
                                {solutionsMenu.map((phase) => (
                                    <div key={phase.phase}>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{phase.phase}</div>
                                        <div className="space-y-3">
                                            {phase.items.map((item) => (
                                                <Link key={item.name} href={item.href} className="block text-sm font-bold text-slate-600 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>{item.name}</Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => toggleDropdown('platform-mobile')}
                            className="flex items-center justify-between w-full px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl"
                        >
                            Platform
                            <ChevronDown size={18} className={`transition-transform duration-300 ${openDropdown === 'platform-mobile' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'platform-mobile' && (
                            <div className="pl-6 py-2 border-l-2 border-orange-100 ml-4 mt-1 space-y-3">
                                {platformMenu.map((item) => (
                                    <Link key={item.name} href={item.href} className="block text-sm font-bold text-slate-600 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>{item.name}</Link>
                                ))}
                            </div>
                        )}
                        */}

                        <Link href="/about" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <Link href="/booking" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl" onClick={() => setIsMenuOpen(false)}>Bookings</Link>
                        <Link href="/contact" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl" onClick={() => setIsMenuOpen(false)}>Contact</Link>

                        <div className="mt-8 px-4 space-y-3 border-t border-slate-50 pt-6">
                            {isLoggedIn ? (
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full py-4 text-center text-red-600 font-bold">Logout</button>
                            ) : (
                                <Link href="/login" className="block w-full py-4 text-center bg-slate-900 text-white rounded-xl font-bold transition-all" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
