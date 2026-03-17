'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Shield,
    Sun,
    Link as LinkIcon
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/dashboard',
        },
        {
            title: 'Drive Links',
            icon: <LinkIcon size={20} />,
            path: '/drivelinks',
        },
        {
            title: 'Bookings',
            icon: <Calendar size={20} />,
            path: '/booking',
        },
        {
            title: 'Contacts',
            icon: <MessageSquare size={20} />,
            path: '/contacts',
        },
        {
            title: 'User Management',
            icon: <Users size={20} />,
            path: '/users',
        },
        {
            title: 'Legal Documents',
            icon: <Shield size={20} />,
            path: '/legal',
        },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-slate-600 flex flex-col z-50 border-r border-slate-100 shadow-xl">
            {/* Brand Section */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <img 
                      src="/solar_mark_logo.svg" 
                      alt="SolarMark Logo" 
                      className="h-12 w-auto"
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Control Panel v2.0
                    </p>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Main Menu
                </p>

                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100'
                                : 'hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-semibold tracking-tight">{item.title}</span>
                            </div>
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                        </Link>
                    );
                })}

               
            </nav>

            {/* User Support / Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
               

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}
                    className="w-full mt-4 flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group text-slate-500 font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    Exit System
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;