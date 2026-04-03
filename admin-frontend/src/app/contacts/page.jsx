'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Mail,
    Phone,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Trash2,
    Leaf,
    Home,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Clock,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContactsAdminPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

    const parseContactDate = (dateString) => {
        if (!dateString) return null;

        let dateToParse = dateString;
        if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
            dateToParse = `${dateString}Z`;
        }

        const date = new Date(dateToParse);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatContactDate = (dateString) => {
        const date = parseContactDate(dateString);
        return date ? date.toLocaleDateString() : 'N/A';
    };

    const formatContactTime = (dateString) => {
        const date = parseContactDate(dateString);
        return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    };

    const fetchContacts = async () => {
        const token = localStorage.getItem('token');

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/contacts/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch contact requests');

            const data = await response.json();
            setContacts(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');
            fetchContacts();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact request?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete contact request');
            fetchContacts();
        } catch (err) {
            alert(err.message);
        }
    };

    // Filtering logic
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact =>
            contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredContacts.slice(start, start + itemsPerPage);
    }, [filteredContacts, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when searching
    }, [searchTerm]);

    useEffect(() => {
        fetchContacts();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-gray-900">Contact Requests</h1>
                                <p className="text-[11px] text-gray-400 font-medium">Managing user inquiries</p>
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

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Inquiries</p>
                        <p className="text-2xl font-bold mt-1 text-gray-600">{contacts.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Inquiries</p>
                        <p className="text-2xl font-bold mt-1 text-orange-600">{contacts.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm overflow-hidden whitespace-nowrap transition-all hover:shadow-md">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Request</p>
                        <p className="text-sm font-bold mt-2 text-gray-600 truncate">
                            {contacts.length > 0 ? `${contacts[0].first_name} ${contacts[0].last_name}` : 'No data'}
                        </p>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, message..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-grow overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-[220px]">Sender</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-[500px]">Message Content</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[140px]">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[180px]">Received At</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-[100px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500 font-medium">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                                                Loading inquiries...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center flex flex-col items-center">
                                            <MessageSquare className="w-12 h-12 text-gray-100 mb-4" />
                                            <h3 className="text-sm font-bold text-gray-900">No inquiry found</h3>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedContacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-6 overflow-hidden">
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-sm font-bold text-gray-900 tracking-tight">
                                                        {contact.first_name} {contact.last_name}
                                                    </span>
                                                    <div className="flex items-center text-[11px] text-gray-400 font-medium truncate">
                                                        <Mail className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-l border-gray-50/50">
                                                <p className="text-[11px] text-gray-600 leading-relaxed font-medium whitespace-pre-line" title={contact.message}>
                                                    {contact.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleStatusUpdate(contact.id, contact.status === 'new' ? 'read' : 'new')}
                                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${contact.status === 'new'
                                                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                                                        : 'bg-green-100 text-green-700 border-green-200'
                                                        }`}
                                                >
                                                    {contact.status || 'new'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                    {formatContactDate(contact.created_at)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {formatContactTime(contact.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDelete(contact.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all uppercase tracking-wider"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between mt-auto">
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                            Showing <span className="mx-1 text-gray-900">{filteredContacts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to
                            <span className="mx-1 text-gray-900">{Math.min(currentPage * itemsPerPage, filteredContacts.length)}</span> of
                            <span className="mx-1 text-gray-900 font-bold">{filteredContacts.length}</span> entries
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 transition-all font-bold"
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
                                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30 transition-all font-bold"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
