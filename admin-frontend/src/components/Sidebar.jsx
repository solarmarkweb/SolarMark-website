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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-50 border-r border-slate-800 shadow-2xl">
            {/* Brand Section */}
            <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                        <Sun className="text-white fill-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">
                            Solar<span className="text-orange-500">Admin</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            Control Panel v2.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Main Menu
                </p>

                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-orange-600/10 text-orange-500 shadow-sm border border-orange-500/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`${isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-semibold tracking-tight">{item.title}</span>
                            </div>
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            )}
                        </Link>
                    );
                })}

                <div className="mt-12">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Preferences
                    </p>
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-300 group text-slate-400">
                        <Settings size={20} className="text-slate-500 group-hover:text-amber-400" />
                        <span className="text-sm font-semibold tracking-tight">Settings</span>
                    </button>
                </div>
            </nav>

            {/* User Support / Footer */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                <div className="px-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                        <Shield size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Admin Access</p>
                        <p className="text-[10px] text-slate-500 font-medium">Verified Identity</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}
                    className="w-full mt-4 flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group text-slate-400 font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    Exit System
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;