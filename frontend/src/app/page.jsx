"use client";

// import React, { useState, useEffect } from "react";
// import {
//   ArrowRight, Zap, Shield, Globe, Sun, FileUp, Database,
//   HardDrive, CheckCircle, User, Mail, Phone, MapPin,
//   Settings, MessageSquare, Send, CloudUpload, Activity, Loader2, ShieldCheck, Star, ChevronDown, ChevronLeft, ChevronRight,
//   Thermometer, ClipboardList, TrendingUp, Eye, Brain, FileText, Calendar, Image, Camera, Upload, X, Grid, List
// } from "lucide-react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { authAPI } from "@/lib/api";
// import { useRouter } from "next/navigation";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// export default function HomePage() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [rgbFiles, setRgbFiles] = useState([]);
//   const [thermalFiles, setThermalFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [loadingImages, setLoadingImages] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [status, setStatus] = useState({ type: '', message: '' });
//   const [viewMode, setViewMode] = useState('grid');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [dragActive, setDragActive] = useState({ rgb: false, thermal: false });
//   const [uploadProgress, setUploadProgress] = useState({ rgb: 0, thermal: 0 });

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     workEmail: "",
//     jobTitle: "",
//     phone: "",
//     country: "",
//     companyName: "",
//     companyType: "",
//     solarCapacity: "",
//     referralSource: "",
//     additionalInfo: ""
//   });

//   const allServices = [
//     {
//       name: "Thermography",
//       href: "/solutions/operation/thermography",
//       icon: Thermometer,
//       color: "orange",
//       category: "Operation",
//       image: "/operation_phase.png",
//       desc: "Advanced thermal imaging to pinpoint cellular-level defects and hotspot anomalies."
//     },
//     {
//       name: "Work Management",
//       href: "/solutions/operation/work-management",
//       icon: ClipboardList,
//       color: "blue",
//       category: "Operation",
//       image: "/ensure_lasting_quality.png",
//       desc: "Digitize site operations with real-time field reporting and automated task assignments."
//     },
//     {
//       name: "Asset Management",
//       href: "/solutions/operation/asset-management",
//       icon: Database,
//       color: "emerald",
//       category: "Operation",
//       image: "/prevent_revenue_loss.png",
//       desc: "Comprehensive lifecycle tracking for every PV module and inverter across your portfolio."
//     },
//     {
//       name: "Progress Tracking",
//       href: "/solutions/construction/progress-tracking",
//       icon: TrendingUp,
//       color: "orange",
//       category: "Construction",
//       image: "/construction_phase.png",
//       desc: "High-precision aerial surveys to monitor as-built progress against design milestones."
//     },
//     {
//       name: "Quality Control",
//       href: "/solutions/construction/quality-control",
//       icon: CheckCircle,
//       color: "blue",
//       category: "Construction",
//       image: "/ensure_lasting_quality.png",
//       desc: "Automated QC workflows ensuring compliance with engineering specifications and standards."
//     },
//     {
//       name: "Commissioning",
//       href: "/solutions/construction/commissioning",
//       icon: Zap,
//       color: "emerald",
//       category: "Construction",
//       image: "/construction_phase.png",
//       desc: "Streamlined inspection protocols for rapid and secure site handovers to O&M teams."
//     },
//     {
//       name: "Site Assessment",
//       href: "/solutions/planning/site-assessment",
//       icon: Globe,
//       color: "orange",
//       category: "Planning",
//       image: "/planning_phase.png",
//       desc: "High-resolution topography and shading analysis for optimized plant layout design."
//     },
//     {
//       name: "Drones & Robotics",
//       href: "/platform/drones",
//       icon: Eye,
//       color: "blue",
//       category: "Platform",
//       image: "/centralized_oversight.png",
//       desc: "Integrated fleet management for autonomous aerial and ground-based inspection robotics."
//     },
//     {
//       name: "AI & Analytics",
//       href: "/platform/ai-analytics",
//       icon: Brain,
//       color: "emerald",
//       category: "Platform",
//       image: "/prevent_revenue_loss.png",
//       desc: "ML-driven classification of defects to quantify power loss and prioritize maintenance."
//     },
//     {
//       name: "Forms & Ticketing",
//       href: "/platform/forms",
//       icon: FileText,
//       color: "orange",
//       category: "Platform",
//       image: "/ensure_lasting_quality.png",
//       desc: "Smart mobile forms for consistent structured data collection across all field personnel."
//     },
//     {
//       name: "Integrations",
//       href: "/platform/integrations",
//       icon: Settings,
//       color: "blue",
//       category: "Platform",
//       image: "/centralized_oversight.png",
//       desc: "Seamless data synchronization with existing ERP, SCADA, and CMMS platforms."
//     },
//   ];

//   const companyTypes = [
//     "Asset Owner",
//     "EPC Contractor",
//     "O&M Team",
//     "Drone Service Provider",
//     "Developer",
//     "Other"
//   ];

//   const solarCapacities = [
//     "Less than 1 MW",
//     "1-10 MW",
//     "10-50 MW",
//     "50-100 MW",
//     "100-500 MW",
//     "500+ MW"
//   ];

//   const referralSources = [
//     "Google Search",
//     "LinkedIn",
//     "Industry Event",
//     "Referral",
//     "Social Media",
//     "Other"
//   ];

//   const countries = [
//     "United States",
//     "Canada",
//     "United Kingdom",
//     "Germany",
//     "France",
//     "Spain",
//     "Italy",
//     "Australia",
//     "India",
//     "Other"
//   ];

