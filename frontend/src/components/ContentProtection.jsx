'use client';

import React, { useEffect, useState } from 'react';
import { Shield, EyeOff, AlertTriangle, MonitorOff } from 'lucide-react';

const ContentProtection = ({ children, isProtected = true }) => {
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        if (!isProtected) return;

        // 1. Prevent Right-Click to prevent saving images or viewing source
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener('contextmenu', handleContextMenu);

        // 2. Prevent Keyboard Shortcuts
        const handleKeyDown = (e) => {
            // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
            }
            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
            }
            // Disable Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
            }
            // Disable Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
            }
            // Disable PrintScreen
            if (e.key === 'PrintScreen') {
                // Try to clear clipboard, though limited success in browsers
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText("");
                }
                alert('Screenshots/Print are disabled for this confidential report.');
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // 3. Blur on Focus Loss (Highly effective against most screenshot & screen recording tools)
        const handleBlur = () => {
            setIsBlurred(true);
        };
        const handleFocus = () => {
            setIsBlurred(false);
        };
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        // 4. Also listen for visibility change
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isProtected]);

    if (!isProtected) return <>{children}</>;

    return (
        <div className="relative group/protection overflow-hidden">
            <div 
                className={`transition-all duration-300 ${isBlurred ? 'blur-2xl grayscale brightness-50 pointer-events-none scale-105' : ''}`}
                style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none',
                    KhtmlUserSelect: 'none',
                    MozUserSelect: 'none'
                }}
            >
                {/* CSS for print protection */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        body {
                            display: none !important;
                        }
                    }
                ` }} />
                
                {/* Confidential Watermark Overlay (Subtle) */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] select-none flex flex-wrap gap-20 items-center justify-center rotate-[-30deg]">
                    {Array(40).fill('CONFIDENTIAL REPORT - SOLARMARK').map((text, i) => (
                        <span key={i} className="text-4xl font-black whitespace-nowrap">{text}</span>
                    ))}
                </div>
                
                {children}
            </div>

            {/* Warning Overlay when blurred */}
            {isBlurred && (
                <div className="absolute inset-0 z-[99] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white/90 p-8 rounded-[2rem] shadow-2xl text-center max-w-sm border border-white/20 animate-in fade-in zoom-in duration-300">
                        <div className="mb-6 mx-auto w-24 h-24 bg-orange-600/20 rounded-full flex items-center justify-center border-2 border-orange-500/50 animate-pulse">
                            <AlertTriangle size={48} className="text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight tracking-tight">PROTECTED CONTENT</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            For security purposes, this report is hidden when you switch applications or open screenshot tools.
                        </p>
                        <div className="mt-8 px-4 py-2 bg-orange-50 text-orange-600 text-xs font-bold rounded-full inline-block uppercase tracking-widest">
                            Solarmark Security
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentProtection;
