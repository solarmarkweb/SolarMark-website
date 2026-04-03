"use client";

import React from "react";
import Link from "next/link";
import {
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Mail
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [dynamicSocialLinks, setDynamicSocialLinks] = React.useState([]);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

    React.useEffect(() => {
        const fetchSocial = async () => {
            try {
                const res = await fetch(`${API_URL}/footer-social/`);
                const data = await res.json();
                setDynamicSocialLinks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching footer social:", err);
                setDynamicSocialLinks([]);
            }
        };
        fetchSocial();
    }, [API_URL]);

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('facebook')) return <Facebook size={18} />;
        if (p.includes('twitter')) return <Twitter size={18} />;
        if (p.includes('linkedin')) return <Linkedin size={18} />;
        if (p.includes('instagram')) return <Instagram size={18} />;
        return <Mail size={18} />;
    };

    const footerSections = {
        "Company": [
            { name: "Home", href: "/" },
            { name: "Bookings", href: "/booking" },
            { name: "Contact", href: "/contact" },
        ],
        "Legal": [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
        ],
    };

    return (
        <footer className="bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center mb-4">
                            <img
                                src="/solar_mark_logo.svg"
                                alt="SolarMark Logo"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-slate-600 mb-6 max-w-xs text-balance">
                            Maximize performance across the solar lifecycle with AI-powered insights and automated tracking.
                        </p>
                        <div className="flex gap-3">
                            {Array.isArray(dynamicSocialLinks) && dynamicSocialLinks.map((social, index) => (
                                <a
                                    key={social.id || index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                                    aria-label={social.platform}
                                >
                                    {social.icon_url ? (
                                        <img 
                                            src={`${API_URL.replace('/api', '')}${social.icon_url}`} 
                                            alt="" 
                                            className="w-5 h-5 object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        getIcon(social.platform)
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {Object.entries(footerSections).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-600 hover:text-orange-600 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-600">
                            © {currentYear} SolarMark. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
