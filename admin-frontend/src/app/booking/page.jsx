'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Clock,
    Phone,
    Plus,
    Loader2,
    CheckCircle,
    XCircle,
    X,
    AlertCircle,
    Search,
    Trash2,
    Edit,
    Leaf,
    Home,
    MapPin,
    Zap,
    Mail,
    ChevronLeft,
    ChevronRight,
    Eye,
    MoreHorizontal,
    User,
    FileText,
    Plane
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const router = useRouter();

    // Helper to extract fields from notes (Legacy fallback)
    const getValueFromNotes = (notes, field) => {
        if (!notes) return '';
        const regex = new RegExp(`${field}:\\s*(.*?)(\\n|$)`, 'i');
        const match = notes.match(regex);
        return match ? match[1].trim() : '';
    };

    // Helper to render extra fields dynamically
    const renderExtraFields = (booking) => {
        const handledFields = [
            'id', 'user_id', 'user_email', 'user_name', 'service_type', 
            'date', 'time', 'notes', 'contact_phone', 'status', 
            'payment_status', 'location', 'system_size', 'company_name', 
            'area_size', 'created_at', 'project_name', 'inspection_purpose',
            'coordinates', 'drone', 'pilot', 'flight', 'compliance', 
            'thermal', '_id', 'name', 'email', 'output'
        ];

        const extras = Object.entries(booking).filter(([key]) => !handledFields.includes(key));
        if (extras.length === 0) return null;

        return (
            <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Extended Payload</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {extras.map(([key, value]) => (
                        <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                            <p className="text-xs font-bold text-slate-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    // Form State
    const [formData, setFormData] = useState({
        service_type: 'Solar Panel Cleaning',
        date: '',
        time: '',
        contact_phone: '',
        location: '',
        system_size: '',
        notes: '',
        company_name: '',
        area_size: '',
        project_name: '',
        inspection_purpose: ''
    });

    const [editMode, setEditMode] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

    // Fetch Bookings
    const fetchBookings = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            setLoading(true);
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${API_URL}/bookings/`, { headers });
            if (!response.ok) throw new Error('Failed to fetch bookings');

            const data = await response.json();
            setBookings(data);
            setError('');
        } catch (err) {
            setError('Error loading bookings. Please ensure you are logged in.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Form Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit Booking
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            let url = `${API_URL}/bookings/`;
            let method = 'POST';

            if (editMode && currentBookingId) {
                url = `${API_URL}/bookings/${currentBookingId}`;
                method = 'PATCH';
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to save booking');
            }

            setShowModal(false);
            resetForm();
            fetchBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Booking
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete booking');
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert('Error deleting booking');
        }
    };

    // Update Status
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                router.push('/');
                return;
            }

            if (!response.ok) throw new Error('Failed to update status');
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };

    const resetForm = () => {
        setFormData({
            service_type: 'Solar Panel Cleaning',
            date: '',
            time: '',
            contact_phone: '',
            location: '',
            system_size: '',
            notes: '',
            company_name: '',
            area_size: '',
            project_name: '',
            inspection_purpose: ''
        });
        setEditMode(false);
        setCurrentBookingId(null);
    };

    const openEditModal = (booking) => {
        setFormData({
            service_type: booking.service_type,
            date: booking.date,
            time: booking.time,
            contact_phone: booking.contact_phone,
            location: booking.location || '',
            system_size: booking.system_size || '',
            notes: booking.notes || '',
            company_name: booking.company_name || '',
            area_size: booking.area_size || '',
            project_name: booking.project_name || '',
            inspection_purpose: booking.inspection_purpose || ''
        });
        setCurrentBookingId(booking.id);
        setEditMode(true);
        setShowModal(true);
    };

    // Filtering logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                (booking.user_name || '').toLowerCase().includes(searchLower) ||
                (booking.service_type || '').toLowerCase().includes(searchLower) ||
                (booking.user_email || '').toLowerCase().includes(searchLower) ||
                (booking.location || '').toLowerCase().includes(searchLower) ||
                (booking.company_name || '').toLowerCase().includes(searchLower);
            const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, filterStatus]);

    // Pagination logic
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(start, start + itemsPerPage);
    }, [filteredBookings, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filtering
    }, [searchTerm, filterStatus]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPaymentStyles = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'created': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-gray-100 text-gray-400 border-gray-200';
            default: return 'bg-rose-50 text-rose-600 border-rose-100';
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Leaf className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-gray-900">Service Management</h1>
                                <p className="text-[11px] text-gray-400 font-medium">Monitoring all active bookings</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Admin View
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Requests', count: bookings.length, color: 'text-gray-600' },
                        { label: 'Awaiting Review', count: bookings.filter(b => b.status === 'pending').length, color: 'text-amber-600' },
                        { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'text-emerald-600' },
                        { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'text-blue-600' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[540px]">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by customer, email, location..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === status
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[220px]">Customer / Type</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Schedule</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Contact</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[220px]">Company + Site</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[110px]">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[110px]">Payment</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[240px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                                                <span className="text-sm font-medium text-gray-500">Retrieving data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Calendar className="w-10 h-10 text-gray-200 mb-2" />
                                                <h3 className="text-sm font-bold text-gray-900">No entries found</h3>
                                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedBookings.map((booking) => {
                                        const companyName = booking.company_name || getValueFromNotes(booking.notes, 'Company');
                                        const jobTitle = booking.service_type || getValueFromNotes(booking.notes, 'Job Title');
                                        const referralSource = getValueFromNotes(booking.notes, 'Referral Source');
                                        const addInfoMatch = booking.notes?.match(/Additional Info:([\s\S]*)/);
                                        const addInfo = addInfoMatch ? addInfoMatch[1].trim() : '';

                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 truncate">{booking.user_name || 'Guest User'}</span>
                                                        <span className="text-[11px] font-semibold text-orange-600">{booking.service_type}</span>
                                                        <div className="flex items-center text-[10px] text-gray-400 mt-1">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {booking.user_email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                            {booking.date}
                                                        </div>
                                                        <div className="flex items-center mt-1 text-xs text-gray-400">
                                                            <Clock className="w-3.5 h-3.5 mr-2" />
                                                            {booking.time}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                        {booking.contact_phone}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col text-[11px] text-gray-600">
                                                        {companyName && (
                                                            <div className="font-bold text-gray-800 truncate">{companyName}</div>
                                                        )}
                                                        {jobTitle && (
                                                            <div className="text-gray-500 truncate">{jobTitle}</div>
                                                        )}
                                                        {booking.location && (
                                                            <div className="flex items-start mt-1 text-gray-500">
                                                                <MapPin className="w-3 h-3 mr-1.5 text-gray-400 mt-0.5" />
                                                                <span className="line-clamp-1">{booking.location}</span>
                                                            </div>
                                                        )}
                                                        {booking.system_size && (
                                                            <div className="flex items-center mt-1 text-gray-400">
                                                                <Zap className="w-3 h-3 mr-1.5" />
                                                                {booking.system_size} {booking.area_size && `(${booking.area_size})`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusStyles(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getPaymentStyles(booking.payment_status)}`}>
                                                        {booking.payment_status === 'active' ? 'PAID' : (booking.payment_status || 'UNPAID')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                            disabled={booking.status === 'confirmed'}
                                                            className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                                                            title="Accept"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                            disabled={booking.status === 'cancelled'}
                                                            className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => openEditModal(booking)}
                                                            className="p-1.5 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(booking.id)}
                                                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">
                            Showing {filteredBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">{editMode ? 'Edit Booking' : 'New Service Booking'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">{error}</div>}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Service Type</label>
                                    <select name="service_type" value={formData.service_type} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500">
                                        <option>Solar Panel Cleaning</option>
                                        <option>Maintenance Check</option>
                                        <option>Repair Service</option>
                                        <option>System Upgrade</option>
                                        <option>Consultation</option>
                                        <option>Residential</option>
                                        <option>Commercial</option>
                                        <option>Industrial solar farm</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Date</label>
                                        <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Time</label>
                                        <input type="time" name="time" required value={formData.time} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Contact Phone</label>
                                    <input type="tel" name="contact_phone" required value={formData.contact_phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Company Name</label>
                                        <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="e.g. SolarMark" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Area Size</label>
                                        <input type="text" name="area_size" value={formData.area_size} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="e.g. 10 Acres" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Project Name</label>
                                        <input type="text" name="project_name" value={formData.project_name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="e.g. Sahara Site" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Inspection Purpose</label>
                                        <input type="text" name="inspection_purpose" value={formData.inspection_purpose} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="e.g. Thermal" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="City / Address" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">System Size</label>
                                        <input type="text" name="system_size" value={formData.system_size} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" placeholder="e.g. 10kW" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Notes (Optional)</label>
                                    <textarea name="notes" rows="3" value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-500" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editMode ? 'Save Changes' : 'Confirm Registration')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-10 pointer-events-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBooking(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-2xl" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/90">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                            <Plane size={16} className="text-orange-500" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Deployment Request</h2>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                        REF ID: <span className="text-slate-600 font-mono select-all bg-slate-50 px-1.5 py-0.5 rounded uppercase">{String(selectedBooking.id).slice(-12)}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
                                {/* Section: Primary Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Contact Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <User size={14} className="text-orange-500" /> Contact Info
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 space-y-6">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Full Name</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.user_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Email Address</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.user_email}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Phone Reference</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.contact_phone || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Lead Attribution</label>
                                                <span className="inline-flex mt-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm italic">
                                                    {selectedBooking.service_type || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Parameters */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <FileText size={14} className="text-orange-500" /> Project Scope
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 space-y-6">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Project Name</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.project_name || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Company Entity</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.company_name || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Inspection Mandate</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.inspection_purpose || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">System Capacity & Coverage</label>
                                                <p className="text-md font-bold text-slate-800">
                                                    {selectedBooking.system_size || '-'} 
                                                    {selectedBooking.area_size && <span className="text-slate-400 font-medium text-xs ml-2">({selectedBooking.area_size})</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Logistics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-100">
                                    {/* Location Analytics */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <MapPin size={14} className="text-orange-500" /> Geolocation
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 space-y-6">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Primary Address</label>
                                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedBooking.location || 'No address provided'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-sm">
                                                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Latitude</label>
                                                    <p className="font-mono text-xs font-black text-orange-600">{selectedBooking.coordinates?.lat || '-'}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-150 text-center shadow-sm">
                                                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Longitude</label>
                                                    <p className="font-mono text-xs font-black text-orange-600">{selectedBooking.coordinates?.lng || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Flight Schedule */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Plane size={14} className="text-orange-500" /> Flight Windows
                                        </h3>
                                        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Target Date</label>
                                                    <p className="text-md font-bold text-slate-800">{selectedBooking.date || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Request Time</label>
                                                    <p className="text-md font-bold text-slate-800">{selectedBooking.time || '-'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Requested Altitude (GSD Target)</label>
                                                <p className="text-md font-bold text-slate-800">{selectedBooking.flight?.altitude || selectedBooking.altitude || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.thermal && (
                                    <div className="pt-8 border-t border-slate-100">
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 px-1">
                                                <Zap size={14} className="text-orange-500" /> Thermal Calibration
                                            </h3>
                                            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Drone</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.drone_type || '-'}</p></div>
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Alt</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.flight_altitude || '-'}m</p></div>
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Irr.</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.irradiance || '-'} W/m²</p></div>
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Emis.</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.emissivity || '-'}</p></div>
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Humid.</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.humidity || '-'}%</p></div>
                                                    <div><p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Ambient</p><p className="text-[11px] font-bold text-white">{selectedBooking.thermal.ambient_temperature || '-'}°C</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.notes && (
                                    <div className="pt-8 border-t border-slate-100">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Technical Notes</h3>
                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-slate-600 text-sm italic leading-relaxed whitespace-pre-wrap">
                                            "{selectedBooking.notes}"
                                        </div>
                                    </div>
                                )}

                                {renderExtraFields(selectedBooking)}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center z-20">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Lifecycle State</label>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner flex items-center gap-2 ${getStatusStyles(selectedBooking.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
                                            {selectedBooking.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Financial Reconciliation</label>
                                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/10 bg-white/5 text-slate-300">
                                            {selectedBooking.payment_status}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedBooking(null)} 
                                    className="px-10 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-900/20 active:scale-95"
                                >
                                    Close Inspector
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
