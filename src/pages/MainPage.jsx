import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Film, 
  ShoppingBag, 
  Briefcase, 
  Calendar,
  Upload,
  X,
  ChevronDown,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Category tabs configuration
  const categoryTabs = [
    { id: 'business', name: 'Business', icon: Building2, actions: ['Buy', 'Sell', 'Invest'] },
    { id: 'property', name: 'Properties', icon: Home, actions: ['Buy', 'Sell', 'Rent'] },
    { id: 'movies', name: 'Movies', icon: Film, actions: ['Buy', 'Sell', 'Distribute'] },
    { id: 'products', name: 'Products', icon: ShoppingBag, actions: ['Buy', 'Sell', 'Distribute'] },
    { id: 'jobs', name: 'Jobs', icon: Briefcase, actions: ['Join'] },
    { id: 'events', name: 'Events', icon: Calendar, actions: ['Join'], link: '/events' }
  ];

  const [activeTab, setActiveTab] = useState('business');
  const [activeAction, setActiveAction] = useState('Sell');
  const [coverImage, setCoverImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: 'business',
    listingPurpose: 'For Sale',
    title: '',
    tagline: '',
    location: '',
    country: 'Singapore',
    description: '',
    askingPrice: '',
    currency: 'USD',
    priceType: 'Negotiable',
    revenue: '',
    profit: '',
    sellerName: '',
    sellerType: 'Owner',
    phone: '',
    email: '',
    contactMethod: ['WhatsApp'],
    highlights: [],
    included: []
  });

  // Featured listings data
  const featuredListings = [
    {
      id: 1,
      category: 'property',
      title: 'Luxury Villa for Sale',
      price: '$1,200,000',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
      badge: 'Property'
    },
    {
      id: 2,
      category: 'business',
      title: 'Cozy Cafe for Sale',
      price: '$120,000',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      badge: 'Business'
    },
    {
      id: 3,
      category: 'products',
      title: 'Popular Restaurant',
      price: '$250,000',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      badge: 'Products'
    },
    {
      id: 4,
      category: 'food',
      title: 'Popular Restaurant',
      price: '$250,000',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      badge: 'Food & Beverage'
    },
    {
      id: 5,
      category: 'products',
      title: 'Organic Skincare',
      price: '$30 per set',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
      badge: 'Products'
    }
  ];

  const highlightOptions = [
    'Ready to operate',
    'Licenses included',
    'High footfall',
    'Online orders active',
    'Profitable',
    'Break-even',
    'Startup'
  ];

  const includedOptions = [
    'Assets',
    'Brand / Name',
    'Inventory',
    'Equipment',
    'Recipes / IP',
    'Staff (optional)'
  ];

  const handleTabClick = (tab) => {
    if (tab.link) {
      navigate(tab.link);
      return;
    }
    setActiveTab(tab.id);
    setFormData(prev => ({ ...prev, category: tab.id }));
    if (tab.actions.length > 0) {
      setActiveAction(tab.actions.includes('Sell') ? 'Sell' : tab.actions[0]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const toggleHighlight = (highlight) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  const toggleIncluded = (item) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.includes(item)
        ? prev.included.filter(i => i !== item)
        : [...prev.included, item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        category: 'business',
        listingPurpose: 'For Sale',
        title: '',
        tagline: '',
        location: '',
        country: 'Singapore',
        description: '',
        askingPrice: '',
        currency: 'USD',
        priceType: 'Negotiable',
        revenue: '',
        profit: '',
        sellerName: '',
        sellerType: 'Owner',
        phone: '',
        email: '',
        contactMethod: ['WhatsApp'],
        highlights: [],
        included: []
      });
      setCoverImage(null);
    }, 3000);
  };

  const currentTab = categoryTabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-[#f5f3f0] to-[#efecea]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 40 40" className="w-6 h-6 sm:w-8 sm:h-8 text-white">
                  <path fill="currentColor" d="M20 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-8 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm16 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-8 8c-4.4 0-8 2.7-8 6v4h16v-4c0-3.3-3.6-6-8-6z"/>
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                  <span className="text-gray-900">Link</span>
                  <span className="text-red-600">MeU</span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 -mt-0.5">Connecting Me to You</div>
              </div>
            </div>

            {/* Right side info */}
            <div className="hidden sm:block text-right text-xs sm:text-sm text-gray-600">
              <div>1 listing per account, editable after login.</div>
              <div className="text-gray-500">
                Submission fee: <span className="text-red-600 font-semibold">US$1</span> · Admin approval required ✓
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                List Your {currentTab?.name || 'Business'} for {activeAction}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Fill out the form to add your property, business, food, or product for sale in our marketplace.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-4 sm:p-8 mb-6">
              {/* Main Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.slice(0, 4)}</span>
                  </button>
                ))}
              </div>

              {/* Action Sub-tabs */}
              {currentTab && currentTab.actions.length > 1 && (
                <div className="flex gap-2 mb-6">
                  {currentTab.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => setActiveAction(action)}
                      className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        activeAction === action
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:border-red-400 ${
                      coverImage ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {coverImage ? (
                      <div className="relative">
                        <img src={coverImage} alt="Cover" className="max-h-32 sm:max-h-40 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverImage(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload cover image</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Category & Location Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      >
                        <option value="property">🏠 Property</option>
                        <option value="business">🏢 Business</option>
                        <option value="food">🍽️ Food & Beverage</option>
                        <option value="products">📦 Products</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter listing title..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Fully Equipped Café in Orchard"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Explain what is being sold, why, and what the buyer gets..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                  />
                </div>

                {/* Price Row */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget / Asking Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="askingPrice"
                        value={formData.askingPrice}
                        onChange={handleInputChange}
                        placeholder="Enter asking price..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenue
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="revenue"
                        value={formData.revenue}
                        onChange={handleInputChange}
                        placeholder="Monthly revenue..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profit
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="profit"
                        value={formData.profit}
                        onChange={handleInputChange}
                        placeholder="Monthly profit..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Highlights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Highlights
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {highlightOptions.map((highlight) => (
                      <button
                        key={highlight}
                        type="button"
                        onClick={() => toggleHighlight(highlight)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                          formData.highlights.includes(highlight)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {formData.highlights.includes(highlight) && <span className="mr-1">✓</span>}
                        {highlight}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email your r-email..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Note */}
                <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 py-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>1 listing per account. Login required. Pay US$1 to submit. Admin approval required.</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    showSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : showSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Listing Submitted Successfully!
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🔴</span>
                      Submit Listing to LinkMeU
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Featured Listings */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Featured Listings</h2>
              
              <div className="space-y-4">
                {/* Large Featured Card */}
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
                  <img 
                    src={featuredListings[0].image} 
                    alt={featuredListings[0].title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      Property
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">{featuredListings[0].title}</h3>
                    <p className="text-xl sm:text-2xl font-bold text-white/90">{featuredListings[0].price}</p>
                  </div>
                </div>

                {/* Grid of smaller cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {featuredListings.slice(1).map((listing) => (
                    <div 
                      key={listing.id}
                      className="relative rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <img 
                        src={listing.image} 
                        alt={listing.title}
                        className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 text-white text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1 ${
                          listing.category === 'business' ? 'bg-red-700' :
                          listing.category === 'products' ? 'bg-amber-600' :
                          listing.category === 'food' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {listing.category === 'business' && <Building2 className="w-2.5 h-2.5" />}
                          {listing.category === 'products' && <ShoppingBag className="w-2.5 h-2.5" />}
                          {listing.category === 'food' && <span>🍽️</span>}
                          <span className="hidden sm:inline">{listing.badge}</span>
                          <span className="sm:hidden">{listing.badge.slice(0, 4)}</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 text-white">
                        <h4 className="text-xs sm:text-sm font-bold mb-0.5 line-clamp-1">{listing.title}</h4>
                        <p className="text-sm sm:text-base font-bold text-white/90">{listing.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Link */}
                <button 
                  onClick={() => navigate('/listings')}
                  className="w-full py-3 text-center text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  View All Listings →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5 text-white">
                  <path fill="currentColor" d="M20 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-8 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm16 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-8 8c-4.4 0-8 2.7-8 6v4h16v-4c0-3.3-3.6-6-8-6z"/>
                </svg>
              </div>
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
