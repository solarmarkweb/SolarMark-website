'use client';

import React, { useState, useEffect } from "react";
import {
    User, Mail, HardDrive, Calendar,
    Download, ExternalLink, FileText,
    Eye, File as LucideFile, Loader2, AlertCircle,
    RefreshCw, Home, Folder, CheckCircle,
    Link as LinkIcon,
    AlertTriangle, Clock, ClipboardList,
    CheckCircle2, XCircle, MapPin, Phone,
    ShieldCheck, Trash2, Lock, CreditCard,
    Shield, X, GitCompare, ArrowUpDown, BarChart3, CheckSquare, Square, Zap, LogOut,
    MessageSquarePlus, History, Send, MessageSquare, ListTodo, Share2, Users,
    CloudUpload, Camera, Globe, Database, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import ContentProtection from "@/components/ContentProtection";
import dynamic from 'next/dynamic';

// Dynamic import for react-pdf to prevent SSR errors (DOMMatrix is not defined)
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });
const KmlViewer = dynamic(() => import('@/components/KmlViewer'), { ssr: false });

// Only import and configure pdfjs on the client
if (typeof window !== 'undefined') {
    const { pdfjs } = require('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

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
    const [numPages, setNumPages] = useState(null);
    const [pdfReady, setPdfReady] = useState(false);

    // Review States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedPdfForReview, setSelectedPdfForReview] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reportReviews, setReportReviews] = useState({}); // {pdf_id: review_data}

    // Sharing States
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharedWithMe, setSharedWithMe] = useState([]);
    const [shareRecipientEmail, setShareRecipientEmail] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    // Upload States
    const [rgbFiles, setRgbFiles] = useState([]);
    const [thermalFiles, setThermalFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({ projectName: "", areaSize: "" });





    const fetchProfileData = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError("");

            // Check authentication - give it a moment if we just arrived
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token && !authAPI.isAuthenticated()) {
                if (retryCount < 2) {
                    setTimeout(() => fetchProfileData(retryCount + 1), 500);
                    return;
                }
                handleLogout();
                return;
            }

            const userInfo = authAPI.getCurrentUser();
            if (userInfo) setUser(userInfo);

            try {
                const [profileRes, bookingsResponse, pdfsData, reviewsResponse, sharedData] = await Promise.all([
                    authAPI.getProfile(),
                    authAPI.getMyBookings(),
                    authAPI.getAllMyPDFs(),
                    authAPI.getMyAllReviews().catch(err => ({ data: {} })),
                    authAPI.getSharedWithMe().catch(err => ({ data: [] }))
                ]);

                if (profileRes && profileRes.data) {
                    const freshUser = {
                        id: profileRes.data.id,
                        name: `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim() || profileRes.data.email,
                        email: profileRes.data.email
                    };
                    setUser(freshUser);
                    localStorage.setItem('user_name', freshUser.name);
                }

                const bData = bookingsResponse?.data || [];
                setBookings(bData);
                setPdfs(pdfsData || []);
                
                const reviewsArray = reviewsResponse?.data || [];
                const reviewsDict = {};
                if (Array.isArray(reviewsArray)) {
                    reviewsArray.forEach(r => {
                        reviewsDict[r.pdf_id] = r;
                    });
                }
                setReportReviews(reviewsDict);

                console.log("DEBUG: Raw Shared Data response:", sharedData);
                const sData = sharedData?.data || (Array.isArray(sharedData) ? sharedData : []);
                console.log("DEBUG: Processed Shared Data for state:", sData);
                setSharedWithMe(sData);

                const totalSize = (pdfsData || []).reduce((sum, pdf) => sum + (pdf.file_size || 0), 0);
                setStats({
                    total_pdfs: (pdfsData || []).length,
                    total_bookings: bData.length,
                    total_size: Math.round(totalSize / (1024 * 1024) * 100) / 100
                });

            } catch (err) {
                console.error("Data fetch failed:", err);
                if (err.response?.status === 401) {
                    handleLogout();
                    return;
                }
                setError("Unable to sync reports. Please check your connection.");
            }
        } catch (err) {
            console.error("Critical error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Upload Handlers
    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files, type);
        }
    };

    const handleFiles = (files, type) => {
        let validFiles = [];
        const MAX_SIZE = 1000 * 1024 * 1024 * 1024; // 1000 GB

        if (type === 'rgb') {
            // Drone Images - only images
            validFiles = Array.from(files).filter(file => {
                const isImage = file.type.startsWith('image/') &&
                    (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg');
                const isWithinSize = file.size <= MAX_SIZE;
                return isImage && isWithinSize;
            });
        } else {
            // Site Plan - KML format alone strictly
            validFiles = Array.from(files).filter(file => {
                const isKML = file.name.toLowerCase().endsWith('.kml') ||
                    file.type === 'application/vnd.google-earth.kml+xml';
                const isWithinSize = file.size <= MAX_SIZE;
                return isKML && isWithinSize;
            });
        }

        if (validFiles.length === 0) {
            setUploadStatus({
                type: "error",
                message: type === 'rgb'
                    ? "Please upload valid image files for Drone Images (JPEG, PNG, max 1000GB)"
                    : "Please upload KML format files strictly for Site Plan (max 1000GB)"
            });
            return;
        }

        if (type === 'rgb') {
            setRgbFiles(prev => [...prev, ...validFiles]);
        } else {
            setThermalFiles(prev => [...prev, ...validFiles]);
        }
    };

    const uploadRGBImages = async () => {
        if (rgbFiles.length === 0) return;

        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const formData = new FormData();

        rgbFiles.forEach(file => {
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const newFileName = `${user?.name || 'User'}_rgb_${timestamp}.${fileExt}`;

            const renamedFile = new File([file], newFileName, { type: file.type });
            formData.append('rgb_images', renamedFile);
        });

        formData.append('project_name', uploadForm.projectName || 'Untitled Project');
        if (uploadForm.areaSize) {
            formData.append('area_size', uploadForm.areaSize);
        }

        const response = await fetch(`${API_URL}/upload-rgb-images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401) {
            throw new Error('Session error. Please try refreshing the page.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to upload RGB images');
        }

        return response.json();
    };

    const uploadThermalImages = async () => {
        if (thermalFiles.length === 0) return;

        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const formData = new FormData();

        thermalFiles.forEach(file => {
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const newFileName = `${user?.name || 'User'}_thermal_${timestamp}.${fileExt}`;

            const renamedFile = new File([file], newFileName, { type: file.type });
            formData.append('thermal_images', renamedFile);
        });

        formData.append('project_name', uploadForm.projectName || 'Untitled Project');
        if (uploadForm.areaSize) {
            formData.append('area_size', uploadForm.areaSize);
        }

        const response = await fetch(`${API_URL}/upload-thermal-images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401) {
            throw new Error('Session error. Please try refreshing the page.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to upload Thermal images');
        }

        return response.json();
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();

        if (rgbFiles.length === 0 && thermalFiles.length === 0) {
            setUploadStatus({ type: "error", message: "Please select at least one asset to upload." });
            return;
        }

        if (uploading) return;

        setUploading(true);
        setUploadStatus({ type: "info", message: "Uploading assets to Google Drive..." });

        try {
            let rgbResult = null;
            let thermalResult = null;
            let totalUploaded = 0;

            if (rgbFiles.length > 0) {
                rgbResult = await uploadRGBImages();
                totalUploaded += rgbResult?.uploaded_count || rgbFiles.length;
            }

            if (thermalFiles.length > 0) {
                thermalResult = await uploadThermalImages();
                totalUploaded += thermalResult?.uploaded_count || thermalFiles.length;
            }

            setUploadStatus({
                type: "success",
                message: `Successfully uploaded ${totalUploaded} assets to Google Drive!`
            });

            setTimeout(() => {
                setUploadStatus({ type: "", message: "" });
            }, 3000);

            setRgbFiles([]);
            setThermalFiles([]);
            setShowUploadModal(false);
            setUploadForm({ projectName: "", areaSize: "" });

            await fetchProfileData();

        } catch (err) {
            console.error("Upload error:", err);
            setUploadStatus({
                type: "error",
                message: "Network Error: Failed to complete the upload. Please check your connection and try again."
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadClick = (pdf) => {
        setSelectedPdf(pdf);
        startDirectVisualization(pdf);
    };

    const startDirectVisualization = async (pdf) => {
        if (!pdf) return;

        try {
            setDownloadingPdf(pdf.pdf_id);
            setError("");

            const response = await authAPI.downloadPDF(pdf.pdf_id);

            // Determine MIME type based on extension
            const filename = pdf.filename || '';
            let mimeType = 'application/pdf';
            if (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')) {
                mimeType = 'text/html';
            } else if (filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')) {
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            } else if (filename.toLowerCase().endsWith('.csv')) {
                mimeType = 'text/csv';
            } else if (filename.toLowerCase().endsWith('.kml')) {
                mimeType = 'application/vnd.google-earth.kml+xml';
            } else if (filename.toLowerCase().endsWith('.kmz')) {
                mimeType = 'application/vnd.google-earth.kmz';
            }

            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            setViewingBlob(url);
            setShowViewModal(true);

            // For non-PDF files, we don't use react-pdf loader
            if (!filename.toLowerCase().endsWith('.pdf')) {
                setPdfReady(true);
            } else {
                setPdfReady(false); // Reset for next PDF
            }

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
            await fetchProfileData();
        } catch (err) {
            console.error("Error deleting booking:", err);
            setError(err.response?.data?.detail || err.message || "Failed to delete booking");
            setLoading(false);
        }
    };

    const handleShareClick = (pdf) => {
        setSelectedPdf(pdf);
        setShareRecipientEmail("");
        setShareSuccess(false);
        setShowShareModal(true);
    };

    const handleConfirmShare = async () => {
        if (!shareRecipientEmail.trim()) return;

        try {
            setIsSharing(true);
            setError("");
            await authAPI.shareReport(selectedPdf.pdf_id, shareRecipientEmail);
            setShareSuccess(true);
            setTimeout(() => {
                setShowShareModal(false);
                setShareSuccess(false);
            }, 2000);
        } catch (err) {
            const detail = err.response?.data?.detail || "Failed to share report.";
            setError(detail);
        } finally {
            setIsSharing(false);
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

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            a.download = `report_comparison_${selectedReports.length}_reports_${timestamp}.pdf`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error("Error downloading comparison report:", err);
            setError(err.response?.data?.detail || "Failed to download comparison report");
        } finally {
            setComparingReports(false);
        }
    };

    const handleVisualizeComparison = async () => {
        if (selectedReports.length < 2) {
            setError("Please select at least 2 reports to visualize comparison");
            return;
        }

        try {
            setComparingReports(true);
            setError("");

            const blob = await authAPI.downloadComparisonReport(selectedReports, sortBy, sortOrder);

            setSelectedPdf({
                filename: `COMPARISON ANALYSIS_REPORT`,
                pdf_id: 'CMP-' + Math.random().toString(36).substring(7).toUpperCase()
            });

            const url = window.URL.createObjectURL(blob);
            setViewingBlob(url);
            setShowViewModal(true);
            setShowComparisonModal(false);
        } catch (err) {
            console.error("Error visualizing comparison report:", err);
            setError(err.response?.data?.detail || "Failed to visualize comparison report");
        } finally {
            setComparingReports(false);
        }
    };

    // Report Review Handlers
    const handleReviewClick = async (pdf) => {
        setSelectedPdfForReview(pdf);
        setReviewText("");
        setShowReviewModal(true);

        try {
            const existingReview = await authAPI.getMyReportReview(pdf.pdf_id);
            if (existingReview.data) {
                setReviewText(existingReview.data.user_feedback);
                setReportReviews(prev => ({
                    ...prev,
                    [pdf.pdf_id]: existingReview.data
                }));
            }
        } catch (err) {
            console.error("Error fetching review:", err);
        }
    };

    const submitReview = async () => {
        if (!reviewText.trim()) {
            setError("Please enter your feedback before submitting.");
            return;
        }

        try {
            setSubmittingReview(true);
            await authAPI.submitReportReview({
                pdf_id: selectedPdfForReview.pdf_id,
                filename: selectedPdfForReview.filename,
                user_feedback: reviewText
            });

            setReportReviews(prev => ({
                ...prev,
                [selectedPdfForReview.pdf_id]: {
                    status: 'pending',
                    user_feedback: reviewText,
                    submitted_at: new Date().toISOString()
                }
            }));

            setShowReviewModal(false);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError("Failed to submit your change request. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        fetchProfileData();
    }, [router]);

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const truncateFilename = (filename) => {
        if (!filename) return 'Unnamed Report';
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const words = nameWithoutExt.split(/[\s_-]+/);
        if (words.length <= 2) return filename;
        return words.slice(0, 2).join(' ') + '.....';
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

                {/* Elegant Formal Upload Section - Precision Intelligence Hub */}
                {user && (
                    <section id="image-upload-section" className="py-10 bg-[#f1f3f5] relative overflow-hidden shadow-sm mb-12 rounded-[2.5rem]">
                        {/* Top Transition Blur Glow */}
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent opacity-50 backdrop-blur-3xl -z-10" />

                        {/* Theme Inset: Sophisticated Ash Atmosphere */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-0"></div>
                        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-[120px] -z-10" />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                                {/* Left Column: Interactive Direct Flow Hub - Professional Ash Theme */}
                                <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center">
                                    <div className="w-full max-w-lg">
                                        {/* Premium Ash Theme - Replaced Dark Mode */}
                                        <div className="p-10 md:p-12 bg-slate-200/60 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:bg-slate-200/80 transition-all duration-500 border border-slate-300/50">
                                            <div className="relative z-10">
                                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
                                                    UPLOAD TO <br />
                                                    <span className="text-orange-600 drop-shadow-sm transition-all duration-500">GOOGLE DRIVE</span>
                                                </h2>
                                                <p className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                                    Easy cloud upload <br />
                                                    for your solar projects.
                                                </p>
                                            </div>
                                            {/* Subtle Background Accent */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -z-0" />
                                        </div>
                                    </div>
                                </div>

                                {/* Center Column: Perfectly Centered Solid Arrow - Black High-Contrast */}
                                <div className="hidden xl:flex xl:col-span-2 items-center justify-center">
                                    <div className="text-slate-950 flex-shrink-0 drop-shadow-sm">
                                        <svg width="70" height="40" viewBox="0 0 70 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 13H45V27H0V13Z" />
                                            <path d="M40 5L65 20L40 35V5Z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Right Column: Balanced Interactive Terminal - Symmetrical 5-span */}
                                <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -4 }}
                                        className="bg-white border-2 border-slate-950 rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] w-full max-w-xl relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Upload here</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            {/* Zone A: Drone Image */}
                                            <motion.div
                                                whileHover={{ y: -2, scale: 1.01 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="relative group cursor-pointer"
                                            >
                                                <input
                                                    type="file" multiple accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'rgb')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${rgbFiles.length > 0
                                                        ? 'border-orange-600 bg-orange-100 shadow-inner'
                                                        : 'border-orange-100 bg-orange-50 hover:border-orange-200 hover:shadow-lg'
                                                    }`}>
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rgbFiles.length > 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-orange-400 shadow-sm'
                                                        }`}>
                                                        <Camera size={22} />
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-0.5 uppercase tracking-tight">Drone Image</h4>
                                                        <span className={`text-[10px] font-black tracking-widest transition-colors uppercase ${rgbFiles.length > 0 ? 'text-orange-600' : 'text-orange-400 opacity-60'}`}>
                                                            {rgbFiles.length > 0 ? `${rgbFiles.length} Selected` : "Scan Hub"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Zone B: Site Plan */}
                                            <motion.div
                                                whileHover={{ y: -2, scale: 1.01 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="relative group cursor-pointer"
                                            >
                                                <input
                                                    type="file" multiple accept=".kml"
                                                    onChange={(e) => handleFileChange(e, 'thermal')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${thermalFiles.length > 0
                                                        ? 'border-orange-600 bg-orange-100 shadow-inner'
                                                        : 'border-orange-100 bg-orange-50 hover:border-orange-200 hover:shadow-lg'
                                                    }`}>
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${thermalFiles.length > 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-orange-400 shadow-sm'
                                                        }`}>
                                                        <Globe size={22} />
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-0.5 uppercase tracking-tight">Site Plan</h4>
                                                        <span className={`text-[10px] font-black tracking-widest transition-colors uppercase ${thermalFiles.length > 0 ? 'text-orange-600' : 'text-orange-400 opacity-60'}`}>
                                                            {thermalFiles.length > 0 ? `${thermalFiles.length} Vectors` : "KML Import"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="max-w-md mx-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (rgbFiles.length === 0 && thermalFiles.length === 0) return;
                                                    setShowUploadModal(true);
                                                }}
                                                disabled={uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-3 shadow-xl"
                                            >
                                                {uploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <CloudUpload size={22} />
                                                )}
                                                <span>{uploading ? 'Processing' : 'Finalize Upload'}</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>

                            </div>
                        </div>
                    </section>
                )}


                {/* Stats Grid - 4 Containers System */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-orange-200 transition-all duration-500"
                    >
                        <div>
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-orange-100">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stats.total_pdfs}</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Inspection Reports</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span>Data Volume</span>
                            <span className="text-slate-900">{stats.total_size} MB</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-blue-200 transition-all duration-500"
                    >
                        <div>
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-100">
                                <ClipboardList size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stats.total_bookings}</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Bookings</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span>Pending Jobs</span>
                            <span className="text-orange-600">{bookings.filter(b => b.status === 'pending').length} Active</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all duration-500"
                    >
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-100">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length}</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Completed Audits</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span>Success Rate</span>
                            <span className="text-emerald-600">{stats.total_bookings > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / stats.total_bookings) * 100) : 0}%</span>
                        </div>
                    </motion.div>

                    {/* NEW 4th CONTAINER: DIGITAL TWIN UPLINK - White Palette matched */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group hover:border-blue-200 transition-all duration-500"
                    >
                        {/* Background Ornament - Subtle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors duration-700"></div>
                        
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-50">
                                    <CloudUpload size={20} />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 text-sm font-black uppercase tracking-tight">Data Uplink</h4>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Secure Cloud Sync</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="relative group/node">
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'rgb')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${rgbFiles.length > 0 ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:border-orange-500 group-hover:text-orange-500 hover:bg-white'}`}>
                                        <Camera size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-tight leading-none text-center">RGB <br/> {rgbFiles.length > 0 ? `${rgbFiles.length}` : 'DATA'}</span>
                                    </div>
                                </div>
                                <div className="relative group/node">
                                    <input type="file" multiple accept=".kml" onChange={(e) => handleFileChange(e, 'thermal')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${thermalFiles.length > 0 ? 'bg-blue-700 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500 hover:bg-white'}`}>
                                        <Globe size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-tight leading-none text-center">KMZ <br/> {thermalFiles.length > 0 ? `${thermalFiles.length}` : 'SITE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleImageUpload}
                            disabled={uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)}
                            className={`w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                                uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)
                                    ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                                    : 'bg-slate-900 text-white shadow-xl hover:bg-blue-600 active:scale-95'
                            }`}
                        >
                            {uploading ? <Loader2 className="animate-spin w-3 h-3" /> : (uploadStatus.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />)}
                            <span>{uploading ? 'Uplinking' : (uploadStatus.type === 'success' ? 'Success' : 'Start Uplink')}</span>
                        </button>
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
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <div className="relative mb-4">
                                                <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl animate-pulse"></div>
                                                <Loader2 className="w-12 h-12 text-orange-600 animate-spin relative z-10" />
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm animate-pulse">Syncing Secure Reports...</p>
                                        </div>
                                    ) : pdfs.length > 0 ? (
                                        pdfs.map((pdf) => {
                                            const isSelected = selectedReports.includes(pdf.pdf_id);
                                            return (
                                                <div key={pdf.pdf_id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isSelected ? 'bg-orange-50/50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-200/20'
                                                    }`}>
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <button
                                                            onClick={() => toggleReportSelection(pdf.pdf_id)}
                                                            className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-orange-600 border-orange-600 scale-110 shadow-lg shadow-orange-600/20' : 'border-slate-200 hover:border-orange-400'
                                                                }`}
                                                        >
                                                            {isSelected && <CheckSquare size={10} strokeWidth={4} className="text-white" />}
                                                        </button>

                                                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shadow-sm border border-red-100 shrink-0">
                                                            <FileText size={24} className="text-red-500" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-slate-900 text-sm pr-4" title={pdf.filename}>{truncateFilename(pdf.filename)}</h4>
                                                                {pdf.report_type && (
                                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${pdf.report_type === 'rgb' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                                        }`}>
                                                                        {pdf.report_type === 'rgb' ? 'DRONE DATA' : 'SITE PLAN'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                                <span>{formatDate(pdf.uploaded_at)}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span>{formatFileSize(pdf.file_size)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {reportReviews[pdf.pdf_id] && (
                                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${reportReviews[pdf.pdf_id]?.status === 'completed'
                                                                    ? 'bg-green-100 text-green-700 border-green-200 animate-pulse'
                                                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                                                }`}>
                                                                {reportReviews[pdf.pdf_id]?.status === 'completed' ? (
                                                                    <><CheckCircle2 size={10} strokeWidth={3} /> CHANGES MADE</>
                                                                ) : (
                                                                    <><Clock size={10} strokeWidth={3} /> REVIEW PENDING</>
                                                                )}
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleReviewClick(pdf)}
                                                            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                                        >
                                                            <MessageSquarePlus size={14} className="text-orange-500" />
                                                            <span>Review</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleShareClick(pdf)}
                                                            className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 group"
                                                        >
                                                            <Share2 size={14} className="group-hover:text-white transition-colors" />
                                                            <span>Share</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDownloadClick(pdf)}
                                                            className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95"
                                                        >
                                                            <Eye size={14} />
                                                            <span>Visualize</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Folder size={32} />
                                            </div>
                                            <h4 className="text-slate-900 font-bold mb-2">No Reports Available</h4>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Your inspection reports will appear here once the analysis is complete.</p>
                                        </div>
                                    )}
                                </div>

                                {/* SHARED WITH ME SECTION */}
                                {sharedWithMe.length > 0 && (
                                    <div className="mt-12 pt-12 border-t border-slate-100">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Shared with Me</h3>
                                                <p className="text-xs text-slate-400 font-medium">Reports shared by other users</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {sharedWithMe.map((shared) => (
                                                <div key={shared.share_id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/20 transition-all">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                                                            <FileText size={20} className="text-blue-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate">{shared.filename}</h4>
                                                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                                <span className="text-blue-600">From: {shared.sender_name || shared.sender_email}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span>Shared {formatDate(shared.shared_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadClick({ pdf_id: shared.pdf_id, filename: shared.filename })}
                                                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                                                    >
                                                        <Eye size={14} />
                                                        <span>Visualize</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </ContentProtection>
                        </div>
                    </div>


                </div>
            </div>

            {/* Payment Modal - Commented out for now */}
            {/* 
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
            */}

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
                                        <button
                                            onClick={handleVisualizeComparison}
                                            disabled={comparingReports}
                                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {comparingReports ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Shield size={14} className="group-hover:text-white" />
                                            )}
                                            Visualization Only
                                        </button>
                                    </div>
                                </div>
                            </ContentProtection>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Report Visualization Modal - Full Screen */}
            <AnimatePresence>
                {showViewModal && viewingBlob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950"
                        />
                        <ContentProtection isProtected={true}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative bg-white w-screen h-screen flex flex-col overflow-hidden"
                            >
                                <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedPdf?.filename}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Verified Security Mode</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Read-Only Visualization</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                            <ShieldCheck size={14} className="text-emerald-400" />
                                            SECURE STREAM
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false);
                                                window.URL.revokeObjectURL(viewingBlob);
                                                setViewingBlob(null);
                                            }}
                                            className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group shadow-sm"
                                        >
                                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-slate-200 relative overflow-hidden flex flex-col">
                                    {/* THE SHIELD CHECK BARRIER - Verification Phase */}
                                    {!pdfReady && (
                                        <div className="absolute inset-0 z-[70] bg-slate-900 flex flex-col items-center justify-center gap-6">
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 5, -5, 0]
                                                    }}
                                                    transition={{ repeat: Infinity, duration: 4 }}
                                                    className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40"
                                                >
                                                    <Shield size={48} className="text-white drop-shadow-lg" />
                                                </motion.div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h4 className="text-white text-xl font-black uppercase tracking-widest text-[#f5f5f5]">Shield-Check Activated</h4>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                                    <Loader2 size={14} className="animate-spin text-orange-500" />
                                                    Verifying Data Integrity
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* The Shielded Report Viewer (Canvas-based for PDF, Iframe for HTML, Download for others) */}
                                    <div
                                        className="flex-1 overflow-auto bg-slate-800 p-8 flex justify-center scrollbar-thin scrollbar-thumb-slate-600"
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        <div
                                            className="relative shadow-2xl shadow-black/40 ring-1 ring-slate-700 rounded w-full max-w-5xl"
                                        >
                                            {selectedPdf?.filename?.toLowerCase().endsWith('.pdf') ? (
                                                <Document
                                                    file={viewingBlob}
                                                    onLoadSuccess={({ numPages }) => {
                                                        setNumPages(numPages);
                                                        setPdfReady(true);
                                                    }}
                                                    loading={<div className="h-[800px] w-full bg-slate-800 animate-pulse flex items-center justify-center">
                                                        <Loader2 className="text-orange-500 animate-spin" size={32} />
                                                    </div>}
                                                >
                                                    {Array.from(new Array(numPages), (el, index) => (
                                                        <Page
                                                            key={`page_${index + 1}`}
                                                            pageNumber={index + 1}
                                                            scale={1.5}
                                                            className="mb-8 last:mb-0"
                                                            loading={<div className="h-[800px] w-full bg-slate-800"></div>}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                        />
                                                    ))}
                                                </Document>
                                            ) : selectedPdf?.filename?.toLowerCase().endsWith('.html') || selectedPdf?.filename?.toLowerCase().endsWith('.htm') ? (
                                                <div className="w-full h-full bg-white min-h-[85vh] rounded-lg overflow-hidden relative">
                                                    <iframe
                                                        src={viewingBlob}
                                                        className="w-full h-full border-none min-h-[85vh]"
                                                        title="HTML Report Content"
                                                    />
                                                </div>
                                            ) : selectedPdf?.filename?.toLowerCase().match(/\.(kml|kmz)$/) ? (
                                                <div className="w-full h-full min-h-[85vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl">
                                                    <KmlViewer kmlUrl={viewingBlob} />
                                                </div>
                                            ) : (
                                                <div className="w-full min-h-[60vh] bg-slate-900 rounded-[2rem] border border-slate-700 flex flex-col items-center justify-center p-12 text-center gap-6">
                                                    <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-2xl shadow-orange-500/10">
                                                        <BarChart3 size={48} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">Technical Data Ready</h4>
                                                        <p className="text-slate-400 max-w-md mx-auto text-sm">
                                                            This spreadsheet dataset requires external software (Excel or CSV Editor) for full analysis.
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={viewingBlob}
                                                        download={selectedPdf?.filename}
                                                        className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-900/40 flex items-center gap-3 active:scale-95"
                                                    >
                                                        <Download size={18} />
                                                        Download Data Pack
                                                    </a>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">Security Verified & Scanned</p>
                                                </div>
                                            )}

                                            {/* SECURE OVERLAY: Prevent any interaction with content */}
                                            <div className="absolute inset-0 z-50 select-none pointer-events-none">
                                                {/* Watermark Overlay for the Report itself */}
                                                <div className="absolute inset-0 flex flex-wrap gap-12 items-center justify-center rotate-[-20deg] opacity-[0.05] overflow-hidden py-24">
                                                    {Array(100).fill(`AUTHORITY ACCESS ONLY`).map((text, i) => (
                                                        <span key={`wm_${i}`} className="text-2xl font-black whitespace-nowrap tracking-tighter uppercase select-none">{text}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-8">
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fingerprint</span>
                                            <span className="text-xs font-mono text-slate-600 font-bold">{selectedPdf?.pdf_id?.substring(0, 24)}</span>
                                        </div>
                                        <div className="hidden md:block h-8 w-px bg-slate-100"></div>
                                        <div className="hidden md:block">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visual Analysis</span>
                                            <span className="text-xs text-orange-600 font-black uppercase tracking-widest">Active High-Res</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                        SolarMark Privacy Shield Enabled
                                    </div>
                                </div>
                            </motion.div>
                        </ContentProtection>
                    </div>
                )}
            </AnimatePresence>

            {/* REPORT REVIEW MODAL */}
            <AnimatePresence mode="wait">
                {showReviewModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setShowReviewModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="flex h-full max-h-[90vh] flex-col">
                                {/* Header */}
                                <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                                            <MessageSquarePlus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Request Report Changes</h3>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference: {selectedPdfForReview?.pdf_id?.substring(0, 8)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                                    {/* Existing Status if any */}
                                    {reportReviews[selectedPdfForReview?.pdf_id] && (
                                        <div className="mb-10">
                                            {/* Status Header */}
                                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Request Tracking</h4>
                                                    <p className="text-xs text-slate-400 font-medium tracking-wide">Ref: {reportReviews[selectedPdfForReview?.pdf_id].id?.substring(18)}</p>
                                                </div>
                                                <div className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-sm border ${reportReviews[selectedPdfForReview?.pdf_id].status === 'completed'
                                                        ? 'bg-green-50 text-green-700 border-green-200/50'
                                                        : 'bg-orange-50 text-orange-700 border-orange-200/50'
                                                    }`}>
                                                    {reportReviews[selectedPdfForReview?.pdf_id].status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                                    {reportReviews[selectedPdfForReview?.pdf_id].status}
                                                </div>
                                            </div>

                                            {/* Discussion Thread */}
                                            <div className="space-y-6 flex flex-col">
                                                {/* User Request Base Card */}
                                                <div className="flex w-full">
                                                    <div className="bg-white border border-slate-200 rounded-[2rem] rounded-tl-sm p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] w-fit max-w-[90%] transition-shadow hover:shadow-md">
                                                        <div className="flex items-center gap-3 mb-3 border-b border-slate-50 pb-3">
                                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                                <User size={12} className="text-slate-500" />
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Your Request</p>
                                                        </div>
                                                        <p className="text-sm text-slate-700 font-medium leading-relaxed pr-2">
                                                            {reportReviews[selectedPdfForReview?.pdf_id].user_feedback}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Admin Remark Base Card (if exists) */}
                                                {reportReviews[selectedPdfForReview?.pdf_id].admin_remarks && (
                                                    <div className="flex w-full justify-end">
                                                        <div className="bg-gradient-to-l from-orange-50 to-amber-50/10 border border-orange-100/80 rounded-[2rem] rounded-tr-sm p-5 shadow-[0_4px_20px_-10px_rgba(249,115,22,0.1)] w-fit max-w-[90%]">
                                                            <div className="flex items-center justify-end gap-3 mb-3 border-b border-orange-100/40 pb-3 text-right">
                                                                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Analysis Team Resolution</p>
                                                                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200/50">
                                                                    <Shield size={12} className="text-orange-600" />
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-orange-950 font-medium leading-relaxed pl-2 text-right">
                                                                {reportReviews[selectedPdfForReview?.pdf_id].admin_remarks}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                                {reportReviews[selectedPdfForReview?.pdf_id] ? "Request Further Changes" : "Submit Issue Profile"}
                                            </h4>
                                        </div>
                                        <div className="relative group">
                                            <textarea
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="Please specify the exact technical changes required for this report... (e.g., 'Re-evaluate thermal signature on Zone B' or 'Include updated site plan coordinates')"
                                                className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-[15px] font-medium leading-relaxed shadow-sm"
                                            />
                                        </div>

                                        {!reportReviews[selectedPdfForReview?.pdf_id] && (
                                            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                                    <AlertCircle size={18} className="text-slate-500" />
                                                </div>
                                                <div className="pt-0.5">
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-1">Direct Technical Link</p>
                                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                                        Submitting this profile will directly alert the analysis team. Track the resolution status via the badge on your dashboard.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="px-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitReview}
                                        disabled={submittingReview || !reviewText.trim()}
                                        className="px-10 py-4 bg-slate-900 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-2xl text-sm font-black transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 uppercase tracking-[0.2em]"
                                    >
                                        {submittingReview ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                        {reportReviews[selectedPdfForReview?.pdf_id] ? 'Update Request' : 'Submit Review'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SECURE SHARE MODAL */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => !isSharing && setShowShareModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <Share2 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Secure Share</h3>
                                            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Report access transfer</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <X size={20} />
                                    </button>
                                </div>

                                {shareSuccess ? (
                                    <div className="py-10 text-center animate-in zoom-in-95 duration-300">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Successfully Shared</h4>
                                        <p className="text-sm text-slate-500">Access has been granted to {shareRecipientEmail}.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                                                <FileText size={18} className="text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{selectedPdf?.filename}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Selected Report</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Recipient Email Address</label>
                                                <input
                                                    type="email"
                                                    value={shareRecipientEmail}
                                                    onChange={(e) => setShareRecipientEmail(e.target.value)}
                                                    placeholder="e.g. partner@example.com"
                                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                                                />
                                            </div>

                                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-3">
                                                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                                    <strong>Important:</strong> Recipients must be registered on SolarMark to access shared reports.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConfirmShare}
                                            disabled={isSharing || !shareRecipientEmail.trim()}
                                            className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:bg-slate-300 active:scale-[0.98]"
                                        >
                                            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                            <span className="uppercase tracking-widest text-xs">Authorize Share Access</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload Details Modal - Project Structure */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !uploading && setShowUploadModal(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 z-10"
                        >
                            <div className="p-8 md:p-10">
                                <button
                                    onClick={() => !uploading && setShowUploadModal(false)}
                                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                                    disabled={uploading}
                                >
                                    <X size={20} />
                                </button>

                                <div className="mb-8">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                        <CloudUpload size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Project Details</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed">
                                        Provide the project details to structure your Google Drive folders correctly.
                                    </p>
                                </div>

                                <form onSubmit={handleImageUpload} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Nevada Solar Array 1"
                                            value={uploadForm.projectName}
                                            onChange={(e) => setUploadForm({ ...uploadForm, projectName: e.target.value })}
                                            disabled={uploading}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Area Size (Acres/MW) <span className="text-slate-300">- Optional</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 50 MW or 120 Acres"
                                            value={uploadForm.areaSize}
                                            onChange={(e) => setUploadForm({ ...uploadForm, areaSize: e.target.value })}
                                            disabled={uploading}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50"
                                        />
                                    </div>

                                    {uploadStatus.message && (
                                        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${uploadStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {uploadStatus.message}
                                        </div>
                                    )}

                                    <button
                                        disabled={uploading}
                                        type="submit"
                                        className="w-full py-5 bg-orange-600 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-orange-900/20"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Processing Upload...</span>
                                            </>
                                        ) : (
                                            "Upload to Drive"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}