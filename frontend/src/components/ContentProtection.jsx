'use client';

import React, { useEffect, useState } from 'react';
import { Shield, EyeOff, AlertTriangle, MonitorOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ContentProtection = ({ children, isProtected = true }) => {
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        if (!isProtected) return;

        const blackout = () => {
            setIsBlurred(true);
            // Additionally clear clipboard to frustrate screenshot tools, but only if we have focus
            if (navigator.clipboard && navigator.clipboard.writeText && document.hasFocus()) {
                try {
                    navigator.clipboard.writeText("Content Protected by SolarMark Privacy Shield").catch(() => {});
                } catch (e) {
                    // Fail silently - user focus may have shifted or permission denied
                }
            }
        };
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
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                e.stopPropagation();
                blackout();
            }
            // F12 (DevTools)
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault();
                blackout();
            }
            
            // 3. Snapshot Triggers (PrintScreen / PrtSc / PrtScn / Win / Meta / Alt / Ctrl combinations)
            const isPrtSc = e.key === 'PrintScreen' || e.keyCode === 44 || e.key === 'Snapshot' || 
                           e.key === 'SysReq' || e.key === 'PrtSc' || e.key === 'PrtScn' || 
                           e.key === 'PrntScrn' || e.keyCode === 124 || e.keyCode === 121;
            
            const isMetaCapture = e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92;
            
            const isMacCapture = e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5');

            if (isPrtSc || isMetaCapture || isMacCapture || (e.altKey && isPrtSc) || (e.ctrlKey && isPrtSc)) {
                e.preventDefault();
                e.stopPropagation();
                blackout();
            }
        };

        // Extra logic for keyup (capture delayed releases of Fn+combinations)
        const handleKeyUpSecurity = (e) => {
            const isPrtSc = e.key === 'PrintScreen' || e.keyCode === 44 || e.key === 'SysReq' || 
                           e.key === 'Snapshot' || e.key === 'PrtSc' || e.key === 'PrtScn' || 
                           e.key === 'PrntScrn' || e.key === 'Meta';
            if (isPrtSc) {
                blackout();
            }
        };

        // 4. Tab Visibility Detection (Prevents background capture)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                blackout();
            }
        };

        // 4. Print Event Capture (Specific to Browser Print Dialogs)
        const handleBeforePrint = (e) => {
            blackout();
        };

        // 5. Focus Loss detection (Standard for Screenshot tools that steal focus)
        const handleWindowBlur = () => {
            blackout();
        };

        // 6. Specific Snapshot Intent Detection
        document.addEventListener('keydown', handleKeyDownSecurity);
        document.addEventListener('keyup', handleKeyUpSecurity);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', restore);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', preventDefault);
            document.removeEventListener('cut', preventDefault);
            document.removeEventListener('selectstart', preventDefault);
            document.removeEventListener('dragstart', preventDefault);
            document.removeEventListener('keydown', handleKeyDownSecurity);
            document.removeEventListener('keyup', handleKeyUpSecurity);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', restore);
        };
    }, [isProtected]);

    if (!isProtected) return <>{children}</>;

    return (
        <div className="relative overflow-hidden w-full h-full">
            {/* Hard-Coded Print Barrier (CSS Level) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { display: none !important; opacity: 0; visibility: hidden; }
                    html { display: none !important; }
                }
                * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-print-color-adjust: exact !important;
                }
            ` }} />

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
