'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Copy,
  Calendar,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
  User,
  Clock,
  FileText,
  X,
  Mail,
  Users,
  Hash,
  Folder,
  AlertCircle,
  Upload,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  Image as ImageIcon,
  Map as MapIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DriveLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [linkPDFs, setLinkPDFs] = useState({});
  const [imageStats, setImageStats] = useState({});
  const [expandedUserGroups, setExpandedUserGroups] = useState({}); // Track which user groups are expanded
  const [allImages, setAllImages] = useState([]); // All image/KML records
  const [searchTerm, setSearchTerm] = useState('');

  // PDF Upload states
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [selectedItemForUpload, setSelectedItemForUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete states
  const [deletingLink, setDeletingLink] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);

  // Loading PDFs state
  const [loadingPDFs, setLoadingPDFs] = useState({});
  const [expandedUserReports, setExpandedUserReports] = useState({}); // Track user-level reports expansion

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fileInputRef = useRef(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';

  useEffect(() => {
    checkAdminAuth();
    fetchLinks();
    fetchAllImages();
  }, []);

  const checkAdminAuth = () => {
    setIsAdmin(true);
    let name = localStorage.getItem('admin_name');
    if (!name || name === 'Admin User' || name === 'System Admin') {
      name = 'Princilla Savier';
      localStorage.setItem('admin_name', name);
    }
    setAdminInfo({
      name: name,
      loginTime: localStorage.getItem('admin_login_time') || Date.now()
    });
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      // 1. Fetch all users
      const usersResponse = await fetch(`${API_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const users = await usersResponse.json();

      // 2. Fetch consolidated submission stats
      let statsData = {};
      try {
        const statsResponse = await fetch(`${API_URL}/user-submission-stats`);
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
          setImageStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching submission stats:', err);
      }

      // Filter to users who have ANY submission (image or PDF)
      const activeUsers = users.filter(u => statsData[u._id]);

      const sortedData = activeUsers.map(u => ({
        id: u._id,
        user_id: u._id,
        user_code: u.user_code || '',
        user_name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        user_email: u.email,
        created_at: u.created_at || new Date().toISOString()
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setLinks(sortedData);
      setError('');

    } catch (err) {
      setError('Error loading user submissions. Please try again.');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllImages = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/all-user-images`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch all images');
      const data = await response.json();
      setAllImages(data);
    } catch (err) {
      console.error('Error fetching all images:', err);
    }
  };

  // Reset pagination when searching or filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUser]);

  const deleteDriveLink = async (linkId) => {
    try {
      setDeletingLink(linkId);
      setError('');

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      const response = await fetch(`${API_URL}/drive-links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete link');
      }

      const result = await response.json();
      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
      alert(`✅ ${result.message || 'Link deleted successfully!'}`);

    } catch (err) {
      console.error('Error deleting link:', err);
      setError(`Failed to delete link: ${err.message}`);
    } finally {
      setDeletingLink(null);
      setShowDeleteConfirm(false);
      setLinkToDelete(null);
    }
  };

  const handleDeleteImage = async (imageId, userId = null) => {
    if (!confirm('Are you sure you want to delete this specific upload record?')) return;
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAllImages(prev => prev.filter(img => img.id !== imageId));
        // Refresh main stats too
        fetchLinks();
        alert('✅ Record deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(`Failed to delete record: ${err.message}`);
    }
  };

  const fetchLinkPDFs = async (linkId) => {
    try {
      setLoadingPDFs(prev => ({ ...prev, [linkId]: true }));
      setError('');

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      const response = await fetch(`${API_URL}/drive-links/${linkId}/pdfs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required to view files.');
          return;
        }
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setLinkPDFs(prev => ({ ...prev, [linkId]: data }));

    } catch (err) {
      console.error('Error fetching files:', err);
      setError(`Failed to load files: ${err.message}`);
    } finally {
      setLoadingPDFs(prev => ({ ...prev, [linkId]: false }));
    }
  };

  const toggleRow = async (linkId) => {
    const isExpanded = expandedRows[linkId];
    setExpandedRows(prev => ({ ...prev, [linkId]: !isExpanded }));

    if (!isExpanded && !linkPDFs[linkId]) {
      await fetchLinkPDFs(linkId);
    }
  };

  const triggerPdfUpload = (item) => {
    setSelectedItemForUpload(item);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const toggleUserGroup = (userId) => {
    setExpandedUserGroups(prev => ({
      [userId]: !prev[userId]
    }));
    // Also close report expansion if switching groups
    setExpandedUserReports({});
  };

  const toggleUserReports = async (userId) => {
    const isExpanded = expandedUserReports[userId];
    setExpandedUserReports({
      [userId]: !isExpanded
    });
    // Also close group expansion if switching to reports
    setExpandedUserGroups({});

    if (!isExpanded && (!linkPDFs[userId] || linkPDFs[userId].length === 0)) {
      await fetchLinkPDFs(userId);
    }
  };

  const confirmDelete = (link) => {
    if (!isAdmin) {
      setError('Admin login required to delete links');
      return;
    }

    setLinkToDelete(link);
    setShowDeleteConfirm(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    let dateToParse = dateString;
    if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
      dateToParse = `${dateString}Z`;
    }

    const date = new Date(dateToParse);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${datePart} at ${timePart}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUserInitials = (userName) => {
    if (!userName || userName === 'Anonymous User') return 'AU';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName[0]?.toUpperCase() || 'U';
  };

  const uniqueUsers = [
    { id: 'all', name: 'All Users', email: '' },
    ...Array.from(new Map(links.map(link => [
      link.user_id,
      { id: link.user_id, name: link.user_name || `User ${link.user_id?.slice(-4) || 'unknown'}`, email: link.user_email }
    ])).values())
  ];

  const filteredLinks = links.filter(link => {
    const matchesUser = selectedUser === 'all' || link.user_id === selectedUser;
    const matchesSearch = !searchTerm ||
      link.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (() => {
        const stats = imageStats[link.user_id];
        const status = (stats?.has_rgb && stats?.has_thermal) ? 'done' :
          (stats?.has_rgb || stats?.has_thermal) ? 'partial' : 'pending';
        return status.includes(searchTerm.toLowerCase());
      })();
    return matchesUser && matchesSearch;
  });

  const totalLinks = Object.keys(imageStats).length;
  const totalUsers = new Set(links.map(u => u.user_id)).size;
  const totalPDFs = Object.values(imageStats).reduce((sum, stats) => sum + (stats.pdf_count || 0), 0);

  // Group links by user for grouped view
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const userId = link.user_id || 'anonymous';
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        user_code: link.user_code || '',
        user_name: link.user_name,
        user_email: link.user_email,
        links: []
      };
    }
    acc[userId].links.push(link);
    return acc;
  }, {});

  const groupedLinksArray = Object.values(groupedLinks).sort((a, b) => {
    // Sort by most recent upload date (FILO / Newest First)
    const userAImgs = allImages.filter(img => img.user_id === a.user_id);
    const userBImgs = allImages.filter(img => img.user_id === b.user_id);

    const latestA = userAImgs.length > 0
      ? Math.max(...userAImgs.map(i => new Date(i.uploaded_at).getTime()))
      : 0;
    const latestB = userBImgs.length > 0
      ? Math.max(...userBImgs.map(i => new Date(i.uploaded_at).getTime()))
      : 0;

    return latestB - latestA;
  });

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedLinksArray.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(groupedLinksArray.length / itemsPerPage);

  const handlePdfUpload = async (event, item) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedExtensions = ['.pdf', '.html', '.htm', '.xlsx', '.xls', '.csv', '.kml', '.kmz'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Supported extensions: ${allowedExtensions.join(', ')}`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size should be less than 50MB');
      return;
    }

    try {
      setUploadingPdf(true);
      setSelectedItemForUpload(item);
      setUploadProgress(0);
      setError('');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('link_id', item.id);

      const response = await fetch(`${API_URL}/drive-links/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Upload requires admin authentication.');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to upload file');
        }
        return;
      }

      const data = await response.json();
      setError('');

      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === item.id
            ? {
              ...link,
              has_pdf: true,
              pdf_id: data.pdf_id,
              pdf_filename: data.filename,
              pdf_uploaded_at: data.uploaded_at
            }
            : link
        )
      );

      if (expandedRows[item.id]) {
        await fetchLinkPDFs(item.id);
      }

      // Re-fetch all submission stats to update the PDF count in the main table
      await fetchLinks();

      alert(`✅ File uploaded successfully!\nFile: ${data.filename}`);
      fetchAllImages(); // Refresh image list if relevant

      setTimeout(() => {
        setUploadingPdf(false);
        setSelectedItemForUpload(null);
        setUploadProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Failed to upload file: ${err.message}`);
      setUploadingPdf(false);
      setSelectedItemForUpload(null);
      setUploadProgress(0);
    } finally {
      event.target.value = '';
    }
  };

  const downloadPDF = async (pdfId, filename) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      const response = await fetch(`${API_URL}/drive-links/pdf/download/${pdfId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const viewPDF = async (pdfId) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/drive-links/pdf/view/${pdfId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to view file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error viewing file:', err);
      setError('Failed to view file');
    }
  };

  const deletePDF = async (pdfId, userId) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/drive-links/pdf/${pdfId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Refresh the PDF list for this specific user/link
      if (userId) {
        await fetchLinkPDFs(userId);
      }

      // Update the main statistics
      fetchLinks();

      alert('✅ Report deleted successfully');

    } catch (err) {
      console.error('Error deleting report:', err);
      setError(`Failed to delete report: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Reports</h1>
                <p className="text-[11px] text-gray-400 font-medium">Manage user images & reports</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {adminInfo?.name || 'Admin'}
              </div>
              <button
                onClick={fetchLinks}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 font-medium text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && linkToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLinkToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to delete this user's records?
                <br />
                <span className="font-medium block mt-2 text-xs text-gray-800 truncate">{linkToDelete.user_name}</span>
                <span className="text-xs text-red-600 mt-2 block">
                  ⚠️ This will also delete all associated report files!
                </span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLinkToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteDriveLink(linkToDelete.id)}
                  disabled={deletingLink === linkToDelete.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-semibold"
                >
                  {deletingLink === linkToDelete.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Records
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users (w/ uploads)', count: totalLinks, color: 'text-blue-600', bg: 'bg-white', icon: <LinkIcon className="w-5 h-5" /> },
            { label: 'Active Users', count: totalUsers, color: 'text-green-600', bg: 'bg-white', icon: <Users className="w-5 h-5" /> },
            { label: 'Uploaded Reports', count: totalPDFs, color: 'text-purple-600', bg: 'bg-white', icon: <FileText className="w-5 h-5" /> },
            { label: 'Filtered Results', count: filteredLinks.length, color: 'text-orange-600', bg: 'bg-white', icon: <Hash className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-')}/10`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, email, or status..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full md:w-64">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
              >
                {uniqueUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.id === 'all' ? '� All Accounts' : `👤 ${user.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[280px]">Submission / File</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[160px]">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[220px]">Reports / Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[200px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                        <span className="text-sm font-medium text-gray-500">Loading user records...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <LinkIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">No user records found</h3>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((group) => (
                    <React.Fragment key={`group-${group.user_id}`}>
                      {/* User Group Header */}
                      <tr
                        key={`group-header-${group.user_id}`}
                        className="bg-orange-50/40 border-t-2 border-orange-200 hover:bg-orange-50/60 cursor-pointer transition-colors"
                        onClick={() => toggleUserGroup(group.user_id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${group.user_name && group.user_name !== 'Anonymous User'
                              ? 'bg-gray-900'
                              : 'bg-gray-400'
                              }`}>
                              <span className="text-white font-semibold text-sm">
                                {getUserInitials(group.user_name)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                                  {group.user_name || 'Anonymous User'}
                                </div>
                                {group.user_code && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-black rounded border border-orange-200">
                                    {group.user_code}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[120px]">{group.user_email || 'anonymous@example.com'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const stats = imageStats[group.user_id];
                            const statusLabel = (stats?.has_rgb && stats?.has_thermal) ? 'DONE' :
                              (stats?.has_rgb || stats?.has_thermal) ? 'PARTIAL' : 'PENDING';
                            const statusColor = statusLabel === 'DONE' ? 'bg-green-100 text-green-700 border-green-200' :
                              statusLabel === 'PARTIAL' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                'bg-rose-100 text-rose-700 border-rose-200';
                            return (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor} uppercase tracking-wider`}>
                                {statusLabel}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleUserReports(group.user_id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all flex items-center hover:shadow-md active:scale-95 ${(imageStats[group.user_id]?.pdf_count > 0) ? 'bg-orange-600 text-white border-orange-600 shadow-orange-900/10' : 'bg-white text-gray-400 border-gray-200'}`}
                            >
                              <FileText className="w-3.5 h-3.5 mr-2" />
                              REPORTS: {imageStats[group.user_id]?.pdf_count || 0}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); triggerPdfUpload({ id: group.user_id }); }}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5 mr-2 text-orange-400" />
                              UPLOAD REPORT
                            </button>
                            <div className="p-1 rounded-full hover:bg-orange-50 transition-colors">
                              {expandedUserGroups[group.user_id] ? (
                                <ChevronUp className="w-5 h-5 text-orange-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-orange-600" />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Section for ALL User Reports */}
                      {expandedUserReports[group.user_id] && (
                        <tr className="bg-orange-50/10 border-l-4 border-orange-500">
                          <td colSpan="4" className="px-6 py-6">
                            <div className="max-w-4xl mx-auto md:mx-0">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-orange-600" />
                                  Master Inspection Reports
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400">{linkPDFs[group.user_id]?.length || 0} DOCUMENTS FOUND</span>
                              </div>

                              {loadingPDFs[group.user_id] ? (
                                <div className="flex items-center justify-center py-10 bg-white/50 rounded-xl border border-gray-100">
                                  <Loader2 className="w-5 h-5 text-orange-600 animate-spin mr-3" />
                                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Compiling all reports...</span>
                                </div>
                              ) : linkPDFs[group.user_id]?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {linkPDFs[group.user_id].map(pdf => (
                                    <div key={pdf.pdf_id} className="group relative flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-xl transition-all border-l-4 border-l-gray-900 overflow-hidden">
                                      <div className="flex items-center min-w-0">
                                        <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover:bg-gray-900 transition-colors shrink-0">
                                          <FileText className="w-4 h-4 text-orange-600 group-hover:text-white" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight pr-2">{pdf.filename}</div>
                                          <div className="text-[9px] font-bold text-gray-400 mt-1 flex items-center gap-3">
                                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-orange-600" /> {formatDate(pdf.uploaded_at)}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span className="flex items-center uppercase">{pdf.report_type === 'rgb' ? 'Drone Data' : pdf.report_type === 'thermal' ? 'Site Plan' : 'Standard Report'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => viewPDF(pdf.pdf_id)}
                                          className="px-4 py-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 shrink-0"
                                        >
                                          VIEW
                                        </button>
                                        <button
                                          onClick={() => downloadPDF(pdf.pdf_id, pdf.filename)}
                                          className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 shrink-0"
                                        >
                                          DOWNLOAD
                                        </button>
                                        <button
                                          onClick={() => deletePDF(pdf.pdf_id, group.user_id)}
                                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all border border-rose-100 shadow-sm shrink-0"
                                          title="Delete Report"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-12 text-center bg-white/40 rounded-xl border border-dashed border-gray-200">
                                  <FileText className="w-8 h-8 text-orange-100 mx-auto mb-3" />
                                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No reports have been generated for this user yet.</div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Unified Upload Activity Table */}
                      {expandedUserGroups[group.user_id] && (
                        <tr className="bg-gray-50/30">
                          <td colSpan="4" className="px-6 py-6 border-b border-gray-100">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto max-w-[1500px]">
                              <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                  <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Date & Time</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-center text-gray-900 uppercase tracking-widest border-l border-gray-100">Drone Data</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-center text-orange-600 uppercase tracking-widest border-l border-gray-100">Site Plan</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-right uppercase tracking-widest border-l border-gray-100">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {(() => {
                                    const userImgs = allImages.filter(img => img.user_id === group.user_id);

                                    // Group by timestamp
                                    const timeGroups = userImgs.reduce((acc, img) => {
                                      const timeKey = formatDate(img.uploaded_at);
                                      if (!acc[timeKey]) {
                                        acc[timeKey] = { time: timeKey, rgb: null, thermal: null, raw_date: img.uploaded_at };
                                      }
                                      if (img.image_type === 'rgb') acc[timeKey].rgb = img;
                                      if (img.image_type === 'thermal') acc[timeKey].thermal = img;
                                      return acc;
                                    }, {});

                                    const sortedGroups = Object.values(timeGroups).sort((a, b) =>
                                      new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime()
                                    );

                                    return sortedGroups.length > 0 ? sortedGroups.map((entry, idx) => (
                                      <tr key={idx} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-6 py-4">
                                          <div className="flex flex-col">
                                            <div className="flex items-center text-[12px] font-bold text-gray-900 mb-1">
                                              <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                              {entry.time.split(' at ')[0]}
                                            </div>
                                            <div className="flex items-center text-[10px] font-bold text-gray-400">
                                              <Clock className="w-3 h-3 mr-2" />
                                              {entry.time.split(' at ')[1]}
                                            </div>
                                          </div>
                                        </td>

                                        {/* Drone Data Column */}
                                        <td className="px-6 py-4 border-l border-gray-50">
                                          <div className="flex justify-center">
                                            {entry.rgb ? (
                                              <div className="flex flex-col items-center gap-1">
                                                <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-[9px] font-black uppercase flex items-center">
                                                  <CheckCircle className="w-3 h-3 mr-1 text-orange-400" /> UPLOADED
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-[9px] font-black text-gray-200">PENDING</span>
                                            )}
                                          </div>
                                        </td>

                                        {/* Site Plan Column */}
                                        <td className="px-6 py-4 border-l border-gray-50">
                                          <div className="flex justify-center">
                                            {entry.thermal ? (
                                              <div className="flex flex-col items-center gap-1">
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[9px] font-black uppercase flex items-center">
                                                  <CheckCircle className="w-3 h-3 mr-1" /> UPLOADED
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-[9px] font-black text-gray-200">PENDING</span>
                                            )}
                                          </div>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-4 border-l border-gray-50 text-right">
                                          <div className="flex justify-end gap-2">
                                            {entry.rgb && (
                                              <button
                                                onClick={() => handleDeleteImage(entry.rgb.id)}
                                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Drone Data Batch"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                            {entry.thermal && (
                                              <button
                                                onClick={() => handleDeleteImage(entry.thermal.id)}
                                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border-l border-gray-100 ml-1 pl-3"
                                                title="Delete Site Plan Batch"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    )) : (
                                      <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                          <div className="flex flex-col items-center">
                                            <ImageIcon className="w-8 h-8 text-gray-200 mb-3" />
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No activity found yet</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {groupedLinksArray.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, groupedLinksArray.length)} of {groupedLinksArray.length} accounts
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      return Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-300 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-black transition-all ${currentPage === page
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-900/20 border-orange-600'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-500 hover:text-orange-600'
                            }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))
                  }
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Hidden PDF file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handlePdfUpload(e, selectedItemForUpload)}
        accept=".pdf,.html,.htm,.xlsx,.xls,.csv,.kml,.kmz"
        style={{ display: 'none' }}
      />
    </div>
  );
}

