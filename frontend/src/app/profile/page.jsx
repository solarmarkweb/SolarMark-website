'use client';

import React, { useState, useEffect } from "react";
import {
    User, Mail, HardDrive, Calendar,
    Download, ExternalLink, FileText,
    Eye, File, Loader2, AlertCircle,
    RefreshCw, Home, Folder, CheckCircle,
    Link as LinkIcon,
    AlertTriangle, Clock, ClipboardList,
    CheckCircle2, XCircle, MapPin, Phone,
    ShieldCheck, Trash2, Lock, CreditCard,
    X, GitCompare, ArrowUpDown, BarChart3, CheckSquare, Square, Zap, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import ContentProtection from "@/components/ContentProtection";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookings, setBookings] = useState([]);

    // Data States
    const [pdfs, setPdfs] = useState([]);
    const [stats, setStats] = useState({
        total_pdfs: 0,
        total_bookings: 0,
        total_size: 0
    });
    const [downloadingPdf, setDownloadingPdf] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);

    // Comparison States
    const [selectedReports, setSelectedReports] = useState([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [comparingReports, setComparingReports] = useState(false);
    const [sortBy, setSortBy] = useState('uploaded_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingBlob, setViewingBlob] = useState(null);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError("");

            // Check authentication locally first
            if (!authAPI.isAuthenticated()) {
                handleLogout();
                return;
            }

            // 1. First set user from local storage for immediate UI feedback
            const userInfo = authAPI.getCurrentUser();
            if (userInfo) setUser(userInfo);

            // 2. Then fetch fresh profile data from backend to verify session
            try {
                const profileRes = await authAPI.getProfile();
                if (profileRes.data) {
                    const freshUser = {
                        id: profileRes.data.id,
                        name: `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim() || profileRes.data.email,
                        email: profileRes.data.email
                    };
                    setUser(freshUser);

                    // Update local storage names in case they changed
                    localStorage.setItem('user_name', freshUser.name);
                }

                // Fetch data in parallel
                const [bookingsResponse, pdfsData] = await Promise.all([
                    authAPI.getMyBookings(),
                    authAPI.getAllMyPDFs()
                ]);

                const bookingsData = bookingsResponse.data || [];
                setBookings(bookingsData);
                setPdfs(pdfsData);

                // Calculate statistics
                const totalSize = pdfsData.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0);
                setStats({
                    total_pdfs: pdfsData.length,
                    total_bookings: bookingsData.length,
                    total_size: Math.round(totalSize / (1024 * 1024) * 100) / 100
                });

            } catch (err) {
                console.error("Session verification or data fetch failed:", err);
                if (err.response?.status === 401) {
                    handleLogout();
                    return;
                }
                setError(err.message || "Failed to load profile data");
            }

        } catch (err) {
            console.error("Critical error in profile page:", err);
            setError("An unexpected error occurred. Please try logging in again.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger payment flow for download
    const handleDownloadClick = (pdf) => {
        setSelectedPdf(pdf);
        setShowPaymentModal(true);
    };

    // Actual visualization after "payment" (or directly)
    const processVisualization = async () => {
        if (!selectedPdf) return;

        const pdf = selectedPdf;
        setShowPaymentModal(false);

        try {
            setDownloadingPdf(pdf.pdf_id);
            setError("");

            const response = await authAPI.downloadPDF(pdf.pdf_id);

            // Create blob from response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            setViewingBlob(url);
            setShowViewModal(true);

        } catch (err) {
            console.error('Error fetching report data:', err);
            if (err.response?.status === 401) {
                handleLogout();
            } else {
                setError(err.message || "Failed to load visualization data");
            }
        } finally {
            setDownloadingPdf(null);
        }
    };

    const handleLogout = () => {
        authAPI.clearAuthData();
        router.push('/login');
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking? It will be removed from your list and the admin records.")) {
            return;
        }

        try {
            setLoading(true);
            await authAPI.deleteBooking(bookingId);
            // Re-fetch data to update UI
            await fetchProfileData();
        } catch (err) {
            console.error("Error deleting booking:", err);
            setError(err.response?.data?.detail || err.message || "Failed to delete booking");
            setLoading(false);
        }
    };

    // Comparison Handlers
    const toggleReportSelection = (pdfId) => {
        setSelectedReports(prev => {
            if (prev.includes(pdfId)) {
                return prev.filter(id => id !== pdfId);
            } else {
                return [...prev, pdfId];
            }
        });
    };

    const handleCompareReports = async () => {
        if (selectedReports.length < 2) {
            setError("Please select at least 2 reports to compare");
            return;
        }

        try {
            setComparingReports(true);
            setError("");

            const result = await authAPI.compareReports(selectedReports, sortBy, sortOrder);
            setComparisonResult(result);
            setShowComparisonModal(true);
        } catch (err) {
            console.error("Error comparing reports:", err);
            setError(err.response?.data?.detail || "Failed to compare reports");
        } finally {
            setComparingReports(false);
        }
    };

    const clearComparison = () => {
        setSelectedReports([]);
        setComparisonResult(null);
        setShowComparisonModal(false);
    };

    const handleDownloadComparisonReport = async () => {
        if (selectedReports.length < 2) {
            setError("Please select at least 2 reports to download comparison");
            return;
        }

        try {
            setComparingReports(true);
            setError("");

            const blob = await authAPI.downloadComparisonReport(selectedReports, sortBy, sortOrder);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            a.download = `report_comparison_${selectedReports.length}_reports_${timestamp}.pdf`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error("Error downloading comparison report:", err);
            setError(err.response?.data?.detail || "Failed to download comparison report");
        } finally {
            setComparingReports(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [router]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getUserInitials = (userName) => {
        if (!userName || userName === 'Anonymous User') return 'AU';
        const names = userName.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return userName[0]?.toUpperCase() || 'U';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                    <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">LOADING PROFILE DATA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="bg-slate-950 pt-32 pb-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3912982/pexels-photo-3912982.jpeg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl ring-4 ring-slate-900 overflow-hidden relative group">
                                <span className="text-3xl font-bold text-white z-10">{getUserInitials(user?.name)}</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{user?.name || 'User'}</h1>
                                <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-orange-500" /> {user?.email}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Premium Account</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 backdrop-blur-md"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center justify-between backdrop-blur-md"
                    >
                        <div className="flex items-center text-red-600 font-medium">
                            <AlertCircle className="w-5 h-5 mr-3" />
                            {error}
                        </div>
                        <button onClick={() => setError("")} className="text-red-600 hover:text-red-700">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.total_pdfs}</h3>
                            <p className="text-slate-500 font-medium">Inspection Reports</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Total Storage</span>
                            <span>{stats.total_size} MB</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <ClipboardList size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.total_bookings}</h3>
                            <p className="text-slate-500 font-medium">Total Bookings</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Pending Actions</span>
                            <span className="text-orange-600">{bookings.filter(b => b.status === 'pending').length}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length}</h3>
                            <p className="text-slate-500 font-medium">Completed Inspections</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Completion Rate</span>
                            <span>{stats.total_bookings > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / stats.total_bookings) * 100) : 0}%</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column: Bookings */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
                                <button
                                    onClick={() => router.push('/booking')}
                                    className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                    title="New Booking"
                                >
                                    <Zap size={18} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {bookings.length > 0 ? bookings.map((booking) => (
                                    <div key={booking.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <h4 className="font-bold text-slate-900 mb-2">{booking.service_type || 'General Inquiry'}</h4>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar size={12} />
                                                <span>{booking.date} at {booking.time}</span>
                                            </div>
                                            {booking.location && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <MapPin size={12} />
                                                    <span>{booking.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Calendar size={20} />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">No active bookings found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Reports */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Inspection Reports</h3>
                                    <p className="text-slate-500 text-sm mt-1">Access and analyze your solar assets</p>
                                </div>

                                {pdfs.length > 1 && (
                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                        <button
                                            onClick={handleCompareReports}
                                            disabled={selectedReports.length < 2 || comparingReports}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${selectedReports.length >= 2
                                                ? 'bg-slate-900 text-white shadow-lg'
                                                : 'text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {comparingReports ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitCompare className="w-3 h-3" />}
                                            Compare ({selectedReports.length})
                                        </button>

                                        {selectedReports.length > 0 && (
                                            <button
                                                onClick={clearComparison}
                                                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ContentProtection isProtected={true}>
                                <div className="space-y-3">
                                    {pdfs.length > 0 ? pdfs.map((pdf) => {
                                        const isSelected = selectedReports.includes(pdf.pdf_id);
                                        return (
                                            <div key={pdf.pdf_id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'
                                                }`}>
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <button
                                                        onClick={() => toggleReportSelection(pdf.pdf_id)}
                                                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-orange-600 border-orange-600' : 'border-slate-300 hover:border-orange-400'
                                                            }`}
                                                    >
                                                        {isSelected && <CheckSquare size={12} className="text-white" />}
                                                    </button>

                                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <FileText size={20} className="text-red-500" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate pr-4">{pdf.filename || "Unnamed Report"}</h4>
                                                            {pdf.report_type && (
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${pdf.report_type === 'rgb' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                                    }`}>
                                                                    {pdf.report_type === 'rgb' ? 'DRONE DATA' : 'SITE PLAN'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                            <span>{formatDate(pdf.uploaded_at)}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span>{formatFileSize(pdf.file_size)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDownloadClick(pdf)}
                                                    className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                                                >
                                                    <Eye size={14} />
                                                    <span className="hidden sm:inline">Visualize</span>
                                                </button>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Folder size={32} />
                                            </div>
                                            <h4 className="text-slate-900 font-bold mb-2">No Reports Available</h4>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Your inspection reports will appear here once the analysis is complete.</p>
                                            <button
                                                onClick={() => router.push('/booking')}
                                                className="text-orange-600 font-bold text-sm hover:underline"
                                            >
                                                Schedule an Inspection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </ContentProtection>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowPaymentModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">Premium Access</h3>
                                <p className="text-center text-slate-500 mb-8">Secure access required to visualize high-resolution thermal analysis.</p>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                                <FileText size={18} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 line-clamp-1">{selectedPdf?.filename}</p>
                                                <p className="text-xs text-slate-400">PDF Report</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900">$49.00</span>
                                    </div>
                                </div>

                                <button
                                    onClick={processVisualization}
                                    className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2"
                                >
                                    {downloadingPdf ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                                    Pay & Visualize
                                </button>

                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="w-full py-4 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                                >
                                    Cancel Transaction
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Comparison Modal */}
            <AnimatePresence>
                {showComparisonModal && comparisonResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowComparisonModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <ContentProtection isProtected={true}>
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <GitCompare className="text-orange-600" />
                                        Report Comparison
                                    </h3>
                                    <button
                                        onClick={() => setShowComparisonModal(false)}
                                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {comparisonResult.reports?.map((report, index) => (
                                            <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-orange-600 border border-slate-100">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate text-sm" title={report.filename}>
                                                            {report.filename}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{formatDate(report.uploaded_at)}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                                                        <p className="text-sm font-semibold text-slate-700">{formatFileSize(report.file_size)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upload Date</p>
                                                        <p className="text-sm font-semibold text-slate-700">{formatDate(report.uploaded_at)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Report ID</p>
                                                        <p className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{report.pdf_id?.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <Zap size={18} />
                                            AI Analysis Insight
                                        </h4>
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            Comparison completed successfully. The selected reports show a variance in inspection dates.
                                            We recommend focusing on the trend analysis to identify recurring thermal anomalies across these timeframes.
                                            You can download the full merged technical report below.
                                        </p>
                                    </div>

                                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                                        <button
                                            onClick={() => setShowComparisonModal(false)}
                                            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider">
                                            <Shield size={14} />
                                            Visualization Only
                                        </div>
                                    </div>
                                </div>
                            </ContentProtection>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Report Visualization Modal */}
            <AnimatePresence>
                {showViewModal && viewingBlob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                            onClick={() => {
                                setShowViewModal(false);
                                window.URL.revokeObjectURL(viewingBlob);
                                setViewingBlob(null);
                            }}
                        />
                        <ContentProtection isProtected={true}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-slate-200"
                            >
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedPdf?.filename}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protected Visualization Mode</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            window.URL.revokeObjectURL(viewingBlob);
                                            setViewingBlob(null);
                                        }}
                                        className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group"
                                    >
                                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-100 relative overflow-hidden">
                                    <iframe
                                        src={`${viewingBlob}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full border-none"
                                        title="Report Preview"
                                    />
                                    {/* Additional overlay to prevent right click interaction on iframe if possible */}
                                    <div className="absolute inset-0 pointer-events-none"></div>
                                </div>
                                <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Hash</span>
                                            <span className="text-xs font-mono text-slate-600 font-bold">{selectedPdf?.pdf_id?.substring(0, 16)}...</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100"></div>
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Level</span>
                                            <span className="text-xs text-orange-600 font-black uppercase tracking-widest">Verified Premium</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                        <ShieldCheck size={14} className="text-emerald-400" />
                                        Content Protected
                                    </div>
                                </div>
                            </motion.div>
                        </ContentProtection>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
