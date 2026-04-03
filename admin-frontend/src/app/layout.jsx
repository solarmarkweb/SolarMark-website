'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "../components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Hide sidebar on root path (login page)
  const isLoginPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          }
        ` }} />
      </head>
      <body className="antialiased bg-[#f8fafc]">
        <div className="flex">
          {!isLoginPage && <Sidebar />}
          <main className={`flex-1 ${isLoginPage ? '' : 'ml-56'} min-h-screen`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
