import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, MapPin, Briefcase, Home, Film, Package, Phone, Mail, Plus, Calendar, ChevronRight, Sparkles, Search, Filter } from 'lucide-react';
import { getAllListings } from '../db/databaseAdapter';

// Platform support contact (shown for unpaid listings)
const PLATFORM_CONTACT = {
    phone: '+65 9019 1311',
    email: 'linkmeucom@gmail.com'
};

// Mask contact info in text (phone numbers and emails) for unpaid listings
const maskContactInfo = (text, isPaid) => {
    if (!text || isPaid) return text;
    
    // Mask phone numbers (various formats)
    let masked = text.replace(/(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, '***-****-****');
    
    // Mask emails
    masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '****@****.***');
    
    // Mask WhatsApp/Telegram mentions with numbers
    masked = masked.replace(/(whatsapp|telegram|wa|tele|call|contact|hp|phone|mobile|tel)[\s:]*(\+?\d[\d\s-]{6,})/gi, '$1: ***-****-****');
    
    return masked;
};

const MainPage = () => {
    const navigate = useNavigate();
    const [allListings, setAllListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Listings', icon: Sparkles, color: 'from-gray-600 to-gray-700' },
        { id: 'business', label: 'Business', subtitle: 'Buy | Sell | Invest', icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
        { id: 'property', label: 'Properties', subtitle: 'Buy | Sell | Rent', icon: Home, color: 'from-blue-500 to-blue-600' },
        { id: 'movies', label: 'Movies', subtitle: 'Buy | Sell | Distribute', icon: Film, color: 'from-purple-500 to-purple-600' },
        { id: 'products', label: 'Products', subtitle: 'Buy | Sell | Distribute', icon: Package, color: 'from-orange-500 to-orange-600' },
        { id: 'opportunity', label: 'Opportunity', subtitle: 'Hire | Join', icon: Briefcase, color: 'from-red-500 to-red-600' },
    ];

    // Fetch all listings on mount (public access - no auth required)
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const data = await getAllListings();
                setAllListings(data || []);
            } catch (error) {
                console.error('Error fetching listings:', error);
                setAllListings([]);
            }
            setLoading(false);
        };
        fetchListings();
    }, []);

    // Filter listings by category and search
    const filteredListings = allListings.filter(listing => {
        const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
        const matchesSearch = !searchQuery || 
            listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Group listings by category for display
    const listingsByCategory = categories.slice(1).reduce((acc, cat) => {
        acc[cat.id] = filteredListings.filter(l => l.category === cat.id);
        return acc;
    }, {});

    // Get contact info based on is_paid status
    const getContactInfo = (listing) => {
        if (listing.isPaid) {
            return {
                phone: listing.contact || PLATFORM_CONTACT.phone,
                email: listing.email || PLATFORM_CONTACT.email,
                isPaid: true
            };
        }
        return {
            phone: PLATFORM_CONTACT.phone,
            email: PLATFORM_CONTACT.email,
            isPaid: false
        };
    };

    const getCategoryInfo = (categoryId) => {
        return categories.find(c => c.id === categoryId) || categories[0];
    };

    // Listing Card Component
    const ListingCard = ({ listing }) => {
        const contact = getContactInfo(listing);
        const catInfo = getCategoryInfo(listing.category);
        const Icon = catInfo.icon;

        return (
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                {/* Image */}
                {listing.images && listing.images.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Category Badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${catInfo.color} text-white text-xs font-medium rounded-full flex items-center gap-1.5`}>
                            <Icon className="w-3 h-3" />
                            {catInfo.label}
                        </div>
                        
                        {/* Price Badge */}
                        {(listing.budgetMin || listing.budgetMax) && (
                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                                <span className="text-emerald-600 font-bold text-sm">
                                    {listing.currency === 'SGD' ? 'S$' : listing.currency === 'MYR' ? 'RM' : '$'}
                                    {listing.budgetMin?.toLocaleString() || '0'}
                                    {listing.budgetMax && ` - ${listing.budgetMax.toLocaleString()}`}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`h-32 bg-gradient-to-br ${catInfo.color} flex items-center justify-center`}>
                        <Icon className="w-12 h-12 text-white/50" />
                    </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                        {maskContactInfo(listing.title, listing.isPaid)}
                    </h3>
                    
                    {listing.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {maskContactInfo(listing.description, listing.isPaid)}
                        </p>
                    )}
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{listing.location || 'Singapore'}</span>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${contact.phone}`} className="text-sm text-gray-700 hover:text-red-600 transition-colors">
                                {contact.phone}
                            </a>
                            {!contact.isPaid && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Support</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${contact.email}`} className="text-sm text-gray-700 hover:text-red-600 transition-colors truncate">
                                {contact.email}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5f0eb] to-[#ebe5dc] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading listings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f5] via-[#f5f0eb] to-[#ebe5dc]">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(180,120,80,0.08)_0%,_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,115,85,0.06)_0%,_transparent_50%)]"></div>

            {/* Global Navigation Header */}
            <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                            <div>
                                <div className="flex items-center">
                                    <span className="text-2xl font-bold text-gray-900">Link</span>
                                    <span className="text-2xl font-bold text-red-600">Me</span>
                                    <span className="text-2xl font-bold text-gray-900">U</span>
                                </div>
                                <p className="text-[10px] text-gray-500 -mt-0.5 tracking-wide">Link Me You Matter Most.</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/events')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                Events
                            </button>
                            
                            {/* Register Button - Prominent */}
                            <button
                                onClick={() => navigate('/register-listing')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Register Listing</span>
                                <span className="sm:hidden">Register</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Premium Marketplace</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                        Discover Amazing <span className="text-red-600">Opportunities</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Browse businesses, properties, movies, products, and opportunities. 
                        Find what you're looking for or list your own.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search listings..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const count = cat.id === 'all' ? filteredListings.length : listingsByCategory[cat.id]?.length || 0;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        selectedCategory === cat.id
                                            ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                                            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.label}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Listings Grid */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {selectedCategory === 'all' ? (
                    // Show listings grouped by category
                    <div className="space-y-12">
                        {categories.slice(1).map((cat) => {
                            const categoryListings = listingsByCategory[cat.id] || [];
                            if (categoryListings.length === 0) return null;
                            
                            const Icon = cat.icon;
                            return (
                                <section key={cat.id}>
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-white`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
                                                <p className="text-sm text-gray-500">{cat.subtitle}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            View All
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Listings Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {categoryListings.slice(0, 4).map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                        
                        {filteredListings.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                                <p className="text-gray-500 mb-6">Be the first to post a listing!</p>
                                <button
                                    onClick={() => navigate('/register-listing')}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold"
                                >
                                    Create Listing
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Show filtered listings for selected category
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {getCategoryInfo(selectedCategory).label}
                                <span className="text-gray-400 font-normal ml-2">({filteredListings.length})</span>
                            </h2>
                        </div>
                        
                        {filteredListings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredListings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {React.createElement(getCategoryInfo(selectedCategory).icon, { className: "w-10 h-10 text-gray-400" })}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings in this category</h3>
                                <p className="text-gray-500 mb-6">Be the first to post!</p>
                                <button
                                    onClick={() => navigate('/register-listing')}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold"
                                >
                                    Create Listing
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl font-bold">Link</span>
                                <span className="text-xl font-bold text-red-500">Me</span>
                                <span className="text-xl font-bold">U</span>
                            </div>
                            <p className="text-gray-400 text-sm">Link Me. You Matter Most.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact Support</h4>
                            <div className="space-y-2 text-gray-400 text-sm">
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    +65 9019 1311
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    linkmeucom@gmail.com
                                </p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <div className="space-y-2 text-gray-400 text-sm">
                                <button onClick={() => navigate('/register-listing')} className="block hover:text-white transition-colors">
                                    Register Listing
                                </button>
                                <button onClick={() => navigate('/events')} className="block hover:text-white transition-colors">
                                    Events
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                        © 2024 LinkMeU. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
