import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, getSampleListings } from '../db/listings';

const MainPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Tab configuration matching the screenshots
    const categoryTabs = [
        { id: 'part-time', label: 'Part-time Job', category: 'jobs' },
        { id: 'business', label: 'Business for Sale', category: 'business' },
        { id: 'property', label: 'Property for Rent', category: 'property' },
        { id: 'wedding', label: 'Wedding Hall Booking', category: 'events' }
    ];

    const [activeTab, setActiveTab] = useState('business');
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        category: 'business',
        title: '',
        description: '',
        location: '',
        askingPrice: '',
        revenue: '',
        phone: '',
        email: '',
        fromDate: '',
        toDate: ''
    });

    // Load featured listings
    useEffect(() => {
        const loadListings = async () => {
            const listings = getSampleListings();
            setFeaturedListings(listings);
        };
        loadListings();
    }, []);

    const categoryOptions = [
        { value: 'property', label: 'Property', icon: '🏠' },
        { value: 'business', label: 'Business', icon: '🏢' },
        { value: 'food_beverage', label: 'Food & Beverage', icon: '🍽️' },
        { value: 'products', label: 'Products', icon: '📦' }
    ];

    const handleTabClick = (tabId) => {
        if (tabId === 'wedding') {
            navigate('/events');
            return;
        }
        setActiveTab(tabId);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createListing({
                ...formData,
                coverImage: coverImage,
                sellerName: formData.email.split('@')[0],
                listingPurpose: 'for_sale'
            });

            if (result.success) {
                setShowSuccess(true);
                // Reset form after 3 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setFormData({
                        category: 'business',
                        title: '',
                        description: '',
                        location: '',
                        askingPrice: '',
                        revenue: '',
                        phone: '',
                        email: '',
                        fromDate: '',
                        toDate: ''
                    });
                    setCoverImage(null);
                    setCoverImageFile(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to submit listing:', error);
        }

        setIsSubmitting(false);
    };

    const formatPrice = (price, currency = 'SGD') => {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}K`;
        }
        return `$${price}`;
    };

    const getCategoryBadge = (category) => {
        const badges = {
            property: { label: 'Property', color: 'bg-blue-500', icon: '🏠' },
            business: { label: 'Business', color: 'bg-red-700', icon: '🏢' },
            food_beverage: { label: 'Food & Beverage', color: 'bg-orange-500', icon: '🍽️' },
            products: { label: 'Products', color: 'bg-amber-600', icon: '📦' }
        };
        return badges[category] || badges.business;
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f3f0 0%, #ebe8e4 50%, #e8e5e0 100%)' }}>
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo - Using original logo */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <img
                                src="/linkmeu-logo.png"
                                alt="LinkMeU"
                                className="h-10 md:h-14 w-auto"
                            />
                            <div className="hidden sm:block">
                                <div className="text-lg md:text-2xl font-bold tracking-tight">
                                    <span className="text-gray-900">Link</span>
                                    <span className="text-red-600">MeU</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side info */}
                        <div className="text-right text-xs md:text-sm text-gray-600">
                            <div className="hidden md:block">1 listing per account, editable after login.</div>
                            <div className="text-gray-500">
                                Submission fee: <span className="text-red-600 font-semibold">US$1</span> · Admin approval required <span className="text-green-500">✓</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-3">
                        {/* Header */}
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                Create Your Listing
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 max-w-lg">
                                Post a listing for part-time jobs, business buy/sell, property rent, or wedding hall booking.
                                <br />
                                <span className="text-gray-500">Pay US$1 to submit and get admin approval required.</span>
                            </p>
                        </div>

                        {/* Category Tabs */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-100">
                                {categoryTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`flex-1 py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} className="p-4 md:p-8">
                                {/* Date Range Row - For Part-time Job */}
                                {activeTab === 'part-time' && (
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                                <input
                                                    type="date"
                                                    name="fromDate"
                                                    value={formData.fromDate}
                                                    onChange={handleInputChange}
                                                    placeholder="Select start date"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                                <input
                                                    type="date"
                                                    name="toDate"
                                                    value={formData.toDate}
                                                    onChange={handleInputChange}
                                                    placeholder="Select 1 date"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Category & Location Row - For Business/Property */}
                                {(activeTab === 'business' || activeTab === 'property') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {categoryOptions.find(c => c.value === formData.category)?.icon}
                                                        {categoryOptions.find(c => c.value === formData.category)?.label || 'Select a category'}
                                                    </span>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                {showCategoryDropdown && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                                        {categoryOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, category: option.value }));
                                                                    setShowCategoryDropdown(false);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl"
                                                            >
                                                                <span>{option.icon}</span>
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="Enter listing title..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter destription..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                {/* Description - For Business */}
                                {activeTab === 'business' && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Describe your listing..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                        />
                                    </div>
                                )}

                                {/* Price Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {activeTab === 'business' ? 'Selling Price' : 'Budget'}
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm">$</span>
                                            <input
                                                type="text"
                                                name="askingPrice"
                                                value={formData.askingPrice}
                                                onChange={handleInputChange}
                                                placeholder={activeTab === 'business' ? 'Enter asking price...' : 'Min'}
                                                className="flex-1 px-4 py-3 border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                            {activeTab !== 'business' && (
                                                <>
                                                    <span className="inline-flex items-center px-3 border-y border-gray-200 bg-gray-50 text-gray-500 text-sm">$</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Max"
                                                        className="w-24 px-4 py-3 border border-l-0 border-gray-200 rounded-r-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    />
                                                </>
                                            )}
                                            {activeTab === 'business' && (
                                                <span className="inline-flex items-center px-3 border border-l-0 border-gray-200 rounded-r-xl bg-gray-50 text-gray-500 text-sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Revenue / Profit</label>
                                        <input
                                            type="text"
                                            name="revenue"
                                            value={formData.revenue}
                                            onChange={handleInputChange}
                                            placeholder="Enter budget, amount..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                {/* Contact Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Contact"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Email your r-email..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                {/* Terms Note */}
                                <p className="text-xs text-gray-500 mb-5">
                                    1 listing per account. Login required. Pay US$1 to submit. Admin approval required.
                                </p>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${showSuccess
                                            ? 'bg-green-500 text-white'
                                            : 'text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    style={!showSuccess ? { background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)' } : {}}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : showSuccess ? (
                                        <>
                                            <span>✓</span>
                                            Listing Submitted Successfully!
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-lg">🇺🇸</span>
                                            Pay & Submit Listing $1
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Featured Listings & Illustration */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            {/* Clipboard Illustration - matching screenshot */}
                            <div className="hidden lg:flex justify-center mb-8">
                                <div className="relative">
                                    <img
                                        src="https://img.icons8.com/3d-fluency/200/checklist.png"
                                        alt="Checklist"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Featured Listings */}
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Featured Listings</h2>

                            <div className="space-y-4">
                                {/* Large Featured Card */}
                                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
                                    <img
                                        src={featuredListings[0]?.cover_image_url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'}
                                        alt={featuredListings[0]?.title || 'Featured Listing'}
                                        className="w-full h-44 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1.5">
                                            <span>🏠</span>
                                            Property
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-lg md:text-xl font-bold mb-1">{featuredListings[0]?.title || 'Luxury Villa for Sale'}</h3>
                                        <p className="text-xl md:text-2xl font-bold">${featuredListings[0]?.asking_price?.toLocaleString() || '1,200,000'}</p>
                                    </div>
                                </div>

                                {/* Grid of smaller cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    {featuredListings.slice(1, 5).map((listing, index) => {
                                        const badge = getCategoryBadge(listing.category);
                                        return (
                                            <div
                                                key={listing.id || index}
                                                className="relative rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                <img
                                                    src={listing.cover_image_url}
                                                    alt={listing.title}
                                                    className="w-full h-24 md:h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                <div className="absolute top-2 left-2">
                                                    <span className={`px-2 py-0.5 ${badge.color} text-white text-[10px] font-medium rounded-full flex items-center gap-1`}>
                                                        <span className="text-xs">{badge.icon}</span>
                                                        <span className="hidden sm:inline">{badge.label}</span>
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-2 left-2 text-white">
                                                    <h4 className="text-xs md:text-sm font-bold mb-0.5 line-clamp-1">{listing.title}</h4>
                                                    <p className="text-sm md:text-base font-bold">
                                                        ${listing.asking_price >= 1000 ? listing.asking_price.toLocaleString() : listing.asking_price}
                                                        {listing.asking_price < 100 && ' per set'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* View All Link */}
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="w-full py-3 text-center text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors border border-gray-200 rounded-xl hover:bg-white flex items-center justify-center gap-1"
                                >
                                    View All Listings
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/linkmeu-logo.png" alt="LinkMeU" className="h-8 w-auto" />
                            <span className="text-lg font-bold">
                                <span className="text-gray-900">Link</span>
                                <span className="text-red-600">MeU</span>
                            </span>
                        </div>
                        <div className="text-gray-500 text-sm text-center sm:text-right">
                            © 2025 LinkMeU. Connecting Me to You.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
