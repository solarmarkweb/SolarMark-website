'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Search, Filter, MoreVertical, Edit, Trash2, UserPlus, Mail } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // API configuration
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // Fetch all registered users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            const response = await axios.get(`${API_URL}/users/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);

                // Calculate statistics
                const total = response.data.length;
                const active = response.data.filter(user =>
                    user.status === 'active' || user.status === 'Active'
                ).length;

                setStats({
                    total,
                    active,
                    inactive: total - active
                });
            } else {
                setUsers([]);
                setError('No users found');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view users');
            } else {
                setError(err.response?.data?.detail || 'Failed to fetch users from server');
            }
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Delete user function
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Remove user from local state
            setUsers(users.filter(user => user._id !== userId));

            // Update stats
            setStats(prev => ({
                ...prev,
                total: prev.total - 1
            }));

            alert('User deleted successfully');
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.detail || 'Failed to delete user');
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const roleStr = user.is_admin ? 'Admin' : (user.role || 'User');
        return (
            (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
            (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower)) ||
            (roleStr.toLowerCase().includes(searchLower))
        );
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get initials for avatar
    const getInitials = (user) => {
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`;
        } else if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6 pb-20">
            {/* Page Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-1 font-medium text-xs">Manage all registered users in the system</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                        <Filter size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                        <span className="text-xs font-bold text-gray-500">registered</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Users</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
                        <span className="text-xs font-bold text-green-500">currently active</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Status</p>
                    <div className="flex items-center gap-2 text-green-600 mt-1">
                        <Shield size={16} />
                        <span className="text-sm font-bold">Secure Connection</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchUsers}
                            className="px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            {loading ? 'Refreshing...' : 'Refresh List'}
                        </button>
                        <span className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium">
                            {filteredUsers.length} users
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">No Users Found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'No users match your search' : 'No registered users in the system'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-bold text-orange-600 border border-white shadow-sm">
                                                    {getInitials(user)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {user._id?.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700 font-medium">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.is_admin || user.role === 'admin' || user.role === 'Admin'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {user.is_admin || user.role === 'admin' || user.role === 'Admin' ? 'Admin' : (user.role || 'User')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm text-gray-600 font-medium">
                                                {formatDate(user.created_at || user.joined_date)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'active' || user.status === 'Active'
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                                    }`} />
                                                <span className="text-sm font-medium text-gray-600">
                                                    {user.status === 'active' || user.status === 'Active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id || user.id)}
                                                    className="px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 rounded-lg transition-all border border-rose-100 bg-rose-50"
                                                    title="Delete User"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 font-medium">
                    <span className="font-bold text-gray-900">System Information:</span> Managing all registered administrative and user accounts.
                </p>
            </div>
        </div>
    );
}