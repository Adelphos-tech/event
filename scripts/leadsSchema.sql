-- Leads table for capturing user enquiries on listings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE SET NULL,
  listing_title VARCHAR(500),
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  event_date DATE,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_listing_id ON leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all for authenticated users" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Allow insert for anonymous users (public lead capture)
CREATE POLICY "Allow insert for anonymous" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Grant permissions
GRANT ALL ON leads TO authenticated;
GRANT INSERT ON leads TO anon;
