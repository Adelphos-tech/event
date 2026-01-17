import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Plus, Users, Search, Upload, Download, Calendar, 
  Phone, Mail, DollarSign, CheckCircle, XCircle, Clock,
  Edit2, Trash2, Eye, X, ChevronDown, FileSpreadsheet,
  Building2, UserPlus, CreditCard, AlertCircle
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { format } from 'date-fns';

// Membership year runs from Jan 1 to Dec 31
const MEMBERSHIP_YEAR_START = 1; // January
const MEMBERSHIP_YEAR_END = 12; // December

const Membership = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('clubs'); // 'clubs' or 'members'
  const [clubs, setClubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showClubModal, setShowClubModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form states
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    logo: '',
    contactPerson: '',
    contact: '',
    email: '',
    annualFee: 120,
  });
  
  const [memberForm, setMemberForm] = useState({
    name: '',
    contact: '',
    email: '',
    comments: '',
    registrationDate: format(new Date(), 'yyyy-MM-dd'),
    membershipType: 'annual',
    paymentStatus: 'not_paid',
    amountPaid: 0,
    clubId: null,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now (will be replaced with Supabase)
      const savedClubs = JSON.parse(localStorage.getItem('linkmeu_clubs') || '[]');
      const savedMembers = JSON.parse(localStorage.getItem('linkmeu_members') || '[]');
      setClubs(savedClubs);
      setMembers(savedMembers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  // Calculate prorata fee based on registration month
  const calculateProrataFee = (annualFee, registrationDate) => {
    const regDate = new Date(registrationDate);
    const currentMonth = regDate.getMonth() + 1; // 1-12
    const remainingMonths = 12 - currentMonth + 1; // Include current month
    const monthlyFee = annualFee / 12;
    return Math.round(monthlyFee * remainingMonths * 100) / 100;
  };

  // Club CRUD operations
  const handleSaveClub = () => {
    if (!clubForm.name || !clubForm.email) {
      toast.error('Please fill in club name and email');
      return;
    }

    const newClub = {
      ...clubForm,
      id: editingClub?.id || Date.now(),
      createdAt: editingClub?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedClubs;
    if (editingClub) {
      updatedClubs = clubs.map(c => c.id === editingClub.id ? newClub : c);
      toast.success('Club updated successfully');
    } else {
      updatedClubs = [...clubs, newClub];
      toast.success('Club created successfully');
    }

    setClubs(updatedClubs);
    localStorage.setItem('linkmeu_clubs', JSON.stringify(updatedClubs));
    resetClubForm();
  };

  const handleDeleteClub = (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? All members will also be removed.')) return;
    
    const updatedClubs = clubs.filter(c => c.id !== clubId);
    const updatedMembers = members.filter(m => m.clubId !== clubId);
    
    setClubs(updatedClubs);
    setMembers(updatedMembers);
    localStorage.setItem('linkmeu_clubs', JSON.stringify(updatedClubs));
    localStorage.setItem('linkmeu_members', JSON.stringify(updatedMembers));
    toast.success('Club deleted successfully');
  };

  const resetClubForm = () => {
    setClubForm({
      name: '',
      description: '',
      logo: '',
      contactPerson: '',
      contact: '',
      email: '',
      annualFee: 120,
    });
    setEditingClub(null);
    setShowClubModal(false);
  };

  // Member CRUD operations
  const handleSaveMember = () => {
    if (!memberForm.name || !memberForm.email || !memberForm.clubId) {
      toast.error('Please fill in name, email, and select a club');
      return;
    }

    const club = clubs.find(c => c.id === memberForm.clubId);
    const prorataFee = calculateProrataFee(club?.annualFee || 120, memberForm.registrationDate);

    const newMember = {
      ...memberForm,
      id: editingMember?.id || Date.now(),
      prorataFee,
      createdAt: editingMember?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedMembers;
    if (editingMember) {
      updatedMembers = members.map(m => m.id === editingMember.id ? newMember : m);
      toast.success('Member updated successfully');
    } else {
      updatedMembers = [...members, newMember];
      toast.success('Member registered successfully');
    }

    setMembers(updatedMembers);
    localStorage.setItem('linkmeu_members', JSON.stringify(updatedMembers));
    resetMemberForm();
  };

  const handleDeleteMember = (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    localStorage.setItem('linkmeu_members', JSON.stringify(updatedMembers));
    toast.success('Member removed successfully');
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      contact: '',
      email: '',
      comments: '',
      registrationDate: format(new Date(), 'yyyy-MM-dd'),
      membershipType: 'annual',
      paymentStatus: 'not_paid',
      amountPaid: 0,
      clubId: selectedClub?.id || null,
    });
    setEditingMember(null);
    setShowMemberModal(false);
  };

  // Bulk upload handler
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newMembers = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const member = {
            id: Date.now() + i,
            name: values[headers.indexOf('name')] || '',
            contact: values[headers.indexOf('contact')] || values[headers.indexOf('phone')] || '',
            email: values[headers.indexOf('email')] || '',
            comments: values[headers.indexOf('comments')] || values[headers.indexOf('notes')] || '',
            registrationDate: values[headers.indexOf('date')] || format(new Date(), 'yyyy-MM-dd'),
            membershipType: 'annual',
            paymentStatus: 'not_paid',
            amountPaid: 0,
            clubId: selectedClub?.id,
            createdAt: new Date().toISOString(),
          };
          
          if (member.name && member.email) {
            const club = clubs.find(c => c.id === member.clubId);
            member.prorataFee = calculateProrataFee(club?.annualFee || 120, member.registrationDate);
            newMembers.push(member);
          }
        }

        if (newMembers.length > 0) {
          const updatedMembers = [...members, ...newMembers];
          setMembers(updatedMembers);
          localStorage.setItem('linkmeu_members', JSON.stringify(updatedMembers));
          toast.success(`${newMembers.length} members imported successfully`);
        } else {
          toast.error('No valid members found in file');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    setShowBulkUploadModal(false);
  };

  // Download template
  const downloadTemplate = () => {
    const template = 'name,email,contact,comments,date\nJohn Doe,john@example.com,+65 9123 4567,New member,2026-01-17';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_template.csv';
    a.click();
  };

  // Filter data
  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClub = !selectedClub || member.clubId === selectedClub.id;
    return matchesSearch && matchesClub;
  });

  // Stats
  const getClubStats = (clubId) => {
    const clubMembers = members.filter(m => m.clubId === clubId);
    const paid = clubMembers.filter(m => m.paymentStatus === 'paid').length;
    const partial = clubMembers.filter(m => m.paymentStatus === 'partial').length;
    const unpaid = clubMembers.filter(m => m.paymentStatus === 'not_paid').length;
    const totalRevenue = clubMembers.reduce((sum, m) => sum + (m.amountPaid || 0), 0);
    return { total: clubMembers.length, paid, partial, unpaid, totalRevenue };
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'partial':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Partial</span>;
      default:
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Not Paid</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">Link</span>
                <span className="text-2xl font-bold text-red-600">Me</span>
                <span className="text-2xl font-bold text-gray-900">U</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">Membership</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/events')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Events
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Listings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => { setActiveTab('clubs'); setSelectedClub(null); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'clubs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Clubs
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{clubs.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{members.length}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'clubs' ? 'Search clubs...' : 'Search members...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'clubs' ? (
              <button
                onClick={() => { setEditingClub(null); setShowClubModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Club
              </button>
            ) : (
              <>
                {selectedClub && (
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Bulk Upload
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!selectedClub) {
                      toast.error('Please select a club first');
                      return;
                    }
                    setMemberForm({ ...memberForm, clubId: selectedClub.id });
                    setEditingMember(null);
                    setShowMemberModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Member
                </button>
              </>
            )}
          </div>
        </div>

        {/* Club Filter for Members Tab */}
        {activeTab === 'members' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Club</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClub(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !selectedClub
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Clubs
              </button>
              {clubs.map(club => (
                <button
                  key={club.id}
                  onClick={() => setSelectedClub(club)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedClub?.id === club.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {club.name}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    selectedClub?.id === club.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {members.filter(m => m.clubId === club.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clubs Grid */}
        {activeTab === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No clubs yet</h3>
                <p className="text-gray-500 mb-4">Create your first club to get started</p>
                <button
                  onClick={() => setShowClubModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Club
                </button>
              </div>
            ) : (
              filteredClubs.map(club => {
                const stats = getClubStats(club.id);
                return (
                  <div key={club.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {club.logo ? (
                            <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{club.name}</h3>
                            <p className="text-sm text-gray-500">{stats.total} members</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingClub(club);
                              setClubForm(club);
                              setShowClubModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClub(club.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {club.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{club.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{club.contactPerson || 'No contact person'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{club.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>Annual Fee: ${club.annualFee}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">{stats.paid} Paid</span>
                          <span className="text-amber-600">{stats.partial} Partial</span>
                          <span className="text-red-600">{stats.unpaid} Unpaid</span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${(stats.paid / stats.total) * 100 || 0}%` }}></div>
                          <div className="bg-amber-500 h-full" style={{ width: `${(stats.partial / stats.total) * 100 || 0}%` }}></div>
                          <div className="bg-red-500 h-full" style={{ width: `${(stats.unpaid / stats.total) * 100 || 0}%` }}></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedClub(club);
                          setActiveTab('members');
                        }}
                        className="mt-4 w-full py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Members →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Members Table */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
                <p className="text-gray-500 mb-4">
                  {selectedClub ? `Add members to ${selectedClub.name}` : 'Select a club and add members'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMembers.map(member => {
                      const club = clubs.find(c => c.id === member.clubId);
                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                              {member.contact && <p className="text-xs text-gray-400">{member.contact}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm text-gray-700">{club?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">{format(new Date(member.registrationDate), 'MMM d, yyyy')}</p>
                              <p className="text-xs text-gray-500 capitalize">{member.membershipType}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">${member.prorataFee?.toFixed(2) || '0.00'}</p>
                              <p className="text-xs text-gray-500">Prorata</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {getPaymentStatusBadge(member.paymentStatus)}
                              {member.amountPaid > 0 && (
                                <p className="text-xs text-gray-500 mt-1">${member.amountPaid} paid</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setMemberForm(member);
                                  setShowMemberModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Club Modal */}
      {showClubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingClub ? 'Edit Club' : 'Create New Club'}
                </h2>
                <button onClick={resetClubForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
                <input
                  type="text"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g., Singapore Tech Club"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Brief description of the club..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={clubForm.logo}
                  onChange={(e) => setClubForm({ ...clubForm, logo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={clubForm.contactPerson}
                  onChange={(e) => setClubForm({ ...clubForm, contactPerson: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={clubForm.contact}
                    onChange={(e) => setClubForm({ ...clubForm, contact: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="+65 9123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={clubForm.email}
                    onChange={(e) => setClubForm({ ...clubForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="club@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Membership Fee ($)</label>
                <input
                  type="number"
                  value={clubForm.annualFee}
                  onChange={(e) => setClubForm({ ...clubForm, annualFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="120"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={resetClubForm}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClub}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                {editingClub ? 'Save Changes' : 'Create Club'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMember ? 'Edit Member' : 'Register Member'}
                </h2>
                <button onClick={resetMemberForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club *</label>
                <select
                  value={memberForm.clubId || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, clubId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select a club</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Full name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="tel"
                    value={memberForm.contact}
                    onChange={(e) => setMemberForm({ ...memberForm, contact: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="+65 9123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="member@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={memberForm.comments}
                  onChange={(e) => setMemberForm({ ...memberForm, comments: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Any notes or remarks..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={memberForm.registrationDate}
                    onChange={(e) => setMemberForm({ ...memberForm, registrationDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
                  <select
                    value={memberForm.membershipType}
                    onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="annual">Annual</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="honorary">Honorary</option>
                  </select>
                </div>
              </div>
              
              {/* Prorata Fee Display */}
              {memberForm.clubId && (
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-700 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">Prorata Calculation</span>
                  </div>
                  <p className="text-sm text-indigo-600">
                    Fee for remaining months: <strong>${calculateProrataFee(
                      clubs.find(c => c.id === memberForm.clubId)?.annualFee || 120,
                      memberForm.registrationDate
                    ).toFixed(2)}</strong>
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={memberForm.paymentStatus}
                    onChange={(e) => setMemberForm({ ...memberForm, paymentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="not_paid">Not Paid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    value={memberForm.amountPaid}
                    onChange={(e) => setMemberForm({ ...memberForm, amountPaid: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={resetMemberForm}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                {editingMember ? 'Save Changes' : 'Register Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Members</h2>
                <button onClick={() => setShowBulkUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">CSV Format Required</p>
                    <p>Columns: name, email, contact, comments, date</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload CSV file</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkUpload}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Choose File
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
