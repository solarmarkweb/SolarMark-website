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
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const router = useRouter();

    // Helper to extract fields from notes
    const getValueFromNotes = (notes, field) => {
        if (!notes) return '';
        const regex = new RegExp(`${field}:\\s*(.*?)(\\n|$)`, 'i');
        const match = notes.match(regex);
        return match ? match[1].trim() : '';
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
        notes: ''
    });

    const [editMode, setEditMode] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    // Fetch Bookings
    const fetchBookings = async () => {
        const token = localStorage.getItem('token');

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
            notes: ''
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
            notes: booking.notes || ''
        });
        setCurrentBookingId(booking.id);
        setEditMode(true);
        setShowModal(true);
    };

    // Filtering logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch = booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.location?.toLowerCase().includes(searchTerm.toLowerCase());
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

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 transition-all duration-300">
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
                        { label: 'Total Requests', count: bookings.length, color: 'text-gray-600', bg: 'bg-white' },
                        { label: 'Awaiting Review', count: bookings.filter(b => b.status === 'pending').length, color: 'text-amber-600', bg: 'bg-white' },
                        { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'text-emerald-600', bg: 'bg-white' },
                        { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'text-blue-600', bg: 'bg-white' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md`}>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[540px]">
                    {/* Table Toolbar */}
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
                                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="flex-grow overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[220px]">Customer / Type</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Schedule</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Contact</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[220px]">Company + Site</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[200px]">Additional</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[110px]">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[200px]">Actions</th>
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
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <Calendar className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900">No entries found</h3>
                                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedBookings.map((booking) => {
                                        const companyName = getValueFromNotes(booking.notes, 'Company');
                                        const jobTitle = getValueFromNotes(booking.notes, 'Job Title');
                                        const referralSource = getValueFromNotes(booking.notes, 'Referral Source');
                                        // Simple extraction for Additional Info if it's at the end
                                        const additionalInfoMatch = booking.notes?.match(/Additional Info:([\s\S]*)/);
                                        const additionalInfo = additionalInfoMatch ? additionalInfoMatch[1].trim() : '';

                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 py-3 overflow-hidden">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 truncate">{booking.user_name || 'Guest User'}</span>
                                                        <span className="text-[11px] font-semibold text-orange-600 mt-0.5">{booking.service_type}</span>
                                                        <div className="flex items-center text-[10px] text-gray-400 mt-1 truncate">
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
                                                                <MapPin className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                                <span className="line-clamp-1" title={booking.location}>{booking.location}</span>
                                                            </div>
                                                        )}
                                                        {booking.system_size && (
                                                            <div className="flex items-center mt-1 text-gray-400">
                                                                <Zap className="w-3 h-3 mr-1.5" />
                                                                {booking.system_size}
                                                            </div>
                                                        )}
                                                        {!companyName && !jobTitle && !booking.location && !booking.system_size && (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-xs text-gray-500 max-w-[200px]">
                                                        {referralSource && (
                                                            <div className="mb-1">
                                                                <span className="font-semibold text-gray-400">Ref:</span> {referralSource}
                                                            </div>
                                                        )}
                                                        {additionalInfo && (
                                                            <div className="line-clamp-2 italic" title={additionalInfo}>
                                                                "{additionalInfo}"
                                                            </div>
                                                        )}
                                                        {!referralSource && !additionalInfo && <span className="text-gray-300">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* Workflow Actions */}
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                            disabled={booking.status === 'confirmed'}
                                                            className="h-8 px-3 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-600"
                                                            title="Accept Booking"
                                                        >
                                                            ACCEPT
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                            disabled={booking.status === 'cancelled'}
                                                            className="h-8 px-3 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                                                            title="Reject Booking"
                                                        >
                                                            REJECT
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'pending')}
                                                            disabled={booking.status === 'pending'}
                                                            className="h-8 px-3 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-500 hover:text-white transition-all disabled:opacity-30"
                                                            title="Move to Pending"
                                                        >
                                                            PENDING
                                                        </button>
                                                        {/* Control Actions */}
                                                        <div className="ml-2 h-6 w-px bg-gray-100"></div>
                                                        <button
                                                            onClick={() => openEditModal(booking)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                            title="Edit details"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(booking.id)}
                                                            className="px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 rounded-lg transition-all border border-rose-100 bg-rose-50"
                                                            title="Delete entry"
                                                        >
                                                            DELETE
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

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between mt-auto">
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                            Showing <span className="mx-1 text-gray-900">{filteredBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to
                            <span className="mx-1 text-gray-900">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of
                            <span className="mx-1 text-gray-900 font-bold">{filteredBookings.length}</span> results
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editMode ? 'Edit Booking' : 'New Service Booking'}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Fill in the details for the manual schedule</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 text-gray-400 rounded-full transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold rounded-lg flex items-center">
                                    <AlertCircle className="w-3.5 h-3.5 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Service Type</label>
                                <select
                                    name="service_type"
                                    value={formData.service_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                >
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
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        required
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact Phone</label>
                                <input
                                    type="tel"
                                    name="contact_phone"
                                    required
                                    placeholder="+1 (234) 567-8900"
                                    value={formData.contact_phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="City / Address"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">System Size</label>
                                    <input
                                        type="text"
                                        name="system_size"
                                        placeholder="e.g. 10kW"
                                        value={formData.system_size}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    placeholder="Any specific requirements..."
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm resize-none transition-all bg-gray-50/50"
                                />
                            </div>

                            <div className="pt-4 mt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all duration-200 flex justify-center items-center disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editMode ? 'Save Changes' : 'Confirm Registration')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
