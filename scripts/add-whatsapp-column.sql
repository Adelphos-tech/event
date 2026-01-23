-- Add WhatsApp column to listings table
-- Run this in Supabase SQL Editor

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(100) DEFAULT '';

-- Update existing listings to use contact as whatsapp if empty
UPDATE listings 
SET whatsapp = contact 
WHERE whatsapp IS NULL OR whatsapp = '';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name = 'whatsapp';
