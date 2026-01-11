import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, getSampleListings } from '../db/listings';

const MainPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Tab configuration
    const categoryTabs = [
        { id: 'part-time', label: 'Part-time Job', icon: '💼' },
        { id: 'business', label: 'Business for Sale', icon: '🏢' },
        { id: 'property', label: 'Property for Rent', icon: '🏠' },
        { id: 'wedding', label: 'Wedding Hall Booking', icon: '💒' }
    ];

    const [activeTab, setActiveTab] = useState('business');
    const [coverImage, setCoverImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

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

    useEffect(() => {
        const listings = getSampleListings();
        setFeaturedListings(listings);
    }, []);

    const categoryOptions = [
        { value: 'property', label: 'Property', icon: '🏠', color: '#3B82F6' },
        { value: 'business', label: 'Business', icon: '🏢', color: '#8B5CF6' },
        { value: 'food_beverage', label: 'Food & Beverage', icon: '🍽️', color: '#F59E0B' },
        { value: 'products', label: 'Products', icon: '📦', color: '#10B981' }
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
            const reader = new FileReader();
            reader.onloadend = () => setCoverImage(reader.result);
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
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to submit listing:', error);
        }

        setIsSubmitting(false);
    };

    const getCategoryBadge = (category) => {
        const badges = {
            property: { label: 'Property', bg: 'from-blue-500 to-blue-600', icon: '🏠' },
            business: { label: 'Business', bg: 'from-purple-500 to-purple-600', icon: '🏢' },
            food_beverage: { label: 'Food & Beverage', bg: 'from-orange-500 to-orange-600', icon: '🍽️' },
            products: { label: 'Products', bg: 'from-emerald-500 to-emerald-600', icon: '📦' }
        };
        return badges[category] || badges.business;
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3ef 25%, #ebe7e0 50%, #e8e4dc 75%, #f0ece5 100%)'
                }} />
                {/* Floating orbs for premium feel */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-red-200/30 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/20 to-rose-100/20 rounded-full blur-3xl" />
            </div>

            {/* Premium Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="relative">
                                <img
                                    src="/linkmeu-logo.png"
                                    alt="LinkMeU"
                                    className="h-10 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-xl md:text-2xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Link</span>
                                    <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">MeU</span>
                                </div>
                                <p className="text-[10px] text-gray-500 -mt-0.5 tracking-wide">Connecting Me to You</p>
                            </div>
                        </div>

                        {/* Right side info */}
                        <div className="text-right">
                            <div className="hidden md:block text-sm text-gray-600 font-medium">1 listing per account, editable after login.</div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                                <span>Submission fee:</span>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold text-xs">US$1</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    Admin approval
                                    <span className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-3">
                        {/* Premium Header */}
                        <div className="mb-8 md:mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-full text-sm text-red-600 font-medium mb-4">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Premium Marketplace
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                                Create Your
                                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent"> Listing</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
                                Post a listing for part-time jobs, business buy/sell, property rent, or wedding hall booking.
                            </p>
                        </div>

                        {/* Premium Form Card */}
                        <div className="relative group">
                            {/* Card glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-white/50">
                                {/* Tab Navigation */}
                                <div className="flex border-b border-gray-100/80">
                                    {categoryTabs.map((tab, index) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab.id)}
                                            className={`flex-1 py-4 px-3 text-xs md:text-sm font-semibold transition-all duration-300 relative ${activeTab === tab.id
                                                    ? 'text-white'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                                                }`}
                                        >
                                            {activeTab === tab.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
                                            )}
                                            <span className="relative flex items-center justify-center gap-1.5">
                                                <span className="hidden md:inline">{tab.icon}</span>
                                                {tab.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Form Content */}
                                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                    {/* Date Fields for Part-time */}
                                    {activeTab === 'part-time' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {['fromDate', 'toDate'].map((field, i) => (
                                                <div key={field} className="group/field">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        {i === 0 ? 'From Date' : 'To Date'}
                                                    </label>
                                                    <div className={`relative rounded-xl transition-all duration-300 ${focusedField === field ? 'ring-2 ring-red-500/50' : ''}`}>
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📅</span>
                                                        <input
                                                            type="date"
                                                            name={field}
                                                            value={formData[field]}
                                                            onChange={handleInputChange}
                                                            onFocus={() => setFocusedField(field)}
                                                            onBlur={() => setFocusedField(null)}
                                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm focus:outline-none focus:border-red-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Category & Location */}
                                    {(activeTab === 'business' || activeTab === 'property') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Category Dropdown */}
                                            <div className="group/field">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                        className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm text-left flex items-center justify-between transition-all duration-300 ${showCategoryDropdown ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <span className="text-xl">{categoryOptions.find(c => c.value === formData.category)?.icon}</span>
                                                            <span className="font-medium">{categoryOptions.find(c => c.value === formData.category)?.label}</span>
                                                        </span>
                                                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {showCategoryDropdown && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-fadeIn">
                                                            {categoryOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, category: option.value }));
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${formData.category === option.value ? 'bg-red-50 text-red-600' : ''
                                                                        }`}
                                                                >
                                                                    <span className="text-xl">{option.icon}</span>
                                                                    <span className="font-medium">{option.label}</span>
                                                                    {formData.category === option.value && (
                                                                        <svg className="w-4 h-4 ml-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="group/field">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('location')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Enter location..."
                                                    className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'location' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <div className="group/field">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('title')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Enter a compelling title..."
                                            className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'title' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                }`}
                                        />
                                    </div>

                                    {/* Description */}
                                    {activeTab === 'business' && (
                                        <div className="group/field">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('description')}
                                                onBlur={() => setFocusedField(null)}
                                                rows={3}
                                                placeholder="Describe your listing in detail..."
                                                className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 resize-none ${focusedField === 'description' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    {/* Price Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="group/field">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {activeTab === 'business' ? 'Selling Price' : 'Budget'}
                                            </label>
                                            <div className={`flex rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'price' ? 'ring-2 ring-red-500/20' : ''}`}>
                                                <span className="inline-flex items-center px-4 bg-gradient-to-b from-gray-50 to-gray-100 border border-r-0 border-gray-200 text-gray-500 font-medium">$</span>
                                                <input
                                                    type="text"
                                                    name="askingPrice"
                                                    value={formData.askingPrice}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('price')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Enter amount..."
                                                    className="flex-1 px-4 py-3.5 border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
                                                />
                                                <span className="inline-flex items-center px-3 bg-gradient-to-b from-gray-50 to-gray-100 border border-l-0 border-gray-200 text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="group/field">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Revenue / Profit</label>
                                            <input
                                                type="text"
                                                name="revenue"
                                                value={formData.revenue}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('revenue')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="Enter budget, amount..."
                                                className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'revenue' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="group/field">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('phone')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Your contact number"
                                                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'phone' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div className="group/field">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="your@email.com"
                                                className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'email' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Info Note */}
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                        <span className="text-2xl">💡</span>
                                        <p className="text-sm text-amber-800">
                                            <span className="font-semibold">1 listing per account.</span> Login required. Pay US$1 to submit. Admin approval required.
                                        </p>
                                    </div>

                                    {/* Premium Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`relative w-full py-4 rounded-xl font-bold text-lg transition-all duration-500 overflow-hidden group/btn ${showSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''
                                            }`}
                                        style={!showSuccess ? {
                                            background: 'linear-gradient(135deg, #92400e 0%, #b45309 25%, #a16207 50%, #92400e 75%, #78350f 100%)'
                                        } : {}}
                                    >
                                        {/* Button shine effect */}
                                        {!showSuccess && !isSubmitting && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                        )}

                                        <span className="relative flex items-center justify-center gap-3 text-white">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : showSuccess ? (
                                                <>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Listing Submitted Successfully!
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl">🇺🇸</span>
                                                    Pay & Submit Listing
                                                    <span className="px-2.5 py-1 bg-white/20 rounded-lg text-sm font-bold">$1</span>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Featured Listings */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-28">
                            {/* Premium Illustration */}
                            <div className="hidden lg:flex justify-center mb-8">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                    <img
                                        src="https://img.icons8.com/3d-fluency/200/checklist.png"
                                        alt="Checklist"
                                        className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
                                    />
                                </div>
                            </div>

                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Listings</h2>
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="text-sm text-red-600 font-semibold hover:text-red-700 transition-colors flex items-center gap-1"
                                >
                                    View all
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Premium Listing Cards */}
                            <div className="space-y-4">
                                {/* Featured Hero Card */}
                                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <img
                                        src={featuredListings[0]?.cover_image_url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'}
                                        alt="Featured"
                                        className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                                            <span>🏠</span>
                                            Property
                                        </span>
                                    </div>

                                    {/* Featured badge */}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Featured</span>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">
                                            {featuredListings[0]?.title || 'Luxury Villa for Sale'}
                                        </h3>
                                        <p className="text-2xl font-bold text-white">
                                            ${featuredListings[0]?.asking_price?.toLocaleString() || '1,200,000'}
                                        </p>
                                    </div>
                                </div>

                                {/* Smaller Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {featuredListings.slice(1, 5).map((listing, index) => {
                                        const badge = getCategoryBadge(listing.category);
                                        return (
                                            <div
                                                key={listing.id || index}
                                                className="relative rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                            >
                                                <img
                                                    src={listing.cover_image_url}
                                                    alt={listing.title}
                                                    className="w-full h-28 md:h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                                {/* Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <span className={`px-2 py-1 bg-gradient-to-r ${badge.bg} text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1`}>
                                                        <span>{badge.icon}</span>
                                                        <span className="hidden sm:inline">{badge.label}</span>
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="absolute bottom-2 left-2 right-2 text-white">
                                                    <h4 className="text-xs md:text-sm font-bold mb-0.5 truncate">{listing.title}</h4>
                                                    <p className="text-sm md:text-base font-bold">
                                                        ${listing.asking_price >= 1000 ? listing.asking_price.toLocaleString() : listing.asking_price}
                                                        {listing.asking_price < 100 && <span className="text-xs font-normal opacity-80"> per set</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="w-full py-3.5 text-center font-semibold text-sm transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-red-50/50 flex items-center justify-center gap-2 group"
                                >
                                    <span>View All Listings</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Footer */}
            <footer className="relative bg-white/80 backdrop-blur-xl border-t border-gray-100 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/linkmeu-logo.png" alt="LinkMeU" className="h-10 w-auto" />
                            <div>
                                <span className="text-xl font-bold">
                                    <span className="text-gray-900">Link</span>
                                    <span className="text-red-600">MeU</span>
                                </span>
                                <p className="text-xs text-gray-500">Connecting Me to You</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                        </div>
                        <div className="text-gray-500 text-sm">
                            © 2025 LinkMeU. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>

            {/* Custom Styles */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default MainPage;
