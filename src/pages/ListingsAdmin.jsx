import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LogOut, Plus, Search, RefreshCw, Trash2, Edit, Eye, 
  ChevronLeft, ChevronRight, Users, Briefcase, Home, Heart, 
  DollarSign, Calendar, MapPin, Mail, Phone, CheckCircle, XCircle,
  MoreVertical, Filter, Download, Image, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllListings, deleteListing, updateListing, getAllUsers } from '../db/databaseAdapter';
import { format } from 'date-fns';

const ListingsAdmin = () => {
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingListing, setEditingListing] = useState(null);
  const itemsPerPage = 10;

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'parttime', label: 'Part-time Job', icon: Briefcase },
    { id: 'business', label: 'Business for Sale', icon: DollarSign },
    { id: 'property', label: 'Property for Rent', icon: Home },
    { id: 'wedding', label: 'Wedding Hall', icon: Heart },
  ];

  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'active', label: 'Active', color: 'emerald' },
    { id: 'pending', label: 'Pending', color: 'amber' },
    { id: 'rejected', label: 'Rejected', color: 'red' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsData, usersData] = await Promise.all([
        getAllListings(),
        getAllUsers()
      ]);
      setListings(listingsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isSuperAdmin()) {
      navigate('/listings-login');
    } else {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/listings-login');
  };

  const handleDeleteListing = async (listing) => {
    if (!window.confirm(`Delete listing "${listing.title}"?\n\nThis action cannot be undone.`)) return;
    
    try {
      await deleteListing(listing.id);
      setListings(prev => prev.filter(l => l.id !== listing.id));
      alert('Listing deleted successfully');
    } catch (error) {
      alert('Failed to delete listing: ' + error.message);
    }
  };

  const handleStatusChange = async (listing, newStatus) => {
    try {
      await updateListing(listing.id, { status: newStatus });
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected listings?`)) return;
    
    try {
      await Promise.all(selectedItems.map(id => deleteListing(id)));
      setListings(prev => prev.filter(l => !selectedItems.includes(l.id)));
      setSelectedItems([]);
      alert('Listings deleted successfully');
    } catch (error) {
      alert('Failed to delete listings: ' + error.message);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter users
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(
    (activeTab === 'listings' ? filteredListings.length : filteredUsers.length) / itemsPerPage
  );
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    pendingListings: listings.filter(l => l.status === 'pending').length,
    totalUsers: users.length,
    todayUsers: users.filter(u => {
      const created = new Date(u.created_at);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length,
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || Briefcase;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      deleted: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-6">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/80 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Listings Admin</h1>
                <p className="text-gray-500 text-xs">Manage marketplace listings & users</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
              >
                Back to Site
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
                <p className="text-xs text-gray-500">Total Listings</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeListings}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pendingListings}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.todayUsers}</p>
                <p className="text-xs text-gray-500">New Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-gray-700/50 p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('listings'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'listings' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                Listings ({listings.length})
              </button>
              <button
                onClick={() => { setActiveTab('users'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'users' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                Users ({users.length})
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={activeTab === 'listings' ? 'Search listings...' : 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {activeTab === 'listings' && (
                <>
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </>
              )}

              <button
                onClick={fetchData}
                className="p-2 bg-gray-900/50 border border-gray-700/50 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-all"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-4 py-3 flex items-center gap-4">
              <span className="text-indigo-400 text-sm">{selectedItems.length} selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="text-gray-400 text-sm hover:text-white"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Listings Table */}
          {activeTab === 'listings' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedListings.length && paginatedListings.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(paginatedListings.map(l => l.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Listing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {paginatedListings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        No listings found
                      </td>
                    </tr>
                  ) : (
                    paginatedListings.map((listing) => {
                      const CategoryIcon = getCategoryIcon(listing.category);
                      return (
                        <tr key={listing.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(listing.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, listing.id]);
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== listing.id));
                                }
                              }}
                              className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                                {listing.images && listing.images[0] ? (
                                  <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Image className="w-5 h-5 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium truncate max-w-[200px]">{listing.title}</p>
                                <p className="text-gray-500 text-xs truncate max-w-[200px]">{listing.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300 text-sm capitalize">{listing.category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-400 text-sm font-medium">
                              {listing.currency === 'SGD' ? 'S$' : listing.currency === 'MYR' ? 'RM' : '$'}
                              {listing.budgetMin?.toLocaleString() || '0'}
                              {listing.budgetMax && ` - ${listing.budgetMax.toLocaleString()}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-300 text-sm">{listing.email}</p>
                              <p className="text-gray-500 text-xs">{listing.contact}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={listing.status}
                              onChange={(e) => handleStatusChange(listing, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(listing.status)} bg-transparent cursor-pointer focus:outline-none`}
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-400 text-sm">
                              {listing.createdAt ? format(new Date(listing.createdAt), 'MMM d, yyyy') : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDeleteListing(listing)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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
          )}

          {/* Users Table */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.email}</p>
                              <p className="text-gray-500 text-xs">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{user.contact || 'Not provided'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'superadmin' 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : user.role === 'owner'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-sm">
                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy HH:mm') : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-700/50 px-4 py-3 flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'listings' ? filteredListings.length : filteredUsers.length)} of {activeTab === 'listings' ? filteredListings.length : filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-800/50 text-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-gray-400 text-sm px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-800/50 text-gray-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListingsAdmin;
