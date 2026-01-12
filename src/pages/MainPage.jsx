import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, Mail, CheckCircle, Sparkles, Upload, X, MapPin, Briefcase, Home, Heart, Image } from 'lucide-react';
import { createListing, getListingsByCategory } from '../db/databaseAdapter';
import { convertImageToBase64 } from '../utils/imageUtils';

const MainPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('business');
    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        title: '',
        description: '',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        revenue: '',
        contact: '',
        email: '',
        password: '',
        location: 'Singapore',
        images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(false);

    const categories = [
        { id: 'business', label: 'Business', subtitle: 'Buy | Sell | Invest' },
        { id: 'property', label: 'Properties', subtitle: 'Buy | Sell | Rent' },
        { id: 'movies', label: 'Movies', subtitle: 'Buy | Sell | Distribute' },
        { id: 'products', label: 'Products', subtitle: 'Buy | Sell | Distribute' },
        { id: 'opportunity', label: 'Opportunity', subtitle: 'Hire | Join' },
        { id: 'events', label: 'Events', isLink: true }
    ];

    // Fetch listings when category changes
    useEffect(() => {
        const fetchListings = async () => {
            if (activeCategory === 'events') return;
            setLoadingListings(true);
            try {
                const data = await getListingsByCategory(activeCategory);
                setListings(data);
            } catch (error) {
                console.error('Error fetching listings:', error);
                setListings([]);
            }
            setLoadingListings(false);
        };
        fetchListings();
    }, [activeCategory]);

    const handleCategoryClick = (cat) => {
        if (cat.isLink) {
            navigate('/events');
        } else {
            setActiveCategory(cat.id);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }
        
        for (const file of files) {
            try {
                const base64 = await convertImageToBase64(file);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64]
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'business': return <DollarSign className="w-5 h-5" />;
            case 'property': return <Home className="w-5 h-5" />;
            case 'movies': return <Image className="w-5 h-5" />;
            case 'products': return <Briefcase className="w-5 h-5" />;
            case 'opportunity': return <Briefcase className="w-5 h-5" />;
            default: return <Briefcase className="w-5 h-5" />;
        }
    };

    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.label : category;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.email || !formData.password || !formData.contact) {
            alert('Please fill in all required fields: Email, Password, and Contact');
            return;
        }
        
        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        if (!formData.title) {
            alert('Please enter a title for your listing');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const listing = await createListing({
                category: activeCategory,
                title: formData.title,
                description: formData.description || formData.title,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                budgetMin: formData.budgetMin,
                budgetMax: formData.budgetMax,
                currency: formData.currency,
                revenue: formData.revenue,
                location: formData.location,
                contact: formData.contact,
                email: formData.email,
                password: formData.password,
                images: formData.images
            });

            alert('Listing submitted successfully!');
            
            // Reset form
            setFormData({
                fromDate: '',
                toDate: '',
                title: '',
                description: '',
                budgetMin: '',
                budgetMax: '',
                currency: 'USD',
                revenue: '',
                contact: '',
                email: '',
                password: '',
                location: 'Singapore',
                images: []
            });
            
            // Refresh listings
            const data = await getListingsByCategory(activeCategory);
            setListings(data);
        } catch (error) {
            console.error('Error submitting listing:', error);
            alert('Error submitting listing: ' + error.message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f5] via-[#f5f0eb] to-[#ebe5dc]">
            {/* Premium gradient overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(180,120,80,0.08)_0%,_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,115,85,0.06)_0%,_transparent_50%)]"></div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            {/* Header */}
            <header className="relative px-6 lg:px-16 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/linkmeu-logo.png"
                            alt="LinkMeU"
                            className="h-14 w-auto drop-shadow-sm"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-sm">1 listing per account, editable after login.</p>
                        <p className="flex items-center justify-end gap-2 text-sm">
                            <span className="text-gray-500">Submission fee:</span>
                            <span className="font-bold text-gray-800 bg-amber-100 px-2 py-0.5 rounded">US$1</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">Admin approval required</span>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-6 lg:px-16 py-8 flex flex-col lg:flex-row gap-16">
                {/* Left Side - Form */}
                <div className="flex-1 max-w-2xl">
                    {/* Premium badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Premium Marketplace</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Create Your Listing
                    </h1>
                    <p className="text-gray-600 mb-2 text-lg leading-relaxed">
                        Post a listing for part-time jobs, business buy/sell,<br className="hidden sm:block" />
                        property rent, or wedding hall booking.
                    </p>
                    <p className="text-gray-400 mb-8 text-sm">
                        Pay US$1 to submit and get admin approval required.
                    </p>

                    {/* Category Tabs - Premium Style */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex flex-col items-start ${activeCategory === cat.id
                                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-900/20'
                                        : cat.isLink
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-600/20'
                                            : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
                                    }`}
                            >
                                <span className="font-semibold">{cat.label}</span>
                                {cat.subtitle && <span className={`text-xs ${activeCategory === cat.id ? 'text-gray-300' : 'text-gray-500'}`}>{cat.subtitle}</span>}
                                {cat.isLink && <span className="text-xs">View All →</span>}
                            </button>
                        ))}
                    </div>

                    {/* Form - Premium Glass Style */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Images Section - At Top */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <Image className="w-4 h-4 text-amber-600" />
                                Upload Photos
                                <span className="text-gray-400 font-normal">(Max 5)</span>
                            </label>
                            
                            <div className="grid grid-cols-5 gap-3">
                                {/* Main large upload area or first image */}
                                {formData.images.length === 0 ? (
                                    <label className="col-span-2 row-span-2 aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all group">
                                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-7 h-7 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">Add Main Photo</span>
                                        <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                ) : (
                                    <div className="col-span-2 row-span-2 relative group">
                                        <img
                                            src={formData.images[0]}
                                            alt="Main"
                                            className="w-full h-full aspect-square object-cover rounded-2xl border-2 border-amber-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(0)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">Main</span>
                                    </div>
                                )}
                                
                                {/* Secondary image slots */}
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="aspect-square">
                                        {formData.images[index] ? (
                                            <div className="relative group w-full h-full">
                                                <img
                                                    src={formData.images[index]}
                                                    alt={`Photo ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : formData.images.length > 0 && formData.images.length <= index ? (
                                            <label className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                                                <Upload className="w-5 h-5 text-gray-300" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                                                <span className="text-gray-200 text-lg font-medium">{index + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Title & Description Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Listing Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-gray-800"
                                    placeholder="e.g., Weekend Barista Position at Premium Cafe"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm resize-none text-gray-800"
                                    placeholder="Describe your listing in detail - what makes it special?"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Date & Budget Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.fromDate}
                                            onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-700 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.toDate}
                                            onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-700 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                        {/* Budget / Revenue */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Range</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.budgetMin}
                                                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                                className="w-full pl-8 pr-3 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                                placeholder="Min"
                                            />
                                        </div>
                                        <span className="flex items-center text-gray-400">-</span>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={formData.budgetMax}
                                                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                                className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                                placeholder="Max"
                                            />
                                        </div>
                                        <select 
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="px-3 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-600 shadow-sm cursor-pointer font-medium"
                                        >
                                            <option value="USD">$</option>
                                            <option value="SGD">S$</option>
                                            <option value="MYR">RM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Revenue</label>
                                    <input
                                        type="text"
                                        value={formData.revenue}
                                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                        placeholder="e.g., $5,000/month"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Registration Section */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-amber-600" />
                                Create Your LinkMeU Account
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Register to manage your listings and get notified when someone is interested.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                            placeholder="Min 6 characters"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                        placeholder="+65 9XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer text */}
                        <p className="text-gray-400 text-sm">
                            By submitting, you agree to create a LinkMeU account. 1 listing per account.
                        </p>

                        {/* Submit Button - Premium Gradient */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#8B2323] via-[#A52A2A] to-[#8B2323] text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <span>{isSubmitting ? 'Creating Account & Submitting...' : 'Register & Submit Listing'}</span>
                        </button>
                    </form>
                </div>

                {/* Right Side - Listings Sidebar */}
                <div className="hidden lg:block w-[420px] sticky top-8 self-start">
                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 mb-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                    {getCategoryIcon(activeCategory)}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">
                                        {getCategoryLabel(activeCategory)}
                                    </h3>
                                    <p className="text-gray-400 text-xs">{listings.length} active listings</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                                Live
                            </span>
                        </div>
                    </div>
                    
                    {loadingListings ? (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-500 text-sm">Loading listings...</p>
                            </div>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                                {getCategoryIcon(activeCategory)}
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">No listings yet</h4>
                            <p className="text-gray-500 text-sm">Be the first to post in this category!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                            {listings.map((listing, index) => (
                                <div 
                                    key={listing.id} 
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-amber-200 hover:-translate-y-1"
                                >
                                    {/* Image with overlay */}
                                    {listing.images && listing.images.length > 0 ? (
                                        <div className="relative h-36 overflow-hidden">
                                            <img 
                                                src={listing.images[0]} 
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
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
                                            {/* Image count badge */}
                                            {listing.images.length > 1 && (
                                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md flex items-center gap-1">
                                                    <Image className="w-3 h-3 text-white" />
                                                    <span className="text-white text-xs font-medium">{listing.images.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                            <div className="text-gray-300">
                                                {getCategoryIcon(activeCategory)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Content */}
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
                                            {listing.title}
                                        </h4>
                                        
                                        {listing.description && (
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                                                {listing.description}
                                            </p>
                                        )}
                                        
                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="text-xs">{listing.location || 'Singapore'}</span>
                                            </div>
                                            <button className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                </div>
            </main>

            {/* Bottom decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-50/30 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default MainPage;
