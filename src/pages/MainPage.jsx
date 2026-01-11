import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../db/listings';

const MainPage = () => {
    const navigate = useNavigate();

    const categoryTabs = [
        { id: 'part-time', label: 'Part-time Job' },
        { id: 'business', label: 'Business for Sale' },
        { id: 'property', label: 'Property for Rent' },
        { id: 'wedding', label: 'Wedding Hall Booking' }
    ];

    const [activeTab, setActiveTab] = useState('part-time');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        title: '',
        budgetMin: '',
        budgetMax: '',
        revenue: '',
        phone: '',
        email: ''
    });

    const handleTabClick = (tabId) => {
        if (tabId === 'wedding') {
            navigate('/events');
            return;
        }
        setActiveTab(tabId);
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
                category: activeTab,
                askingPrice: formData.budgetMin,
                sellerName: formData.email?.split('@')[0] || 'User',
                listingPurpose: 'for_sale'
            });

            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setFormData({
                        fromDate: '',
                        toDate: '',
                        title: '',
                        budgetMin: '',
                        budgetMax: '',
                        revenue: '',
                        phone: '',
                        email: ''
                    });
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to submit listing:', error);
        }

        setIsSubmitting(false);
    };

    return (
        <div
            className="min-h-screen"
            style={{
                background: 'linear-gradient(135deg, #f5f3f0 0%, #f0ece7 50%, #ebe7e2 100%)'
            }}
        >
            {/* Header */}
            <header className="py-4 px-6 md:px-12">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/linkmeu-logo.png"
                            alt="LinkMeU"
                            className="h-12 w-auto"
                        />
                        <span className="text-xl font-bold">
                            <span className="text-gray-800">Link</span>
                            <span style={{ color: '#8B3A3A' }}>MeU</span>
                        </span>
                    </div>

                    {/* Right Info */}
                    <div className="text-right text-sm text-gray-600 hidden md:block">
                        <div>1 listing per account, editable after login.</div>
                        <div className="flex items-center justify-end gap-2 text-gray-500">
                            <span>Submission fee:</span>
                            <span style={{ color: '#8B3A3A' }} className="font-semibold">US$1</span>
                            <span>·</span>
                            <span>Admin approval required</span>
                            <span className="text-green-500">✓</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 md:px-12 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left - Form Section */}
                        <div>
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                Create Your Listing
                            </h1>
                            <p className="text-gray-600 mb-2">
                                Post a listing for part-time jobs, business buy/sell,<br />
                                property rent, or wedding hall booking.
                            </p>
                            <p className="text-gray-500 text-sm mb-8">
                                Pay US$1 to submit and get admin approval required.
                            </p>

                            {/* Form Card */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                {/* Tabs */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {categoryTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Date Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                                <input
                                                    type="text"
                                                    name="fromDate"
                                                    value={formData.fromDate}
                                                    onChange={handleInputChange}
                                                    placeholder="Select start date"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                                <input
                                                    type="text"
                                                    name="toDate"
                                                    value={formData.toDate}
                                                    onChange={handleInputChange}
                                                    placeholder="Select 1 date"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Enter destription..."
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    {/* Budget & Revenue Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm">$</span>
                                                <input
                                                    type="text"
                                                    name="budgetMin"
                                                    value={formData.budgetMin}
                                                    onChange={handleInputChange}
                                                    placeholder="Min"
                                                    className="w-16 px-2 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                />
                                                <span className="inline-flex items-center px-2 bg-gray-50 border-y border-gray-200 text-gray-500 text-sm">$</span>
                                                <input
                                                    type="text"
                                                    name="budgetMax"
                                                    value={formData.budgetMax}
                                                    onChange={handleInputChange}
                                                    placeholder="Max"
                                                    className="w-16 px-2 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                />
                                                <span className="inline-flex items-center px-2 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Revenue / Profit</label>
                                            <input
                                                type="text"
                                                name="revenue"
                                                value={formData.revenue}
                                                onChange={handleInputChange}
                                                placeholder="Enter budget, amount..."
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact & Email Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Contact"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email your r-email..."
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Info Text */}
                                    <p className="text-sm text-gray-500">
                                        1 listing per account. Login required. Pay US$1 to submit. Admin approval required.
                                    </p>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
                                        style={{
                                            background: showSuccess
                                                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                                : 'linear-gradient(135deg, #8B3A3A 0%, #A0522D 50%, #8B3A3A 100%)'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : showSuccess ? (
                                            <>
                                                <span>✓</span>
                                                Submitted Successfully!
                                            </>
                                        ) : (
                                            <>
                                                <span>🇺🇸</span>
                                                Pay & Submit Listing
                                                <span className="ml-1">$1</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right - Illustration */}
                        <div className="hidden lg:flex justify-center items-start pt-12">
                            <div className="relative">
                                {/* Inline SVG Clipboard Illustration */}
                                <svg width="320" height="400" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                                    {/* Clipboard Base */}
                                    <rect x="40" y="50" width="240" height="320" rx="16" fill="#F5E6D3" stroke="#D4B896" strokeWidth="3" />

                                    {/* Clipboard Clip */}
                                    <rect x="110" y="30" width="100" height="45" rx="8" fill="#8B4513" />
                                    <rect x="125" y="40" width="70" height="25" rx="6" fill="#A0522D" />

                                    {/* Checklist Items */}
                                    {/* Item 1 - Checked */}
                                    <rect x="70" y="100" width="180" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                                    <circle cx="95" cy="125" r="12" fill="#22C55E" />
                                    <path d="M89 125 L93 129 L101 121" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="115" y="115" width="80" height="8" rx="4" fill="#D1D5DB" />
                                    <rect x="115" y="128" width="50" height="6" rx="3" fill="#E5E7EB" />
                                    <rect x="210" y="110" width="30" height="30" rx="6" fill="#FEE2E2" />
                                    <text x="218" y="130" fontSize="16">🏠</text>

                                    {/* Item 2 - Checked */}
                                    <rect x="70" y="165" width="180" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                                    <circle cx="95" cy="190" r="12" fill="#22C55E" />
                                    <path d="M89 190 L93 194 L101 186" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="115" y="180" width="70" height="8" rx="4" fill="#D1D5DB" />
                                    <rect x="115" y="193" width="60" height="6" rx="3" fill="#E5E7EB" />
                                    <rect x="210" y="175" width="30" height="30" rx="6" fill="#DBEAFE" />
                                    <text x="218" y="195" fontSize="16">🏢</text>

                                    {/* Item 3 - Checked */}
                                    <rect x="70" y="230" width="180" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                                    <circle cx="95" cy="255" r="12" fill="#22C55E" />
                                    <path d="M89 255 L93 259 L101 251" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="115" y="245" width="90" height="8" rx="4" fill="#D1D5DB" />
                                    <rect x="115" y="258" width="45" height="6" rx="3" fill="#E5E7EB" />
                                    <rect x="210" y="240" width="30" height="30" rx="6" fill="#FEF3C7" />
                                    <text x="218" y="260" fontSize="16">📦</text>

                                    {/* Item 4 - Unchecked */}
                                    <rect x="70" y="295" width="180" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                                    <circle cx="95" cy="320" r="12" fill="white" stroke="#D1D5DB" strokeWidth="2" />
                                    <rect x="115" y="310" width="65" height="8" rx="4" fill="#D1D5DB" />
                                    <rect x="115" y="323" width="55" height="6" rx="3" fill="#E5E7EB" />
                                    <rect x="210" y="305" width="30" height="30" rx="6" fill="#F3E8FF" />
                                    <text x="218" y="325" fontSize="16">💼</text>

                                    {/* Pencil */}
                                    <g transform="rotate(-45, 270, 200)">
                                        <rect x="250" y="180" width="12" height="60" fill="#F59E0B" />
                                        <polygon points="256,240 250,255 262,255" fill="#F59E0B" />
                                        <polygon points="256,250 253,255 259,255" fill="#1F2937" />
                                        <rect x="250" y="180" width="12" height="10" fill="#F472B6" />
                                    </g>

                                    {/* Big Checkmark Badge */}
                                    <circle cx="265" cy="340" r="35" fill="#22C55E" filter="url(#shadow)" />
                                    <path d="M248 340 L258 350 L282 326" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Shadow Filter */}
                                    <defs>
                                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
                                        </filter>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainPage;
