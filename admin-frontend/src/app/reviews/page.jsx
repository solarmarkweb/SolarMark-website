'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    MessageSquarePlus,
    RefreshCw,
    Loader2,
    User,
    Clock,
    FileText,
    X,
    AlertCircle,
    CheckCircle2,
    Send,
    Shield,
    Search,
    ChevronRight,
    MessageCircle,
    Inbox,
    CheckSquare,
    Users,
    Filter,
    Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FormalReportReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [updatingReview, setUpdatingReview] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [userSubsetFilter, setUserSubsetFilter] = useState('all'); // All, Pending, Completed for active user

    // Manage Review Modal State
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [updateStatus, setUpdateStatus] = useState('pending');
    const [replacementFile, setReplacementFile] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api';
    const router = useRouter();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/drive-links/report/reviews/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);

            if (data.length > 0 && !selectedUserId) {
                const firstUser = data[0].user_id;
                setSelectedUserId(firstUser);
            }
        } catch (err) {
            setError('System connectivity error. Please ensure backend is operational.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const groupedUsers = useMemo(() => {
        const groups = {};
        reviews.forEach(review => {
            if (!groups[review.user_id]) {
                groups[review.user_id] = {
                    user_id: review.user_id,
                    user_name: review.user_name || 'System User',
                    user_email: review.user_email || '',
                    reviews: [],
                    pendingCount: 0
                };
            }
            groups[review.user_id].reviews.push(review);
            if ((review.status || '').toLowerCase() === 'pending') {
                groups[review.user_id].pendingCount += 1;
            }
        });

        return Object.values(groups)
            .filter(group => {
                const matchesSearch = searchTerm === '' ||
                    group.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    group.user_email.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesStatus = statusFilter === 'all' ||
                    (statusFilter === 'pending' && group.pendingCount > 0) ||
                    (statusFilter === 'completed' && group.pendingCount === 0);

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => b.pendingCount - a.pendingCount);
    }, [reviews, searchTerm, statusFilter]);

    const activeUserData = useMemo(() =>
        groupedUsers.find(u => u.user_id === selectedUserId),
        [selectedUserId, groupedUsers]);

    const filteredActiveReviews = useMemo(() => {
        if (!activeUserData) return [];
        return activeUserData.reviews.filter(r => {
            if (userSubsetFilter === 'all') return true;
            return (r.status || '').toLowerCase() === userSubsetFilter;
        });
    }, [activeUserData, userSubsetFilter]);

    const handleManageClick = (review) => {
        setCurrentReview(review);
        setAdminRemarks(review.admin_remarks || '');
        setUpdateStatus(review.status || 'pending');
        setReplacementFile(null);
        setShowUpdateModal(true);
    };

    const updateReview = async () => {
        try {
            setUpdatingReview(currentReview.id);
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

            // 1. First upload the document if any
            if (replacementFile) {
                const formData = new FormData();
                formData.append('pdf', replacementFile);

                const uploadRes = await fetch(`${API_URL}/drive-links/report/review/${currentReview.id}/upload-replacement`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Document replacement failed');
            }

            // 2. Then update status and remarks
            const response = await fetch(`${API_URL}/drive-links/report/review/${currentReview.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: updateStatus,
                    admin_remarks: adminRemarks
                })
            });

            if (!response.ok) throw new Error('Status update failed');

            await fetchReviews();
            setShowUpdateModal(false);
            setReplacementFile(null);
            setSuccessMsg('Report replacement successfully updated!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.message || 'Operational failure during status update.');
        } finally {
            setUpdatingReview(null);
        }
    };

    const globalStats = useMemo(() => ({
        pending: reviews.filter(r => (r.status || '').toLowerCase() === 'pending').length,
        totalAccounts: new Set(reviews.map(r => r.user_id)).size
    }), [reviews]);

    return (
        <div className="flex h-screen bg-[#FDFDFD] overflow-hidden text-slate-800 font-sans">
            {successMsg && (
                <div className="fixed top-6 right-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-3 z-50">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">{successMsg}</p>
                </div>
            )}

            {/* Sidebar: Navigation Inbox */}
            <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <h1 className="text-lg font-bold tracking-tight mb-4">Report Reviews</h1>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 focus:shadow-sm"
                        />
                    </div>

                    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
                        {['all', 'pending', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {groupedUsers.length === 0 ? (
                        <div className="p-10 text-center text-slate-300 text-[10px] font-bold uppercase">No records found</div>
                    ) : (
                        groupedUsers.map(user => (
                            <button
                                key={user.user_id}
                                onClick={() => {
                                    setSelectedUserId(user.user_id);
                                    setUserSubsetFilter('all');
                                }}
                                className={`w-full p-4 flex items-center gap-3 border-b border-slate-50 transition-colors ${selectedUserId === user.user_id ? 'bg-slate-100/50' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${user.pendingCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <User size={16} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-xs font-bold truncate">{user.user_name}</p>
                                        {user.pendingCount > 0 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate font-medium">{user.user_email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Workplace: Detailed Analysis */}
            <div className="flex-1 flex flex-col bg-white">
                {activeUserData ? (
                    <>
                        {/* Workplace Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Account: {activeUserData.user_name}
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                        ID: {activeUserData.user_id.slice(-8)}
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">{activeUserData.user_email}</p>
                            </div>
                            <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                {['all', 'pending', 'completed'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setUserSubsetFilter(f)}
                                        className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${userSubsetFilter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Document List */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-5xl mx-auto space-y-6">
                                {filteredActiveReviews.length === 0 ? (
                                    <div className="text-center py-12 text-slate-300 text-xs font-bold uppercase tracking-widest bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        No matching documents for this filter
                                    </div>
                                ) : (
                                    filteredActiveReviews.map((review, index) => (
                                        <div key={review.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
                                            {/* Sequence Indicator */}
                                            <div className="w-12 bg-slate-50 border-r border-slate-100 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-slate-400">#{index + 1}</span>
                                            </div>

                                            <div className="flex-1">
                                                {/* Header Row */}
                                                <div className="px-6 py-4 flex flex-col gap-3 border-b border-slate-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                                <FileText size={14} />
                                                            </div>
                                                            <div>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Original File Submitted For Review</span>
                                                                <p className="text-xs font-bold text-slate-900 leading-none mb-1">{review.filename}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(review.submitted_at)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${(review.status || '').toLowerCase() === 'completed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {review.status || 'Pending'}
                                                            </div>
                                                            <button
                                                                onClick={() => handleManageClick(review)}
                                                                className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest px-3 py-1.5 border border-blue-100 rounded-md hover:bg-blue-50 transition-colors"
                                                            >
                                                                Update Decision
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {review.replacement_filename && (
                                                        <div className="flex items-center gap-4 mt-2 border-t border-slate-50 pt-3">
                                                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500 shrink-0 shadow-sm border border-green-100">
                                                                <CheckCircle2 size={14} />
                                                            </div>
                                                            <div>
                                                                <span className="text-[8px] font-black text-green-600 uppercase tracking-widest block mb-0.5">Revised File Successfully Re-Uploaded</span>
                                                                <p className="text-xs font-bold text-slate-900 leading-none">{review.replacement_filename}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Row */}
                                                <div className="px-6 py-5 grid grid-cols-2 gap-8 bg-slate-50/30">
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Client Feedback</p>
                                                        <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{review.user_feedback}</p>
                                                    </div>
                                                    <div className="space-y-2 border-l border-slate-200 pl-8">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Analysis Remark</p>
                                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                                            {review.admin_remarks || "No remark assigned."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                            < Inbox size={32} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] mb-2">Select Account</h3>
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Please select a client from the left panel to begin status management and formal reporting.</p>
                    </div>
                )}
            </div>

            {/* Formal Modal */}
            {showUpdateModal && currentReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Update Report Status</h3>
                            <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Classification</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setUpdateStatus('pending')}
                                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all ${updateStatus === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        Pending Action
                                    </button>
                                    <button
                                        onClick={() => setUpdateStatus('completed')}
                                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all ${updateStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        Resolved / Adjusted
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Administrative Remark</label>
                                <textarea
                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300"
                                    placeholder="Enter formal response for the client..."
                                    value={adminRemarks}
                                    onChange={(e) => setAdminRemarks(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Re-upload Document (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer group">
                                        <Upload className="text-slate-400 group-hover:text-orange-500 mb-2" size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-600">
                                            {replacementFile ? replacementFile.name : 'Select Updated PDF'}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setReplacementFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                    {replacementFile && (
                                        <button
                                            onClick={() => setReplacementFile(null)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 flex-shrink-0"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={updateReview}
                                disabled={updatingReview}
                                className="w-full py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {updatingReview ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                Finalize Status Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