//   useEffect(() => {
//     const name = localStorage.getItem("user_name");
//     const token = localStorage.getItem("auth_token");
//     if (token && name) {
//       setUser({ name, token });
//       fetchUserImages();
//     }
//   }, []);

//   const fetchUserImages = async () => {
//     try {
//       setLoadingImages(true);
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_URL}/user-images`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch images');
//       }

//       const data = await response.json();
//       setUploadedImages(data);
//     } catch (err) {
//       console.error('Error fetching images:', err);
//     } finally {
//       setLoadingImages(false);
//     }
//   };

//   const handleDrag = (e, type) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(prev => ({ ...prev, [type]: true }));
//     } else if (e.type === "dragleave") {
//       setDragActive(prev => ({ ...prev, [type]: false }));
//     }
//   };

//   const handleDrop = (e, type) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(prev => ({ ...prev, [type]: false }));

//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       handleFiles(e.dataTransfer.files, type);
//     }
//   };

//   const handleFileChange = (e, type) => {
//     if (e.target.files && e.target.files.length > 0) {
//       handleFiles(e.target.files, type);
//     }
//   };

//   const handleFiles = (files, type) => {
//     const validFiles = Array.from(files).filter(file => 
//       file.type.startsWith('image/') && 
//       (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')
//     );

//     if (validFiles.length === 0) {
//       setUploadStatus({ 
//         type: "error", 
//         message: `Please upload valid image files for ${type === 'rgb' ? 'RGB' : 'Thermal'} (JPEG, PNG)` 
//       });
//       return;
//     }

//     if (type === 'rgb') {
//       setRgbFiles(prev => [...prev, ...validFiles]);
//     } else {
//       setThermalFiles(prev => [...prev, ...validFiles]);
//     }
//   };

//   const removeFile = (index, type) => {
//     if (type === 'rgb') {
//       setRgbFiles(prev => prev.filter((_, i) => i !== index));
//     } else {
//       setThermalFiles(prev => prev.filter((_, i) => i !== index));
//     }
//   };

//   const uploadRGBImages = async () => {
//     if (rgbFiles.length === 0) return;

//     const token = localStorage.getItem('auth_token');
//     const formData = new FormData();

//     rgbFiles.forEach(file => {
//       formData.append('rgb_images', file);
//     });

//     const response = await fetch(`${API_URL}/upload-rgb-images`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       body: formData
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to upload RGB images');
//     }

//     return response.json();
//   };

//   const uploadThermalImages = async () => {
//     if (thermalFiles.length === 0) return;

//     const token = localStorage.getItem('auth_token');
//     const formData = new FormData();

//     thermalFiles.forEach(file => {
//       formData.append('thermal_images', file);
//     });

//     const response = await fetch(`${API_URL}/upload-thermal-images`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       body: formData
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to upload Thermal images');
//     }

//     return response.json();
//   };

//   const handleImageUpload = async (e) => {
//     e.preventDefault();

//     if (rgbFiles.length === 0 && thermalFiles.length === 0) {
//       setUploadStatus({ type: "error", message: "Please select at least one image to upload." });
//       return;
//     }

//     if (uploading) return;

//     setUploading(true);
//     setUploadStatus({ type: "info", message: "Uploading images..." });

//     try {
//       let rgbResult = null;
//       let thermalResult = null;
//       let totalUploaded = 0;

//       // Upload RGB images if any
//       if (rgbFiles.length > 0) {
//         setUploadProgress(prev => ({ ...prev, rgb: 0 }));
//         rgbResult = await uploadRGBImages();
//         totalUploaded += rgbResult?.uploaded_count || rgbFiles.length;
//         setUploadProgress(prev => ({ ...prev, rgb: 100 }));
//       }

//       // Upload Thermal images if any
//       if (thermalFiles.length > 0) {
//         setUploadProgress(prev => ({ ...prev, thermal: 0 }));
//         thermalResult = await uploadThermalImages();
//         totalUploaded += thermalResult?.uploaded_count || thermalFiles.length;
//         setUploadProgress(prev => ({ ...prev, thermal: 100 }));
//       }

//       setUploadStatus({
//         type: "success",
//         message: `Successfully uploaded ${totalUploaded} images!`
//       });

//       // Clear file lists
//       setRgbFiles([]);
//       setThermalFiles([]);
//       setUploadProgress({ rgb: 0, thermal: 0 });

//       // Refresh images list
//       await fetchUserImages();

//     } catch (err) {
//       console.error("Upload error:", err);
//       setUploadStatus({
//         type: "error",
//         message: err.message || "Failed to upload images. Please try again."
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadSingleType = async (type) => {
//     if (type === 'rgb' && rgbFiles.length === 0) {
//       setUploadStatus({ type: "error", message: "No RGB images selected." });
//       return;
//     }
//     if (type === 'thermal' && thermalFiles.length === 0) {
//       setUploadStatus({ type: "error", message: "No Thermal images selected." });
//       return;
//     }

//     setUploading(true);
//     setUploadStatus({ type: "info", message: `Uploading ${type === 'rgb' ? 'RGB' : 'Thermal'} images...` });

//     try {
//       let result;
//       if (type === 'rgb') {
//         setUploadProgress(prev => ({ ...prev, rgb: 0 }));
//         result = await uploadRGBImages();
//         setUploadProgress(prev => ({ ...prev, rgb: 100 }));
//         setRgbFiles([]);
//       } else {
//         setUploadProgress(prev => ({ ...prev, thermal: 0 }));
//         result = await uploadThermalImages();
//         setUploadProgress(prev => ({ ...prev, thermal: 100 }));
//         setThermalFiles([]);
//       }

//       setUploadStatus({
//         type: "success",
//         message: `Successfully uploaded ${result?.uploaded_count || (type === 'rgb' ? rgbFiles.length : thermalFiles.length)} ${type === 'rgb' ? 'RGB' : 'Thermal'} images!`
//       });

//       setUploadProgress({ rgb: 0, thermal: 0 });
//       await fetchUserImages();

//     } catch (err) {
//       console.error("Upload error:", err);
//       setUploadStatus({
//         type: "error",
//         message: err.message || `Failed to upload ${type === 'rgb' ? 'RGB' : 'Thermal'} images.`
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const deleteImage = async (imageId) => {
//     if (!confirm('Are you sure you want to delete this image?')) return;

//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_URL}/images/${imageId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete image');
//       }

//       setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//       setUploadStatus({
//         type: "success",
//         message: "Image deleted successfully"
//       });

//     } catch (err) {
//       console.error('Error deleting image:', err);
//       setUploadStatus({
//         type: "error",
//         message: "Failed to delete image"
//       });
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     setSubmitting(true);
//     setStatus({ type: '', message: '' });

//     try {
//       const payload = {
//         name: `${formData.firstName} ${formData.lastName}`,
//         email: formData.workEmail,
//         contact_phone: formData.phone,
//         location: formData.country,
//         service_type: formData.companyType,
//         system_size: formData.solarCapacity,
//         notes: `Job Title: ${formData.jobTitle}\nCompany: ${formData.companyName}\nReferral Source: ${formData.referralSource}\n\nAdditional Info: ${formData.additionalInfo}`,
//         date: new Date().toISOString().split('T')[0],
//         time: new Date().toLocaleTimeString('en-US', { hour12: false })
//       };

//       const response = await fetch(`${API_URL}/bookings/guest`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to submit booking');
//       }

//       setStatus({
//         type: 'success',
//         message: 'Thank you! Your request has been received. Someone from our team will be in touch with you shortly.'
//       });

//       setFormData({
//         firstName: "",
//         lastName: "",
//         workEmail: "",
//         jobTitle: "",
//         phone: "",
//         country: "",
//         companyName: "",
//         companyType: "",
//         solarCapacity: "",
//         referralSource: "",
//         additionalInfo: ""
//       });

//     } catch (error) {
//       console.error("Error submitting booking:", error);
//       setStatus({
//         type: 'error',
//         message: error.message || 'Something went wrong. Please try again later.'
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Hero Section */}
//       <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-tr from-orange-50 to-blue-50"></div>
//         <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-4xl mx-auto">
//             <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-medium text-sm mb-6 animate-bounce">
//               <Sun size={16} />
//               <span>Next-Gen Solar Technology</span>
//             </div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
//             >
//               Expert <span className="text-orange-600">Solar Inspection</span> Services
//             </motion.h1>
//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-xl text-slate-600 mb-10 leading-relaxed"
//             >
//               Ensure your solar infrastructure is operating at peak performance with our professional drone-based inspection solutions.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
//             >
//               <>
//                 <Link
//                   href="#inspection-form"
//                   className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all flex items-center justify-center uppercase tracking-wider"
//                 >
//                   Book Inspection <ArrowRight className="ml-2" size={20} />
//                 </Link>
//                 <Link
//                   href="/about"
//                   className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm uppercase tracking-wider"
//                 >
//                   Learn More
//                 </Link>
//               </>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Image Upload Section */}
//       {user && (
//         <section id="image-upload-section" className="py-24 bg-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[120px] -mr-64 -mt-64" />
//           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] -ml-64 -mb-64" />

//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

//               <motion.div
//                 initial={{ opacity: 0, x: -30 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 className="lg:col-span-5"
//               >
//                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-200">
//                   <span className="relative flex h-2 w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
//                   </span>
//                   Image Management
//                 </div>
//                 <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
//                   Upload Your <br />
//                   <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent italic">Inspection Images</span>
//                 </h2>
//                 <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
//                   Upload RGB and thermal images of your solar installation separately. Our AI will analyze them for defects, hotspots, and performance issues.
//                 </p>

//                 <div className="space-y-4">
//                   {[
//                     { icon: Camera, label: "Separate RGB & Thermal upload" },
//                     { icon: Shield, label: "Secure encrypted storage" },
//                     { icon: Brain, label: "AI-powered defect detection" },
//                   ].map((item, idx) => (
//                     <div key={idx} className="flex items-center gap-3 text-slate-700 font-semibold group">
//                       <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
//                         <item.icon size={18} className="text-orange-600" />
//                       </div>
//                       <span>{item.label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 className="lg:col-span-7"
//               >
//                 <div className="bg-slate-900 rounded-[3rem] p-1 md:p-1.5 shadow-2xl shadow-slate-200">
//                   <div className="bg-white rounded-[2.8rem] p-8 md:p-12 border border-slate-100">

//                     {/* Status Message */}
//                     {uploadStatus.message && (
//                       <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
//                         uploadStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50" :
//                         uploadStatus.type === "error" ? "bg-red-50 text-red-700 border border-red-100/50" :
//                         "bg-orange-50 text-orange-700 border border-orange-100/50"
//                       }`}>
//                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                           uploadStatus.type === "success" ? "bg-emerald-100" :
//                           uploadStatus.type === "error" ? "bg-red-100" : "bg-orange-100"
//                         }`}>
//                           {uploadStatus.type === "success" ? <CheckCircle size={18} /> :
//                            uploadStatus.type === "error" ? "✕" :
//                            uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div> : "!"}
//                         </div>
//                         <span className="font-bold text-sm">{uploadStatus.message}</span>
//                       </div>
//                     )}

