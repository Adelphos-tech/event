import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, Mail, CheckCircle, Sparkles, Upload, X, MapPin, Briefcase, Home, Heart, Image, ArrowLeft, Film, Package } from 'lucide-react';
import { createListing } from '../db/databaseAdapter';
import { convertImageToBase64 } from '../utils/imageUtils';
import PhoneInput from '../components/PhoneInput';

const RegisterListing = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('business');
    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        title: '',
        description: '',
        budgetMin: '',
        budgetMax: '',
        currency: 'SGD',
        revenue: '',
        contact: '',
        email: '',
        password: '',
        location: 'Singapore',
        images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { id: 'business', label: 'Business', subtitle: 'Buy | Sell | Invest', icon: DollarSign },
        { id: 'property', label: 'Properties', subtitle: 'Buy | Sell | Rent', icon: Home },
        { id: 'movies', label: 'Movies', subtitle: 'Buy | Sell | Distribute', icon: Film },
        { id: 'products', label: 'Products', subtitle: 'Buy | Sell | Distribute', icon: Package },
        { id: 'opportunity', label: 'Opportunity', subtitle: 'Hire | Join', icon: Briefcase },
    ];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            await createListing({
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
                images: formData.images,
                isPaid: false // New listings are unpaid by default
            });

            alert('Listing submitted successfully! Your listing will be reviewed by admin.');
            navigate('/');
        } catch (error) {
            console.error('Error submitting listing:', error);
            alert('Error submitting listing: ' + error.message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f5] via-[#f5f0eb] to-[#ebe5dc]">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(180,120,80,0.08)_0%,_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,115,85,0.06)_0%,_transparent_50%)]"></div>

            {/* Header */}
            <header className="relative px-6 lg:px-16 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Listings</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Submission fee:</span>
                        <span className="font-bold text-gray-800 bg-amber-100 px-2 py-0.5 rounded">S$1</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-4xl mx-auto px-6 lg:px-16 py-8">
                {/* Premium badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Register Your Listing</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                    Create Your Listing
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Post your business, property, movie, product, or opportunity listing.
                </p>

                {/* Category Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                                        activeCategory === cat.id
                                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                                            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
                                    }`}
                                >
                                    <Icon className={`w-6 h-6 mb-2 ${activeCategory === cat.id ? 'text-white' : 'text-red-500'}`} />
                                    <span className="font-semibold block">{cat.label}</span>
                                    <span className={`text-xs ${activeCategory === cat.id ? 'text-red-100' : 'text-gray-500'}`}>
                                        {cat.subtitle}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Images Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Image className="w-4 h-4 text-amber-600" />
                            Upload Photos
                            <span className="text-gray-400 font-normal">(Max 5)</span>
                        </label>
                        
                        <div className="grid grid-cols-5 gap-3">
                            {formData.images.length === 0 ? (
                                <label className="col-span-2 row-span-2 aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all group">
                                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Add Main Photo</span>
                                    <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="col-span-2 row-span-2 relative group">
                                    <img src={formData.images[0]} alt="Main" className="w-full h-full aspect-square object-cover rounded-2xl border-2 border-amber-200" />
                                    <button type="button" onClick={() => removeImage(0)} className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            {[1, 2, 3, 4].map((index) => (
                                <div key={index} className="aspect-square">
                                    {formData.images[index] ? (
                                        <div className="relative group w-full h-full">
                                            <img src={formData.images[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : formData.images.length > 0 && formData.images.length <= index ? (
                                        <label className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                                            <Upload className="w-5 h-5 text-gray-300" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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

                    {/* Title & Description */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Listing Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-gray-800"
                                placeholder="e.g., Premium Cafe Business for Sale"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm resize-none text-gray-800"
                                placeholder="Describe your listing in detail..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Date & Budget */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                            <div>
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
                            <div>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Budget / Price Range</label>
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
                                    <input
                                        type="text"
                                        value={formData.budgetMax}
                                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                        className="flex-1 px-3 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                        placeholder="Max"
                                    />
                                    <select 
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="px-3 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-600 shadow-sm cursor-pointer font-medium"
                                    >
                                        <option value="SGD">S$</option>
                                        <option value="USD">$</option>
                                        <option value="MYR">RM</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                        placeholder="Singapore"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Registration */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-amber-600" />
                            Create Your LinkMeU Account
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Register to manage your listings and get notified when someone is interested.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
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
                        
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <PhoneInput
                                value={formData.contact}
                                onChange={(value) => setFormData({ ...formData, contact: value || '' })}
                                defaultCountry="SG"
                                placeholder="Phone number"
                                theme="light"
                                required
                            />
                        </div>
                    </div>

                    {/* Info text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Note:</strong> Your contact details will only be visible after payment verification. 
                            Until then, interested parties will contact our support team at <strong>+65 9019 1311</strong>.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Register & Submit Listing
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default RegisterListing;
