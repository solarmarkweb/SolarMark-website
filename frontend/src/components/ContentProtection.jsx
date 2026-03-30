'use client';

import React, { useEffect, useState } from 'react';
import { Shield, EyeOff, AlertTriangle, MonitorOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ContentProtection = ({ children, isProtected = true }) => {
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        if (!isProtected) return;

        const blackout = () => setIsBlurred(true);
        const restore = () => setIsBlurred(false);

        // 1. Human Interaction Blocks (Right-click, Copy, Selection, etc.)
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('contextmenu', handleContextMenu);

        const preventDefault = (e) => e.preventDefault();
        document.addEventListener('copy', preventDefault);
        document.addEventListener('cut', preventDefault);
        document.addEventListener('selectstart', preventDefault);
        document.addEventListener('dragstart', preventDefault);

        // 2. Keyboard Control (Inspect, Source, Print, Save shortcuts)
        const handleKeyDownSecurity = (e) => {
            // Disable Ctrl+Shift+I, J, C (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                blackout();
            }
            // Disable Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                blackout();
            }
            // F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                blackout();
            }
            
            // 3. Snapshot Triggers (PrintScreen / Win / Meta / OS Keys)
            if (e.key === 'PrintScreen' || e.keyCode === 44 || e.key === 'Snapshot' || 
                e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92) {
                blackout();
            }
        };

        // 4. Specific Snapshot Intent Detection
        document.addEventListener('keydown', handleKeyDownSecurity);
        window.addEventListener('focus', restore);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', preventDefault);
            document.removeEventListener('cut', preventDefault);
            document.removeEventListener('selectstart', preventDefault);
            document.removeEventListener('dragstart', preventDefault);
            document.removeEventListener('keydown', handleKeyDownSecurity);
            window.removeEventListener('focus', restore);
        };
    }, [isProtected]);

    if (!isProtected) return <>{children}</>;

    return (
        <div className="relative overflow-hidden w-full h-full">
            {/* Main Data Layer */}
            <div className={`transition-none ${isBlurred ? 'opacity-0 invisible h-0 overflow-hidden' : 'opacity-100 visible'}`}>
                {/* Dynamic Security Watermarks */}
                <div className="absolute inset-0 pointer-events-none z-[60] opacity-[0.03] select-none flex flex-wrap gap-24 items-center justify-center rotate-[-25deg] overflow-hidden">
                    {Array(40).fill(`AUTHORITY ACCESS ONLY`).map((text, i) => (
                        <span key={i} className="text-3xl font-black whitespace-nowrap tracking-tighter uppercase">{text}</span>
                    ))}
                </div>
                {children}
            </div>

            {/* Pure Black Security Barrier */}
            {isBlurred && (
                <div 
                    className="absolute inset-0 z-[9999] bg-black flex items-center justify-center cursor-none"
                    onClick={() => setIsBlurred(false)}
                >
                    {/* No text/UI, just pure black as requested */}
                </div>
            )}
        </div>
    );
};

export default ContentProtection;