//                     {/* RGB Images Upload Section */}
//                     <div className="mb-10 p-6 bg-blue-50/30 rounded-2xl border border-blue-100">
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
//                             <Camera size={20} className="text-white" />
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-bold text-slate-900">RGB Images</h3>
//                             <p className="text-xs text-slate-500">Standard visual photographs</p>
//                           </div>
//                         </div>
//                         <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
//                           {rgbFiles.length} selected
//                         </span>
//                       </div>

//                       <div
//                         className={`relative border-2 border-dashed rounded-xl p-6 transition-all mb-3 ${
//                           dragActive.rgb 
//                             ? 'border-blue-500 bg-blue-100/50' 
//                             : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
//                         }`}
//                         onDragEnter={(e) => handleDrag(e, 'rgb')}
//                         onDragLeave={(e) => handleDrag(e, 'rgb')}
//                         onDragOver={(e) => handleDrag(e, 'rgb')}
//                         onDrop={(e) => handleDrop(e, 'rgb')}
//                       >
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/jpeg,image/png,image/jpg"
//                           onChange={(e) => handleFileChange(e, 'rgb')}
//                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                         />

//                         <div className="text-center">
//                           <Upload className="mx-auto h-8 w-8 text-blue-400 mb-2" />
//                           <p className="text-sm text-slate-600 font-medium">
//                             Drag & drop or <span className="text-blue-600">browse</span>
//                           </p>
//                           <p className="text-xs text-slate-500 mt-1">
//                             Supports: JPG, JPEG, PNG
//                           </p>
//                         </div>
//                       </div>

