import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, Calendar, MapPin, Users, Mail, Phone, CheckCircle } from 'lucide-react';
import { saveEvent, getEvent, registerUser, loginUser } from '../db/database';
import { convertImageToBase64, resizeImage } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import DynamicList from '../components/DynamicList';

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
  const [showRegistration, setShowRegistration] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const event = await getEvent(parseInt(id));
      if (event) {
        setFormData(event);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      alert('Failed to load event');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field, file) => {
    if (file) {
      try {
        const base64 = await convertImageToBase64(file);
        const resized = await resizeImage(base64, 800, 800);
        handleChange(field, resized);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in title, start date, and end date');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date must be after or equal to start date');
      return;
    }

    if (formData.capacity && parseInt(formData.capacity) <= 0) {
      alert('Capacity must be a positive number');
      return;
    }

    // For new events, require registration info
    if (!isEdit && !user) {
      if (!formData.creatorEmail || !formData.creatorPassword || !formData.creatorContact) {
        alert('Please fill in your registration details (Email, Password, Contact)');
        return;
      }
      if (formData.creatorPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
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

      const savedId = await saveEvent(eventData);
      
      // Redirect to events page
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/events" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EX</span>
              </div>
              <span className="text-xl font-bold text-gray-800">EventsX</span>
            </div>
          </Link>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Your Event</h1>
            <p className="text-gray-600 text-lg">
              Post an event for conferences, workshops, seminars,<br/>
              meetups, exhibitions, or networking sessions.<br/>
              <span className="text-sm text-gray-500 mt-2 inline-block">
                Login required to submit and get admin approval.
              </span>
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />To Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter event title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Venue and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="Event location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="Max attendees"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
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
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.creatorCountryCode}
                      onChange={(e) => handleChange('creatorCountryCode', e.target.value)}
                      className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="+65">+65</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.creatorContact}
                      onChange={(e) => handleChange('creatorContact', e.target.value)}
                      placeholder="Contact number"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
                    placeholder="Email your r-email..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required={!user}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.creatorPassword}
                  onChange={(e) => handleChange('creatorPassword', e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required={!user}
                />
              </div>
            </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

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
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <span className="text-xl">🇺🇸</span> Pay & Submit Event ${isEdit ? 'Update' : '1'}
              </>
            )}
          </button>
        </form>
        </div>

        {/* Right Column - Illustration */}
        <div className="hidden lg:flex items-start justify-center pt-20">
          <div className="relative w-full max-w-md">
            {/* Decorative illustration */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-xl">
              <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    <div className="flex-1 h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-full shadow-lg">
                    <Upload size={32} />
                  </div>
                </div>
              </div>
              {/* Floating event cards */}
              <div className="absolute -left-4 top-12 bg-white rounded-lg shadow-md p-3 transform -rotate-12">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
              </div>
              <div className="absolute -right-4 top-32 bg-white rounded-lg shadow-md p-3 transform rotate-12">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg"></div>
              </div>
              <div className="absolute -left-6 bottom-24 bg-white rounded-lg shadow-md p-3 transform rotate-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg"></div>
              </div>
            </div>
            {/* Floating check badge */}
            <div className="absolute -bottom-4 -right-4 bg-green-500 text-white rounded-full p-4 shadow-xl">
              <CheckCircle size={40} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EventForm;
