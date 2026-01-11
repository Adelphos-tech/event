// Listings Database Module - Production Ready
import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const getDatabaseUrl = () => {
    return import.meta.env.VITE_NEON_DATABASE_URL || import.meta.env.VITE_DATABASE_URL;
};

// Create SQL client
const createSqlClient = () => {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
        console.warn('No database URL configured - listings will use local storage fallback');
        return null;
    }
    return neon(dbUrl);
};

// Local storage fallback for development
const LOCAL_STORAGE_KEY = 'linkmeu_listings';

const getLocalListings = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveLocalListings = (listings) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
};

// Generate UUID for local storage
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ==================== LISTING OPERATIONS ====================

/**
 * Create a new listing
 */
export const createListing = async (listingData) => {
    const sql = createSqlClient();

    const listing = {
        id: generateUUID(),
        category: listingData.category || 'business',
        listing_purpose: listingData.listingPurpose || 'for_sale',
        title: listingData.title,
        tagline: listingData.tagline || '',
        description: listingData.description,
        location: listingData.location,
        city: listingData.city || '',
        country: listingData.country || 'Singapore',
        visibility: listingData.visibility || 'local',
        asking_price: parseFloat(listingData.askingPrice) || 0,
        currency: listingData.currency || 'SGD',
        price_type: listingData.priceType || 'negotiable',
        monthly_revenue: listingData.revenue ? parseFloat(listingData.revenue) : null,
        monthly_profit: listingData.profit ? parseFloat(listingData.profit) : null,
        highlights: JSON.stringify(listingData.highlights || []),
        included_items: JSON.stringify(listingData.included || []),
        cover_image_url: listingData.coverImage || null,
        additional_images: JSON.stringify(listingData.additionalImages || []),
        video_url: listingData.videoUrl || null,
        seller_name: listingData.sellerName,
        seller_type: listingData.sellerType || 'owner',
        seller_phone: listingData.phone,
        seller_email: listingData.email,
        preferred_contact: JSON.stringify(listingData.contactMethod || ['whatsapp']),
        documents_available: JSON.stringify(listingData.documents || []),
        status: 'pending',
        urgency: listingData.urgency || 'normal',
        expiry_date: listingData.expiryDays ?
            new Date(Date.now() + listingData.expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (sql) {
        try {
            const result = await sql`
        INSERT INTO listings (
          category, listing_purpose, title, tagline, description,
          location, city, country, visibility,
          asking_price, currency, price_type, monthly_revenue, monthly_profit,
          highlights, included_items,
          cover_image_url, additional_images, video_url,
          seller_name, seller_type, seller_phone, seller_email, preferred_contact,
          documents_available, status, urgency, expiry_date
        ) VALUES (
          ${listing.category}, ${listing.listing_purpose}, ${listing.title}, ${listing.tagline}, ${listing.description},
          ${listing.location}, ${listing.city}, ${listing.country}, ${listing.visibility},
          ${listing.asking_price}, ${listing.currency}, ${listing.price_type}, ${listing.monthly_revenue}, ${listing.monthly_profit},
          ${listing.highlights}::jsonb, ${listing.included_items}::jsonb,
          ${listing.cover_image_url}, ${listing.additional_images}::jsonb, ${listing.video_url},
          ${listing.seller_name}, ${listing.seller_type}, ${listing.seller_phone}, ${listing.seller_email}, ${listing.preferred_contact}::jsonb,
          ${listing.documents_available}::jsonb, ${listing.status}, ${listing.urgency}, ${listing.expiry_date}
        ) RETURNING *
      `;
            return { success: true, listing: result[0] };
        } catch (error) {
            console.error('Failed to create listing in Neon:', error);
            // Fallback to local storage
        }
    }

    // Local storage fallback
    const listings = getLocalListings();
    listings.push(listing);
    saveLocalListings(listings);
    return { success: true, listing, mode: 'local' };
};

/**
 * Get all active listings
 */
export const getActiveListings = async (filters = {}) => {
    const sql = createSqlClient();

    if (sql) {
        try {
            let result;
            if (filters.category) {
                result = await sql`
          SELECT * FROM listings 
          WHERE status = 'active' AND category = ${filters.category}
          ORDER BY urgency DESC, created_at DESC
          LIMIT 50
        `;
            } else {
                result = await sql`
          SELECT * FROM listings 
          WHERE status = 'active'
          ORDER BY urgency DESC, created_at DESC
          LIMIT 50
        `;
            }
            return result.map(listing => ({
                ...listing,
                highlights: typeof listing.highlights === 'string' ? JSON.parse(listing.highlights) : listing.highlights,
                included_items: typeof listing.included_items === 'string' ? JSON.parse(listing.included_items) : listing.included_items,
                additional_images: typeof listing.additional_images === 'string' ? JSON.parse(listing.additional_images) : listing.additional_images,
                preferred_contact: typeof listing.preferred_contact === 'string' ? JSON.parse(listing.preferred_contact) : listing.preferred_contact,
                documents_available: typeof listing.documents_available === 'string' ? JSON.parse(listing.documents_available) : listing.documents_available
            }));
        } catch (error) {
            console.error('Failed to get listings from Neon:', error);
        }
    }

    // Local storage fallback
    let listings = getLocalListings().filter(l => l.status === 'active');
    if (filters.category) {
        listings = listings.filter(l => l.category === filters.category);
    }
    return listings;
};

/**
 * Get featured listings for display
 */
export const getFeaturedListings = async (limit = 5) => {
    const sql = createSqlClient();

    if (sql) {
        try {
            const result = await sql`
        SELECT * FROM listings 
        WHERE status = 'active'
        ORDER BY urgency DESC, views_count DESC, created_at DESC
        LIMIT ${limit}
      `;
            return result;
        } catch (error) {
            console.error('Failed to get featured listings:', error);
        }
    }

    // Return sample listings for display
    return getSampleListings();
};

/**
 * Get listing by ID
 */
export const getListingById = async (id) => {
    const sql = createSqlClient();

    if (sql) {
        try {
            const result = await sql`
        SELECT * FROM listings WHERE id = ${id}
      `;
            if (result.length > 0) {
                // Increment view count
                await sql`UPDATE listings SET views_count = views_count + 1 WHERE id = ${id}`;
                return result[0];
            }
            return null;
        } catch (error) {
            console.error('Failed to get listing:', error);
        }
    }

    // Local storage fallback
    const listings = getLocalListings();
    return listings.find(l => l.id === id) || null;
};

/**
 * Update listing status (admin function)
 */
export const updateListingStatus = async (id, status, adminNotes = null, rejectionReason = null) => {
    const sql = createSqlClient();

    if (sql) {
        try {
            const updates = { status };
            if (adminNotes) updates.admin_notes = adminNotes;
            if (rejectionReason) updates.rejection_reason = rejectionReason;
            if (status === 'active') updates.published_at = new Date().toISOString();

            const result = await sql`
        UPDATE listings 
        SET status = ${status}, 
            admin_notes = ${adminNotes},
            rejection_reason = ${rejectionReason},
            published_at = ${status === 'active' ? new Date().toISOString() : null},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
            return { success: true, listing: result[0] };
        } catch (error) {
            console.error('Failed to update listing status:', error);
            return { success: false, error: error.message };
        }
    }

    // Local storage fallback
    const listings = getLocalListings();
    const index = listings.findIndex(l => l.id === id);
    if (index >= 0) {
        listings[index].status = status;
        listings[index].updated_at = new Date().toISOString();
        if (status === 'active') listings[index].published_at = new Date().toISOString();
        saveLocalListings(listings);
        return { success: true, listing: listings[index] };
    }
    return { success: false, error: 'Listing not found' };
};

/**
 * Create inquiry for a listing
 */
export const createInquiry = async (listingId, inquiryData) => {
    const sql = createSqlClient();

    if (sql) {
        try {
            const result = await sql`
        INSERT INTO listing_inquiries (listing_id, inquirer_name, inquirer_email, inquirer_phone, message)
        VALUES (${listingId}, ${inquiryData.name}, ${inquiryData.email}, ${inquiryData.phone || null}, ${inquiryData.message})
        RETURNING *
      `;
            // Increment inquiry count
            await sql`UPDATE listings SET inquiries_count = inquiries_count + 1 WHERE id = ${listingId}`;
            return { success: true, inquiry: result[0] };
        } catch (error) {
            console.error('Failed to create inquiry:', error);
            return { success: false, error: error.message };
        }
    }

    return { success: true, mode: 'local' };
};

// Sample listings for display when no database
export const getSampleListings = () => [
    {
        id: '1',
        category: 'property',
        title: 'Luxury Villa for Sale',
        asking_price: 1200000,
        currency: 'SGD',
        cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        location: 'Sentosa Cove'
    },
    {
        id: '2',
        category: 'business',
        title: 'Cozy Cafe for Sale',
        asking_price: 120000,
        currency: 'SGD',
        cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
        location: 'Orchard Road'
    },
    {
        id: '3',
        category: 'products',
        title: 'Popular Restaurant',
        asking_price: 250000,
        currency: 'SGD',
        cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        location: 'Clarke Quay'
    },
    {
        id: '4',
        category: 'food_beverage',
        title: 'Popular Restaurant',
        asking_price: 250000,
        currency: 'SGD',
        cover_image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
        location: 'Marina Bay'
    },
    {
        id: '5',
        category: 'products',
        title: 'Organic Skincare Brand',
        asking_price: 30,
        currency: 'SGD',
        cover_image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
        location: 'Online'
    }
];

export default {
    createListing,
    getActiveListings,
    getFeaturedListings,
    getListingById,
    updateListingStatus,
    createInquiry,
    getSampleListings
};
