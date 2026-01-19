import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, Briefcase, Home, Film, Package, Phone, Mail, Plus, Calendar, ChevronRight, Sparkles, Search, Filter, Heart as HeartIcon, ArrowUpDown, SlidersHorizontal, Shield, GraduationCap, ExternalLink } from 'lucide-react';
import { getAllListings } from '../db/databaseAdapter';
import { ListingGridSkeleton, CategoryTabsSkeleton } from '../components/Skeleton';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../components/Toast';
import LeadCaptureModal from '../components/LeadCaptureModal';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const categoryTabVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 20 }
    }
};

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
    const [sortBy, setSortBy] = useState('newest');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const { toggleFavorite, isFavorite, favoritesCount } = useFavorites();
    const toast = useToast();
    
    // Lead capture modal state
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);

    // Handle listing click - show lead capture modal first
    const handleListingClick = (listing) => {
        setSelectedListing(listing);
        setShowLeadModal(true);
    };

    // After lead is captured, navigate to listing
    const handleLeadSuccess = () => {
        setShowLeadModal(false);
        toast.success('Thank you!', 'Your enquiry has been submitted.');
        if (selectedListing) {
            navigate(`/listing/${selectedListing.id}`);
        }
    };

    const sortOptions = [
        { id: 'newest', label: 'Newest First' },
        { id: 'oldest', label: 'Oldest First' },
        { id: 'price_low', label: 'Price: Low to High' },
        { id: 'price_high', label: 'Price: High to Low' },
    ];

    const categories = [
        { id: 'all', label: 'All Listings', icon: Sparkles, color: 'from-gray-600 to-gray-700' },
        { id: 'business', label: 'Business', subtitle: 'Buy | Sell | Invest', icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
        { id: 'property', label: 'Properties', subtitle: 'Buy | Sell | Rent', icon: Home, color: 'from-blue-500 to-blue-600' },
        { id: 'movies', label: 'Movies', subtitle: 'Buy | Sell | Distribute', icon: Film, color: 'from-purple-500 to-purple-600' },
        { id: 'products', label: 'Products', subtitle: 'Buy | Sell | Distribute', icon: Package, color: 'from-orange-500 to-orange-600' },
        { id: 'opportunity', label: 'Opportunity', subtitle: 'Hire | Join', icon: Briefcase, color: 'from-red-500 to-red-600' },
        { id: 'wedding', label: 'Wedding', subtitle: 'Venues | Services', icon: HeartIcon, color: 'from-pink-500 to-pink-600' },
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

    // Filter listings by category, search, and favorites
    const filteredListings = allListings
        .filter(listing => {
            const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
            const matchesSearch = !searchQuery || 
                listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorites = !showFavoritesOnly || isFavorite(listing.id);
            return matchesCategory && matchesSearch && matchesFavorites;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'price_low':
                    return (a.budgetMin || 0) - (b.budgetMin || 0);
                case 'price_high':
                    return (b.budgetMax || b.budgetMin || 0) - (a.budgetMax || a.budgetMin || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

    // Group listings by category for display
    const listingsByCategory = categories.slice(1).reduce((acc, cat) => {
        acc[cat.id] = filteredListings.filter(l => l.category === cat.id);
        return acc;
    }, {});

    // Get contact info based on approval status (active = approved)
    // Only show listing owner's contact if the listing is approved (status === 'active')
    const getContactInfo = (listing) => {
        const isApproved = listing.status === 'active';
        if (isApproved) {
            return {
                phone: listing.contact || PLATFORM_CONTACT.phone,
                email: listing.email || PLATFORM_CONTACT.email,
                isApproved: true
            };
        }
        return {
            phone: PLATFORM_CONTACT.phone,
            email: PLATFORM_CONTACT.email,
            isApproved: false
        };
    };

    const getCategoryInfo = (categoryId) => {
        return categories.find(c => c.id === categoryId) || categories[0];
    };

    // Listing Card Component with animations
    const ListingCard = ({ listing, index = 0 }) => {
        const contact = getContactInfo(listing);
        const catInfo = getCategoryInfo(listing.category);
        const Icon = catInfo.icon;
        const isPending = listing.status === 'pending';

        return (
            <motion.div 
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => handleListingClick(listing)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer relative">
                
                {/* Image - always visible */}
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
                        
                        {/* Pending Review Badge */}
                        {isPending && (
                            <div className="absolute top-12 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                Pending Review
                            </div>
                        )}
                        
                        {/* Favorite Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(listing.id);
                                toast.success(isFavorite(listing.id) ? 'Removed from favorites' : 'Added to favorites');
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                                isFavorite(listing.id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                        >
                            <HeartIcon className={`w-4 h-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                        </button>
                        
                        {/* Price Badge - always visible */}
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
                    <div className={`h-32 bg-gradient-to-br ${catInfo.color} flex items-center justify-center relative`}>
                        <Icon className="w-12 h-12 text-white/50" />
                        {/* Pending Review Badge for no-image listings */}
                        {isPending && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                Pending Review
                            </div>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                    {/* Title - always visible */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                        {maskContactInfo(listing.title, listing.isPaid)}
                    </h3>
                    
                    {/* Description - always visible */}
                    {listing.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {maskContactInfo(listing.description, listing.isPaid)}
                        </p>
                    )}
                    
                    {/* Location - always visible */}
                    <div className="flex items-center gap-1.5 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{listing.location || 'Singapore'}</span>
                    </div>
                    
                    {/* Contact Info - ONLY blur for pending */}
                    <div className="pt-3 border-t border-gray-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                            <div className="space-y-2 blur-sm select-none pointer-events-none">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">+XX XXXX XXXX</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">****@****.***</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <a href={`tel:${contact.phone}`} className="text-sm text-gray-700 hover:text-red-600 transition-colors">
                                        {contact.phone}
                                    </a>
                                    {!contact.isApproved && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Support</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <a href={`mailto:${contact.email}`} className="text-sm text-gray-700 hover:text-red-600 transition-colors truncate">
                                        {contact.email}
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Loading state - show skeleton
    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f5] via-[#f5f0eb] to-[#ebe5dc]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(180,120,80,0.08)_0%,_transparent_50%)]"></div>
                
                {/* Header skeleton */}
                <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-900">Link</span>
                                <span className="text-2xl font-bold text-red-600">Me</span>
                                <span className="text-2xl font-bold text-gray-900">U</span>
                            </div>
                            <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </header>
                
                {/* Content skeleton */}
                <section className="relative py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="h-12 bg-gray-200 rounded-xl w-96 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-8 animate-pulse"></div>
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
                        </div>
                        <div className="flex justify-center mb-8">
                            <CategoryTabsSkeleton />
                        </div>
                    </div>
                </section>
                
                <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <ListingGridSkeleton count={8} />
                </main>
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
                            
                            <button
                                onClick={() => navigate('/membership')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Membership
                            </button>
                            
                            <a
                                href="https://tutor.linkmeu.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 rounded-lg transition-all border border-amber-200/50"
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span className="font-medium">AI Tutor</span>
                            </a>
                            
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

            {/* Hero Section - Hidden on mobile, shown on desktop */}
            <section className="relative py-12 px-4 sm:px-6 lg:px-8 hidden sm:block overflow-hidden">
                <motion.div 
                    className="max-w-7xl mx-auto text-center"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.div 
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full mb-6"
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Sparkles className="w-4 h-4 text-amber-600" />
                        </motion.div>
                        <span className="text-sm font-medium text-amber-800">Premium Marketplace</span>
                    </motion.div>
                    
                    <motion.h1 
                        variants={fadeInUp}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
                    >
                        Discover Amazing <span className="text-red-600">Opportunities</span>
                    </motion.h1>
                    <motion.p 
                        variants={fadeInUp}
                        className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
                    >
                        Browse businesses, properties, movies, products, and opportunities. 
                        Find what you're looking for or list your own.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div 
                        variants={fadeInUp}
                        className="max-w-3xl mx-auto mb-6"
                    >
                        <motion.div 
                            className="flex flex-col sm:flex-row gap-3"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search listings..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-800"
                                />
                            </div>
                            
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none w-full sm:w-auto px-4 py-4 pl-10 pr-10 bg-white border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-700 font-medium cursor-pointer"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            
                            {/* Favorites Filter */}
                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-medium transition-all shadow-lg ${
                                    showFavoritesOnly
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <HeartIcon className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                <span className="sm:hidden">Favorites</span>
                                {favoritesCount > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        showFavoritesOnly ? 'bg-white/20' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Category Filter Tabs - Horizontal scroll on mobile */}
                    <motion.div 
                        variants={fadeInUp}
                        className="relative -mx-4 sm:mx-0 px-4 sm:px-0 mb-8"
                    >
                        <motion.div 
                            className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {categories.map((cat, index) => {
                                const Icon = cat.icon;
                                const count = cat.id === 'all' ? filteredListings.length : listingsByCategory[cat.id]?.length || 0;
                                return (
                                    <motion.button
                                        key={cat.id}
                                        variants={categoryTabVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                                            selectedCategory === cat.id
                                                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                                                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{cat.label}</span>
                                        <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
                                        }`}>
                                            {count}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                        {/* Fade indicator for scroll */}
                        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#f5f0eb] to-transparent pointer-events-none sm:hidden"></div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Mobile-Only Compact Search & Filters - Shows at top on mobile */}
            <section className="sm:hidden sticky top-16 z-40 bg-gradient-to-b from-[#faf8f5] via-[#faf8f5] to-transparent pb-4 pt-4 px-4">
                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-800 text-sm"
                    />
                </div>
                
                {/* Category Pills - Horizontal scroll */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const count = cat.id === 'all' ? filteredListings.length : listingsByCategory[cat.id]?.length || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                    selectedCategory === cat.id
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                                        : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {cat.label.split(' ')[0]}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                
                {/* Sort & Favorites Row */}
                <div className="flex gap-2 mt-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-medium"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            showFavoritesOnly
                                ? 'bg-red-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                    >
                        <HeartIcon className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        {favoritesCount > 0 && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                showFavoritesOnly ? 'bg-white/20' : 'bg-red-100 text-red-600'
                            }`}>
                                {favoritesCount}
                            </span>
                        )}
                    </button>
                </div>
            </section>

            {/* Listings Grid */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-2 sm:pt-0">
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
                                    <motion.div 
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-100px" }}
                                        variants={staggerContainer}
                                    >
                                        {categoryListings.slice(0, 4).map((listing, index) => (
                                            <ListingCard key={listing.id} listing={listing} index={index} />
                                        ))}
                                    </motion.div>
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
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                            >
                                {filteredListings.map((listing, index) => (
                                    <ListingCard key={listing.id} listing={listing} index={index} />
                                ))}
                            </motion.div>
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

            {/* Lead Capture Modal */}
            <LeadCaptureModal
                isOpen={showLeadModal}
                onClose={() => setShowLeadModal(false)}
                listing={selectedListing}
                onSuccess={handleLeadSuccess}
            />
        </div>
    );
};

export default MainPage;
