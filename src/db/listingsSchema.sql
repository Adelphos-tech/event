-- LinkMeU Listings Database Schema
-- Production-ready schema for universal buy/sell listings

-- Listings table for all categories
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Category & Purpose
    category VARCHAR(50) NOT NULL CHECK (category IN ('property', 'business', 'food_beverage', 'products', 'movies')),
    listing_purpose VARCHAR(50) NOT NULL CHECK (listing_purpose IN ('for_sale', 'for_rent', 'for_partnership', 'for_investment', 'clearance')),
    
    -- Listing Identity
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(200),
    description TEXT NOT NULL,
    
    -- Location
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Singapore',
    visibility VARCHAR(50) DEFAULT 'local' CHECK (visibility IN ('local', 'national', 'international')),
    
    -- Pricing
    asking_price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SGD',
    price_type VARCHAR(50) DEFAULT 'negotiable' CHECK (price_type IN ('fixed', 'negotiable', 'open_to_offers')),
    monthly_revenue DECIMAL(15,2),
    monthly_profit DECIMAL(15,2),
    
    -- Key Highlights (stored as JSON array)
    highlights JSONB DEFAULT '[]',
    
    -- What's Included (stored as JSON array)
    included_items JSONB DEFAULT '[]',
    
    -- Media
    cover_image_url TEXT,
    additional_images JSONB DEFAULT '[]',
    video_url TEXT,
    
    -- Seller Information
    seller_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_name VARCHAR(255) NOT NULL,
    seller_type VARCHAR(50) DEFAULT 'owner' CHECK (seller_type IN ('owner', 'agent', 'partner', 'company')),
    seller_phone VARCHAR(50) NOT NULL,
    seller_email VARCHAR(255) NOT NULL,
    preferred_contact JSONB DEFAULT '["whatsapp"]',
    
    -- Verification
    documents_available JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    
    -- Admin Controls
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'expired', 'sold')),
    urgency VARCHAR(50) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'featured')),
    expiry_date DATE,
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadata
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    payment_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Listing inquiries table
CREATE TABLE IF NOT EXISTS listing_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    inquirer_name VARCHAR(255) NOT NULL,
    inquirer_email VARCHAR(255) NOT NULL,
    inquirer_phone VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(asking_price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_listing ON listing_inquiries(listing_id);

-- Apply updated_at trigger to listings
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
