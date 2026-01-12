-- EventsX Database Schema for Supabase
-- Run this in Supabase SQL Editor to set up the database

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner' CHECK (role IN ('user', 'owner', 'superadmin')),
    contact VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) DEFAULT 'conference',
    start_date DATE NOT NULL,
    end_date DATE,
    venue VARCHAR(500),
    capacity INTEGER DEFAULT 100,
    logo TEXT,
    image TEXT,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    organisers JSONB DEFAULT '[]'::jsonb,
    speakers JSONB DEFAULT '[]'::jsonb,
    sponsors JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled', 'completed', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ATTENDEES TABLE
-- =====================================================
CREATE TABLE attendees (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    notes TEXT,
    attended BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMPTZ,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LISTINGS TABLE (Marketplace)
-- =====================================================
DROP TABLE IF EXISTS listings CASCADE;
CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL CHECK (category IN ('parttime', 'business', 'property', 'wedding')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    from_date DATE,
    to_date DATE,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'USD',
    revenue VARCHAR(255),
    location VARCHAR(255) DEFAULT 'Singapore',
    contact VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'expired', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_attendees_event ON attendees(event_id);
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_email ON listings(email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Permissive for anonymous access
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
CREATE POLICY "Allow anonymous user creation" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow updates on users" ON users
    FOR UPDATE USING (true);

-- EVENTS TABLE POLICIES
CREATE POLICY "Allow anonymous event creation" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read events" ON events
    FOR SELECT USING (status != 'deleted');

CREATE POLICY "Allow updates on events" ON events
    FOR UPDATE USING (true);

-- ATTENDEES TABLE POLICIES
CREATE POLICY "Allow anonymous attendee registration" ON attendees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read attendees" ON attendees
    FOR SELECT USING (true);

CREATE POLICY "Allow updates on attendees" ON attendees
    FOR UPDATE USING (true);

-- LISTINGS TABLE POLICIES
CREATE POLICY "Allow anonymous listing creation" ON listings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read listings" ON listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow updates on listings" ON listings
    FOR UPDATE USING (true);

-- =====================================================
-- SEED DATA - Super Admin
-- =====================================================
INSERT INTO users (email, password, role, first_name, last_name)
VALUES ('robocorpsg@gmail.com', 'Admin@7990', 'superadmin', 'Super', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SEED DATA - Test Event
-- =====================================================
INSERT INTO events (title, description, start_date, end_date, venue, capacity, owner_id, status)
SELECT 
    'Welcome to EventsX',
    'This is a test event to verify the database is working correctly. You can delete this event after testing.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day',
    'Singapore',
    100,
    id,
    'active'
FROM users WHERE email = 'robocorpsg@gmail.com'
LIMIT 1;

-- =====================================================
-- SEED DATA - Sample Listings
-- =====================================================

-- Part-time Job Listings
INSERT INTO listings (category, title, description, budget_min, budget_max, currency, location, contact, email, images, status) VALUES
('parttime', 'Weekend Barista at Premium Cafe', 'Looking for an experienced barista to work weekends at our premium coffee shop in Orchard. Must have latte art skills and customer service experience.', 15, 20, 'SGD', 'Orchard, Singapore', '+65 9123 4567', 'cafe@example.com', '["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"]'::jsonb, 'active'),
('parttime', 'Delivery Rider - Flexible Hours', 'Join our delivery team! Flexible hours, good pay. Must have own motorcycle and valid license. Training provided.', 2000, 4000, 'SGD', 'Island-wide, Singapore', '+65 8234 5678', 'delivery@example.com', '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"]'::jsonb, 'active'),
('parttime', 'Tuition Teacher - Math & Science', 'Seeking qualified tutors for primary and secondary students. Competitive hourly rates. Must have teaching experience.', 40, 80, 'SGD', 'Tampines, Singapore', '+65 9345 6789', 'tutor@example.com', '["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400"]'::jsonb, 'active');

-- Business for Sale Listings
INSERT INTO listings (category, title, description, budget_min, budget_max, currency, revenue, location, contact, email, images, status) VALUES
('business', 'Profitable Bubble Tea Shop for Sale', 'Well-established bubble tea shop in high foot traffic area. Includes all equipment, recipes, and trained staff. Monthly revenue $25k+.', 80000, 120000, 'SGD', '$25,000/month', 'Bugis, Singapore', '+65 9456 7890', 'biz1@example.com', '["https://images.unsplash.com/photo-1558857563-b371033873b8?w=400", "https://images.unsplash.com/photo-1525803377221-4f5e3c4e0b3c?w=400"]'::jsonb, 'active'),
('business', 'Online E-commerce Store - Fashion', 'Turnkey fashion e-commerce business with 10k+ followers. Includes inventory, supplier contacts, and social media accounts.', 15000, 25000, 'USD', '$5,000/month', 'Online', '+65 8567 8901', 'biz2@example.com', '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"]'::jsonb, 'active'),
('business', 'Food Truck Business - Ready to Operate', 'Fully equipped food truck with all licenses. Specializes in Western fusion cuisine. Prime locations secured.', 45000, 60000, 'SGD', '$8,000/month', 'Mobile, Singapore', '+65 9678 9012', 'biz3@example.com', '["https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400"]'::jsonb, 'active');

-- Property for Rent Listings
INSERT INTO listings (category, title, description, budget_min, budget_max, currency, location, contact, email, images, status) VALUES
('property', 'Modern 2BR Condo near MRT', 'Fully furnished 2-bedroom condo with city view. Walking distance to MRT. Includes gym and pool access. Min 1 year lease.', 2800, 3200, 'SGD', 'Toa Payoh, Singapore', '+65 9789 0123', 'rent1@example.com', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"]'::jsonb, 'active'),
('property', 'Cozy Studio Apartment - CBD', 'Compact studio perfect for professionals. High floor, great view. All utilities included. Available immediately.', 1800, 2200, 'SGD', 'Raffles Place, Singapore', '+65 8890 1234', 'rent2@example.com', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"]'::jsonb, 'active'),
('property', 'Spacious HDB Room for Rent', 'Master bedroom in 4-room HDB. Aircon, attached bathroom. Near amenities and bus stop. Female tenants preferred.', 800, 1000, 'SGD', 'Jurong East, Singapore', '+65 9901 2345', 'rent3@example.com', '["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400"]'::jsonb, 'active');

-- Wedding Hall Booking Listings
INSERT INTO listings (category, title, description, budget_min, budget_max, currency, location, contact, email, images, status) VALUES
('wedding', 'Grand Ballroom - 500 Guests Capacity', 'Elegant ballroom with crystal chandeliers and marble floors. Includes catering, decoration, and AV equipment. Perfect for grand weddings.', 15000, 25000, 'SGD', 'Marina Bay, Singapore', '+65 9012 3456', 'wedding1@example.com', '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400"]'::jsonb, 'active'),
('wedding', 'Garden Wedding Venue - Outdoor', 'Beautiful garden setting with gazebo. Capacity 150 guests. Includes setup, chairs, and basic decoration. Sunset ceremony available.', 5000, 8000, 'SGD', 'Sentosa, Singapore', '+65 8123 4567', 'wedding2@example.com', '["https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400"]'::jsonb, 'active'),
('wedding', 'Intimate Restaurant Wedding Package', 'Cozy restaurant venue for 50-80 guests. 8-course dinner included. Private space with romantic ambiance.', 8000, 12000, 'SGD', 'Dempsey Hill, Singapore', '+65 9234 5678', 'wedding3@example.com', '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"]'::jsonb, 'active');

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 'Setup Complete!' as status;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Attendees:', COUNT(*) FROM attendees
UNION ALL
SELECT 'Listings:', COUNT(*) FROM listings;
