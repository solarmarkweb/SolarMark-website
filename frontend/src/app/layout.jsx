import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Solar Software for Asset Owners - SolarMark",
  description: "Maximize ROI on your solar assets with AI-powered insights, drone inspections, and automated performance tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <Navbar />
        <AuthGuard>
          <main>{children}</main>
        </AuthGuard>
        <Footer />
      </body>
    </html>
  );
}
