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
    Shield, X, GitCompare, ArrowUpDown, BarChart3, CheckSquare, Square, Zap, LogOut, Activity, Terminal,
    MessageSquarePlus, History, Send, MessageSquare, ListTodo, Share2, Users,
    CloudUpload, Camera, Globe, Database, ArrowRight, ChevronDown, LayoutDashboard, Plus,
    Contact2, Settings, HelpCircle, ChevronLeft, Info, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import ContentProtection from "@/components/ContentProtection";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';

// Dynamic import for react-pdf to prevent SSR errors (DOMMatrix is not defined)
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });
const KmlViewer = dynamic(() => import('@/components/KmlViewer'), { ssr: false });

// Only import and configure pdfjs on the client
if (typeof window !== 'undefined') {
    const { pdfjs } = require('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookings, setBookings] = useState([]);
    const [bookingFilter, setBookingFilter] = useState('All');
    const [showBookingsList, setShowBookingsList] = useState(false);
    const [showReportsList, setShowReportsList] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');

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
    const [excelData, setExcelData] = useState(null);
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

    // Action Modals
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Form States
    const [contactForm, setContactForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        message: ""
    });
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState({ type: '', message: '' });

    const [bookingFormData, setBookingFormData] = useState({
        firstName: "", lastName: "", workEmail: "", phone: "", companyName: "", gstNumber: "",
        companyType: "", areaSize: "", projectName: "", inspectionPurpose: "",
        solarCapacity: "", otherSolarCapacity: "", siteAddress: "", latitude: "",
        longitude: "", airspaceType: "", flightDate: "", flightTime: "",
        altitude: "", additionalInfo: "", flightAltitude: "", humidity: "",
        emissivity: "", ambientTemperature: "", reflectedTemperature: "",
        droneType: "", irradiance: ""
    });
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingStatus, setBookingStatus] = useState({ type: "", message: "" });
    const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
    const bookingsPerPage = 6;

    const fetchProfileData = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError("");

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
            
            const role = localStorage.getItem("user_role");
            setUserRole(role || null);

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
                        user_code: profileRes.data.user_code || "",
                        name: `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim() || profileRes.data.email,
                        email: profileRes.data.email
                    };
                    setUser(freshUser);
                    localStorage.setItem('user_name', freshUser.name);
                    if (freshUser.user_code) localStorage.setItem('user_code', freshUser.user_code);
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

                const sData = sharedData?.data || (Array.isArray(sharedData) ? sharedData : []);
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

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files, type);
        }
    };

    const handleFiles = (files, type) => {
        let validFiles = [];
        const MAX_SIZE = 1000 * 1024 * 1024 * 1024; 

        if (type === 'rgb') {
            validFiles = Array.from(files).filter(file => {
                const isImage = file.type.startsWith('image/') &&
                    (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg');
                const isWithinSize = file.size <= MAX_SIZE;
                return isImage && isWithinSize;
            });
        } else {
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

        if (rgbFiles.length === 0) {
            setUploadStatus({ type: "error", message: "A Drone Image is mandatory to proceed." });
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
            
            setExcelData(null);
            
            if (filename.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const firstSheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[firstSheetName];
                            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                            setExcelData(jsonData);
                        } catch (parseErr) {
                            console.error("Error parsing spreadsheet:", parseErr);
                            setExcelData([["Error displaying data. Check file format."]]);
                        }
                    };
                    reader.readAsArrayBuffer(blob);
                } catch (readerErr) {
                    console.error("FileReader error:", readerErr);
                }
            }
            
            setShowViewModal(true);

            if (!filename.toLowerCase().endsWith('.pdf')) {
                setPdfReady(true);
            } else {
                setPdfReady(false);
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

    const handleReviewClick = async (pdf) => {
        setSelectedPdfForReview(pdf);
        setReviewText("");
        setShowReviewModal(true);

        try {
            const existingReview = await authAPI.getMyReportReview(pdf.pdf_id);
            if (existingReview.data) {
                if (existingReview.data.status === 'pending') {
                    setReviewText(existingReview.data.user_feedback);
                }
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

    const handleContactChange = (e) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactSubmitting(true);
        setContactStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${API_URL}/contacts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send message');
            }

            setContactStatus({
                type: 'success',
                message: 'Thank you! Your message has been sent successfully.'
            });

            setContactForm({ first_name: "", last_name: "", email: "", message: "" });
            
            setTimeout(() => {
                setContactStatus({ type: '', message: '' });
            }, 2000);
        } catch (error) {
            setContactStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setContactSubmitting(false);
        }
    };

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        
        // Reset thermal fields if company type changes from Drone Service Provider
        if (name === "companyType" && value !== "Drone Service Provider") {
            setBookingFormData(prev => ({
                ...prev,
                companyType: value,
                flightAltitude: "",
                humidity: "",
                emissivity: "",
                ambientTemperature: "",
                reflectedTemperature: "",
                droneType: "",
                irradiance: ""
            }));
            return;
        }

        setBookingFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSolarCapacityReset = () => {
        setBookingFormData(prev => ({ ...prev, solarCapacity: "", otherSolarCapacity: "" }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingSubmitting(true);
        setBookingStatus({ type: 'info', message: 'Processing request...' });

        const token = localStorage.getItem("auth_token") || localStorage.getItem('token');

        try {
            const payload = {
                name: user?.name || `${bookingFormData.firstName} ${bookingFormData.lastName}`,
                email: user?.email || bookingFormData.workEmail,
                contact_phone: bookingFormData.phone,
                location: bookingFormData.siteAddress,
                service_type: bookingFormData.companyType,
                company_name: bookingFormData.companyName,
                system_size: bookingFormData.solarCapacity === "Other" ? bookingFormData.otherSolarCapacity : bookingFormData.solarCapacity,
                area_size: bookingFormData.areaSize,
                project_name: bookingFormData.projectName,
                inspection_purpose: bookingFormData.inspectionPurpose,
                date: bookingFormData.flightDate,
                time: bookingFormData.flightTime,
                coordinates: { lat: bookingFormData.latitude, lng: bookingFormData.longitude },
                flight: { date: bookingFormData.flightDate, time: bookingFormData.flightTime, altitude: bookingFormData.altitude },
                thermal: bookingFormData.companyType === "Drone Service Provider" ? {
                    flight_altitude: bookingFormData.flightAltitude,
                    humidity: bookingFormData.humidity,
                    emissivity: bookingFormData.emissivity,
                    ambient_temperature: bookingFormData.ambientTemperature,
                    reflected_temperature: bookingFormData.reflectedTemperature,
                    drone_type: bookingFormData.droneType,
                    irradiance: bookingFormData.irradiance
                } : null,
                notes: bookingFormData.additionalInfo
            };

            const response = await fetch(`${API_URL}/bookings/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Booking failed. Please check your data.');

            setBookingStatus({ type: 'success', message: 'Success! Your booking request has been received.' });
            setBookingFormData({
                firstName: "", lastName: "", workEmail: "", phone: "", companyName: "",
                companyType: "", areaSize: "", projectName: "", inspectionPurpose: "",
                solarCapacity: "", otherSolarCapacity: "", siteAddress: "", latitude: "",
                longitude: "", airspaceType: "", flightDate: "", flightTime: "",
                altitude: "", additionalInfo: "", flightAltitude: "", humidity: "",
                emissivity: "", ambientTemperature: "", reflectedTemperature: "",
                droneType: "", irradiance: ""
            });
            await fetchProfileData();

            setTimeout(() => {
                setBookingStatus({ type: '', message: '' });
            }, 2000);
        } catch (error) {
            setBookingStatus({ type: 'error', message: error.message });
        } finally {
            setBookingSubmitting(false);
        }
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

    const getFileIcon = (filename) => {
        const ext = filename?.toLowerCase().split('.').pop();
        switch (ext) {
            case 'pdf':
                return {
                    icon: <FileText size={24} className="text-red-500" />,
                    bg: 'bg-red-50',
                    border: 'border-red-100'
                };
            case 'html':
            case 'htm':
                return {
                    icon: <Globe size={24} className="text-blue-500" />,
                    bg: 'bg-blue-50',
                    border: 'border-blue-100'
                };
            case 'xlsx':
            case 'xls':
            case 'csv':
                return {
                    icon: <BarChart3 size={24} className="text-emerald-500" />,
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100'
                };
            case 'kml':
            case 'kmz':
                return {
                    icon: <MapPin size={24} className="text-purple-500" />,
                    bg: 'bg-purple-50',
                    border: 'border-purple-100'
                };
            default:
                return {
                    icon: <LucideFile size={24} className="text-slate-500" />,
                    bg: 'bg-slate-50',
                    border: 'border-slate-100'
                };
        }
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

    const navigationItems = [
        { id: 'dashboard', label: 'Profile', icon: <User size={20} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar size={20} /> },
        ...(userRole === "Drone Service Provider" ? [{ id: 'upload', label: 'Upload Data', icon: <CloudUpload size={20} /> }] : []),
        { id: 'contact', label: 'Support', icon: <Contact2 size={20} /> },
    ];

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Row: User Profile & Quick Info */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3912982/pexels-photo-3912982.jpeg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 border-4 border-white/20 flex items-center justify-center text-4xl font-black text-white shadow-2xl shrink-0">
                            {getUserInitials(user?.name)}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome, {user?.name}!</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                                    <Mail size={16} className="text-orange-500" />
                                    <span className="text-xs font-bold text-slate-300">{user?.email}</span>
                                </div>
                                <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all backdrop-blur-md" onClick={() => navigator.clipboard.writeText(user?.user_code)}>
                                    <ShieldCheck size={16} className="text-orange-500" />
                                    <span className="text-xs font-bold text-slate-300 tracking-wider">ID: {user?.user_code}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: stats.total_pdfs, icon: <FileText size={20} />, color: 'orange' },
                    { label: 'Total Bookings', value: stats.total_bookings, icon: <ClipboardList size={20} />, color: 'blue' },
                    { label: 'Completed Audits', value: bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length, icon: <CheckCircle2 size={20} />, color: 'emerald' },
                    { label: 'Data Usage', value: `${stats.total_size} MB`, icon: <Database size={20} />, color: 'purple' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-4 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <History size={20} className="text-orange-500" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{booking.service_type || 'General Inquiry'}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{formatDate(booking.date)}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                        {bookings.length === 0 && <p className="text-center text-slate-400 py-10 font-medium">No recent activity</p>}
                        <button onClick={() => setActiveSection('bookings')} className="w-full py-4 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest border-t border-slate-100 mt-2">
                            View Full History
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-xl shadow-orange-100">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Need an Audit?</h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">Schedule a professional drone inspection for your solar asset today.</p>
                    <button 
                        onClick={() => setActiveSection('bookings')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest"
                    >
                        Book Inspection
                    </button>
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Inspection Reports</h2>
                        <p className="text-sm text-slate-400 font-medium tracking-wide">Secure access to your analyzed solar data</p>
                    </div>
                </div>
                
                <ContentProtection isProtected={true}>
                    <div className="space-y-4">
                        {pdfs.length > 0 ? (
                            pdfs.map((pdf) => {
                                const fileMeta = getFileIcon(pdf.filename);
                                return (
                                    <div key={pdf.pdf_id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all bg-white group gap-4 ${
                                        pdf.is_sample_report
                                            ? 'border-orange-100 bg-orange-50/30 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/30'
                                            : 'border-slate-100 hover:border-orange-200 hover:shadow-lg hover:shadow-slate-200/20'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${fileMeta.bg} rounded-xl flex items-center justify-center shadow-sm border ${fileMeta.border} shrink-0`}>
                                                {fileMeta.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900 text-sm truncate" title={pdf.filename}>{truncateFilename(pdf.filename)}</h4>
                                                    {pdf.is_sample_report && (
                                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 flex items-center gap-1">
                                                            ★ SAMPLE
                                                        </span>
                                                    )}
                                                    {pdf.report_type && !pdf.is_sample_report && (
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${pdf.report_type === 'rgb' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {pdf.report_type === 'rgb' ? 'DRONE DATA' : 'SITE PLAN'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                    <span>{formatDate(pdf.uploaded_at)}</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                    <span>{formatFileSize(pdf.file_size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!pdf.is_sample_report && (
                                                <>
                                                    <button onClick={() => handleShareClick(pdf)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Share Report">
                                                        <Share2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleReviewClick(pdf)} className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Request Changes">
                                                        <MessageSquarePlus size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDownloadClick(pdf)} className="ml-2 px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                                                <Eye size={16} />
                                                Visualize
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                    <Folder size={32} />
                                </div>
                                <h4 className="text-slate-900 font-bold mb-2">No Reports Found</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Your inspection reports will appear here once analysis is complete.</p>
                            </div>
                        )}
                    </div>

                    {sharedWithMe.length > 0 && (
                        <div className="mt-12 pt-12 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Users size={20} className="text-blue-600" />
                                Shared with Me
                            </h3>
                            <div className="space-y-4">
                                {sharedWithMe.map((shared, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 border border-slate-100 shadow-sm">
                                                <FileText size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{shared.filename}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">From: {shared.sender_name || shared.sender_email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDownloadClick({ pdf_id: shared.pdf_id, filename: shared.filename })} className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                            <Eye size={16} />
                                            Visualize
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ContentProtection>
            </div>
        </div>
    );

    const renderBookings = () => {
        const inspectionPurposes = ["Thermal Imaging", "Visual Inspection", "Maintenance Audit", "System Performance Analysis", "Fault Detection", "Construction Progress"];
        const companyTypes = ["Asset Owner", "EPC Contractor", "O&M Team", "Operation & Management", "Drone Service Provider", "Other"];
        const solarCapacities = ["Less than 1 MW", "1-10 MW", "10-50 MW", "50-100 MW", "100-500 MW", "500+ MW", "Others"];
        const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white";
        const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 group-focus-within:text-orange-600 transition-colors";

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inspection Deployment Form</h2>
                                <p className="text-slate-500 font-medium mt-1">Aviation-grade compliance and technical specification request.</p>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm shrink-0">
                                <ShieldCheck size={16} /> Secure Aviation Sync
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="p-8 md:p-12 space-y-12">
                        {bookingStatus.message && (
                            <div className={`p-6 rounded-3xl font-bold flex items-center gap-4 border ${
                                bookingStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                bookingStatus.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {bookingSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                                <span className="text-sm">{bookingStatus.message}</span>
                            </div>
                        )}

                        {/* Section 1: Contact Info */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 text-orange-600">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Stakeholder Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="group"><label className={labelClass}>First Name*</label><input name="firstName" required value={bookingFormData.firstName} onChange={handleBookingChange} className={inputClass} placeholder="Jane" /></div>
                                <div className="group"><label className={labelClass}>Last Name*</label><input name="lastName" required value={bookingFormData.lastName} onChange={handleBookingChange} className={inputClass} placeholder="Doe" /></div>
                                <div className="group"><label className={labelClass}>Work Email*</label><input name="workEmail" type="email" required value={bookingFormData.workEmail} onChange={handleBookingChange} className={inputClass} placeholder="jane@company.com" /></div>
                                <div className="group"><label className={labelClass}>Phone Number*</label><input name="phone" type="tel" required value={bookingFormData.phone} onChange={handleBookingChange} className={inputClass} placeholder="+1 (555) 000-0000" /></div>
                                <div className="group"><label className={labelClass}>Company Name*</label><input name="companyName" required value={bookingFormData.companyName} onChange={handleBookingChange} className={inputClass} placeholder="SolarMark Industries" /></div>
                                <div className="group"><label className={labelClass}>GST Number (Optional)</label><input name="gstNumber" value={bookingFormData.gstNumber} onChange={handleBookingChange} className={inputClass} placeholder="22AAAAA0000A1Z5" /></div>
                                <div className="group">
                                    <label className={labelClass}>Stakeholder Role*</label>
                                    <select name="companyType" required value={bookingFormData.companyType} onChange={handleBookingChange} className={inputClass}>
                                        <option value="">Select Role</option>
                                        {companyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Drone Service Provider Specific Section */}
                        {bookingFormData.companyType === "Drone Service Provider" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-orange-600">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                        <Zap size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Technical Flight Parameters</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="group"><label className={labelClass}>Flight Altitude (m)*</label><input name="flightAltitude" required value={bookingFormData.flightAltitude} onChange={handleBookingChange} className={inputClass} placeholder="e.g. 50" /></div>
                                    <div className="group"><label className={labelClass}>Humidity (%)*</label><input name="humidity" required value={bookingFormData.humidity} onChange={handleBookingChange} className={inputClass} placeholder="e.g. 45" /></div>
                                    <div className="group"><label className={labelClass}>Emissivity (0-1)*</label><input name="emissivity" required value={bookingFormData.emissivity} onChange={handleBookingChange} className={inputClass} placeholder="e.g. 0.95" /></div>
                                    <div className="group"><label className={labelClass}>Reflected Temp (°C)*</label><input name="reflectedTemperature" required value={bookingFormData.reflectedTemperature} onChange={handleBookingChange} className={inputClass} placeholder="25" /></div>
                                    <div className="group"><label className={labelClass}>Ambient Temp (°C)*</label><input name="ambientTemperature" required value={bookingFormData.ambientTemperature} onChange={handleBookingChange} className={inputClass} placeholder="25" /></div>
                                    <div className="group"><label className={labelClass}>Drone Model*</label><input name="droneType" required value={bookingFormData.droneType} onChange={handleBookingChange} className={inputClass} placeholder="e.g. DJI M30T" /></div>
                                    <div className="group md:col-span-2"><label className={labelClass}>Irradiance (W/m²)*</label><input name="irradiance" required value={bookingFormData.irradiance} onChange={handleBookingChange} className={inputClass} placeholder="e.g. 600" /></div>
                                </div>
                            </motion.div>
                        )}

                        {/* Section 2: Project Details */}
                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-orange-600">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Project Specifications</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group"><label className={labelClass}>Project Name*</label><input name="projectName" required value={bookingFormData.projectName} onChange={handleBookingChange} className={inputClass} placeholder="Sahara Site Alpha" /></div>
                                <div className="group">
                                    <label className={labelClass}>Inspection Purpose*</label>
                                    <select name="inspectionPurpose" required value={bookingFormData.inspectionPurpose} onChange={handleBookingChange} className={inputClass}>
                                        <option value="">Select Purpose</option>
                                        {inspectionPurposes.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="group">
                                    <label className={labelClass}>Solar Capacity*</label>
                                    {bookingFormData.solarCapacity === "Others" ? (
                                        <div className="relative group/field translate-y-0.5">
                                            <input 
                                                name="otherSolarCapacity" 
                                                required 
                                                value={bookingFormData.otherSolarCapacity} 
                                                onChange={handleBookingChange} 
                                                className={inputClass + " border-orange-500 bg-orange-50/10 focus:ring-orange-500/20 pr-14"} 
                                                placeholder="Enter specific capacity (e.g. 750 MW)" 
                                                autoFocus 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleSolarCapacityReset} 
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                                                title="Choose from list"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ) : (
                                        <select 
                                            name="solarCapacity" 
                                            required 
                                            value={bookingFormData.solarCapacity} 
                                            onChange={handleBookingChange} 
                                            className={inputClass}
                                        >
                                            <option value="">Select Capacity</option>
                                            {solarCapacities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="group"><label className={labelClass}>Area Size (Acres/MW)*</label><input name="areaSize" required value={bookingFormData.areaSize} onChange={handleBookingChange} placeholder="e.g. 50 Acres" className={inputClass} /></div>
                                <div className="group"><label className={labelClass}>Preferred Date*</label><input name="flightDate" type="date" required value={bookingFormData.flightDate} onChange={handleBookingChange} className={inputClass} /></div>
                                <div className="group"><label className={labelClass}>Preferred Time*</label><input name="flightTime" type="time" required value={bookingFormData.flightTime} onChange={handleBookingChange} className={inputClass} /></div>
                                <div className="col-span-full group"><label className={labelClass}>Site Location / Address*</label><input name="siteAddress" required value={bookingFormData.siteAddress} onChange={handleBookingChange} className={inputClass} placeholder="Full facility address or GPS coordinates" /></div>
                            </div>
                        </div>

                        {/* Section 6: Instructions */}
                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-orange-600">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                    <Activity size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Site Safety & Instructions</h3>
                            </div>
                            <div className="group px-1 pt-2">
                                <label className={labelClass}>Special Instructions / Site Hazards</label>
                                <textarea name="additionalInfo" rows="4" value={bookingFormData.additionalInfo} onChange={handleBookingChange} className={inputClass + " resize-none"} placeholder="Detail any site obstacles, avian patterns, or specific fault tracking requirements..."></textarea>
                            </div>
                        </div>

                        {/* Final Submit */}
                        <div className="pt-12 border-t border-slate-100">
                            <button type="submit" disabled={bookingSubmitting} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-950/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50 uppercase tracking-[0.2em] group">
                                {bookingSubmitting ? <Loader2 className="animate-spin" /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                Submit Deployment Request
                            </button>
                            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                                <Shield size={14} className="text-emerald-500" /> Compliant with local Aviation Authority (CAA/DGCA) standards
                            </p>
                        </div>
                    </form>
                </div>

                {/* Booking History */}
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-8 md:p-12">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Booking History</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time status tracking</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest shadow-sm">{bookings.length} Total Records</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(() => {
                            const indexOfLastBooking = bookingCurrentPage * bookingsPerPage;
                            const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
                            const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
                            const totalBookingPages = Math.ceil(bookings.length / bookingsPerPage);

                            return (
                                <>
                                    {currentBookings.map((booking) => (
                            <div key={booking.id} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-white hover:shadow-2xl hover:shadow-orange-950/5 transition-all group relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
                                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        booking.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        booking.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {booking.status}
                                    </div>
                                    <button onClick={() => handleDeleteBooking(booking.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Discard Request">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">{booking.service_type || 'General Inspection'}</h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{booking.company_name || 'Individual Requester'}</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-orange-500 shadow-sm"><Calendar size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Deployment Date</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{formatDate(booking.date)} {booking.time ? `@ ${booking.time}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm"><MapPin size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Site Coordinate</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{booking.location || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {bookings.length === 0 && (
                            <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6 border border-slate-100 shadow-inner">
                                    <Calendar size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-950 mb-2">No Active Deployments</h4>
                                <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">Your scheduled aviation inspections will appear here for management once initiated.</p>
                            </div>
                        )}

                        {totalBookingPages > 1 && (
                            <div className="col-span-full flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => setBookingCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={bookingCurrentPage === 1}
                                    className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all font-bold"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-2">
                                    {[...Array(totalBookingPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            type="button"
                                            onClick={() => setBookingCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                                bookingCurrentPage === i + 1 
                                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20' 
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setBookingCurrentPage(prev => Math.min(prev + 1, totalBookingPages))}
                                    disabled={bookingCurrentPage === totalBookingPages}
                                    className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all font-bold"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}
        </div>
                </div>
            </div>
        );
    };

    const renderContact = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-8">Contact Information</h3>
                        <div className="space-y-8">
                            {[
                                { icon: <Mail size={20} />, title: 'Email Support', detail: 'support@solarmark.in' },
                                { icon: <Phone size={20} />, title: 'Inquiry Line', detail: '+91 9150739434' },
                                { icon: <MapPin size={20} />, title: 'HQ Office', detail: 'Tamil Nadu, India' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</p>
                                        <p className="text-sm font-bold text-slate-800">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                        <h4 className="text-lg font-bold mb-4 relative z-10">24/7 Digital Support</h4>
                        <p className="text-slate-400 text-sm leading-relaxed relative z-10 font-medium">Our technical team is available to assist with data resolution and flight compliance.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Send us a Message</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                        {contactStatus.message && (
                            <div className={`p-4 rounded-xl text-sm font-bold ${contactStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {contactStatus.message}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                <input name="first_name" required value={contactForm.first_name} onChange={handleContactChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Jane" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                <input name="last_name" required value={contactForm.last_name} onChange={handleContactChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email address</label>
                            <input name="email" type="email" required value={contactForm.email} onChange={handleContactChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                            <textarea name="message" required rows="5" value={contactForm.message} onChange={handleContactChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none" placeholder="How can we help you?" />
                        </div>
                        <button 
                            type="submit" 
                            disabled={contactSubmitting}
                            className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {contactSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderUpload = () => (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="relative overflow-hidden bg-white rounded-[3rem] border border-slate-100 shadow-2xl min-h-[600px] flex flex-col lg:flex-row">
                {/* Visual Accent Layer */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 pointer-events-none opacity-50" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                {/* Left Side: Interaction Zone */}
                <div className="flex-1 p-10 lg:p-16 relative z-10 flex flex-col">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-0.5 w-12 bg-orange-600 rounded-full" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Data Ingestion Portal</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 leading-none uppercase mb-6">
                            Upload to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Cloud</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                            Aviation-grade synchronization for drone service providers. Upload technical maps and site boundary vectors for analysis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* RGB Ingestion Card */}
                        <div className="group relative">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, 'rgb')} 
                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            />
                            <div className={`h-full p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-5 bg-white shadow-sm group-hover:shadow-xl group-hover:shadow-orange-100/50 ${rgbFiles.length > 0 ? 'border-orange-500 bg-orange-50/20' : 'border-slate-100 group-hover:border-orange-200'}`}>
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${rgbFiles.length > 0 ? 'bg-orange-600 text-white shadow-2xl shadow-orange-500/30' : 'bg-slate-50 text-slate-400 shadow-inner'}`}>
                                    <Camera size={32} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-orange-600 transition-colors">Drone Image</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">JPEG, PNG, WEBP</p>
                                </div>
                                {rgbFiles.length > 0 ? (
                                    <div className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest animate-bounce">
                                        {rgbFiles.length} ASSETS READY
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <Plus size={16} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vector Ingestion Card */}
                        <div className="group relative">
                            <input 
                                type="file" 
                                multiple 
                                accept=".kml" 
                                onChange={(e) => handleFileChange(e, 'thermal')} 
                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            />
                            <div className={`h-full p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-5 bg-white shadow-sm group-hover:shadow-xl group-hover:shadow-blue-100/50 ${thermalFiles.length > 0 ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 group-hover:border-blue-200'}`}>
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${thermalFiles.length > 0 ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30' : 'bg-slate-50 text-slate-400 shadow-inner'}`}>
                                    <Globe size={32} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Site Plan</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">KML VECTOR DATA</p>
                                </div>
                                {thermalFiles.length > 0 ? (
                                    <div className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest animate-bounce">
                                        {thermalFiles.length} VECTORS LOADED
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <Plus size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-50 flex justify-center">
                        <button 
                            onClick={() => (rgbFiles.length > 0 || thermalFiles.length > 0) && setShowUploadModal(true)}
                            disabled={rgbFiles.length === 0}
                            className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-900/40 hover:bg-orange-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:pointer-events-none flex items-center gap-5"
                        >
                            <CloudUpload size={24} />
                            Ground Control Sync
                        </button>
                    </div>
                </div>

                {/* Right Side: Deployment Protocol */}
                <div className="lg:w-[400px] bg-slate-900 p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent pointer-events-none" />
                    
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                                <Terminal size={20} />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Upload Protocol</h3>
                        </div>

                        <div className="space-y-10">
                            {[
                                { title: 'Security', desc: 'Encrypted transfer to Google Cloud', icon: <ShieldCheck size={18} /> },
                                { title: 'Formats', desc: 'JPEG/PNG for maps, KML for bounds', icon: <Database size={18} /> },
                                { title: 'Capacity', desc: 'Up to 1000 GB per sync session', icon: <HardDrive size={18} /> },
                                { title: 'Sync', desc: 'Real-time ingestion to Drive', icon: <RefreshCw size={18} /> }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/30 group-hover:text-orange-500 group-hover:border-orange-500/50 transition-all shrink-0">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-orange-400 transition-colors uppercase">{step.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md mt-12">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                            By initiating sync, you confirm compliance with <span className="text-white">Aviation Data Sovereignty</span> protocols.
                        </p>
                    </div>
                </div>
             </div>
        </div>
    );

    return (
        <ContentProtection>
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {/* Full Width Top Navbar */}
                <header className="h-20 bg-white shadow-sm border-b border-slate-100 flex items-center justify-between px-10 fixed top-0 w-full z-[90] backdrop-blur-md bg-white/80">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
                            <img 
                                src="/solar_mark_logo.svg" 
                                alt="SolarMark Logo" 
                                className="h-8 w-auto group-hover:scale-105 transition-transform"
                            />
                        </div>

                        <div className="h-6 w-px bg-slate-200" />

                        <div className="flex items-center gap-2">
                            <span className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] bg-orange-100 px-3 py-1.5 rounded-xl text-orange-600 border border-orange-200 shadow-sm">
                                {navigationItems.find(i => i.id === activeSection)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {user?.user_code && (
                             <div 
                                onClick={() => navigator.clipboard?.writeText(user.user_code)}
                                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all flex items-center gap-2"
                             >
                                <ShieldCheck size={14} className="text-orange-500" />
                                ID: {user.user_code}
                             </div>
                        )}
                        <div className="h-8 w-px bg-slate-100"></div>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 pt-20">
                    {/* Sidebar below header */}
                    <aside className="w-72 bg-slate-950 flex flex-col fixed h-[calc(100vh-80px)] top-20 z-[80] transition-all duration-300">
                        <div className="p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar pt-10">
                            <div className="space-y-2">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                                            activeSection === item.id 
                                            ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/30' 
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logout Button at Bottom */}
                        <div className="p-8 border-t border-white/5">
                            <button 
                                onClick={handleLogout}
                                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 ml-72 min-h-screen">
                        <div className="p-10 max-w-[1600px] mx-auto">

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between"
                            >
                                <div className="flex items-center text-red-600 font-bold text-sm">
                                    <AlertCircle className="w-5 h-5 mr-3" />
                                    {error}
                                </div>
                                <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}

                        {activeSection === 'dashboard' && renderDashboard()}
                        {activeSection === 'reports' && renderReports()}
                        {activeSection === 'bookings' && renderBookings()}
                        {activeSection === 'upload' && renderUpload()}
                        {activeSection === 'contact' && renderContact()}
                    </div>
                </main>

                <AnimatePresence>
                    {showViewModal && viewingBlob && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${getFileIcon(selectedPdf?.filename).bg} rounded-2xl flex items-center justify-center shadow-sm border ${getFileIcon(selectedPdf?.filename).border}`}>
                                            {getFileIcon(selectedPdf?.filename).icon}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 truncate max-w-[300px]" title={selectedPdf?.filename}>
                                                {selectedPdf?.filename}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inspection Report Visualization</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!selectedPdf?.is_sample_report && (
                                            <a 
                                                href={viewingBlob} 
                                                download={selectedPdf?.filename}
                                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all text-xs font-bold"
                                                title="Download Original"
                                            >
                                                <Download size={16} />
                                                Download
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => { setShowViewModal(false); setViewingBlob(null); }}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar">
                                    {selectedPdf?.filename.toLowerCase().endsWith('.pdf') ? (
                                        <div className="p-4 md:p-12 flex justify-center">
                                            <Document
                                                file={viewingBlob}
                                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                                loading={
                                                    <div className="flex flex-col items-center py-20">
                                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rendering PDF Matrix...</p>
                                                    </div>
                                                }
                                                className="shadow-2xl rounded-sm overflow-hidden border border-slate-200"
                                            >
                                                {Array.from(new Array(numPages), (el, index) => (
                                                    <Page 
                                                        key={`page_${index + 1}`} 
                                                        pageNumber={index + 1} 
                                                        width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 1000) : 800}
                                                        className="mb-8 last:mb-0"
                                                        renderAnnotationLayer={false}
                                                        renderTextLayer={false}
                                                        loading={<div className="h-[600px] bg-white animate-pulse" />}
                                                    />
                                                ))}
                                            </Document>
                                        </div>
                                    ) : selectedPdf?.filename.toLowerCase().match(/\.(xlsx|xls|csv)$/) ? (
                                        <div className="p-4 md:p-8">
                                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left text-slate-500">
                                                        <thead className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                                                            <tr>
                                                                {excelData && excelData[0] && excelData[0].map((header, i) => (
                                                                    <th key={i} className="px-6 py-5 whitespace-nowrap">{header}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {excelData && excelData.slice(1).map((row, i) => (
                                                                <tr key={i} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                                    {row.map((cell, j) => (
                                                                        <td key={j} className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{cell || '-'}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {(!excelData || excelData.length <= 1) && (
                                                    <div className="py-20 text-center">
                                                        <p className="text-slate-400 font-medium">No data points recovered from spreadsheet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : selectedPdf?.filename.toLowerCase().endsWith('.html') || selectedPdf?.filename.toLowerCase().endsWith('.htm') ? (
                                        <iframe src={viewingBlob} className="w-full h-full border-none bg-white" title="HTML Visualization" />
                                    ) : selectedPdf?.filename.toLowerCase().match(/\.(kml|kmz)$/) ? (
                                        <div className="w-full h-full min-h-[600px] outline-none">
                                            <KmlViewer kmlUrl={viewingBlob} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-200 mb-6">
                                                <AlertTriangle size={40} />
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">Interface Incompatible</h4>
                                            <p className="text-slate-500 text-sm max-w-sm mb-8">This file format requires local visualization or a specialized viewer. Please download the file to proceed.</p>
                                            <a 
                                                href={viewingBlob} 
                                                download={selectedPdf?.filename}
                                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl"
                                            >
                                                Download Asset
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showReviewModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                            <MessageSquarePlus size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Request Changes</h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Report Analysis Feedback</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Asset</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{selectedPdfForReview?.filename}</p>
                                    </div>

                                    <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                                        Please describe any discrepancies or specific areas you'd like us to re-analyze. Our technical team will prioritize your request.
                                    </p>

                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="e.g. Please check tower 4 shadow analysis. The vegetation markup seems slightly offset..."
                                        className="w-full h-40 px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none mb-8 placeholder:text-slate-300"
                                    />

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setShowReviewModal(false)}
                                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <button 
                                            onClick={submitReview}
                                            disabled={submittingReview || !reviewText.trim()}
                                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {submittingReview ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showShareModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, scale: 0.9 }}
                                animate={{ scale: 1, opacity: 1, scale: 1 }}
                                exit={{ scale: 0.95, opacity: 0, scale: 0.9 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <div className="p-10">
                                    {shareSuccess ? (
                                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-6">
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Access Granted</h3>
                                            <p className="text-slate-400 font-medium italic">Collaborator has been notified via email.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                                    <Share2 size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">Share Report</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Cross-Team Collaboration</p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">Securely share this analyzed data with your team members or asset stakeholders.</p>

                                            <div className="space-y-1.5 mb-10">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Work Email</label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input 
                                                        type="email"
                                                        value={shareRecipientEmail}
                                                        onChange={(e) => setShareRecipientEmail(e.target.value)}
                                                        placeholder="partner@organization.com"
                                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-700" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => setShowShareModal(false)}
                                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    Abort
                                                </button>
                                                <button 
                                                    onClick={handleConfirmShare}
                                                    disabled={isSharing || !shareRecipientEmail.includes('@')}
                                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
                                                >
                                                    {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    Confirm Access
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <form onSubmit={handleImageUpload} className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                                            <Database size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Finalize Assets</h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ready for Analysis Ingestion</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 mb-10">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Identifier*</label>
                                            <input 
                                                required
                                                value={uploadForm.projectName}
                                                onChange={(e) => setUploadForm({...uploadForm, projectName: e.target.value})}
                                                placeholder="Solar Site - Quadrant A"
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Capacity / Area Size</label>
                                            <input 
                                                value={uploadForm.areaSize}
                                                onChange={(e) => setUploadForm({...uploadForm, areaSize: e.target.value})}
                                                placeholder="25 Megawatts / 100 Acres"
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700" 
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 text-white">
                                             <div className="text-center p-2">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-1">Visuals</p>
                                                <p className="text-xl font-bold text-orange-500">{rgbFiles.length}</p>
                                             </div>
                                             <div className="text-center p-2 border-l border-white/10">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-1">Vectors</p>
                                                <p className="text-xl font-bold text-orange-500">{thermalFiles.length}</p>
                                             </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Modify
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={uploading || !uploadForm.projectName}
                                            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                                            Execute Sync
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </ContentProtection>
    );
}
