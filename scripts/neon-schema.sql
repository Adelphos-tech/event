-- EventsX Database Schema for Neon PostgreSQL
-- Run this in Neon SQL Editor to set up the database

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS event_sponsors CASCADE;
DROP TABLE IF EXISTS event_speakers CASCADE;
DROP TABLE IF EXISTS event_organizers CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    contact VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Events Table (simplified to match frontend)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) DEFAULT 'conference',
    start_date DATE,
    end_date DATE,
    venue VARCHAR(500),
    capacity INTEGER DEFAULT 100,
    logo TEXT,
    image TEXT,
    owner_id INTEGER REFERENCES users(id),
    organisers JSONB DEFAULT '[]',
    speakers JSONB DEFAULT '[]',
    sponsors JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Attendees Table
CREATE TABLE attendees (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    notes TEXT,
    attended BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_attendees_event ON attendees(event_id);
CREATE INDEX idx_users_email ON users(email);

-- Insert super admin user
INSERT INTO users (email, password, role, first_name, last_name)
VALUES ('robocorpsg@gmail.com', 'Admin@7990', 'superadmin', 'Super', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert a test event to verify
INSERT INTO events (title, description, start_date, end_date, venue, capacity, owner_id, status)
VALUES (
    'Welcome to EventsX',
    'This is a test event to verify the database is working correctly.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day',
    'Singapore',
    100,
    1,
    'active'
);

-- Verify the setup
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Attendees:', COUNT(*) FROM attendees;
