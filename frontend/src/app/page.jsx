
"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight, Zap, Shield, Globe, Sun, FileUp, Database,
  HardDrive, CheckCircle, User, Mail, Phone, MapPin,
  Settings, MessageSquare, Send, CloudUpload, Activity, Loader2, ShieldCheck, Star, ChevronDown, ChevronLeft, ChevronRight,
  Thermometer, ClipboardList, TrendingUp, Eye, Brain, FileText, Calendar, Camera, Upload, X, Grid, List, ExternalLink, Cpu, Layers, Search, FileCheck, Sparkles, Folder, Trash2, Download
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import ContentProtection from "@/components/ContentProtection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [rgbFiles, setRgbFiles] = useState([]);
  const [thermalFiles, setThermalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState({ rgb: false, thermal: false });
  const [uploadProgress, setUploadProgress] = useState({ rgb: 0, thermal: 0 });
  const [sitePhotos, setSitePhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Proposal and Offers Modal State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({ name: "", email: "", role: "", acres: "", mw: "" });
  const [offerForm, setOfferForm] = useState({ name: "", email: "", offer_type: "" });
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

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
    "500+ MW"
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
    setUserName(name || '');
    if (token && name) {
      setUser({ name, token });
      fetchUserImages();
    }
    fetchSitePhotos();
    setIsMounted(true);
  }, []);

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
    return photo ? `${API_URL.replace('/api', '')}${photo.url}` : defaultImage;
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

      // Clear file lists
      setRgbFiles([]);
      setThermalFiles([]);
      setUploadProgress({ rgb: 0, thermal: 0 });

      // Refresh images list
      await fetchUserImages();

    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus({
        type: "error",
        message: err.message || "Failed to upload images to Google Drive. Please try again."
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
        system_size: formData.solarCapacity,
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
        message: `📢 PROPOSAL REQUEST\n\n- Role: ${proposalForm.role}\n- Area: ${proposalForm.acres} Acres\n- Capacity: ${proposalForm.mw} MW`
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({ type: "success", message: "Proposal request sent successfully!" });
        setTimeout(() => {
          setShowProposalModal(false);
          setProposalForm({ name: "", email: "", role: "", acres: "", mw: "" });
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white perspective-1000">
        {/* Advanced Background System */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-50/20"></div>

          {/* 3D Floating Particles */}
          {isMounted && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, i % 2 === 0 ? 50 : -50, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 10 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-200/20 to-blue-200/10 rounded-full blur-[140px]"
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ rotateY: -5, rotateX: 2 }}
              className="lg:col-span-12 xl:col-span-6 text-center lg:text-left transition-all duration-500 preserve-3d"
            >
              <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em] mb-6 border border-orange-200/50">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></div>
                <span>Autonomous Solar Intelligence</span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase leading-[1.1]"
              >
                Expert <span className="text-orange-600 italic">Solar</span> <br />
                <span className="relative">
                  Inspection
                  <motion.span
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 blur-lg bg-orange-500/20 rounded-full -z-10"
                  ></motion.span>
                </span>
                <br />
                Solutions
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-semibold max-w-xl mx-auto lg:mx-0 opacity-80"
              >
                Elevate your asset performance with autonomous drone <br className="hidden md:block" />
                thermography and precision-grade AI defect analytics.
              </motion.p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Request Proposal <ArrowRight size={16} />
                </button>
                <Link
                  href="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm"
                >
                  Tech Specs
                </Link>
              </div>


            </motion.div>

            {/* Right Professional Visual Column */}
            <div className="lg:col-span-12 xl:col-span-6 relative perspective-1000 hidden lg:block py-10">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center">

                {/* 1. Backdrop Coordinate Grid (Enterprise Tech Feel) */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* 2. Main Terminal Hub (Perspective Device) */}
                <motion.div
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{ rotateY: 10, rotateX: -5 }}
                  transition={{ type: "spring", stiffness: 100, damping: 30 }}
                  className="relative z-20 w-[85%] h-[85%] rounded-[2.5rem] bg-slate-900 p-1.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10"
                >
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative">
                    <img
                      src={getDynamicPhoto('Main Hero', '/drone-command-ui.png')}
                      alt="Solar Command Hub"
                      className="w-full h-full object-cover scale-105"
                    />

                    {/* Professional Horizon Scanner */}
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.8)] z-30"
                    ></motion.div>

                    {/* AI Target Reticles (Small Overlay icons) */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute top-1/4 left-1/3 w-16 h-16 border border-orange-500/30 rounded-lg animate-pulse"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border border-blue-500/30 rounded-full animate-ping [animation-duration:3s]"></div>
                    </div>
                  </div>
                </motion.div>

                {/* 3. Data Widget A: Thermal Analysis (Structured UI Look) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 z-30 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                >
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Spectral View</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="p-2">
                    <img src={getDynamicPhoto('Spectral View', '/solar_thermal_scan.png')} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-bold text-slate-800">TEMP_VAR</span>
                      <span className="text-[9px] font-black text-red-600">+12.4°C</span>
                    </div>
                  </div>
                </motion.div>

                {/* 4. Data Widget B: Geospatial Telemetry */}
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-8 -left-8 z-30 w-48 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                    <Globe size={10} className="text-blue-400" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Site Survey</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <img src={getDynamicPhoto('Site Survey', '/agri-drone-survey.png')} className="w-full h-20 object-cover rounded-lg opacity-80" />
                    <div className="space-y-1">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: ["10%", "90%"] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="h-full bg-blue-500"
                        ></motion.div>
                      </div>
                      <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>Scanning...</span>
                        <span>82%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 5. Minimal Telemetry Nodes */}
                <div className="absolute top-[15%] left-[5%] z-40 flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-lg border border-slate-50">
                  <Cpu size={12} className="text-orange-600" />
                  <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Edge Analysis ON</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Image Upload Section */}
      {user && (
        <section id="image-upload-section" className="py-24 bg-white relative overflow-hidden">
          {/* ARCHITECTURAL BACKGROUND SYSTEM */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Drifting Grid */}
            <motion.div 
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"] 
              }}
              transition={{ 
                duration: 60, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
            />
            
            {/* Floating Tech Labels */}
            <div className="absolute inset-0 select-none pointer-events-none opacity-[0.03] font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[10%] left-[20%]">NODE_SYNC_0x12F</motion.div>
              <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-[15%] left-[40%]">RADIOMETRIC_PIPELINE</motion.div>
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[30%] right-[15%]">ENCRYPTION_AES256</motion.div>
            </div>

            {/* Dynamic Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/30 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse duration-[10s]" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] -ml-96 -mb-96 animate-pulse duration-[8s]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-12 xl:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start"
              >
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl shadow-slate-200 border border-slate-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Technical Integration
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-[0.85] italic">
                  Pipeline <br />
                  <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent not-italic">Synchrony</span>
                </h2>
                
                <p className="text-lg text-slate-500 font-bold mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-80 decoration-orange-500/30 underline-offset-8">
                  Direct industrial-grade file ingestion for RGB thermal imagery and geospatial metadata. Real-time organization across the secure Cloud matrix.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                  {[
                    { icon: Camera, label: "Radiometric Data", sub: "Separate RGB & Thermal" },
                    { icon: HardDrive, label: "Cloud Matrix", sub: "Google Drive Persistent" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col p-6 bg-white/40 backdrop-blur-md border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all group duration-500">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all mb-4">
                        <item.icon size={20} />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-12 xl:col-span-7 flex flex-col items-center justify-center py-12"
              >
                {/* LARGE UPLINK TREE STRUCTURE */}
                <div className="relative flex flex-col items-center max-w-md w-full">

                  {/* Central Trunk Line - Thick & Bold */}
                  <div className="absolute top-0 bottom-[80px] w-[2px] bg-slate-200 z-0 border-r border-dashed border-slate-300"></div>

                  {/* Top Entry Node - Larger */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-slate-900/95 flex items-center justify-center mb-12 border-[6px] border-white shadow-[0_0_40px_rgba(15,23,42,0.15)] scale-110">
                    <CloudUpload size={26} className="text-white" />
                  </div>

                  {/* BRANCHES CONTAINER - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-24 relative z-10 w-full mb-16 px-4">

                    {/* Drone Image Branch - Larger Card */}
                    <div className="flex flex-col items-center relative group">
                      {/* Branch Line Left - Only on Desktop */}
                      <div className={`hidden md:block absolute top-[-30px] left-1/2 w-[calc(50%+48px)] h-[2px] transition-all duration-700 -translate-x-[100%] ${rgbFiles.length > 0 ? 'bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-200'}`}></div>

                      <div className="relative group/node select-none cursor-pointer w-full max-w-[180px]">
                        <input
                          type="file" multiple accept="image/*"
                          onChange={(e) => handleFileChange(e, 'rgb')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ease-out flex flex-col items-center gap-4 w-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] ${
                          rgbFiles.length > 0 
                            ? 'border-orange-500 bg-orange-50/80 shadow-[0_20px_50px_-15px_rgba(249,115,22,0.25)] scale-105' 
                            : 'border-slate-100 bg-white hover:border-orange-400 hover:shadow-[0_20px_50px_-20px_rgba(249,115,22,0.3)] hover:-translate-y-2'
                          }`}>
                          <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-colors duration-500 ${rgbFiles.length > 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                            <Camera className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">Drone <br/> Image</span>
                            {rgbFiles.length > 0 ? (
                              <span className="text-[10px] mt-1 text-orange-600 font-black animate-pulse bg-orange-100 px-3 py-1 rounded-full">{rgbFiles.length} Selected</span>
                            ) : (
                              <span className="text-[9px] mt-1 text-slate-400 font-bold uppercase tracking-widest group-hover:text-orange-400 transition-colors">Select Files</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Site Plan Branch - Larger Card */}
                    <div className="flex flex-col items-center relative group">
                      {/* Branch Line Right - Only on Desktop */}
                      <div className={`hidden md:block absolute top-[-30px] right-1/2 w-[calc(50%+48px)] h-[2px] transition-all duration-700 translate-x-[100%] ${thermalFiles.length > 0 ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-slate-200'}`}></div>

                      <div className="relative group/node select-none cursor-pointer w-full max-w-[180px]">
                        <input
                          type="file" multiple accept=".kml"
                          onChange={(e) => handleFileChange(e, 'thermal')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ease-out flex flex-col items-center gap-4 w-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] ${
                          thermalFiles.length > 0 
                            ? 'border-blue-500 bg-blue-50/80 shadow-[0_20px_50px_-15px_rgba(59,130,246,0.25)] scale-105' 
                            : 'border-slate-100 bg-white hover:border-blue-400 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.3)] hover:-translate-y-2'
                          }`}>
                          <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-colors duration-500 ${thermalFiles.length > 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                            <Globe className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">Site <br/> Plan</span>
                            {thermalFiles.length > 0 ? (
                              <span className="text-[10px] mt-1 text-blue-600 font-black animate-pulse bg-blue-100 px-3 py-1 rounded-full">{thermalFiles.length} Selected</span>
                            ) : (
                              <span className="text-[9px] mt-1 text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">Import KML</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION NODE - Premium Large Button */}
                  <div className="relative z-10 w-full max-w-[320px]">
                    <button
                      onClick={handleImageUpload}
                      disabled={uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-3 z-20 group/uplink ${
                        uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200/50 shadow-none'
                          : 'bg-slate-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-orange-600 hover:shadow-[0_20px_50px_rgba(249,115,22,0.4)] active:scale-95'
                      }`}
                    >
                      {!(uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover/uplink:opacity-100 transition-opacity duration-500"></div>
                      )}
                      <div className="relative z-10 flex items-center gap-3">
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight size={20} className={`transition-transform duration-300 ${!(rgbFiles.length === 0 && thermalFiles.length === 0) ? 'group-hover/uplink:translate-x-1' : ''}`} />
                        )}
                        <span>{uploading ? 'Processing...' : 'Upload Data'}</span>
                      </div>
                    </button>

                    {/* STATUS FEEDBACK - Floating */}
                    <AnimatePresence mode="wait">
                      {uploadStatus.message && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute top-full left-0 right-0 mt-6 text-[8px] font-black uppercase tracking-[0.2em] text-center p-3 rounded-xl border-2 shadow-sm ${uploadStatus.type === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                            uploadStatus.type === "error" ? "text-red-700 bg-red-50 border-red-100" : "text-orange-700 bg-orange-50 border-orange-100"
                            }`}
                        >
                          {uploadStatus.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* SECURE LABELS - Stack on Mobile */}
                <div className="mt-10 md:mt-16 flex flex-col md:flex-row gap-6 md:gap-8 opacity-40 items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none text-center md:text-left">Military-Grade Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
                    <Database size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none text-center md:text-left">Cloud Persistent</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}
      {/* AI Intelligence Workflow - Dynamic Flow Showcase */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        {/* Animated Background Nodes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 select-none pointer-events-none -z-0 hidden lg:block">
          <svg width="100%" height="100%" viewBox="0 0 1200 600" fill="none">
            <motion.circle
              cx="150" cy="300" r="100" stroke="#f97316" strokeWidth="0.5" strokeDasharray="10 10"
              animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="1050" cy="300" r="140" stroke="#10b981" strokeWidth="0.5" strokeDasharray="15 15"
              animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-slate-200"
            >
              <Zap size={14} className="text-orange-500" />
              Operational Excellence
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
              Elite <span className="text-orange-600">Solar Inspection</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs md:text-sm max-w-xl mx-auto leading-relaxed tracking-widest uppercase opacity-60">
              A specialized four-stage technical protocol designed to maximize photovoltaic energy yield and long-term asset health.
            </p>
          </div>

          <div className="relative">
            {/* Visual Data Flow Line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-y-1/2 hidden lg:block"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Thermal Scan", desc: "High-spec radiometric capture of module heat signatures.", icon: Thermometer, step: "01", delay: 0 },
                { title: "AI Mapping", desc: "Automated geolocation of bypass diode & string failures.", icon: Layers, step: "02", delay: 0.1 },
                { title: "Revenue ROI", desc: "Impact analysis quantifying recovered power savings.", icon: TrendingUp, step: "03", delay: 0.2 },
                { title: "Digital Twin", desc: "Full interactive 3D site layout with geotagged markers.", icon: MapPin, step: "04", delay: 0.3 }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay, duration: 0.8 }}
                  className="group relative"
                >
                  <div className="relative p-10 rounded-[3rem] bg-white border border-slate-100/60 hover:border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 h-full flex flex-col items-center text-center">

                    {/* Floating Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10 group-hover:bg-orange-50 transition-colors duration-700"></div>

                    <div className="mb-8 relative">
                      <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                        <item.icon size={28} className="transition-transform group-hover:scale-110" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-orange-600 group-hover:text-white group-hover:border-white transition-all shadow-sm">
                        {item.step}
                      </div>
                    </div>

                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-8 opacity-70 group-hover:opacity-100 transition-opacity">
                      {item.desc}
                    </p>

                    <div className="mt-auto w-full">
                      <div className="h-[2px] w-12 bg-slate-100 mx-auto group-hover:w-full transition-all duration-1000 overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className={`absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Defect Intelligence Section */}
      <section className="py-12 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="px-2"
            >
              <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-4 block">Precision Intelligence</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-[0.9]">
                Pinpoint <span className="text-orange-600 italic">Anomalies</span> <br />
                with 5cm Accuracy
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-lg">
                Our platform doesn't just show you pictures. We provide geolocated defect coordinates, thermal grading, and estimated power loss for every anomaly detected across your entire field.
              </p>

              <div className="space-y-4">
                {[
                  { title: "Bypass Diode Failures", val: "Critical", icon: <Zap size={16} /> },
                  { title: "Cell-level Hotspots", val: "High Impact", icon: <Thermometer size={16} /> },
                  { title: "Soiling & Shading", val: "Operational", icon: <Sun size={16} /> }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600">
                        {item.icon}
                      </div>
                      <span className="font-bold text-slate-700">{item.title}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.val === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                      item.val === 'High Impact' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-blue-50 text-orange-600 border border-orange-100'
                      }`}>
                      {item.val}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative mt-12 lg:mt-0"
            >
              <div className="relative bg-slate-900 rounded-[3.5rem] p-4 md:p-6 shadow-2xl overflow-hidden border border-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-orange-500 to-emerald-500"></div>

                <div className="aspect-[4/3] bg-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center relative group">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-700 group-hover:opacity-40"
                    style={{ backgroundImage: `url(${getDynamicPhoto('Precision Intelligence', '/premium-solar-farm.png')})` }}
                  ></div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

                  <Activity className="text-orange-500 w-16 h-16 absolute animate-pulse opacity-20" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-white font-black text-6xl md:text-8xl tracking-tighter">98.4%</span>
                    </motion.span>
                    <span className="text-orange-400 font-bold text-xs uppercase tracking-[0.4em] bg-orange-500/10 px-4 py-1 rounded-full border border-orange-500/20">
                      System Health Index
                    </span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 gap-3 group hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-white text-xs uppercase font-black tracking-widest">Real-time Scan</span>
                  </div>
                  <div className="h-16 bg-orange-600 rounded-2xl flex items-center px-6 gap-3 shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all cursor-pointer">
                    <ShieldCheck className="text-white w-5 h-5" />
                    <span className="text-white text-xs uppercase font-black tracking-widest">Reports</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Scale Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Globe size={14} className="text-blue-400" />
                Global Deployment
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-[0.9]">
                Scaling Solar <br />
                <span className="text-orange-600">Across Continents</span>
              </h2>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Whether it's a 100MW utility site in the desert or a distributed portfolio across Europe, our standardized inspection protocol ensures consistent, high-fidelity data everywhere.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-2"
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                <img src={getDynamicPhoto('Global Deployment', '/premium-solar-farm.png')} alt="Global Solar Asset" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping"></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Active Survey India</span>
                  </div>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-relaxed">Rajasthan 250MW Utility Phase IV</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Gallery Section - Dynamic */}
      {sitePhotos.filter(p => p.category === 'Main Gallery').length > 0 && (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Project Showcase</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">Site <span className="text-orange-600 italic">Gallery</span></h2>
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

      {/* NEW: Enterprise Feature Grid */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20">
            <div>
              <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Platform Core</span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Enterprise <span className="text-orange-500 italic">Capabilities</span></h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mt-6 lg:mt-0 font-bold uppercase tracking-widest leading-relaxed">
              Designed for reliability, security, and velocity in large-scale renewable operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Edge Analytics", desc: "Process datasets at the source with zero latency AI on-device processing." },
              { icon: Database, title: "Historical Vault", desc: "Track every asset's degradation over decades with cryptographically secure logging." },
              { icon: ShieldCheck, title: "Audit Ready", desc: "Automated compliance reports formatted for insurance and financial institutions." }
            ].map((feat, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.07] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <feat.icon size={28} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4">{feat.title}</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed tracking-wide uppercase">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-4 block">Request Service</span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                  Get Your Solar Panels <br />
                  <span className="text-orange-600 italic">Inspected Today.</span>
                </h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  Fill out the form to schedule a professional thermographic inspection. Our team will get back to you within 24 hours with a customized quote and deployment plan.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, text: "High-Resolution Thermal Imaging" },
                    { icon: CheckCircle, text: "AI-Powered Fault Analysis" },
                    { icon: CheckCircle, text: "Detailed ROI Impact Reports" }
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

      {/* The Inspection Algorithm Section */}
      < section className="py-20 md:py-24 bg-[#06080c] relative overflow-hidden text-white border-y border-white/5" >
        {/* Deep Field Glows */}
        < div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 opacity-50" ></div >
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] translate-y-1/2 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase"
            >
              THE INSPECTION <span className="text-orange-500 italic">ALGORITHM</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm md:text-base font-bold max-w-xl mx-auto leading-relaxed tracking-wide"
            >
              Four stages of precision data engineering to transform aerial imagery into actionable maintenance tasks.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              {
                num: "01",
                title: "MISSION CONTROL",
                desc: "Autonomous flight path generation based on site topography and KML layouts.",
                icon: Globe
              },
              {
                num: "02",
                title: "DATA INGEST",
                desc: "High-throughput capture of synchronized RGB and radiometric thermal datasets.",
                icon: Camera
              },
              {
                num: "03",
                title: "NEURAL PROCESSING",
                desc: "Proprietary AI models identify and quantify health state of every PV module.",
                icon: Brain
              },
              {
                num: "04",
                title: "SMART REPORTING",
                desc: "A comprehensive digital twin with geolocated findings for rapid remediation.",
                icon: FileText
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group pr-4"
              >
                {/* Visual Number Label */}
                <div className="absolute top-0 right-0 text-[120px] font-black text-white/[0.04] leading-none select-none -z-0 translate-x-4 -translate-y-4 group-hover:text-orange-500/[0.06] transition-colors">
                  {step.num}
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 border-l-orange-500/50 group-hover:bg-slate-800 transition-all cursor-default">
                    <step.icon className="w-6 h-6 text-orange-500" />
                  </div>

                  <h3 className="text-base font-black tracking-wider text-slate-100 mb-4 uppercase group-hover:text-orange-500 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-bold leading-relaxed tracking-tight group-hover:text-slate-400 transition-colors">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

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
    </div >
  );
}
