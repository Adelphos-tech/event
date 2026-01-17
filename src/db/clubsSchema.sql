-- =====================================================
-- CLUBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT,
  contact_person VARCHAR(255) DEFAULT '',
  contact VARCHAR(100) DEFAULT '',
  email VARCHAR(255) NOT NULL,
  annual_fee DECIMAL(10, 2) DEFAULT 120.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_email ON clubs(email);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);

-- =====================================================
-- CLUB MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) DEFAULT '',
  email VARCHAR(255) NOT NULL,
  comments TEXT DEFAULT '',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_type VARCHAR(50) DEFAULT 'annual' CHECK (membership_type IN ('annual', 'lifetime', 'honorary')),
  payment_status VARCHAR(50) DEFAULT 'not_paid' CHECK (payment_status IN ('not_paid', 'partial', 'paid')),
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  prorata_fee DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_email ON club_members(email);
CREATE INDEX IF NOT EXISTS idx_club_members_payment_status ON club_members(payment_status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================

-- Enable RLS on clubs table
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on clubs" ON clubs
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on club_members table
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on club_members" ON club_members
  FOR ALL USING (true) WITH CHECK (true);
