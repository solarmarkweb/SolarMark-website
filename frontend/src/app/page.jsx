
"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight, Zap, Shield, Globe, Sun, FileUp, Database, Cloud,
  HardDrive, CheckCircle, User, Mail, Phone, MapPin,
  Settings, MessageSquare, Send, CloudUpload, Activity, Loader2, ShieldCheck, Star, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Wind, BarChart3,
  Plane, Clock,
  Thermometer, ClipboardList, TrendingUp, Eye, Brain, FileText, Calendar, Image, Camera, Upload, X, Grid, List, ExternalLink, Cpu, Layers, Search, FileCheck, Sparkles, Leaf, Award
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import ContentProtection from "@/components/ContentProtection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [rgbFiles, setRgbFiles] = useState([]);
  const [thermalFiles, setThermalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [anomalyTab, setAnomalyTab] = useState('thermal');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState({ rgb: false, thermal: false });
  const [uploadProgress, setUploadProgress] = useState({ rgb: 0, thermal: 0 });
  const [sitePhotos, setSitePhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [homeStats, setHomeStats] = useState([
    { num: "5-20%", label: "Avg. energy loss from undetected faults in typical solar sites" },
    { num: "17+", label: "Distinct fault types detected — thermal and visual — in one pass" },
    { num: "100x", label: "Faster than manual walkdown inspection, with far higher accuracy" },
    { num: "48hr", "label": "From flight to a full GPS-tagged, actionable report per module" }
  ]);

  // Proposal and Offers Modal State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    name: "", email: "", role: "", acres: "", mw: "",
    pmax: "", total_panels: "", cuf: "", tariff: "", specific_yield: ""
  });
  const [offerForm, setOfferForm] = useState({ name: "", email: "", offer_type: "" });
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // New Upload Form Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ projectName: "", areaSize: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    jobTitle: "",
    phone: "",
    country: "",
    companyName: "",
    companyType: "",
    solarCapacity: "",
    otherSolarCapacity: "",
    referralSource: "",
    additionalInfo: ""
  });

  const allServices = [
    {
      name: "Thermography",
      href: "/solutions/operation/thermography",
      icon: Thermometer,
      color: "orange",
      category: "Operation",
      image: "/operation_phase.png",
      desc: "Advanced thermal imaging to pinpoint cellular-level defects and hotspot anomalies."
    },
    {
      name: "Work Management",
      href: "/solutions/operation/work-management",
      icon: ClipboardList,
      color: "blue",
      category: "Operation",
      image: "/ensure_lasting_quality.png",
      desc: "Digitize site operations with real-time field reporting and automated task assignments."
    },
    {
      name: "Asset Management",
      href: "/solutions/operation/asset-management",
      icon: Database,
      color: "emerald",
      category: "Operation",
      image: "/prevent_revenue_loss.png",
      desc: "Comprehensive lifecycle tracking for every PV module and inverter across your portfolio."
    },
    {
      name: "Progress Tracking",
      href: "/solutions/construction/progress-tracking",
      icon: TrendingUp,
      color: "orange",
      category: "Construction",
      image: "/construction_phase.png",
      desc: "High-precision aerial surveys to monitor as-built progress against design milestones."
    },
    {
      name: "Quality Control",
      href: "/solutions/construction/quality-control",
      icon: CheckCircle,
      color: "blue",
      category: "Construction",
      image: "/ensure_lasting_quality.png",
      desc: "Automated QC workflows ensuring compliance with engineering specifications and standards."
    },
    {
      name: "Commissioning",
      href: "/solutions/construction/commissioning",
      icon: Zap,
      color: "emerald",
      category: "Construction",
      image: "/construction_phase.png",
      desc: "Streamlined inspection protocols for rapid and secure site handovers to O&M teams."
    },
    {
      name: "Site Assessment",
      href: "/solutions/planning/site-assessment",
      icon: Globe,
      color: "orange",
      category: "Planning",
      image: "/planning_phase.png",
      desc: "High-resolution topography and shading analysis for optimized plant layout design."
    },
    {
      name: "Drones & Robotics",
      href: "/platform/drones",
      icon: Eye,
      color: "blue",
      category: "Platform",
      image: "/centralized_oversight.png",
      desc: "Integrated fleet management for autonomous aerial and ground-based inspection robotics."
    },
    {
      name: "AI & Analytics",
      href: "/platform/ai-analytics",
      icon: Brain,
      color: "emerald",
      category: "Platform",
      image: "/prevent_revenue_loss.png",
      desc: "ML-driven classification of defects to quantify power loss and prioritize maintenance."
    },
    {
      name: "Forms & Ticketing",
      href: "/platform/forms",
      icon: FileText,
      color: "orange",
      category: "Platform",
      image: "/ensure_lasting_quality.png",
      desc: "Smart mobile forms for consistent structured data collection across all field personnel."
    },
    {
      name: "Integrations",
      href: "/platform/integrations",
      icon: Settings,
      color: "blue",
      category: "Platform",
      image: "/centralized_oversight.png",
      desc: "Seamless data synchronization with existing ERP, SCADA, and CMMS platforms."
    },
  ];

  const companyTypes = [
    "Asset Owner",
    "EPC Contractor",
    "O&M Team",
    "Drone Service Provider",
    "Developer",
    "Other"
  ];

  const solarCapacities = [
    "Less than 1 MW",
    "1-10 MW",
    "10-50 MW",
    "50-100 MW",
    "100-500 MW",
    "500+ MW",
    "Other"
  ];

  const referralSources = [
    "Google Search",
    "LinkedIn",
    "Industry Event",
    "Referral",
    "Social Media",
    "Other"
  ];

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Australia",
    "India",
    "Other"
  ];

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");
    setUserName(name || '');
    setUserRole(role || null);
    if (token && name) {
      setUser({ name, token });
      fetchUserImages();
    }
    fetchSitePhotos();
    fetchHomeStats();
    setIsMounted(true);
  }, []);

  const fetchHomeStats = async () => {
    try {
      const response = await fetch(`${API_URL}/home-stats`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setHomeStats(data);
        }
      }
    } catch (err) {
      console.error('Error fetching home stats:', err);
    }
  };

  const fetchSitePhotos = async () => {
    try {
      setLoadingPhotos(true);
      const response = await fetch(`${API_URL}/site-photos`);
      if (response.ok) {
        const data = await response.json();
        setSitePhotos(data);
      }
    } catch (err) {
      console.error('Error fetching site photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const getDynamicPhoto = (category, defaultImage) => {
    const photo = sitePhotos.find(p => p.category === category);
    if (!photo) return defaultImage;
    const baseUrl = API_URL.split('/api')[0];
    return `${baseUrl}${photo.url}`;
  };

  const fetchUserImages = async () => {
    try {
      setLoadingImages(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/user-images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token may have expired — just skip silently, do not auto-logout
        console.warn('Token may have expired. Please re-login manually if needed.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setUploadedImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    setUser(null);
    router.push('/login');
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, type);
    }
  };

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

  const removeFile = (index, type) => {
    if (type === 'rgb') {
      setRgbFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setThermalFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadRGBImages = async () => {
    if (rgbFiles.length === 0) return;

    const token = localStorage.getItem('auth_token');
    const formData = new FormData();

    rgbFiles.forEach(file => {
      // Rename file to include username
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const newFileName = `${userName}_rgb_${timestamp}.${fileExt}`;

      // Create a new file with the updated name
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
      // Do NOT auto-logout — just notify the user
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

    const token = localStorage.getItem('auth_token');
    const formData = new FormData();

    thermalFiles.forEach(file => {
      // Rename file to include username
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const newFileName = `${userName}_thermal_${timestamp}.${fileExt}`;

      // Create a new file with the updated name
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
      // Do NOT auto-logout — just notify the user
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

      // Upload Drone images if any
      if (rgbFiles.length > 0) {
        setUploadProgress(prev => ({ ...prev, rgb: 0 }));
        rgbResult = await uploadRGBImages();
        totalUploaded += rgbResult?.uploaded_count || rgbFiles.length;
        setUploadProgress(prev => ({ ...prev, rgb: 100 }));
      }

      // Upload Site Plan if any
      if (thermalFiles.length > 0) {
        setUploadProgress(prev => ({ ...prev, thermal: 0 }));
        thermalResult = await uploadThermalImages();
        totalUploaded += thermalResult?.uploaded_count || thermalFiles.length;
        setUploadProgress(prev => ({ ...prev, thermal: 100 }));
      }

      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${totalUploaded} assets to Google Drive!`
      });

      // Auto-clear message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: "", message: "" });
      }, 3000);

      // Clear file lists and modal
      setRgbFiles([]);
      setThermalFiles([]);
      setUploadProgress({ rgb: 0, thermal: 0 });
      setShowUploadModal(false);
      setUploadForm({ projectName: "", areaSize: "" });

      // Refresh images list
      await fetchUserImages();

    } catch (err) {
      console.error("Upload error:", err);
      // Simplified, user-friendly error message so non-technical users aren't confused by API logs
      setUploadStatus({
        type: "error",
        message: "Network Error: Failed to complete the upload. Please check your connection and try again."
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleType = async (type) => {
    if (type === 'rgb' && rgbFiles.length === 0) {
      setUploadStatus({ type: "error", message: "No Drone Images selected." });
      return;
    }
    if (type === 'thermal' && thermalFiles.length === 0) {
      setUploadStatus({ type: "error", message: "No Site Plan selected." });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: "info", message: `Uploading ${type === 'rgb' ? 'Drone Images' : 'Site Plan'} to Google Drive...` });

    try {
      let result;
      if (type === 'rgb') {
        setUploadProgress(prev => ({ ...prev, rgb: 0 }));
        result = await uploadRGBImages();
        setUploadProgress(prev => ({ ...prev, rgb: 100 }));
        setRgbFiles([]);
      } else {
        setUploadProgress(prev => ({ ...prev, thermal: 0 }));
        result = await uploadThermalImages();
        setUploadProgress(prev => ({ ...prev, thermal: 100 }));
        setThermalFiles([]);
      }

      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${result?.uploaded_count || (type === 'rgb' ? rgbFiles.length : thermalFiles.length)} ${type === 'rgb' ? 'RGB' : 'Thermal'} images to Google Drive!`
      });

      // Auto-clear message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: "", message: "" });
      }, 3000);

      setUploadProgress({ rgb: 0, thermal: 0 });
      await fetchUserImages();

    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus({
        type: "error",
        message: err.message || `Failed to upload ${type === 'rgb' ? 'RGB' : 'Thermal'} images to Google Drive.`
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image from Google Drive?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from Google Drive');
      }

      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      setUploadStatus({
        type: "success",
        message: "Image deleted successfully from Google Drive"
      });

      // Auto-clear message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: "", message: "" });
      }, 3000);

    } catch (err) {
      console.error('Error deleting image:', err);
      setUploadStatus({
        type: "error",
        message: "Failed to delete image from Google Drive"
      });
    }
  };

  const openGoogleDriveFolder = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/user-drive-folder`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get Google Drive folder link');
      }

      const data = await response.json();
      if (data.folder_url) {
        window.open(data.folder_url, '_blank');
      }
    } catch (err) {
      console.error('Error opening Google Drive folder:', err);
      setUploadStatus({
        type: "error",
        message: "Failed to open Google Drive folder"
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.workEmail,
        contact_phone: formData.phone,
        location: formData.country,
        service_type: formData.companyType,
        system_size: formData.solarCapacity === "Other" ? formData.otherSolarCapacity : formData.solarCapacity,
        notes: `Job Title: ${formData.jobTitle}\nCompany: ${formData.companyName}\nReferral Source: ${formData.referralSource}\n\nAdditional Info: ${formData.additionalInfo}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };

      const response = await fetch(`${API_URL}/bookings/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit booking');
      }

      setStatus({
        type: 'success',
        message: 'Thank you! Your request has been received. Someone from our team will be in touch with you shortly.'
      });

      // Auto-clear status after 3 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 3000);

      setFormData({
        firstName: "",
        lastName: "",
        workEmail: "",
        jobTitle: "",
        phone: "",
        country: "",
        companyName: "",
        companyType: "",
        solarCapacity: "",
        referralSource: "",
        additionalInfo: ""
      });

    } catch (error) {
      console.error("Error submitting booking:", error);
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const names = proposalForm.name.trim().split(' ');
      const first_name = names[0] || "Client";
      const last_name = names.slice(1).join(' ') || "User";

      const response = await api.post("/contacts/", {
        first_name: first_name,
        last_name: last_name,
        email: proposalForm.email,
        message: `📢 PROPOSAL REQUEST\n\n- Role: ${proposalForm.role}\n- Area: ${proposalForm.acres} Acres\n- Capacity: ${proposalForm.mw} MW\n- Pmax: ${proposalForm.pmax} W\n- Total Panels: ${proposalForm.total_panels}\n- CUF: ${proposalForm.cuf}%\n- Tariff: ${proposalForm.tariff} /KWh\n- Specific Yield: ${proposalForm.specific_yield} kWh/kWp`
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({ type: "success", message: "Proposal request sent successfully!" });
        setTimeout(() => {
          setShowProposalModal(false);
          setProposalForm({
            name: "", email: "", role: "", acres: "", mw: "",
            pmax: "", total_panels: "", cuf: "", tariff: "", specific_yield: ""
          });
          setSubmitStatus({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to send proposal request");
      }
    } catch (err) {
      setSubmitStatus({ type: "error", message: "Failed to send request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const names = offerForm.name.trim().split(' ');
      const first_name = names[0] || "Client";
      const last_name = names.slice(1).join(' ') || "User";

      const response = await api.post("/contacts/", {
        first_name: first_name,
        last_name: last_name,
        email: offerForm.email,
        message: `🎁 CLAIM OFFER: ${offerForm.offer_type}`
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({ type: "success", message: "Offer claimed! Our team will contact you." });
        setTimeout(() => {
          setShowOffersModal(false);
          setOfferForm({ name: "", email: "", offer_type: "" });
          setSubmitStatus({ type: "", message: "" });
        }, 2000);
      } else {
        throw new Error("Failed to claim offer");
      }
    } catch (err) {
      setSubmitStatus({ type: "error", message: "Failed to process request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* NEW DESIGN: SILENT FAILURE (HERO SECTION) */}
      <section className="bg-white py-24 md:py-32 px-6 md:px-12 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
        <div className="max-w-5xl mx-auto w-full relative z-10 text-center flex flex-col items-center mt-12">
          <div className="flex flex-col items-center max-w-4xl">
            {/* Heading */}
            <div className="mb-8 flex flex-col items-center">
              <div className="flex items-center gap-3 text-orange-600 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 font-bold relative">
                <div className="w-8 h-px bg-orange-500"></div> 
                DRONE THERMOGRAPHY • SOLAR INSPECTION 
                <div className="w-8 h-px bg-orange-500"></div>
              </div>

              <div className="relative">
                <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-900 uppercase leading-[1.1] tracking-tight drop-shadow-sm">
                  YOUR PANELS ARE <span className="text-orange-500">FAILING</span><br />
                  <span className="text-transparent text-5xl md:text-6xl lg:text-[5rem]" style={{ WebkitTextStroke: '1.5px rgba(15,23,42,0.8)' }}>SILENTLY</span>
                </h1>
              </div>
            </div>

            {/* Contents & Buttons */}
            <div className="flex flex-col items-center">
              <p className="text-slate-600 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-2xl font-medium">
                <strong className="text-slate-900 font-bold">Hidden faults cost solar operators 5–20% of annual yield —</strong> invisibly, every day. We fly thermal drones over your entire site and pinpoint every anomaly: exactly where it is, what it is, and why it's happening.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                {user ? (
                  <button onClick={() => setShowProposalModal(true)} className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.4)]">
                    REQUEST PROPOSAL <ArrowRight size={16} />
                  </button>
                ) : (
                  <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.4)]">
                    REGISTER NOW <ArrowRight size={16} />
                  </Link>
                )}
                <button onClick={() => {
                  const processSection = document.getElementById('process-section');
                  if (processSection) processSection.scrollIntoView({ behavior: 'smooth' });
                }} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-50 hover:border-orange-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-sm">
                  SEE HOW IT WORKS
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ELEGANT MINIMALIST STATS */}
      <section className="bg-white py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
            {homeStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center md:items-start group">
                <div className="text-[10px] font-black tracking-[0.25em] text-orange-500 uppercase mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  Metric {i + 1}
                </div>
                <div className="text-5xl font-black text-slate-950 tracking-tighter mb-4 leading-none">
                  {stat.num}
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[220px] text-center md:text-left">
                  {stat.label}
                </p>
                
                {/* Minimal underline accent */}
                <div className="hidden md:block w-8 h-[1.5px] bg-slate-100 group-hover:bg-orange-500 transition-colors mt-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW DESIGN: PROBLEM SECTION */}
      <section className="bg-[#fff9f2] py-24 md:py-32 px-4 md:px-8 border-b border-orange-100 overflow-hidden relative">
        <div className="max-w-[85rem] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-16 xl:gap-24 items-center">

            {/* LEFT COLUMN: 2 Cards */}
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-12 relative z-10 w-full">
              {[
                {
                  icon: Thermometer, title: <>Hidden<br />Hotspots</>, desc: "Cell-level heating defects degrade panels and create fire risks — completely invisible from the ground or with visual inspection alone.",
                  gradient: "from-orange-400 to-orange-500", shadow: "shadow-orange-500/20"
                },
                {
                  icon: Zap, title: <>Diode & String<br />Failures</>, desc: "Bypassed substrings and failed bypass diodes silently kill string output. You see the dip in SCADA, but you cannot locate the source.",
                  gradient: "from-cyan-400 to-blue-500", shadow: "shadow-blue-500/20"
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white px-6 py-8 md:p-8 rounded-[1.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-orange-100 relative lg:ml-auto w-full lg:max-w-[340px] flex flex-col items-end text-right z-20 hover:-translate-y-1 transition-transform">

                    {/* DASHED CONNECTOR LINE TO CENTER */}
                    <div className="hidden lg:block absolute top-[50%] -right-8 xl:-right-16 w-8 xl:w-16 border-t-[1.5px] border-dashed border-orange-300 -z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 absolute -right-0.5 top-1/2 -translate-y-1/2"></div>
                      <div className="w-1 h-1 rounded-full bg-orange-300 absolute -left-0.5 top-1/2 -translate-y-1/2"></div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mb-4 flex-row-reverse">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] ${item.shadow} ring-4 ring-white relative z-10`}>
                        <Icon size={28} strokeWidth={2} />
                      </div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight uppercase leading-tight">{item.title}</h3>
                    </div>
                    <p className="text-slate-600 text-[13px] leading-relaxed max-w-[280px]">{item.desc}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* MIDDLE COLUMN: Text Content */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="order-1 lg:order-2 flex flex-col items-center text-center z-10 px-4 lg:px-8 xl:px-12 relative py-12 shrink-0">

              <div className="w-12 h-12 bg-white rounded-full border border-orange-200 flex items-center justify-center mb-6 shadow-xl relative pointer-events-none">
                <div className="absolute inset-0 rounded-full ring-4 ring-orange-200/50 -z-10"></div>
                <Eye className="text-orange-500" size={20} strokeWidth={2.5} />
              </div>

              <div className="text-orange-600 text-[9px] uppercase tracking-[0.2em] font-bold mb-4 font-mono">
                The Problem:
              </div>

              <h2 className="font-black text-4xl lg:text-[3.5rem] xl:text-[4rem] text-slate-900 uppercase leading-[1.0] tracking-tighter drop-shadow-sm">
                The <br />
                <span className="text-orange-500 block py-1">Danger</span>
                You Can't See
              </h2>

            </motion.div>

            {/* RIGHT COLUMN: 2 Cards */}
            <div className="order-3 lg:order-3 space-y-6 lg:space-y-12 relative z-10 w-full">
              {[
                {
                  icon: Layers, title: <>Soiling,<br />Shading & Damage</>, desc: "Soiling gradients, vegetation encroachment, broken glass — these compound daily. Without data, maintenance becomes costly guesswork.",
                  gradient: "from-green-400 to-green-500", shadow: "shadow-green-500/20"
                },
                {
                  icon: MapPin, title: <>No Actionable<br />Location Data</>, desc: "Without GPS-tagged module-level reports, your maintenance team spends hours searching — or skips the problem until its a major fault.",
                  gradient: "from-amber-400 to-yellow-500", shadow: "shadow-yellow-500/20"
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white px-6 py-8 md:p-8 rounded-[1.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-orange-100 relative lg:mr-auto w-full lg:max-w-[340px] flex flex-col items-start text-left z-20 hover:-translate-y-1 transition-transform">

                    {/* DASHED CONNECTOR LINE FROM CENTER */}
                    <div className="hidden lg:block absolute top-[50%] -left-8 xl:-left-16 w-8 xl:w-16 border-t-[1.5px] border-dashed border-orange-300 -z-10">
                      <div className="w-1 h-1 rounded-full bg-orange-300 absolute -right-0.5 top-1/2 -translate-y-1/2"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 absolute -left-0.5 top-1/2 -translate-y-1/2"></div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] ${item.shadow} ring-4 ring-white relative z-10`}>
                        <Icon size={28} strokeWidth={2} />
                      </div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight uppercase leading-tight">{item.title}</h3>
                    </div>
                    <p className="text-slate-600 text-[13px] leading-relaxed max-w-[280px]">{item.desc}</p>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </div>
      </section>

      {/* NEW DESIGN: ANOMALIES DETECTION */}
      <section className="bg-[#f8fafc] py-24 px-6 md:px-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 text-cyan-500 font-mono text-xs uppercase tracking-widest mb-4">
                <div className="w-6 h-px bg-cyan-500"></div> What We Detect
              </div>
              <h2 className="font-black text-3xl md:text-5xl text-slate-900 uppercase leading-none tracking-tight">
                Nothing Missed. <span className="text-orange-500">Everything</span> Mapped.
              </h2>
            </div>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              <button onClick={() => setAnomalyTab("thermal")}
                className={`font-mono text-xs uppercase tracking-wider px-6 py-2 rounded transition-all ${anomalyTab === "thermal" ? "bg-orange-600 text-white font-bold" : "text-slate-500 hover:text-slate-900"}`}>
                Thermal
              </button>
              <button onClick={() => setAnomalyTab("visual")}
                className={`font-mono text-xs uppercase tracking-wider px-6 py-2 rounded transition-all ${anomalyTab === "visual" ? "bg-orange-600 text-white font-bold" : "text-slate-500 hover:text-slate-900"}`}>
                Visual (RGB)
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={anomalyTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(anomalyTab === "thermal" ? [
                { name: "Hotspot", category: "anomaly-hotspot", sev: "h", style: "radial-gradient(circle at 32% 42%, #fffde0 0%, #FFD700 12%, #FF4500 26%, #8B1500 48%, #2d0a00 72%, #120308 100%)" },
                { name: "Multi Hotspot", category: "anomaly-multi-hotspot", sev: "h", style: "radial-gradient(circle at 30% 28%, #FFD700 9%, #FF6B1A 18%, transparent 30%), radial-gradient(circle at 67% 62%, #FFD700 9%, #FF6B1A 18%, transparent 28%), linear-gradient(135deg, #1a0900 0%, #3d1200 50%, #1a0900 100%)" },
                { name: "Bypassed Substring", category: "anomaly-bypassed", sev: "m", style: "linear-gradient(0deg, #a03000 0%, #FF6B1A 28%, #FFAA00 33%, #ffffff 50%, #FF6B1A 72%, #a03000 100%)" },
                { name: "Diode Failure", category: "anomaly-diode", sev: "m", style: "linear-gradient(160deg, #FF8C00 0%, #FF4500 25%, #8B1500 50%, #200600 75%, #080108 100%)" },
                { name: "PID Effect", category: "anomaly-pid", sev: "h", style: "linear-gradient(135deg, #0a0012 0%, #3d0060 45%, #7a00a0 60%, #bb33cc 78%, #ff80ff 100%)" }
              ] : [
                { name: "Soiling", category: "anomaly-soiling", sev: "l", style: "radial-gradient(ellipse at 35% 50%, rgba(200,170,90,0.6) 0%, transparent 55%), linear-gradient(135deg, #1a2035 0%, #4a5580 100%)" },
                { name: "Broken Glass", category: "anomaly-broken-glass", sev: "h", style: "repeating-linear-gradient(-48deg, transparent 0px, transparent 7px, rgba(255,255,255,0.15) 7px, rgba(255,255,255,0.15) 8px), linear-gradient(135deg, #1e2d4a 0%, #2e4a7a 100%)" },
                { name: "Delamination", category: "anomaly-delamination", sev: "m", style: "radial-gradient(ellipse at 38% 40%, rgba(255,255,255,0.2) 0%, transparent 28%), linear-gradient(135deg, #1e2f60 0%, #2a4080 100%)" },
                { name: "Vegetation", category: "anomaly-vegetation", sev: "l", style: "linear-gradient(135deg, #0f2010 0%, #1a4020 40%, #0e5010 65%, #0d2a0a 100%)" },
                { name: "Shadowing", category: "anomaly-shadowing", sev: "m", style: "linear-gradient(135deg, #2a3550 0%, #1a2535 35%, #090f1a 55%, #2a3550 100%)" }
              ]).map((card, i) => {
                const imgUrl = getDynamicPhoto(card.category, null);
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer shadow-sm">
                    <div className="aspect-square relative overflow-hidden bg-slate-100">
                      {loadingPhotos ? (
                        <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                      ) : imgUrl ? (
                        <img src={imgUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" style={{ background: card.style }}></div>
                      )}
                    </div>
                    <div className="p-3 flex justify-between items-center text-xs font-mono uppercase tracking-widest text-slate-700 bg-white">
                      {card.name}
                      <div className={`w-1.5 h-1.5 rounded-full ${card.sev === "h" ? "bg-red-500" : card.sev === "m" ? "bg-orange-500" : "bg-yellow-400"}`}></div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4 text-xs font-mono uppercase tracking-widest text-slate-500">
            <span>Severity:</span>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Moderate</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div> Minor</div>
          </div>
        </div>
      </section>

      {/* NEW DESIGN: THE PROCESS */}
      <section id="process-section" className="bg-[#fff9f2] py-32 px-6 md:px-12 relative overflow-hidden border-b border-orange-100">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-cyan-50/30 blur-3xl rounded-full"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="flex items-center gap-3 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
              <div className="w-12 h-px bg-cyan-500"></div> The Process <div className="w-12 h-px bg-cyan-500"></div>
            </div>
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 uppercase tracking-tight max-w-2xl leading-[1.1]">
              Find. <span className="text-orange-500">Fix.</span> Forget.
            </h2>
          </div>

          <div className="relative">
            {/* TIMELINE CONNECTOR LINE (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px border-t border-dashed border-slate-300 -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { icon: Wind, num: "01", title: "Drone Survey", desc: "Automated thermal and RGB aerial coverage — scanning thousands of modules per hour with calibrated precision across any terrain." },
                { icon: Brain, num: "02", title: "AI Analysis", desc: "Proprietary algorithms cross-reference datasets to classify faults and rank severity with automated root-cause attribution." },
                { icon: BarChart3, num: "03", title: "Actionable Intelligence", desc: "Individual fault location on your site map with probable cause and recommended action — delivered within 48 hours." }
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  className="relative flex flex-col items-center text-center group">
                  
                  {/* ICON CIRCLE */}
                  <div className="w-20 h-20 rounded-full bg-white shadow-[0_15px_35px_-12px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-center text-orange-500 mb-8 relative z-10 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white group-hover:bg-cyan-500 transition-colors">
                      {step.num}
                    </div>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm px-8 py-10 rounded-[2rem] border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] hover:bg-white hover:shadow-[0_40px_70px_-25px_rgba(0,0,0,0.08)] transition-all duration-500 flex-grow w-full">
                    <h3 className="font-extrabold text-xl text-slate-900 uppercase tracking-wider mb-4 leading-tight">{step.title}</h3>
                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium max-w-[280px] mx-auto">{step.desc}</p>
                  </div>
                </motion.div>
              )})}
            </div>
          </div>
        </div>
      </section>

      {/* NEW DESIGN: BENEFITS */}
      <section className="bg-white py-32 px-6 md:px-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col mb-16">
            <div className="flex items-center gap-3 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
              <div className="w-12 h-px bg-cyan-500"></div> Why SolarMark
            </div>
            <h2 className="font-black text-3xl md:text-5xl text-slate-900 uppercase tracking-tight leading-[1.1]">
              Because <span className="text-orange-500">Guessing</span> Costs More
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              { icon: Cpu, title: "Dual-Sensor Diagnosis", desc: "Thermal shows heat. RGB shows cracks. Combined, you know the root cause — not just the symptom. No other inspection delivers this precision." },
              { icon: MapPin, title: "Module-Level Location", desc: "Every fault GPS-tagged and overlaid on your site layout. Your maintenance team walks directly to the right module — no searching, no hours wasted." },
              { icon: TrendingUp, title: "Recover Lost Revenue", desc: "Clients routinely recover 8-15% yield post-inspection. One inspection pays for itself many times over in recovered generation within 12 months." },
              { icon: FileCheck, title: "Warranty and Insurance Ready", desc: "IEC 62446-3 compliant thermal reports for panel warranty claims and insurance documentation. Evidence-grade data to protect your asset." }
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-10 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.06)] transition-all duration-500">
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-500 shrink-0 border border-slate-100 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 uppercase tracking-widest mb-4 leading-tight">{benefit.title}</h3>
                    <p className="text-slate-500 text-sm md:text-[15px] leading-relaxed font-medium">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* NEW DESIGN: CTA */}
      <section className="bg-white py-32 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-3 text-cyan-500 font-mono text-xs uppercase tracking-widest mb-8">
            <div className="w-6 h-px bg-cyan-500"></div> Get Started
          </div>
          <h2 className="font-black text-4xl md:text-7xl text-slate-900 uppercase leading-none tracking-tight mb-8">
            Stop Losing Yield.<br /><span className="text-orange-500">See Your Site Clearly.</span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed">
            Book a free 15-minute assessment. We will tell you exactly what your site needs and what you can expect to find.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link href="/contact"
              className="w-full sm:w-auto px-12 py-5 bg-orange-600 text-white font-black text-lg uppercase tracking-wider rounded-lg shadow-lg shadow-orange-500/30 hover:scale-105 transition-all flex items-center justify-center gap-4">
              Talk to an Expert <ArrowRight size={20} />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {["IEC 62446-3 Compliant", "Same-week availability", "No site too large", "48-hr turnaround"].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-500 font-mono text-xs uppercase tracking-widest font-medium">
                <div className="w-[3px] h-[3px] rounded-full bg-orange-500"></div> {text}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Main Gallery Section - Dynamic */}
      {sitePhotos.filter(p => p.category === 'Main Gallery').length > 0 && (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Project Showcase</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">Site <span className="text-orange-600 uppercase">Gallery</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitePhotos.filter(p => p.category === 'Main Gallery').map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-video rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700"
                >
                  <img
                    src={getDynamicPhoto('Main Gallery', '')} // This doesn't make sense with the filter, let's fix it
                    className="hidden" // Just a dummy to keep the logic if I used getDynamicPhoto wrongly
                  />
                  <img
                    src={`${API_URL.replace('/api', '')}${photo.url}`}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-8 left-8">
                      <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">{photo.title}</h4>
                      <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{photo.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Main Gallery Section */}

      {/* Solutions & Platforms Grid Section */}
      {/* 
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Advanced Ecosystem</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
              The <span className="text-orange-600 italic">Future</span> of Solar
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our full suite of digital twins, automated diagnostics, and infrastructure management tools designed for peak asset performance.
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  const container = document.getElementById('solar-future-scroll');
                  container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white transition-all border border-slate-100"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  const container = document.getElementById('solar-future-scroll');
                  container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white transition-all border border-slate-100"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div
              id="solar-future-scroll"
              className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 scroll-smooth"
            >
              {allServices.map((service, idx) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 80
                  }}
                  onClick={() => {
                    router.push(service.href);
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                  }}
                  className="group relative h-[400px] w-[300px] md:w-[380px] flex-shrink-0 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200 hover:shadow-orange-200/50 transition-all duration-700 snap-center"
                >
                  {(() => {
                    const dynamicPhoto = sitePhotos.find(p => p.category === service.name);
                    const bgImageUrl = dynamicPhoto ? `${API_URL.replace('/api', '')}${dynamicPhoto.url}` : service.image;
                    return (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: `url(${bgImageUrl})` }}
                      ></div>
                    );
                  })()}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent group-hover:via-slate-900/60 transition-all duration-500"></div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                    <div className="mb-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${service.color === 'orange' ? 'bg-orange-600/60' :
                        service.color === 'blue' ? 'bg-blue-600/60' :
                          'bg-emerald-600/60'
                        }`}>
                        <service.icon size={24} />
                      </div>
                    </div>

                    <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                          {service.category}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black uppercase tracking-tight leading-tight group-hover:text-orange-400 transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-sm text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-all duration-700 line-clamp-3">
                        {service.desc}
                      </p>

                      <div className="flex items-center gap-2 pt-2 text-orange-400 font-black text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-700">
                        Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),#ffffff_0%,transparent_100%)]"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Dynamic Services Grid */}
      {/* Inspection Form Section */}
      {user && (
        <section id="inspection-form" className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-[100px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-4 block">Get Help</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight uppercase tracking-tighter">
                  Book Your <br />
                  <span className="text-orange-600">Scan Today</span>
                </h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  Fill out the form to schedule a professional solar scan. Our team will get back to you within 24 hours with a simple plan and price.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, text: "High-Quality Heat Images" },
                    { icon: CheckCircle, text: "Smart Fault Finding" },
                    { icon: CheckCircle, text: "Reports that show your savings" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-slate-700 font-medium">
                      <item.icon className="text-orange-500 w-5 h-5" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
              >
                {status.message && (
                  <div className={`mb-6 p-4 rounded-xl text-center shadow-sm ${status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    <p className="font-bold text-sm tracking-tight flex items-center justify-center gap-2">
                      {status.type === 'success' && <CheckCircle size={18} />}
                      {status.message}
                    </p>
                  </div>
                )}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        First Name*
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>
                  </div>

                  {/* Work Email & Job Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Work Email*
                      </label>
                      <input
                        type="email"
                        name="workEmail"
                        required
                        placeholder="jane@company.com"
                        value={formData.workEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Job Title*
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        required
                        placeholder="Operations Manager"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>
                  </div>

                  {/* Phone Number & Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Country*
                      </label>
                      <div className="relative">
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                        >
                          <option value="">Please Select</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Name & Company Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Company Name*
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        placeholder="SolarMark"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Company Type*
                      </label>
                      <div className="relative">
                        <select
                          name="companyType"
                          required
                          value={formData.companyType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                        >
                          <option value="">Please Select</option>
                          {companyTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solar Capacity & Referral Source */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Solar Capacity*
                      </label>
                      {formData.solarCapacity === "Other" ? (
                        <div className="relative flex items-center">
                          <input
                            name="otherSolarCapacity"
                            required
                            value={formData.otherSolarCapacity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm pr-12 font-medium text-slate-700 group-hover:bg-white"
                            placeholder="Enter capacity (e.g. 750 MW)"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, solarCapacity: "", otherSolarCapacity: "" }))}
                            className="absolute right-4 text-slate-400 hover:text-orange-500 transition-colors"
                            title="Back to options"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            name="solarCapacity"
                            required
                            value={formData.solarCapacity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                          >
                            <option value="">Please Select</option>
                            {solarCapacities.map((capacity) => (
                              <option key={capacity} value={capacity}>{capacity}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                        Referral Source*
                      </label>
                      <div className="relative">
                        <select
                          name="referralSource"
                          required
                          value={formData.referralSource}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
                        >
                          <option value="">Please Select</option>
                          {referralSources.map((source) => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2 group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
                      Additional Information you want to share with us
                    </label>
                    <textarea
                      name="additionalInfo"
                      rows="4"
                      placeholder=""
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 md:py-5 bg-orange-600 text-white rounded-2xl font-bold text-sm md:text-lg shadow-xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin w-6 h-6" />
                          Processing Request...
                        </>
                      ) : (
                        <>
                          Submit Inspection Request
                          <Send size={24} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </section >
      )}
      {/* CTA Section */}
      {
        !user && (
          <section className="py-16 md:py-20 bg-orange-600 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 uppercase tracking-tight">
                Ready to switch to cleaner, cheaper energy?
              </h2>
              <p className="text-orange-100 text-xl mb-10 font-medium italic">
                Join thousands of satisfied homeowners who have already made the switch.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3.5 md:px-10 md:py-5 bg-white text-orange-600 rounded-2xl font-bold text-sm md:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
              >
                Start Your Journey <ArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/3"></div>
          </section>
        )
      }

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowProposalModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[8px] font-black uppercase tracking-widest mb-4">
                    <Sparkles size={10} />
                    Custom Project Assessment
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Request Proposal</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Detailed Analytics for your solar assets</p>
                </div>

                {submitStatus.message && (
                  <div className={`mb-6 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={proposalForm.name}
                      onChange={(e) => setProposalForm({ ...proposalForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Email</label>
                    <input
                      required
                      type="email"
                      value={proposalForm.email}
                      onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Role</label>
                    <select
                      required
                      value={proposalForm.role}
                      onChange={(e) => setProposalForm({ ...proposalForm, role: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      <option value="">Select Role</option>
                      <option value="Asset Owner">Asset Owner</option>
                      <option value="Drone Service Provider">Drone Service Provider</option>
                      <option value="Operation & Management">Operation & Management</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Acres</label>
                      <input
                        required
                        type="number"
                        value={proposalForm.acres}
                        onChange={(e) => setProposalForm({ ...proposalForm, acres: e.target.value })}
                        placeholder="e.g. 50"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity (MW)</label>
                      <input
                        required
                        type="number"
                        value={proposalForm.mw}
                        onChange={(e) => setProposalForm({ ...proposalForm, mw: e.target.value })}
                        placeholder="e.g. 10"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Pmax (W)</label>
                      <input
                        type="number"
                        value={proposalForm.pmax}
                        onChange={(e) => setProposalForm({ ...proposalForm, pmax: e.target.value })}
                        placeholder="e.g. 540"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Panels</label>
                      <input
                        type="number"
                        value={proposalForm.total_panels}
                        onChange={(e) => setProposalForm({ ...proposalForm, total_panels: e.target.value })}
                        placeholder="e.g. 20000"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CUF (%)</label>
                      <input
                        type="text"
                        value={proposalForm.cuf}
                        onChange={(e) => setProposalForm({ ...proposalForm, cuf: e.target.value })}
                        placeholder="18.5"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tariff</label>
                      <input
                        type="text"
                        value={proposalForm.tariff}
                        onChange={(e) => setProposalForm({ ...proposalForm, tariff: e.target.value })}
                        placeholder="4.5"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">S. Yield</label>
                      <input
                        type="text"
                        value={proposalForm.specific_yield}
                        onChange={(e) => setProposalForm({ ...proposalForm, specific_yield: e.target.value })}
                        placeholder="1650"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-slate-200"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Request"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offers Modal */}
      <AnimatePresence>
        {showOffersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowOffersModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Claim Your Offer</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exclusive deals for high-scale solar inspections</p>
                </div>

                {submitStatus.message && (
                  <div className={`mb-6 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={offerForm.name}
                      onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={offerForm.email}
                      onChange={(e) => setOfferForm({ ...offerForm, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Offer</label>
                    <select
                      required
                      value={offerForm.offer_type}
                      onChange={(e) => setOfferForm({ ...offerForm, offer_type: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      <option value="">Select an Offer</option>
                      <option value="First-Time Audit Discount (25%)">First-Time Audit Discount (25%)</option>
                      <option value="Free BESS Health Check">Free BESS Health Check</option>
                      <option value="Multi-Site Bundle (15% OFF)">Multi-Site Bundle (15% OFF)</option>
                    </select>
                  </div>

                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full py-5 bg-orange-600 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-orange-900/20"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Grab My Offer"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Additional Upload Project Details Modal */}
      <AnimatePresence>
        {showUploadModal && userRole === "Drone Service Provider" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="p-8 md:p-12">
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CloudUpload size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Project Details</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Structure your cloud storage efficiently</p>
                </div>

                <form onSubmit={handleImageUpload} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nevada Solar Array 1"
                      value={uploadForm.projectName}
                      onChange={(e) => setUploadForm({ ...uploadForm, projectName: e.target.value })}
                      disabled={uploading}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 disabled:opacity-50"
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
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-slate-900 disabled:opacity-50"
                    />
                  </div>

                  {uploadStatus.message && (
                    <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${uploadStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
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
                      "Upload to Google Drive"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div >
  );
}
