'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, BarChart3, Users, Calendar, TrendingUp,
  ExternalLink, Shield, Loader2, Link as LinkIcon,
  Activity, RefreshCw, ChevronRight, CheckCircle2,
  Clock, BookOpen, Database, Sun, AlertTriangle, Image
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

function StatCard({ title, value, icon: Icon, color, bg, sub, loading }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Live</span>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mb-2" />
        ) : (
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        )}
        <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ActivityItem({ icon, label, user, time, badge, badgeColor }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
        <span className="text-base">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{label}</p>
          {badge && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {user} · <span className="text-slate-500">{time}</span>
        </p>
      </div>
    </div>
  );
}

function formatRelativeTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [errors, setErrors] = useState({});
  const [chartYear, setChartYear] = useState(2026);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    const name = localStorage.getItem('admin_name') || 'Admin';
    setAdminName(name);
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const errs = {};

    const safeJson = async (res, key) => {
      if (!res.ok) { errs[key] = `Error ${res.status}`; return []; }
      try { return await res.json(); } catch { errs[key] = 'Parse error'; return []; }
    };

    try {
      const [linksRes, bookingsRes, contactsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/drive-links`, { headers }),
        fetch(`${API_URL}/bookings/`, { headers }),
        fetch(`${API_URL}/contacts/`, { headers }),
        fetch(`${API_URL}/users/all`, { headers })
      ]);

      const [linksData, bookingsData, contactsData, usersData] = await Promise.all([
        safeJson(linksRes, 'driveLinks'),
        safeJson(bookingsRes, 'bookings'),
        safeJson(contactsRes, 'contacts'),
        safeJson(usersRes, 'users')
      ]);

      setErrors(errs);

      const sortByDate = arr => [...arr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setReports(sortByDate(linksData));
      setBookings(sortByDate(bookingsData));
      setContacts(sortByDate(contactsData));
      setUsers(usersData);

      // Build combined recent activity feed
      const activity = [
        ...sortByDate(bookingsData).slice(0, 4).map(b => ({
          id: `b-${b.id}`, icon: '📅',
          label: `Inspection Booking — ${b.service_type || 'General'}`,
          user: b.user_name || b.user_email || 'Guest',
          time: formatRelativeTime(b.created_at),
          badge: b.status || 'pending',
          badgeColor: statusColors[b.status] || 'bg-gray-100 text-gray-600',
          sortDate: new Date(b.created_at)
        })),
        ...sortByDate(linksData).slice(0, 3).map(l => ({
          id: `l-${l.id}`, icon: '📄',
          label: 'Report Uploaded',
          user: l.user_name || l.user_email || 'User',
          time: formatRelativeTime(l.created_at),
          badge: 'Report',
          badgeColor: 'bg-orange-100 text-orange-700',
          sortDate: new Date(l.created_at)
        })),
        ...sortByDate(contactsData).slice(0, 3).map(c => ({
          id: `c-${c.id}`, icon: '💬',
          label: 'New Contact Inquiry',
          user: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.work_email || 'Unknown',
          time: formatRelativeTime(c.created_at),
          badge: 'Inquiry',
          badgeColor: 'bg-purple-100 text-purple-700',
          sortDate: new Date(c.created_at)
        })),
        ...usersData.slice(0, 2).map(u => ({
          id: `u-${u.id || u._id}`, icon: '👤',
          label: 'New User Registered',
          user: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User',
          time: formatRelativeTime(u.created_at),
          badge: u.is_admin ? 'Admin' : 'User',
          badgeColor: u.is_admin ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600',
          sortDate: new Date(u.created_at)
        }))
      ]
        .filter(a => !isNaN(a.sortDate))
        .sort((a, b) => b.sortDate - a.sortDate)
        .slice(0, 8);

      setRecentActivity(activity);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  const stats = [
    { title: 'Registered Users', value: users.length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'All platform accounts' },
    { title: 'Active Bookings', value: activeBookings, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50', sub: 'Confirmed & Pending' },
    { title: 'Reports', value: reports.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'All user reports' },
    { title: 'Contact Inquiries', value: contacts.length, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Total form submissions' },
  ];

  // --- Chart Data ---
  // Booking status donut
  const statusCounts = bookings.reduce((acc, b) => {
    const s = b.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const PIE_COLORS = { confirmed: '#22c55e', pending: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444' };
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value, fill: PIE_COLORS[name] || '#94a3b8' }));

  // Clean 12-month labels for selected year
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const CHART_YEAR = chartYear;

  // Build combined data: bookings + inquiries per month
  const combined = MONTHS.map((month, idx) => ({ month, bookings: 0, inquiries: 0 }));

  bookings.forEach(b => {
    const d = new Date(b.created_at);
    if (!isNaN(d) && d.getFullYear() === CHART_YEAR) {
      combined[d.getMonth()].bookings++;
    }
  });
  contacts.forEach(c => {
    const d = new Date(c.created_at);
    if (!isNaN(d) && d.getFullYear() === CHART_YEAR) {
      combined[d.getMonth()].inquiries++;
    }
  });

  // Year options: 2026 up to current year
  const currentYear = now.getFullYear();
  const yearOptions = [];
  for (let y = 2026; y <= Math.max(currentYear, 2026); y++) yearOptions.push(y);

  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{greeting}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {adminName} <span className="text-slate-400 font-normal">↗</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-orange-300 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800 font-medium">
            Some data could not be loaded: <span className="font-bold">{Object.values(errors).join(', ')}</span>. Other sections are still functional.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} loading={loading} {...stat} />
        ))}
      </div>
      {/* Charts Row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Analytics Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Jan – Dec · Bookings & Inquiries by month</p>
        </div>
        <select
          value={chartYear}
          onChange={e => setChartYear(Number(e.target.value))}
          className="text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all cursor-pointer"
        >
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Booking Status Donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Booking Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by status</p>
          </div>
          {loading ? (
            <div className="h-52 bg-slate-50 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-slate-400 text-sm">No booking data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name.charAt(0).toUpperCase() + name.slice(1)]} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', color: '#64748b' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Bookings Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Bookings</h3>
              <p className="text-xs text-slate-400 mt-0.5">{chartYear} — Jan to Dec</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>Bookings
            </span>
          </div>
          {loading ? (
            <div className="h-52 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={combined} barSize={14} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={22} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', fontSize: 12, padding: '10px 16px' }} cursor={{ fill: '#fff7ed' }} formatter={(val) => [val, 'Bookings']} />
                <Bar dataKey="bookings" name="Bookings" fill="#f97316" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Inquiries Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Inquiries</h3>
              <p className="text-xs text-slate-400 mt-0.5">{chartYear} — Jan to Dec</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>Inquiries
            </span>
          </div>
          {loading ? (
            <div className="h-52 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={combined} barSize={14} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={22} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', fontSize: 12, padding: '10px 16px' }} cursor={{ fill: '#faf5ff' }} formatter={(val) => [val, 'Inquiries']} />
                <Bar dataKey="inquiries" name="Inquiries" fill="#a855f7" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Bookings Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
              <p className="text-xs text-slate-400 mt-0.5">{bookings.length} total inspection requests</p>
            </div>
            <button
              onClick={() => router.push('/booking')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Client</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Service</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.slice(0, 6).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-800 truncate max-w-[140px]">{b.user_name || 'Guest'}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{b.user_email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-700 font-medium truncate max-w-[120px] block">{b.service_type || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-slate-100 text-slate-500'}`}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-3">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivity.map(a => (
                  <ActivityItem key={a.id} icon={a.icon} label={a.label} user={a.user} time={a.time} badge={a.badge} badgeColor={a.badgeColor} />
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">System Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Bookings', val: bookings.length, max: Math.max(bookings.length, 1) },
                { label: 'Pending Review', val: bookings.filter(b => b.status === 'pending').length, max: Math.max(bookings.length, 1) },
                { label: 'Completed', val: bookings.filter(b => b.status === 'completed').length, max: Math.max(bookings.length, 1) },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className="text-white font-bold">{item.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Reports Generated</span>
                <span className="font-bold text-orange-400">{reports.length}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-400">User Inquiries</span>
                <span className="font-bold text-orange-400">{contacts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Reports</h2>
            <p className="text-xs text-slate-400 mt-0.5">{reports.length} linked reports</p>
          </div>
          <button onClick={() => router.push('/drivelinks')} className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No reports yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Uploaded</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.slice(0, 6).map(link => (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-800 truncate max-w-[160px]">{link.user_name || 'Anonymous'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{link.user_email || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {formatRelativeTime(link.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => router.push('/drivelinks')}
                        className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 border border-orange-100 hover:border-orange-300 rounded-lg transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