//                       {/* RGB Files List */}
//                       {rgbFiles.length > 0 && (
//                         <div className="mt-3 space-y-2">
//                           <p className="text-xs font-semibold text-slate-500 mb-2">Selected Files:</p>
//                           {rgbFiles.map((file, index) => (
//                             <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
//                               <div className="flex items-center gap-2 flex-1 min-w-0">
//                                 <Image size={14} className="text-blue-600 flex-shrink-0" />
//                                 <span className="text-xs text-slate-700 truncate">{file.name}</span>
//                                 <span className="text-xs text-slate-500 flex-shrink-0">
//                                   ({(file.size / 1024).toFixed(0)} KB)
//                                 </span>
//                               </div>
//                               <button
//                                 onClick={() => removeFile(index, 'rgb')}
//                                 className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
//                               >
//                                 <X size={14} />
//                               </button>
//                             </div>
//                           ))}

//                           {/* Upload Progress Bar */}
//                           {uploadProgress.rgb > 0 && uploadProgress.rgb < 100 && (
//                             <div className="mt-2">
//                               <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
//                                 <div 
//                                   className="h-full bg-blue-600 transition-all duration-300"
//                                   style={{ width: `${uploadProgress.rgb}%` }}
//                                 />
//                               </div>
//                             </div>
//                           )}

//                           {/* Upload Button for RGB Only */}
//                           <button
//                             onClick={() => uploadSingleType('rgb')}
//                             disabled={uploading || rgbFiles.length === 0}
//                             className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                           >
//                             {uploading && uploadProgress.rgb > 0 && uploadProgress.rgb < 100 ? (
//                               <>
//                                 <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
//                                 Uploading RGB... {uploadProgress.rgb}%
//                               </>
//                             ) : (
//                               <>
//                                 <CloudUpload size={14} />
//                                 Upload RGB Images Only
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     {/* Thermal Images Upload Section */}
//                     <div className="mb-8 p-6 bg-orange-50/30 rounded-2xl border border-orange-100">
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
//                             <Thermometer size={20} className="text-white" />
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-bold text-slate-900">Thermal Images</h3>
//                             <p className="text-xs text-slate-500">Infrared thermal photographs</p>
//                           </div>
//                         </div>
//                         <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
//                           {thermalFiles.length} selected
//                         </span>
//                       </div>

//                       <div
//                         className={`relative border-2 border-dashed rounded-xl p-6 transition-all mb-3 ${
//                           dragActive.thermal 
//                             ? 'border-orange-500 bg-orange-100/50' 
//                             : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50/50'
//                         }`}
//                         onDragEnter={(e) => handleDrag(e, 'thermal')}
//                         onDragLeave={(e) => handleDrag(e, 'thermal')}
//                         onDragOver={(e) => handleDrag(e, 'thermal')}
//                         onDrop={(e) => handleDrop(e, 'thermal')}
//                       >
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/jpeg,image/png,image/jpg"
//                           onChange={(e) => handleFileChange(e, 'thermal')}
//                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                         />

//                         <div className="text-center">
//                           <Upload className="mx-auto h-8 w-8 text-orange-400 mb-2" />
//                           <p className="text-sm text-slate-600 font-medium">
//                             Drag & drop or <span className="text-orange-600">browse</span>
//                           </p>
//                           <p className="text-xs text-slate-500 mt-1">
//                             Supports: JPG, JPEG, PNG
//                           </p>
//                         </div>
//                       </div>

