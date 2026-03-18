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