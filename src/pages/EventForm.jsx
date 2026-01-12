import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, Calendar, MapPin, Users, Mail, Phone, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { addEvent, getEvent, registerUser, loginUser, getDatabaseStatus } from '../db/databaseAdapter';
import { convertImageToBase64, resizeImage } from '../utils/imageUtils';
import { detectCountryFromPhone, countryCodes, getPlaceholder, formatPhoneNumber } from '../utils/phoneUtils';
import { useAuth } from '../context/AuthContext';
import DynamicList from '../components/DynamicList';

// Constants for validation
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_VENUE_LENGTH = 500;
const MAX_CAPACITY = 100000;
const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, canEditEvent, login } = useAuth();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      checkPermissions();
    }
  }, [user, id]);

  const checkPermissions = async () => {
    try {
      const event = await getEvent(parseInt(id));
      // Only super admin can edit events
      if (!user || !canEditEvent(event.ownerId)) {
        alert('Only Super Admin can edit events. Events cannot be edited after creation.');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'conference',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: '',
    organisers: [],
    logo: null,
    image: null,
    guestsOfHonour: [],
    speakers: [],
    sponsors: [],
    media: [],
    // Creator registration info
    creatorEmail: '',
    creatorPassword: '',
    creatorContact: '',
    creatorCountryCode: '+65'
  });

  const eventTypes = [
    { id: 'conference', label: 'Conference' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'seminar', label: 'Seminar' },
    { id: 'meetup', label: 'Meetup' },
    { id: 'exhibition', label: 'Exhibition' },
    { id: 'networking', label: 'Networking' }
  ];

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showRegistration, setShowRegistration] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setPageLoading(true);
    try {
      const event = await getEvent(parseInt(id));
      if (event) {
        setFormData({
          ...event,
          eventType: event.eventType || 'conference'
        });
      } else {
        setErrors({ general: 'Event not found' });
        setTimeout(() => navigate('/events'), 2000);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setErrors({ general: 'Failed to load event. Redirecting...' });
      setTimeout(() => navigate('/events'), 2000);
    } finally {
      setPageLoading(false);
    }
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number
  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9\s\-\+\(\)]{6,20}$/;
    return phoneRegex.test(phone);
  };

  // Validate form fields
  const validateField = useCallback((field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value || !value.trim()) {
          newErrors.title = 'Title is required';
        } else if (value.trim().length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else if (value.length > MAX_TITLE_LENGTH) {
          newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
        } else {
          delete newErrors.title;
        }
        break;
        
      case 'startDate':
        if (!value) {
          newErrors.startDate = 'Start date is required';
        } else {
          const startDate = new Date(value);
          if (isNaN(startDate.getTime())) {
            newErrors.startDate = 'Invalid date format';
          } else if (!isEdit && startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            newErrors.startDate = 'Start date cannot be in the past';
          } else {
            delete newErrors.startDate;
          }
        }
        // Also validate end date when start date changes
        if (formData.endDate && value) {
          if (new Date(formData.endDate) < new Date(value)) {
            newErrors.endDate = 'End date must be after start date';
          } else {
            delete newErrors.endDate;
          }
        }
        break;
        
      case 'endDate':
        if (!value) {
          newErrors.endDate = 'End date is required';
        } else {
          const endDate = new Date(value);
          if (isNaN(endDate.getTime())) {
            newErrors.endDate = 'Invalid date format';
          } else if (formData.startDate && endDate < new Date(formData.startDate)) {
            newErrors.endDate = 'End date must be after start date';
          } else {
            delete newErrors.endDate;
          }
        }
        break;
        
      case 'capacity':
        if (value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            newErrors.capacity = 'Capacity must be a positive number';
          } else if (numValue > MAX_CAPACITY) {
            newErrors.capacity = `Capacity cannot exceed ${MAX_CAPACITY.toLocaleString()}`;
          } else {
            delete newErrors.capacity;
          }
        } else {
          delete newErrors.capacity;
        }
        break;
        
      case 'description':
        if (value && value.length > MAX_DESCRIPTION_LENGTH) {
          newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'venue':
        if (value && value.length > MAX_VENUE_LENGTH) {
          newErrors.venue = `Venue must be less than ${MAX_VENUE_LENGTH} characters`;
        } else {
          delete newErrors.venue;
        }
        break;
        
      case 'creatorEmail':
        if (!user && !isEdit) {
          if (!value || !value.trim()) {
            newErrors.creatorEmail = 'Email is required';
          } else if (!isValidEmail(value)) {
            newErrors.creatorEmail = 'Please enter a valid email address';
          } else {
            delete newErrors.creatorEmail;
          }
        }
        break;
        
      case 'creatorPassword':
        if (!user && !isEdit) {
          if (!value) {
            newErrors.creatorPassword = 'Password is required';
          } else if (value.length < 6) {
            newErrors.creatorPassword = 'Password must be at least 6 characters';
          } else {
            delete newErrors.creatorPassword;
          }
        }
        break;
        
      case 'creatorContact':
        if (!user && !isEdit) {
          if (!value || !value.trim()) {
            newErrors.creatorContact = 'Contact number is required';
          } else if (!isValidPhone(value)) {
            newErrors.creatorContact = 'Please enter a valid phone number';
          } else {
            delete newErrors.creatorContact;
          }
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, formData, user, isEdit]);

  const handleChange = (field, value) => {
    // Sanitize text inputs
    const sanitizedValue = ['title', 'description', 'venue', 'creatorEmail', 'creatorContact'].includes(field)
      ? (typeof value === 'string' ? value : value)
      : value;
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Validate on change if field was touched or submit was attempted
    if (touched[field] || submitAttempted) {
      validateField(field, sanitizedValue);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')}` 
      }));
      return;
    }
    
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `File too large. Maximum size: ${MAX_IMAGE_SIZE_MB}MB` 
      }));
      return;
    }
    
    try {
      // Clear any previous error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const base64 = await convertImageToBase64(file);
      const resized = await resizeImage(base64, 800, 800);
      handleChange(field, resized);
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, [field]: 'Failed to process image. Please try another file.' }));
    }
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    // All mandatory fields for database storage and retrieval
    const fieldsToValidate = ['title', 'description', 'startDate', 'endDate', 'venue', 'capacity'];
    if (!user && !isEdit) {
      fieldsToValidate.push('creatorEmail', 'creatorPassword', 'creatorContact');
    }
    
    let isValid = true;
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      const value = formData[field];
      
      switch (field) {
        case 'title':
          if (!value || !value.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
          } else if (value.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
            isValid = false;
          }
          break;
        case 'description':
          if (!value || !value.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
          } else if (value.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
            isValid = false;
          }
          break;
        case 'startDate':
          if (!value) {
            newErrors.startDate = 'Start date is required';
            isValid = false;
          }
          break;
        case 'endDate':
          if (!value) {
            newErrors.endDate = 'End date is required';
            isValid = false;
          } else if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
            newErrors.endDate = 'End date must be after start date';
            isValid = false;
          }
          break;
        case 'venue':
          if (!value || !value.trim()) {
            newErrors.venue = 'Venue is required';
            isValid = false;
          } else if (value.trim().length < 3) {
            newErrors.venue = 'Venue must be at least 3 characters';
            isValid = false;
          }
          break;
        case 'capacity':
          if (!value || value === '') {
            newErrors.capacity = 'Capacity is required';
            isValid = false;
          } else {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 1) {
              newErrors.capacity = 'Capacity must be a positive number';
              isValid = false;
            }
          }
          break;
        case 'creatorEmail':
          if (!value || !value.trim()) {
            newErrors.creatorEmail = 'Email is required';
            isValid = false;
          } else if (!isValidEmail(value)) {
            newErrors.creatorEmail = 'Please enter a valid email';
            isValid = false;
          }
          break;
        case 'creatorPassword':
          if (!value || value.length < 6) {
            newErrors.creatorPassword = 'Password must be at least 6 characters';
            isValid = false;
          }
          break;
        case 'creatorContact':
          if (!value || !value.trim()) {
            newErrors.creatorContact = 'Contact is required';
            isValid = false;
          }
          break;
        default:
          break;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Validate all fields
    if (!validateAllFields()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Confirmation before submission
    const confirmMessage = isEdit 
      ? 'Are you sure you want to update this event?'
      : `Are you sure you want to create this event?\n\nTitle: ${formData.title}\nDate: ${formData.startDate} to ${formData.endDate}\nVenue: ${formData.venue || 'Not specified'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      let ownerId = user?.id;

      // Register new user if not logged in
      if (!isEdit && !user) {
        try {
          ownerId = await registerUser({
            email: formData.creatorEmail,
            password: formData.creatorPassword,
            contact: `${formData.creatorCountryCode} ${formData.creatorContact}`
          });

          // Auto-login the new user
          const newUser = await loginUser(formData.creatorEmail, formData.creatorPassword);
          login(newUser);
        } catch (error) {
          if (error.message.includes('already exists')) {
            // Try to login instead
            try {
              const existingUser = await loginUser(formData.creatorEmail, formData.creatorPassword);
              login(existingUser);
              ownerId = existingUser.id;
            } catch (loginError) {
              alert('Email already exists. Please use correct password or use a different email.');
              setLoading(false);
              return;
            }
          } else {
            throw error;
          }
        }
      }

      const eventData = {
        ...formData,
        id: isEdit ? parseInt(id) : undefined,
        ownerId: ownerId,
        updatedAt: new Date().toISOString(),
        // Remove creator fields from event data
        creatorEmail: undefined,
        creatorPassword: undefined,
        creatorContact: undefined,
        creatorCountryCode: undefined
      };

      if (!isEdit) {
        eventData.createdAt = new Date().toISOString();
      }

      const savedId = await addEvent(eventData);
      
      // Show success message
      alert(`✅ Event "${formData.title}" created successfully!\n\nYour event has been saved and is pending admin approval.`);
      
      // Redirect to events page
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ general: `Failed to save event: ${error.message}` });
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while loading event for edit
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/events" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EX</span>
              </div>
              <span className="text-xl font-bold text-gray-800">EventsX</span>
            </Link>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">1 listing per account, editable after login.</p>
            <p className="text-xs text-gray-400">Admin approval required ✓</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Left Column - Form */}
        <div>
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {isEdit ? 'Edit Event' : 'Create Your Event'}
            </h1>
            
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{errors.general}</p>
              </div>
            )}
            <p className="text-gray-600 text-lg">
              Post an event for conferences, workshops, seminars,<br/>
              meetups, exhibitions, or networking sessions.<br/>
              <span className="text-sm text-gray-500 mt-2 inline-block">
                Login required to submit and get admin approval.
              </span>
            </p>
          </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key (except in textarea)
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          {/* Event Type Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-6">
              {eventTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleChange('eventType', type.id)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    formData.eventType === type.id
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />From Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                onBlur={() => handleBlur('startDate')}
                min={!isEdit ? new Date().toISOString().split('T')[0] : undefined}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />To Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                onBlur={() => handleBlur('endDate')}
                min={formData.startDate || (!isEdit ? new Date().toISOString().split('T')[0] : undefined)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              placeholder="Enter event title..."
              maxLength={MAX_TITLE_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.title}
                </p>
              ) : <span />}
              <span className="text-xs text-gray-400">
                {formData.title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          {/* Description - Right after title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="Describe your event, what attendees can expect..."
              rows={4}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.description}
                </p>
              ) : <span />}
              <span className="text-xs text-gray-400">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* Venue and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                onBlur={() => handleBlur('venue')}
                placeholder="Event location (e.g., Singapore Convention Centre)"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.venue ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.venue && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.venue}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                onBlur={() => handleBlur('capacity')}
                placeholder="Max attendees (e.g., 100)"
                min="1"
                max={MAX_CAPACITY}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Registration Section - Only for new events when not logged in */}
          {!isEdit && !user && (
            <>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />Contact
                    <span className="text-xs text-gray-400 ml-2">(Auto-detects country)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.creatorCountryCode}
                      onChange={(e) => handleChange('creatorCountryCode', e.target.value)}
                      className="w-28 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.creatorContact}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange('creatorContact', value);
                        
                        // Auto-detect country from phone number
                        const detected = detectCountryFromPhone(value);
                        if (detected && detected.code !== formData.creatorCountryCode) {
                          handleChange('creatorCountryCode', detected.code);
                        }
                      }}
                      onBlur={() => handleBlur('creatorContact')}
                      placeholder={getPlaceholder(formData.creatorCountryCode)}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        errors.creatorContact ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required={!user}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />Email
                  </label>
                  <input
                    type="email"
                    value={formData.creatorEmail}
                    onChange={(e) => handleChange('creatorEmail', e.target.value)}
                    onBlur={() => handleBlur('creatorEmail')}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                      errors.creatorEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required={!user}
                  />
                  {errors.creatorEmail && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.creatorEmail}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.creatorPassword}
                  onChange={(e) => handleChange('creatorPassword', e.target.value)}
                  onBlur={() => handleBlur('creatorPassword')}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                    errors.creatorPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required={!user}
                />
                {errors.creatorPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.creatorPassword}
                  </p>
                )}
              </div>
            </div>
            </>
          )}

          {/* Note */}
          <p className="text-sm text-gray-600 pb-4 border-b border-gray-200">
            1 listing per account. Login required. Admin approval required.
          </p>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>

            {/* Logo and Image */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="space-y-3">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.logo ? 'Change' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
                <div className="space-y-3">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Event"
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.image ? 'Change' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('image', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Organisers */}
            <DynamicList
              title="Organisers"
              items={formData.organisers}
              onChange={(items) => handleChange('organisers', items)}
              fields={[
                { name: 'name', label: 'Name', placeholder: 'Name', type: 'text' },
                { name: 'detail', label: 'Detail', placeholder: 'Detail', type: 'text' },
              ]}
            />

          {/* Guests of Honour */}
          <DynamicList
            title="Guests of Honour"
            items={formData.guestsOfHonour}
            onChange={(items) => handleChange('guestsOfHonour', items)}
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Name', type: 'text' },
              { name: 'title', label: 'Title', placeholder: 'Title/Position', type: 'text' },
              { name: 'photo', label: 'Photo', type: 'image' },
            ]}
          />

          {/* Speakers */}
          <DynamicList
            title="Speakers"
            items={formData.speakers}
            onChange={(items) => handleChange('speakers', items)}
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Name', type: 'text' },
              { name: 'title', label: 'Title', placeholder: 'Title/Position', type: 'text' },
              { name: 'photo', label: 'Photo', type: 'image' },
            ]}
          />

          {/* Sponsors */}
          <DynamicList
            title="Sponsors"
            items={formData.sponsors}
            onChange={(items) => handleChange('sponsors', items)}
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Sponsor Name', type: 'text' },
              { name: 'logo', label: 'Logo', type: 'image' },
            ]}
          />

          {/* Media */}
          <DynamicList
            title="Media Partners"
            items={formData.media}
            onChange={(items) => handleChange('media', items)}
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Media Name', type: 'text' },
              { name: 'logo', label: 'Logo', type: 'image' },
            ]}
          />

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Object.keys(errors).filter(k => k !== 'general').length > 0}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span className="text-xl">🇺🇸</span> {isEdit ? 'Update Event' : 'Pay & Submit Event $1'}
              </>
            )}
          </button>
          
          {/* Validation Summary */}
          {submitAttempted && Object.keys(errors).filter(k => k !== 'general').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Please fix the following errors:</p>
                <ul className="text-red-600 text-sm mt-1 list-disc list-inside">
                  {Object.entries(errors).filter(([k]) => k !== 'general').map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>
        </div>

        {/* Right Column - Other Listings */}
        <div className="hidden lg:block sticky top-24">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Listings</h3>
            <p className="text-sm text-gray-500 mb-4">Explore more on LinkMeU</p>
            
            <div className="space-y-3">
              {/* Part-time Job */}
              <Link 
                to="/" 
                className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Part-time Job</p>
                    <p className="text-xs text-gray-500">Find or post jobs</p>
                  </div>
                </div>
              </Link>

              {/* Business for Sale */}
              <Link 
                to="/" 
                className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">$</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Business for Sale</p>
                    <p className="text-xs text-gray-500">Buy or sell businesses</p>
                  </div>
                </div>
              </Link>

              {/* Property for Rent */}
              <Link 
                to="/" 
                className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Property for Rent</p>
                    <p className="text-xs text-gray-500">Find rental properties</p>
                  </div>
                </div>
              </Link>

              {/* Wedding Hall Booking */}
              <Link 
                to="/" 
                className="block p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg hover:shadow-md transition-all border border-pink-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Wedding Hall Booking</p>
                    <p className="text-xs text-gray-500">Book venues for events</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Back to Main */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link 
                to="/" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Listings
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EventForm;