//                       {/* Thermal Files List */}
//                       {thermalFiles.length > 0 && (
//                         <div className="mt-3 space-y-2">
//                           <p className="text-xs font-semibold text-slate-500 mb-2">Selected Files:</p>
//                           {thermalFiles.map((file, index) => (
//                             <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-100">
//                               <div className="flex items-center gap-2 flex-1 min-w-0">
//                                 <Thermometer size={14} className="text-orange-600 flex-shrink-0" />
//                                 <span className="text-xs text-slate-700 truncate">{file.name}</span>
//                                 <span className="text-xs text-slate-500 flex-shrink-0">
//                                   ({(file.size / 1024).toFixed(0)} KB)
//                                 </span>
//                               </div>
//                               <button
//                                 onClick={() => removeFile(index, 'thermal')}
//                                 className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
//                               >
//                                 <X size={14} />
//                               </button>
//                             </div>
//                           ))}

//                           {/* Upload Progress Bar */}
//                           {uploadProgress.thermal > 0 && uploadProgress.thermal < 100 && (
//                             <div className="mt-2">
//                               <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
//                                 <div 
//                                   className="h-full bg-orange-600 transition-all duration-300"
//                                   style={{ width: `${uploadProgress.thermal}%` }}
//                                 />
//                               </div>
//                             </div>
//                           )}

//                           {/* Upload Button for Thermal Only */}
//                           <button
//                             onClick={() => uploadSingleType('thermal')}
//                             disabled={uploading || thermalFiles.length === 0}
//                             className="w-full mt-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                           >
//                             {uploading && uploadProgress.thermal > 0 && uploadProgress.thermal < 100 ? (
//                               <>
//                                 <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
//                                 Uploading Thermal... {uploadProgress.thermal}%
//                               </>
//                             ) : (
//                               <>
//                                 <CloudUpload size={14} />
//                                 Upload Thermal Images Only
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     {/* Combined Upload Button */}
//                     {(rgbFiles.length > 0 || thermalFiles.length > 0) && (
//                       <button
//                         onClick={handleImageUpload}
//                         disabled={uploading}
//                         className="w-full py-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
//                       >
//                         {uploading ? (
//                           <>
//                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                             Uploading All Images...
//                           </>
//                         ) : (
//                           <>
//                             <CloudUpload size={18} />
//                             Upload All Selected Images
//                           </>
//                         )}
//                       </button>
//                     )}

//                     <div className="mt-6 pt-4 border-t border-slate-100">
//                       <div className="text-sm text-slate-500 flex items-center gap-2">
//                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                         <span><span className="font-semibold text-slate-700">RGB:</span> Standard visual images</span>
//                       </div>
//                       <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
//                         <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
//                         <span><span className="font-semibold text-slate-700">Thermal:</span> Infrared heat maps</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Uploaded Images Gallery */}
//       {user && uploadedImages.length > 0 && (
//         <section className="py-12 bg-slate-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-2xl font-bold text-slate-900">Your Inspection Images</h3>
//                   <p className="text-sm text-slate-500 mt-1">
//                     {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2 rounded-lg transition-colors ${
//                       viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                     }`}
//                   >
//                     <Grid size={20} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('list')}
//                     className={`p-2 rounded-lg transition-colors ${
//                       viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                     }`}
//                   >
//                     <List size={20} />
//                   </button>
//                 </div>
//               </div>

//               {loadingImages ? (
//                 <div className="flex justify-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
//                 </div>
//               ) : (
//                 <>
//                   {viewMode === 'grid' ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                       {uploadedImages.map((image) => (
//                         <div key={image.id} className="group relative border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all">
//                           <div className="aspect-square bg-slate-100 relative">
//                             <img
//                               src={`${API_URL}${image.url}`}
//                               alt={image.filename}
//                               className="w-full h-full object-cover cursor-pointer"
//                               onClick={() => setSelectedImage(image)}
//                             />

//                             {/* Image Type Badge */}
//                             <div className="absolute top-2 left-2">
//                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
//                                 image.image_type === 'rgb' 
//                                   ? 'bg-blue-100 text-blue-700 border border-blue-200' 
//                                   : 'bg-orange-100 text-orange-700 border border-orange-200'
//                               }`}>
//                                 {image.image_type === 'rgb' ? 'RGB' : 'Thermal'}
//                               </span>
//                             </div>

//                             {/* Delete Button */}
//                             <button
//                               onClick={() => deleteImage(image.id)}
//                               className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>

//                           <div className="p-3">
//                             <p className="text-sm font-medium text-slate-900 truncate">{image.filename}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                               {new Date(image.uploaded_at).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {uploadedImages.map((image) => (
//                         <div key={image.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
//                           <div className="flex items-center gap-3 flex-1">
//                             <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
//                               <img
//                                 src={`${API_URL}${image.url}`}
//                                 alt={image.filename}
//                                 className="w-full h-full object-cover"
//                               />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="font-medium text-slate-900 truncate">{image.filename}</p>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                   image.image_type === 'rgb' 
//                                     ? 'bg-blue-100 text-blue-700' 
//                                     : 'bg-orange-100 text-orange-700'
//                                 }`}>
//                                   {image.image_type === 'rgb' ? 'RGB' : 'Thermal'}
//                                 </span>
//                                 <span className="text-xs text-slate-500">
//                                   {new Date(image.uploaded_at).toLocaleDateString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => deleteImage(image.id)}
//                             className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
//                           >
//                             <X size={18} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Image Preview Modal */}
//       {selectedImage && (
//         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
//           <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
//             <button
//               onClick={() => setSelectedImage(null)}
//               className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors"
//             >
//               <X size={24} />
//             </button>

