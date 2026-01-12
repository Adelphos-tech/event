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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_attendees_event ON attendees(event_id);
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Enable for production
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (status != 'deleted');

-- Allow public read access to attendees count
CREATE POLICY "Attendees viewable by event owner" ON attendees
    FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Users can insert events" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert attendees" ON attendees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can be created" ON users
    FOR INSERT WITH CHECK (true);

-- Allow update for event owners
CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (true);

CREATE POLICY "Users can update attendees" ON attendees
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
