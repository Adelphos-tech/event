import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, LogIn, LogOut, Share2, Check, RefreshCw, AlertCircle, Users, Clock, Sparkles, ChevronRight, Search, Filter, Grid, List } from 'lucide-react';
import { getAllEvents, getDatabaseStatus } from '../db/databaseAdapter';
import { format, isToday, isFuture, isPast, startOfDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const EventList = () => {
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();
  const [allEvents, setAllEvents] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await getAllEvents();
      setAllEvents(events || []);
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const safeEvents = Array.isArray(allEvents) ? allEvents : [];
  const filteredEvents = safeEvents.filter(event => 
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const events = filteredEvents.length > 0 ? [...filteredEvents].sort((a, b) => {
    if (!a.startDate && !b.startDate) return 0;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
    const isAToday = isToday(dateA);
    const isBToday = isToday(dateB);
    const isAFuture = isFuture(dateA);
    const isBFuture = isFuture(dateB);
    
    if (isAToday && !isBToday) return -1;
    if (!isAToday && isBToday) return 1;
    if (isAFuture && !isBFuture && !isBToday) return -1;
    if (!isAFuture && isBFuture && !isAToday) return 1;
    if (isAFuture && isBFuture) return dateA - dateB;
    if (!isAFuture && !isBFuture && !isAToday && !isBToday) return dateB - dateA;
    
    return dateA - dateB;
  }) : [];

  const handleLogout = () => {
    logout();
    navigate('/events');
  };

  const handleCopyLink = (eventId, e) => {
    e.stopPropagation();
    const eventUrl = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getEventStatus = (eventDate) => {
    if (!eventDate) return { label: 'No Date', color: 'gray', bg: 'bg-gray-500/10', text: 'text-gray-400' };
    if (isToday(new Date(eventDate))) {
      return { label: 'Today', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' };
    } else if (isFuture(new Date(eventDate))) {
      return { label: 'Upcoming', color: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' };
    } else {
      return { label: 'Past', color: 'gray', bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500' };
    }
  };

  const todayEvents = events.filter(e => e.startDate && isToday(new Date(e.startDate)));
  const upcomingEvents = events.filter(e => e.startDate && isFuture(new Date(e.startDate)) && !isToday(new Date(e.startDate)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-400 mt-6 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6 text-center">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LinkMeU Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <svg className="h-10 w-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left person (red) - head */}
                <circle cx="30" cy="18" r="8" fill="#DC2626"/>
                {/* Right person (gray) - head */}
                <circle cx="70" cy="18" r="8" fill="#9CA3AF"/>
                {/* Left person body */}
                <path d="M30 28 C30 28, 22 32, 22 42 L22 50" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Right person body */}
                <path d="M70 28 C70 28, 78 32, 78 42 L78 50" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Interlinked arms */}
                <path d="M30 32 C30 32, 38 36, 42 48 C46 60, 38 72, 28 72 C18 72, 12 62, 16 52 C20 42, 30 38, 38 42" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
                <path d="M70 32 C70 32, 62 36, 58 48 C54 60, 62 72, 72 72 C82 72, 88 62, 84 52 C80 42, 70 38, 62 42" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Center link */}
                <path d="M42 55 C48 50, 52 50, 58 55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none"/>
              </svg>
              <div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-white">Link</span>
                  <span className="text-lg font-bold text-red-500">Me</span>
                  <span className="text-lg font-bold text-white">U</span>
                  <span className="text-gray-500 text-sm ml-2">Events</span>
                </div>
                <p className="text-[9px] text-gray-500 -mt-0.5 tracking-wide">Link Me You Matter Most.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isSuperAdmin() && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate('/new')}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                <Plus size={18} />
                New Event
              </button>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-all"
                >
                  <LogOut size={18} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-all"
                >
                  <LogIn size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {isSuperAdmin() ? 'All Events' : 'Discover Events'}
              </h1>
              <p className="text-gray-400">
                {user ? (
                  <>Welcome back, <span className="text-red-400">{user.email}</span></>
                ) : (
                  'Find and join amazing events happening around you'
                )}
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-2xl font-bold text-white">{events.length}</p>
                <p className="text-xs text-gray-500">Total Events</p>
              </div>
              {todayEvents.length > 0 && (
                <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-400">{todayEvents.length}</p>
                  <p className="text-xs text-emerald-500/70">Today</p>
                </div>
              )}
              {upcomingEvents.length > 0 && (
                <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{upcomingEvents.length}</p>
                  <p className="text-xs text-blue-500/70">Upcoming</p>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search events by name or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={fetchEvents}
                className="p-3 bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid/List */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar size={40} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No Events Found</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery ? 'Try a different search term' : 'Be the first to create an amazing event'}
            </p>
            <button
              onClick={() => navigate('/new')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium inline-flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
            >
              <Plus size={20} />
              Create Event
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const status = getEventStatus(event.startDate);
              return (
                <div
                  key={event.id}
                  onClick={() => navigate(`/${event.id}`)}
                  className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden cursor-pointer hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    {event.image || event.logo ? (
                      <img
                        src={event.image || event.logo}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Calendar size={48} className="text-gray-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 ${status.bg} backdrop-blur-sm rounded-full flex items-center gap-2`}>
                      <span className={`w-2 h-2 ${status.dot} rounded-full animate-pulse`}></span>
                      <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleCopyLink(event.id, e)}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                    >
                      {copiedId === event.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Share2 size={16} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2">
                      {event.startDate && (
                        <div className="flex items-center gap-3 text-gray-400">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm">
                            {(() => {
                              try {
                                return format(new Date(event.startDate), 'EEE, MMM d, yyyy');
                              } catch {
                                return event.startDate;
                              }
                            })()}
                          </span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-3 text-gray-400">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-sm truncate">{event.venue}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users size={14} />
                        <span className="text-xs">{event.capacity || 100} capacity</span>
                      </div>
                      <span className="text-red-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const status = getEventStatus(event.startDate);
              return (
                <div
                  key={event.id}
                  onClick={() => navigate(`/${event.id}`)}
                  className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                      {event.image || event.logo ? (
                        <img src={event.image || event.logo} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Calendar size={24} className="text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold truncate group-hover:text-red-400 transition-colors">{event.title}</h3>
                        <span className={`px-2 py-0.5 ${status.bg} ${status.text} text-xs rounded-full`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {event.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(event.startDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={14} />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyLink(event.id, e)}
                        className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all"
                      >
                        {copiedId === event.id ? <Check size={18} className="text-green-400" /> : <Share2 size={18} className="text-gray-400" />}
                      </button>
                      <ChevronRight size={20} className="text-gray-600 group-hover:text-red-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Powered by</span>
              <span className="text-red-500 font-semibold">EventsX</span>
              {dbStatus && (
                <span className="text-gray-600">• {dbStatus.mode === 'supabase' ? '☁️ Cloud' : '💾 Local'}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">Home</Link>
              <Link to="/events" className="text-gray-500 hover:text-white text-sm transition-colors">Events</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventList;