//             <img
//               src={`${API_URL}${selectedImage.url}`}
//               alt={selectedImage.filename}
//               className="w-full h-auto rounded-lg"
//             />

//             <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm">
//               {selectedImage.filename} • {selectedImage.image_type === 'rgb' ? 'RGB' : 'Thermal'} • {new Date(selectedImage.uploaded_at).toLocaleDateString()}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Solutions & Platforms Grid Section */}
//       <section className="py-32 bg-slate-50 relative overflow-hidden">
//         {/* Background Decorative Elements */}
//         <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
//           <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px]"></div>
//           <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]"></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="text-center mb-24">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
//             >
//               <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
//               <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Advanced Ecosystem</span>
//             </motion.div>
//             <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
//               The <span className="text-orange-600 italic">Future</span> of Solar
//             </h2>
//             <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
//               Explore our full suite of digital twins, automated diagnostics, and infrastructure management tools designed for peak asset performance.
//             </p>
//           </div>

//           <div className="relative group">
//             {/* Scroll Buttons */}
//             <div className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button
//                 onClick={() => {
//                   const container = document.getElementById('solar-future-scroll');
//                   container.scrollBy({ left: -400, behavior: 'smooth' });
//                 }}
//                 className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white transition-all border border-slate-100"
//               >
//                 <ChevronLeft size={24} />
//               </button>
//             </div>

//             <div className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button
//                 onClick={() => {
//                   const container = document.getElementById('solar-future-scroll');
//                   container.scrollBy({ left: 400, behavior: 'smooth' });
//                 }}
//                 className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white transition-all border border-slate-100"
//               >
//                 <ChevronRight size={24} />
//               </button>
//             </div>

//             <div
//               id="solar-future-scroll"
//               className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 scroll-smooth"
//             >
//               {allServices.map((service, idx) => (
//                 <motion.div
//                   key={service.name}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   viewport={{ once: true }}
//                   transition={{
//                     delay: idx * 0.1,
//                     type: "spring",
//                     stiffness: 80
//                   }}
//                   onClick={() => {
//                     if (!user) {
//                       router.push('/login');
//                     } else {
//                       router.push(service.href);
//                     }
//                   }}
//                   onMouseMove={(e) => {
//                     const rect = e.currentTarget.getBoundingClientRect();
//                     const x = e.clientX - rect.left;
//                     const y = e.clientY - rect.top;
//                     e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
//                     e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
//                   }}
//                   className="group relative h-[400px] w-[300px] md:w-[380px] flex-shrink-0 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200 hover:shadow-orange-200/50 transition-all duration-700 snap-center"
//                 >
//                   {/* Image Layer */}
//                   <div
//                     className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
//                     style={{ backgroundImage: `url(${service.image})` }}
//                   ></div>

//                   {/* Glassmorphism Overlays */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent group-hover:via-slate-900/60 transition-all duration-500"></div>

//                   {/* Content Overlay */}
//                   <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
//                     <div className="mb-auto">
//                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
//                         service.color === 'orange' ? 'bg-orange-600/60' :
//                         service.color === 'blue' ? 'bg-blue-600/60' :
//                         'bg-emerald-600/60'
//                       }`}>
//                         <service.icon size={24} />
//                       </div>
//                     </div>

//                     <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
//                       <div className="flex items-center gap-3">
//                         <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
//                           {service.category}
//                         </span>
//                       </div>

//                       <h3 className="text-2xl font-black uppercase tracking-tight leading-tight group-hover:text-orange-400 transition-colors">
//                         {service.name}
//                       </h3>

//                       <p className="text-sm text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-all duration-700 line-clamp-3">
//                         {service.desc}
//                       </p>

//                       <div className="flex items-center gap-2 pt-2 text-orange-400 font-black text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-700">
//                         Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Perspective Glow Effect */}
//                   <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),#ffffff_0%,transparent_100%)]"></div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-24 pt-12 border-t border-slate-200 flex flex-col items-center gap-8">
//             <div className="flex items-center gap-4">
//               <div className="h-[1px] w-12 bg-slate-300"></div>
//               <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Enterprise Grade Infrastructure</span>
//               <div className="h-[1px] w-12 bg-slate-300"></div>
//             </div>
//             {!user && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => router.push('/login')}
//                 className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-orange-600 transition-all"
//               >
//                 Sign In to access Full Ecosystem
//               </motion.button>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Inspection Form Section */}
//       <section id="inspection-form" className="py-16 bg-slate-50 relative overflow-hidden">
//         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-[100px]" />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
//             <motion.div
//               initial={{ opacity: 0, x: -40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//             >
//               <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-4 block">Request Service</span>
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
//                 Get Your Solar Panels <br />
//                 <span className="text-orange-600 italic">Inspected Today.</span>
//               </h2>
//               <p className="text-slate-600 text-lg mb-8 leading-relaxed">
//                 Fill out the form to schedule a professional thermographic inspection. Our team will get back to you within 24 hours with a customized quote and deployment plan.
//               </p>

