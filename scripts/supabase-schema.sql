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
-- VERIFY SETUP
-- =====================================================
SELECT 'Setup Complete!' as status;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Attendees:', COUNT(*) FROM attendees;
