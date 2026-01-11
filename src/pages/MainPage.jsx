import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, getSampleListings } from '../db/listings';

const MainPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

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
            {/* Premium Animated Background with Floating Orbs */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #fdfcfb 0%, #f7f5f2 25%, #f0ece6 50%, #e8e4dc 75%, #f5f2ed 100%)'
                }} />
                <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/40 to-orange-200/30 rounded-full blur-3xl"
                    style={{ animation: 'float 8s ease-in-out infinite' }} />
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
                    style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
                <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/30 to-rose-100/20 rounded-full blur-3xl" />
            </div>

            {/* Premium Glassmorphism Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/60 border-b border-white/40 shadow-lg shadow-gray-200/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="relative">
                                <img
                                    src="/linkmeu-logo.png"
                                    alt="LinkMeU"
                                    className="h-10 md:h-14 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                />
                                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-xl md:text-2xl font-extrabold tracking-tight">
                                    <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent">Link</span>
                                    <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">MeU</span>
                                </div>
                                <p className="text-[10px] text-gray-500 -mt-0.5 tracking-widest uppercase">Connecting Me to You</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="hidden md:block text-sm text-gray-600 font-medium">1 listing per account, editable after login.</div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                                <span>Submission fee:</span>
                                <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold text-xs shadow-lg shadow-red-500/25">US$1</span>
                                <span className="text-gray-300">·</span>
                                <span className="flex items-center gap-1.5">
                                    Admin approval
                                    <span className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {/* Premium Header with Badge */}
                        <div className="mb-8 md:mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-100/50 rounded-full text-sm text-red-600 font-semibold mb-4 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                Premium Marketplace
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                Create Your
                                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent"> Listing</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
                                Post a listing for part-time jobs, business buy/sell, property rent, or wedding hall booking.
                            </p>
                        </div>

                        {/* Premium Form Card with Glow */}
                        <div className="relative group">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700" />

                            <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-gray-300/30 overflow-hidden border border-white/60">
                                {/* Premium Tab Navigation */}
                                <div className="flex border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white/50">
                                    {categoryTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab.id)}
                                            className={`flex-1 py-4 px-3 text-xs md:text-sm font-bold transition-all duration-500 relative overflow-hidden ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                                                }`}
                                        >
                                            {activeTab === tab.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
                                            )}
                                            <span className="relative flex items-center justify-center gap-1.5">
                                                <span className="hidden md:inline text-base">{tab.icon}</span>
                                                {tab.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Form Content */}
                                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                                    {/* Date Fields */}
                                    {activeTab === 'part-time' && (
                                        <div className="grid grid-cols-2 gap-5">
                                            {['fromDate', 'toDate'].map((field, i) => (
                                                <div key={field}>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2.5">{i === 0 ? 'From Date' : 'To Date'}</label>
                                                    <div className={`relative rounded-xl transition-all duration-300 ${focusedField === field ? 'ring-2 ring-red-500/30 shadow-lg shadow-red-500/10' : ''}`}>
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</span>
                                                        <input
                                                            type="date"
                                                            name={field}
                                                            value={formData[field]}
                                                            onChange={handleInputChange}
                                                            onFocus={() => setFocusedField(field)}
                                                            onBlur={() => setFocusedField(null)}
                                                            className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium focus:outline-none focus:border-red-400 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Category & Location */}
                                    {(activeTab === 'business' || activeTab === 'property') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2.5">Category</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                        className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm text-left flex items-center justify-between transition-all duration-300 ${showCategoryDropdown ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <span className="text-2xl">{categoryOptions.find(c => c.value === formData.category)?.icon}</span>
                                                            <span className="font-semibold">{categoryOptions.find(c => c.value === formData.category)?.label}</span>
                                                        </span>
                                                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {showCategoryDropdown && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                                                            {categoryOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, category: option.value }));
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className={`w-full px-5 py-4 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 flex items-center gap-4 transition-all ${formData.category === option.value ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600' : ''
                                                                        }`}
                                                                >
                                                                    <span className="text-2xl">{option.icon}</span>
                                                                    <span className="font-semibold">{option.label}</span>
                                                                    {formData.category === option.value && (
                                                                        <svg className="w-5 h-5 ml-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2.5">Location</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('location')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Enter location..."
                                                    className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'location' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2.5">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('title')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Enter a compelling title..."
                                            className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'title' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        />
                                    </div>

                                    {/* Description */}
                                    {activeTab === 'business' && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2.5">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('description')}
                                                onBlur={() => setFocusedField(null)}
                                                rows={4}
                                                placeholder="Describe your listing in detail..."
                                                className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 resize-none ${focusedField === 'description' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    {/* Price Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2.5">
                                                {activeTab === 'business' ? 'Selling Price' : 'Budget'}
                                            </label>
                                            <div className={`flex rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'price' ? 'ring-2 ring-red-500/20 shadow-lg' : ''}`}>
                                                <span className="inline-flex items-center px-5 bg-gradient-to-b from-gray-100 to-gray-200 border border-r-0 border-gray-200 text-gray-600 font-bold text-lg">$</span>
                                                <input
                                                    type="text"
                                                    name="askingPrice"
                                                    value={formData.askingPrice}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('price')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Enter amount..."
                                                    className="flex-1 px-4 py-4 border-y border-gray-200 bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none"
                                                />
                                                <span className="inline-flex items-center px-4 bg-gradient-to-b from-gray-100 to-gray-200 border border-l-0 border-gray-200 text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2.5">Expected Revenue / Profit</label>
                                            <input
                                                type="text"
                                                name="revenue"
                                                value={formData.revenue}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('revenue')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="Enter budget, amount..."
                                                className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'revenue' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2.5">Contact</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👤</span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('phone')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="Your contact number"
                                                    className={`w-full pl-14 pr-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'phone' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2.5">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="your@email.com"
                                                className={`w-full px-4 py-4 border rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 ${focusedField === 'email' ? 'border-red-400 ring-2 ring-red-500/20 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Premium Info Note */}
                                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200/50 shadow-sm">
                                        <span className="text-3xl">💡</span>
                                        <p className="text-sm text-amber-800">
                                            <span className="font-bold">1 listing per account.</span> Login required. Pay US$1 to submit. Admin approval required.
                                        </p>
                                    </div>

                                    {/* Premium Submit Button with Shine Effect */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`relative w-full py-5 rounded-xl font-extrabold text-lg transition-all duration-500 overflow-hidden group/btn shadow-xl ${showSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30' : 'shadow-amber-900/30'
                                            }`}
                                        style={!showSuccess ? {
                                            background: 'linear-gradient(135deg, #78350f 0%, #92400e 25%, #b45309 50%, #92400e 75%, #78350f 100%)'
                                        } : {}}
                                    >
                                        {!showSuccess && !isSubmitting && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                        )}

                                        <span className="relative flex items-center justify-center gap-4 text-white">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : showSuccess ? (
                                                <>
                                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Listing Submitted Successfully!
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-2xl">🇺🇸</span>
                                                    Pay & Submit Listing
                                                    <span className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-extrabold backdrop-blur-sm">$1</span>
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
                            {/* Premium Illustration with Glow */}
                            <div className="hidden lg:flex justify-center mb-10">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-700" />
                                    <img
                                        src="https://img.icons8.com/3d-fluency/200/checklist.png"
                                        alt="Checklist"
                                        className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                                    />
                                </div>
                            </div>

                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Featured Listings</h2>
                                <button className="text-sm text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-1 group">
                                    View all
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Premium Listing Cards */}
                            <div className="space-y-5">
                                {/* Hero Card */}
                                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-700">
                                    <img
                                        src={featuredListings[0]?.cover_image_url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'}
                                        alt="Featured"
                                        className="w-full h-52 md:h-60 object-cover transition-all duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                                    <div className="absolute top-4 left-4">
                                        <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-extrabold rounded-full shadow-xl shadow-blue-500/40 flex items-center gap-2">
                                            <span className="text-base">🏠</span>
                                            Property
                                        </span>
                                    </div>

                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-lg">⭐ Featured</span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 group-hover:text-amber-200 transition-colors">
                                            {featuredListings[0]?.title || 'Luxury Villa for Sale'}
                                        </h3>
                                        <p className="text-2xl md:text-3xl font-extrabold text-white">
                                            ${featuredListings[0]?.asking_price?.toLocaleString() || '1,200,000'}
                                        </p>
                                    </div>
                                </div>

                                {/* Grid Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    {featuredListings.slice(1, 5).map((listing, index) => {
                                        const badge = getCategoryBadge(listing.category);
                                        return (
                                            <div
                                                key={listing.id || index}
                                                className="relative rounded-xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                            >
                                                <img
                                                    src={listing.cover_image_url}
                                                    alt={listing.title}
                                                    className="w-full h-28 md:h-36 object-cover transition-all duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                                                <div className="absolute top-2 left-2">
                                                    <span className={`px-2.5 py-1 bg-gradient-to-r ${badge.bg} text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1`}>
                                                        <span>{badge.icon}</span>
                                                        <span className="hidden sm:inline">{badge.label}</span>
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <h4 className="text-xs md:text-sm font-bold mb-1 truncate">{listing.title}</h4>
                                                    <p className="text-sm md:text-lg font-extrabold">
                                                        ${listing.asking_price >= 1000 ? listing.asking_price.toLocaleString() : listing.asking_price}
                                                        {listing.asking_price < 100 && <span className="text-xs font-normal opacity-80"> per set</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="w-full py-4 text-center font-bold text-sm transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 flex items-center justify-center gap-2 group shadow-sm hover:shadow-lg"
                                >
                                    <span>View All Listings</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Footer */}
            <footer className="relative bg-white/70 backdrop-blur-2xl border-t border-gray-200/50 py-10 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img src="/linkmeu-logo.png" alt="LinkMeU" className="h-12 w-auto" />
                            <div>
                                <span className="text-2xl font-extrabold">
                                    <span className="text-gray-900">Link</span>
                                    <span className="text-red-600">MeU</span>
                                </span>
                                <p className="text-xs text-gray-500 tracking-wider">Connecting Me to You</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
                            <a href="#" className="hover:text-red-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Contact</a>
                        </div>
                        <div className="text-gray-400 text-sm">
                            © 2025 LinkMeU. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>

            {/* Animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
        </div>
    );
};

export default MainPage;