//               <div className="space-y-6">
//                 {[
//                   { icon: CheckCircle, text: "High-Resolution Thermal Imaging" },
//                   { icon: CheckCircle, text: "AI-Powered Fault Analysis" },
//                   { icon: CheckCircle, text: "Detailed ROI Impact Reports" }
//                 ].map((item, i) => (
//                   <div key={i} className="flex items-center space-x-3 text-slate-700 font-medium">
//                     <item.icon className="text-orange-500 w-5 h-5" />
//                     <span>{item.text}</span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-orange-100 border border-slate-100"
//             >
//               {status.message && (
//                 <div className={`mb-6 p-4 rounded-xl text-center shadow-sm ${
//                   status.type === 'success'
//                     ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
//                     : 'bg-red-50 text-red-700 border border-red-100'
//                 }`}>
//                   <p className="font-bold text-sm tracking-tight flex items-center justify-center gap-2">
//                     {status.type === 'success' && <CheckCircle size={18} />}
//                     {status.message}
//                   </p>
//                 </div>
//               )}

//               <form onSubmit={handleFormSubmit} className="space-y-4">
//                 {/* First Name & Last Name */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       First Name*
//                     </label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       required
//                       placeholder="Jane"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Last Name*
//                     </label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       required
//                       placeholder="Doe"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>
//                 </div>

//                 {/* Work Email & Job Title */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Work Email*
//                     </label>
//                     <input
//                       type="email"
//                       name="workEmail"
//                       required
//                       placeholder="jane@company.com"
//                       value={formData.workEmail}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Job Title*
//                     </label>
//                     <input
//                       type="text"
//                       name="jobTitle"
//                       required
//                       placeholder="Operations Manager"
//                       value={formData.jobTitle}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>
//                 </div>

//                 {/* Phone Number & Country */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Phone Number*
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       required
//                       placeholder="+1 (555) 000-0000"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Country*
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="country"
//                         required
//                         value={formData.country}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
//                       >
//                         <option value="">Please Select</option>
//                         {countries.map((country) => (
//                           <option key={country} value={country}>{country}</option>
//                         ))}
//                       </select>
//                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Company Name & Company Type */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Company Name*
//                     </label>
//                     <input
//                       type="text"
//                       name="companyName"
//                       required
//                       placeholder="SolarMark"
//                       value={formData.companyName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                     />
//                   </div>

//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Company Type*
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="companyType"
//                         required
//                         value={formData.companyType}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
//                       >
//                         <option value="">Please Select</option>
//                         {companyTypes.map((type) => (
//                           <option key={type} value={type}>{type}</option>
//                         ))}
//                       </select>
//                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Solar Capacity & Referral Source */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Solar Capacity*
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="solarCapacity"
//                         required
//                         value={formData.solarCapacity}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
//                       >
//                         <option value="">Please Select</option>
//                         {solarCapacities.map((capacity) => (
//                           <option key={capacity} value={capacity}>{capacity}</option>
//                         ))}
//                       </select>
//                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2 group">
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                       Referral Source*
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="referralSource"
//                         required
//                         value={formData.referralSource}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none shadow-sm appearance-none font-medium text-slate-700 group-hover:bg-white"
//                       >
//                         <option value="">Please Select</option>
//                         {referralSources.map((source) => (
//                           <option key={source} value={source}>{source}</option>
//                         ))}
//                       </select>
//                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Additional Information */}
//                 <div className="space-y-2 group">
//                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-600 transition-colors">
//                     Additional Information you want to share with us
//                   </label>
//                   <textarea
//                     name="additionalInfo"
//                     rows="4"
//                     placeholder=""
//                     value={formData.additionalInfo}
//                     onChange={handleChange}
//                     className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none shadow-sm font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-white"
//                   ></textarea>
//                 </div>

//                 <div className="pt-2">
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="w-full py-5 bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
//                   >
//                     {submitting ? (
//                       <>
//                         <Loader2 className="animate-spin w-6 h-6" />
//                         Processing Request...
//                       </>
//                     ) : (
//                       <>
//                         Submit Inspection Request
//                         <Send size={24} />
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       {!user && (
//         <section className="py-24 bg-orange-600 relative overflow-hidden">
//           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
//             <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 uppercase tracking-tight">
//               Ready to switch to cleaner, cheaper energy?
//             </h2>
//             <p className="text-orange-100 text-xl mb-10 font-medium italic">
//               Join thousands of satisfied homeowners who have already made the switch.
//             </p>
//             <Link
//               href="/register"
//               className="inline-flex items-center px-10 py-5 bg-white text-orange-600 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
//             >
//               Start Your Journey <ArrowRight className="ml-2" />
//             </Link>
//           </div>
//           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/3"></div>
//         </section>
//       )}
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight, Zap, Shield, Globe, Sun, FileUp, Database,
  HardDrive, CheckCircle, User, Mail, Phone, MapPin,
  Settings, MessageSquare, Send, CloudUpload, Activity, Loader2, ShieldCheck, Star, ChevronDown, ChevronLeft, ChevronRight,
  Thermometer, ClipboardList, TrendingUp, Eye, Brain, FileText, Calendar, Image, Camera, Upload, X, Grid, List, ExternalLink, Cpu, Layers, Search, FileCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white perspective-1000">
        {/* Advanced Background System */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-50/20"></div>

          {/* 3D Floating Particles */}
          {[...Array(20)].map((_, i) => (
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
                <Link
                  href="#inspection-form"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Book Scan <ArrowRight size={16} />
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm"
                >
                  Tech Specs
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 opacity-40 grayscale scale-90 origin-left">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900">500+</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Plants Scanned</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900">2.5GW</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Asset Capacity</span>
                </div>
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
        <section id="image-upload-section" className="py-12 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] -ml-64 -mb-64" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="md:col-span-5 text-center md:text-left flex flex-col items-center md:items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                  </span>
                  Google Drive Integration
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight mx-auto md:mx-0">
                  Upload to <br />
                  <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent italic">Google Drive</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                  Upload drone images and site plans directly to your secure Google Drive folder. Files are automatically organized and named for easy identification.
                </p>

                <div className="space-y-4 w-full flex flex-col items-center md:items-start">
                  {[
                    { icon: Camera, label: "Separate RGB & Thermal upload" },
                    { icon: HardDrive, label: "Direct Google Drive storage" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-700 font-semibold group">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                        <item.icon size={18} className="text-orange-600" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>


              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="md:col-span-7 flex flex-col items-center justify-center py-6 md:py-12"
              >
                {/* LARGE UPLINK TREE STRUCTURE */}
                <div className="relative flex flex-col items-center max-w-md w-full">

                  {/* Central Trunk Line - Thick & Bold */}
                  <div className="absolute top-0 bottom-[80px] w-[2px] bg-slate-200 z-0 border-r border-dashed border-slate-300"></div>

                  {/* Top Entry Node - Larger */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center mb-12 border-[6px] border-white shadow-2xl scale-110">
                    <CloudUpload size={24} className="text-white" />
                  </div>

                  {/* BRANCHES CONTAINER - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-24 relative z-10 w-full mb-16 px-4">

                    {/* Drone Image Branch - Larger Card */}
                    <div className="flex flex-col items-center relative group">
                      {/* Branch Line Left - Only on Desktop */}
                      <div className="hidden md:block absolute top-[-30px] left-1/2 w-[calc(50%+48px)] h-[2px] bg-slate-200 -translate-x-[100%]"></div>

                      <div className="relative group/node select-none cursor-pointer">
                        <input
                          type="file" multiple accept="image/*"
                          onChange={(e) => handleFileChange(e, 'rgb')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 min-w-[140px] shadow-sm ${rgbFiles.length > 0 ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-500/10 scale-110' : 'border-slate-100 bg-white hover:border-orange-400 hover:shadow-2xl'
                          }`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rgbFiles.length > 0 ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                            <Camera className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Drone Image</span>
                          {rgbFiles.length > 0 ? (
                            <span className="text-[9px] text-orange-600 font-black animate-bounce">{rgbFiles.length} Selections</span>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-bold">READY TO SCAN</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Site Plan Branch - Larger Card */}
                    <div className="flex flex-col items-center relative group">
                      {/* Branch Line Right - Only on Desktop */}
                      <div className="hidden md:block absolute top-[-30px] right-1/2 w-[calc(50%+48px)] h-[2px] bg-slate-200 translate-x-[100%]"></div>

                      <div className="relative group/node select-none cursor-pointer">
                        <input
                          type="file" multiple accept=".kml"
                          onChange={(e) => handleFileChange(e, 'thermal')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 min-w-[140px] shadow-sm ${thermalFiles.length > 0 ? 'border-blue-500 bg-blue-50 shadow-xl shadow-blue-500/10 scale-110' : 'border-slate-100 bg-white hover:border-blue-400 hover:shadow-2xl'
                          }`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${thermalFiles.length > 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                            <Globe className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Site Plan</span>
                          {thermalFiles.length > 0 ? (
                            <span className="text-[9px] text-blue-600 font-black animate-bounce">{thermalFiles.length} Vectors</span>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-bold">IMPORT KML</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION NODE - Premium Large Button */}
                  <div className="relative z-10 w-full max-w-[280px]">
                    <button
                      onClick={handleImageUpload}
                      disabled={uploading || (rgbFiles.length === 0 && thermalFiles.length === 0)}
                      className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 group/uplink overflow-hidden z-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover/uplink:opacity-100 transition-opacity"></div>
                      <div className="relative z-10 flex items-center gap-3">
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight size={18} className="group-hover/uplink:translate-x-1 transition-transform" />
                        )}
                        <span>{uploading ? 'Processing' : 'Upload'}</span>
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

              {/* Floating ROI element */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-6 md:-bottom-12 md:-left-12 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 hidden sm:block z-20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Recovered Revenue</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">$14,580</p>
                  </div>
                </div>
              </motion.div>

              {/* Mobile ROI element - simpler for mobile */}
              <div className="sm:hidden mt-6 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Recovered Revenue</p>
                  <p className="text-2xl font-black text-slate-900">$14,580</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={20} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Global Scale Section */}
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

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-black text-slate-900">15GW+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Assets Managed</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-900">450k+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Anomalies Detected</p>
                </div>
              </div>
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
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
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
            {/* Scroll Buttons */}
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
                  {/* Image Layer */}
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

                  {/* Glassmorphism Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent group-hover:via-slate-900/60 transition-all duration-500"></div>

                  {/* Content Overlay */}
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

                  {/* Perspective Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),#ffffff_0%,transparent_100%)]"></div>
                </motion.div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* Dynamic Services Grid */}
      {/* Inspection Form Section */}
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

    {/* The Inspection Algorithm Section */ }
    < section className = "py-20 md:py-24 bg-[#06080c] relative overflow-hidden text-white border-y border-white/5" >
      {/* Deep Field Glows */ }
      < div className = "absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 opacity-50" ></div >
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

    {/* CTA Section */ }
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
    </div >
  );
}