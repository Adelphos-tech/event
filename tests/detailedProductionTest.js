/**
 * DETAILED Production Test Suite for LinkMeU
 * Captures FULL request/response data for every API call
 * Generates comprehensive Excel report with all details
 * 
 * Run: node detailedProductionTest.js
 */

import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

// Configuration
const PRODUCTION_URL = 'https://linkmeu.com';
const SUPABASE_URL = 'https://veqzuimbwsndxwzseimj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcXp1aW1id3NuZHh3enNlaW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxODk4MzIsImV4cCI6MjA4Mzc2NTgzMn0.--OGvr-CCOirQjvgEVNUNCfagP1pz1JXzsEpyN_cwpM';
const TEST_ITERATIONS = 10;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Detailed test results storage - organized by category
const detailedResults = {
  database: [],
  users: [],
  events: [],
  attendees: [],
  listings: [],
  clubs: [],
  clubMembers: [],
  pages: [],
};

// Helper function to measure response time and capture full details
const executeTest = async (testName, category, iteration, requestDetails, testFn) => {
  const start = Date.now();
  let result = {
    timestamp: new Date().toISOString(),
    testName,
    category,
    iteration,
    status: 'FAIL',
    responseTime: 0,
    request: requestDetails,
    response: null,
    responseData: null,
    recordCount: 0,
    error: null,
  };

  try {
    const response = await testFn();
    result.responseTime = Date.now() - start;
    result.status = 'PASS';
    result.response = response;
    result.responseData = JSON.stringify(response, null, 2);
    result.recordCount = Array.isArray(response?.data) ? response.data.length : (response?.data ? 1 : 0);
  } catch (error) {
    result.responseTime = Date.now() - start;
    result.error = error.message;
    result.responseData = JSON.stringify({ error: error.message });
  }

  detailedResults[category].push(result);
  return result;
};

// ==================== DATABASE TESTS ====================

const testDatabase = async (iteration) => {
  console.log(`\n🔌 DATABASE TESTS (Iteration ${iteration})`);

  // Test 1: Database Health Check
  const healthCheck = await executeTest(
    'Database Health Check',
    'database',
    iteration,
    { table: 'users', operation: 'SELECT count', query: 'SELECT count FROM users LIMIT 1' },
    async () => {
      const { data, error, status, statusText } = await supabase.from('users').select('*', { count: 'exact', head: true });
      if (error) throw new Error(error.message);
      return { data: { connected: true }, status, statusText, count: data };
    }
  );
  console.log(`  ${healthCheck.status === 'PASS' ? '✅' : '❌'} Health Check: ${healthCheck.responseTime}ms`);

  // Test 2: Tables Existence Check
  const tablesCheck = await executeTest(
    'Tables Existence Check',
    'database',
    iteration,
    { operation: 'Check all tables exist', tables: ['users', 'events', 'attendees', 'listings', 'clubs', 'club_members'] },
    async () => {
      const tables = ['users', 'events', 'attendees', 'listings', 'clubs', 'club_members'];
      const results = {};
      for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        results[table] = error ? 'NOT FOUND' : 'EXISTS';
      }
      return { data: results };
    }
  );
  console.log(`  ${tablesCheck.status === 'PASS' ? '✅' : '❌'} Tables Check: ${tablesCheck.responseTime}ms`);
};

// ==================== USER TESTS ====================

const testUsers = async (iteration) => {
  console.log(`\n👤 USER API TESTS (Iteration ${iteration})`);

  // Test 1: Get All Users
  const getAllUsers = await executeTest(
    'GET All Users',
    'users',
    iteration,
    { table: 'users', operation: 'SELECT *', orderBy: 'created_at DESC', limit: 50 },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('users')
        .select('id, email, role, contact, first_name, last_name, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllUsers.status === 'PASS' ? '✅' : '❌'} Get All Users: ${getAllUsers.responseTime}ms (${getAllUsers.recordCount} records)`);

  // Test 2: Get User By Email (Admin)
  const getAdminUser = await executeTest(
    'GET User By Email (Admin)',
    'users',
    iteration,
    { table: 'users', operation: 'SELECT WHERE email', email: 'robocorpsg@gmail.com' },
    async () => {
      const { data, error, status, statusText } = await supabase
        .from('users')
        .select('id, email, role, contact, first_name, last_name, created_at')
        .ilike('email', 'robocorpsg@gmail.com')
        .single();
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return { data, status, statusText, found: !!data };
    }
  );
  console.log(`  ${getAdminUser.status === 'PASS' ? '✅' : '❌'} Get Admin User: ${getAdminUser.responseTime}ms`);

  // Test 3: Count Users by Role
  const countByRole = await executeTest(
    'COUNT Users By Role',
    'users',
    iteration,
    { table: 'users', operation: 'GROUP BY role' },
    async () => {
      const { data, error } = await supabase.from('users').select('role');
      if (error) throw new Error(error.message);
      const roleCounts = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      return { data: roleCounts, totalUsers: data.length };
    }
  );
  console.log(`  ${countByRole.status === 'PASS' ? '✅' : '❌'} Count By Role: ${countByRole.responseTime}ms`);
};

// ==================== EVENT TESTS ====================

const testEvents = async (iteration) => {
  console.log(`\n📅 EVENT API TESTS (Iteration ${iteration})`);

  // Test 1: Get All Events
  const getAllEvents = await executeTest(
    'GET All Events',
    'events',
    iteration,
    { table: 'events', operation: 'SELECT *', filter: "status != 'deleted'", orderBy: 'start_date ASC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .neq('status', 'deleted')
        .order('start_date', { ascending: true });
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllEvents.status === 'PASS' ? '✅' : '❌'} Get All Events: ${getAllEvents.responseTime}ms (${getAllEvents.recordCount} records)`);

  // Test 2: Get Active Events
  const getActiveEvents = await executeTest(
    'GET Active Events',
    'events',
    iteration,
    { table: 'events', operation: 'SELECT WHERE status = active' },
    async () => {
      const { data, error, status, statusText } = await supabase
        .from('events')
        .select('id, title, start_date, end_date, venue, capacity, status')
        .eq('status', 'active')
        .order('start_date', { ascending: true });
      if (error) throw new Error(error.message);
      return { data, status, statusText };
    }
  );
  console.log(`  ${getActiveEvents.status === 'PASS' ? '✅' : '❌'} Get Active Events: ${getActiveEvents.responseTime}ms (${getActiveEvents.recordCount} records)`);

  // Test 3: Get Single Event (if exists)
  if (getAllEvents.response?.data?.length > 0) {
    const eventId = getAllEvents.response.data[0].id;
    const getSingleEvent = await executeTest(
      'GET Single Event By ID',
      'events',
      iteration,
      { table: 'events', operation: 'SELECT WHERE id', eventId },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        if (error) throw new Error(error.message);
        return { data, status, statusText };
      }
    );
    console.log(`  ${getSingleEvent.status === 'PASS' ? '✅' : '❌'} Get Single Event: ${getSingleEvent.responseTime}ms`);

    // Test 4: Get Event with Attendee Count
    const getEventWithAttendees = await executeTest(
      'GET Event With Attendee Count',
      'events',
      iteration,
      { table: 'events + attendees', operation: 'JOIN COUNT', eventId },
      async () => {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, title, capacity')
          .eq('id', eventId)
          .single();
        if (eventError) throw new Error(eventError.message);
        
        const { count, error: countError } = await supabase
          .from('attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);
        if (countError) throw new Error(countError.message);
        
        return { data: { ...event, attendeeCount: count, availableSpots: event.capacity - count } };
      }
    );
    console.log(`  ${getEventWithAttendees.status === 'PASS' ? '✅' : '❌'} Event + Attendees: ${getEventWithAttendees.responseTime}ms`);
  }

  // Test 5: Get Upcoming Events
  const getUpcomingEvents = await executeTest(
    'GET Upcoming Events',
    'events',
    iteration,
    { table: 'events', operation: 'SELECT WHERE start_date >= today' },
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error, status, statusText } = await supabase
        .from('events')
        .select('id, title, start_date, venue')
        .gte('start_date', today)
        .neq('status', 'deleted')
        .order('start_date', { ascending: true });
      if (error) throw new Error(error.message);
      return { data, status, statusText, filterDate: today };
    }
  );
  console.log(`  ${getUpcomingEvents.status === 'PASS' ? '✅' : '❌'} Upcoming Events: ${getUpcomingEvents.responseTime}ms (${getUpcomingEvents.recordCount} records)`);
};

// ==================== ATTENDEE TESTS ====================

const testAttendees = async (iteration) => {
  console.log(`\n🎫 ATTENDEE API TESTS (Iteration ${iteration})`);

  // Get an event first
  const { data: events } = await supabase.from('events').select('id, title').neq('status', 'deleted').limit(1);
  const eventId = events?.[0]?.id;
  const eventTitle = events?.[0]?.title || 'N/A';

  // Test 1: Get All Attendees
  const getAllAttendees = await executeTest(
    'GET All Attendees',
    'attendees',
    iteration,
    { table: 'attendees', operation: 'SELECT *', orderBy: 'registered_at DESC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('attendees')
        .select('*', { count: 'exact' })
        .order('registered_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllAttendees.status === 'PASS' ? '✅' : '❌'} Get All Attendees: ${getAllAttendees.responseTime}ms (${getAllAttendees.recordCount} records)`);

  if (eventId) {
    // Test 2: Get Attendees By Event
    const getByEvent = await executeTest(
      'GET Attendees By Event',
      'attendees',
      iteration,
      { table: 'attendees', operation: 'SELECT WHERE event_id', eventId, eventTitle },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('attendees')
          .select('id, name, email, contact, attended, registered_at, check_in_time')
          .eq('event_id', eventId)
          .order('registered_at', { ascending: false });
        if (error) throw new Error(error.message);
        return { data, status, statusText, eventId, eventTitle };
      }
    );
    console.log(`  ${getByEvent.status === 'PASS' ? '✅' : '❌'} Get By Event: ${getByEvent.responseTime}ms (${getByEvent.recordCount} records)`);

    // Test 3: Search Attendees
    const searchAttendees = await executeTest(
      'SEARCH Attendees',
      'attendees',
      iteration,
      { table: 'attendees', operation: 'SELECT WHERE name/email ILIKE', searchQuery: '%test%', eventId },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('attendees')
          .select('id, name, email, attended')
          .eq('event_id', eventId)
          .or('name.ilike.%test%,email.ilike.%test%');
        if (error) throw new Error(error.message);
        return { data, status, statusText, searchQuery: 'test' };
      }
    );
    console.log(`  ${searchAttendees.status === 'PASS' ? '✅' : '❌'} Search Attendees: ${searchAttendees.responseTime}ms (${searchAttendees.recordCount} matches)`);

    // Test 4: Get Attendance Stats
    const getStats = await executeTest(
      'GET Attendance Statistics',
      'attendees',
      iteration,
      { table: 'attendees', operation: 'COUNT GROUP BY attended', eventId },
      async () => {
        const { data, error } = await supabase
          .from('attendees')
          .select('attended')
          .eq('event_id', eventId);
        if (error) throw new Error(error.message);
        const total = data.length;
        const checkedIn = data.filter(a => a.attended).length;
        const pending = total - checkedIn;
        return { 
          data: { total, checkedIn, pending, checkInRate: total > 0 ? ((checkedIn/total)*100).toFixed(1) + '%' : '0%' },
          eventId 
        };
      }
    );
    console.log(`  ${getStats.status === 'PASS' ? '✅' : '❌'} Attendance Stats: ${getStats.responseTime}ms`);
  }
};

// ==================== LISTING TESTS ====================

const testListings = async (iteration) => {
  console.log(`\n🏪 LISTING API TESTS (Iteration ${iteration})`);

  // Test 1: Get All Approved Listings
  const getAllApproved = await executeTest(
    'GET All Approved Listings',
    'listings',
    iteration,
    { table: 'listings', operation: 'SELECT WHERE status = approved', orderBy: 'created_at DESC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllApproved.status === 'PASS' ? '✅' : '❌'} Get Approved: ${getAllApproved.responseTime}ms (${getAllApproved.recordCount} records)`);

  // Test 2: Get All Listings (Admin view)
  const getAllAdmin = await executeTest(
    'GET All Listings (Admin)',
    'listings',
    iteration,
    { table: 'listings', operation: 'SELECT * (all statuses)', orderBy: 'created_at DESC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('listings')
        .select('id, title, category, status, email, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllAdmin.status === 'PASS' ? '✅' : '❌'} Get All (Admin): ${getAllAdmin.responseTime}ms (${getAllAdmin.recordCount} records)`);

  // Test 3-6: Get Listings By Category
  const categories = ['venue', 'catering', 'entertainment', 'photography', 'decoration', 'other'];
  for (const category of categories) {
    const getByCategory = await executeTest(
      `GET ${category.charAt(0).toUpperCase() + category.slice(1)} Listings`,
      'listings',
      iteration,
      { table: 'listings', operation: 'SELECT WHERE category', category, status: 'approved' },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('listings')
          .select('id, title, description, budget_min, budget_max, location, email')
          .eq('category', category)
          .eq('status', 'approved');
        if (error) throw new Error(error.message);
        return { data, status, statusText, category };
      }
    );
    console.log(`  ${getByCategory.status === 'PASS' ? '✅' : '❌'} ${category}: ${getByCategory.responseTime}ms (${getByCategory.recordCount} records)`);
  }

  // Test 7: Get Listings Stats
  const getStats = await executeTest(
    'GET Listings Statistics',
    'listings',
    iteration,
    { table: 'listings', operation: 'COUNT GROUP BY status, category' },
    async () => {
      const { data, error } = await supabase.from('listings').select('status, category');
      if (error) throw new Error(error.message);
      
      const byStatus = data.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
      const byCategory = data.reduce((acc, l) => { acc[l.category] = (acc[l.category] || 0) + 1; return acc; }, {});
      
      return { data: { total: data.length, byStatus, byCategory } };
    }
  );
  console.log(`  ${getStats.status === 'PASS' ? '✅' : '❌'} Listings Stats: ${getStats.responseTime}ms`);
};

// ==================== CLUB TESTS ====================

const testClubs = async (iteration) => {
  console.log(`\n🏛️ CLUB API TESTS (Iteration ${iteration})`);

  // Test 1: Get All Clubs
  const getAllClubs = await executeTest(
    'GET All Clubs',
    'clubs',
    iteration,
    { table: 'clubs', operation: 'SELECT *', orderBy: 'created_at DESC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('clubs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllClubs.status === 'PASS' ? '✅' : '❌'} Get All Clubs: ${getAllClubs.responseTime}ms (${getAllClubs.recordCount} records)`);

  // Test 2: Get Club with Member Count
  if (getAllClubs.response?.data?.length > 0) {
    const clubId = getAllClubs.response.data[0].id;
    const clubName = getAllClubs.response.data[0].name;

    const getClubWithMembers = await executeTest(
      'GET Club With Member Count',
      'clubs',
      iteration,
      { table: 'clubs + club_members', operation: 'JOIN COUNT', clubId, clubName },
      async () => {
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', clubId)
          .single();
        if (clubError) throw new Error(clubError.message);

        const { count, error: countError } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', clubId);
        if (countError) throw new Error(countError.message);

        return { data: { ...club, memberCount: count } };
      }
    );
    console.log(`  ${getClubWithMembers.status === 'PASS' ? '✅' : '❌'} Club + Members: ${getClubWithMembers.responseTime}ms`);
  }

  // Test 3: Get Club Statistics
  const getClubStats = await executeTest(
    'GET Club Statistics',
    'clubs',
    iteration,
    { table: 'clubs', operation: 'AGGREGATE stats' },
    async () => {
      const { data: clubs, error: clubsError } = await supabase.from('clubs').select('id, name, annual_fee');
      if (clubsError) throw new Error(clubsError.message);

      const { data: members, error: membersError } = await supabase.from('club_members').select('club_id, payment_status');
      if (membersError) throw new Error(membersError.message);

      const totalClubs = clubs.length;
      const totalMembers = members.length;
      const avgFee = clubs.length > 0 ? (clubs.reduce((sum, c) => sum + (c.annual_fee || 0), 0) / clubs.length).toFixed(2) : 0;
      const paidMembers = members.filter(m => m.payment_status === 'paid').length;

      return { 
        data: { 
          totalClubs, 
          totalMembers, 
          avgAnnualFee: avgFee,
          paidMembers,
          unpaidMembers: totalMembers - paidMembers
        } 
      };
    }
  );
  console.log(`  ${getClubStats.status === 'PASS' ? '✅' : '❌'} Club Stats: ${getClubStats.responseTime}ms`);
};

// ==================== CLUB MEMBER TESTS ====================

const testClubMembers = async (iteration) => {
  console.log(`\n👥 CLUB MEMBER API TESTS (Iteration ${iteration})`);

  // Test 1: Get All Club Members
  const getAllMembers = await executeTest(
    'GET All Club Members',
    'clubMembers',
    iteration,
    { table: 'club_members', operation: 'SELECT *', orderBy: 'created_at DESC' },
    async () => {
      const { data, error, status, statusText, count } = await supabase
        .from('club_members')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { data, status, statusText, totalCount: count };
    }
  );
  console.log(`  ${getAllMembers.status === 'PASS' ? '✅' : '❌'} Get All Members: ${getAllMembers.responseTime}ms (${getAllMembers.recordCount} records)`);

  // Test 2: Get Members by Payment Status
  const paymentStatuses = ['paid', 'partial', 'not_paid'];
  for (const paymentStatus of paymentStatuses) {
    const getByPayment = await executeTest(
      `GET Members - ${paymentStatus.replace('_', ' ').toUpperCase()}`,
      'clubMembers',
      iteration,
      { table: 'club_members', operation: 'SELECT WHERE payment_status', paymentStatus },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('club_members')
          .select('id, name, email, club_id, amount_paid, prorata_fee')
          .eq('payment_status', paymentStatus);
        if (error) throw new Error(error.message);
        return { data, status, statusText, paymentStatus };
      }
    );
    console.log(`  ${getByPayment.status === 'PASS' ? '✅' : '❌'} ${paymentStatus}: ${getByPayment.responseTime}ms (${getByPayment.recordCount} records)`);
  }

  // Test 3: Get Members by Membership Type
  const membershipTypes = ['annual', 'lifetime', 'honorary'];
  for (const membershipType of membershipTypes) {
    const getByType = await executeTest(
      `GET Members - ${membershipType.toUpperCase()}`,
      'clubMembers',
      iteration,
      { table: 'club_members', operation: 'SELECT WHERE membership_type', membershipType },
      async () => {
        const { data, error, status, statusText } = await supabase
          .from('club_members')
          .select('id, name, email, club_id, registration_date')
          .eq('membership_type', membershipType);
        if (error) throw new Error(error.message);
        return { data, status, statusText, membershipType };
      }
    );
    console.log(`  ${getByType.status === 'PASS' ? '✅' : '❌'} ${membershipType}: ${getByType.responseTime}ms (${getByType.recordCount} records)`);
  }

  // Test 4: Get Payment Summary
  const getPaymentSummary = await executeTest(
    'GET Payment Summary',
    'clubMembers',
    iteration,
    { table: 'club_members', operation: 'SUM amount_paid, prorata_fee' },
    async () => {
      const { data, error } = await supabase
        .from('club_members')
        .select('amount_paid, prorata_fee, payment_status');
      if (error) throw new Error(error.message);

      const totalCollected = data.reduce((sum, m) => sum + (m.amount_paid || 0), 0);
      const totalExpected = data.reduce((sum, m) => sum + (m.prorata_fee || 0), 0);
      const outstanding = totalExpected - totalCollected;

      return { 
        data: { 
          totalMembers: data.length,
          totalCollected: totalCollected.toFixed(2),
          totalExpected: totalExpected.toFixed(2),
          outstanding: outstanding.toFixed(2),
          collectionRate: totalExpected > 0 ? ((totalCollected/totalExpected)*100).toFixed(1) + '%' : '0%'
        } 
      };
    }
  );
  console.log(`  ${getPaymentSummary.status === 'PASS' ? '✅' : '❌'} Payment Summary: ${getPaymentSummary.responseTime}ms`);
};

// ==================== PAGE TESTS ====================

const testPages = async (iteration) => {
  console.log(`\n📄 PAGE AVAILABILITY TESTS (Iteration ${iteration})`);

  const pages = [
    { name: 'Home Page', path: '/', description: 'Main landing page' },
    { name: 'Events Page', path: '/events', description: 'Event listing page' },
    { name: 'Membership Page', path: '/membership', description: 'Club membership management' },
    { name: 'Login Page', path: '/login', description: 'User authentication' },
    { name: 'Register Page', path: '/register', description: 'User registration' },
    { name: 'Admin Dashboard', path: '/admin', description: 'Admin control panel' },
    { name: 'Listings Admin', path: '/listings-admin', description: 'Marketplace admin' },
    { name: 'Listings Login', path: '/listings-login', description: 'Marketplace login' },
    { name: 'Register Listing', path: '/register-listing', description: 'Create new listing' },
  ];

  for (const page of pages) {
    const url = `${PRODUCTION_URL}${page.path}`;
    const pageTest = await executeTest(
      `PAGE: ${page.name}`,
      'pages',
      iteration,
      { url, method: 'GET', description: page.description },
      async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'LinkMeU-DetailedTest/1.0' }
        });
        const text = await response.text();
        const hasHTML = text.includes('<!DOCTYPE html>') || text.includes('<html');
        
        return {
          data: {
            url,
            httpStatus: response.status,
            statusText: response.statusText,
            contentLength: text.length,
            hasHTML,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      }
    );
    console.log(`  ${pageTest.status === 'PASS' ? '✅' : '❌'} ${page.name}: ${pageTest.responseTime}ms (HTTP ${pageTest.response?.data?.httpStatus})`);
  }
};

// ==================== GENERATE DETAILED EXCEL REPORT ====================

const generateDetailedReport = async () => {
  console.log('\n📊 Generating Detailed Excel Report...');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LinkMeU Detailed Test Suite';
  workbook.created = new Date();

  // ========== SUMMARY SHEET ==========
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Calculate totals
  const allResults = Object.values(detailedResults).flat();
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.status === 'PASS').length;
  const failedTests = allResults.filter(r => r.status === 'FAIL').length;
  const avgResponseTime = Math.round(allResults.reduce((sum, r) => sum + r.responseTime, 0) / totalTests);

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 25 },
  ];

  summarySheet.addRows([
    { metric: 'Report Generated', value: new Date().toISOString() },
    { metric: 'Production URL', value: PRODUCTION_URL },
    { metric: 'Supabase URL', value: SUPABASE_URL },
    { metric: 'Test Iterations', value: TEST_ITERATIONS },
    { metric: '', value: '' },
    { metric: 'TOTAL TESTS', value: totalTests },
    { metric: 'Passed', value: passedTests },
    { metric: 'Failed', value: failedTests },
    { metric: 'Pass Rate', value: `${((passedTests / totalTests) * 100).toFixed(2)}%` },
    { metric: 'Average Response Time', value: `${avgResponseTime}ms` },
    { metric: '', value: '' },
    { metric: 'TESTS BY CATEGORY', value: '' },
  ]);

  Object.entries(detailedResults).forEach(([category, results]) => {
    const catPassed = results.filter(r => r.status === 'PASS').length;
    summarySheet.addRow({ metric: `  ${category}`, value: `${catPassed}/${results.length} passed` });
  });

  // Style summary
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
  [6, 12].forEach(row => {
    summarySheet.getRow(row).font = { bold: true };
    summarySheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
  });

  // ========== CATEGORY SHEETS ==========
  const categoryNames = {
    database: 'Database Tests',
    users: 'User API Tests',
    events: 'Event API Tests',
    attendees: 'Attendee API Tests',
    listings: 'Listing API Tests',
    clubs: 'Club API Tests',
    clubMembers: 'Club Member Tests',
    pages: 'Page Tests',
  };

  for (const [category, results] of Object.entries(detailedResults)) {
    if (results.length === 0) continue;

    const sheet = workbook.addWorksheet(categoryNames[category] || category);
    
    sheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Iteration', key: 'iteration', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Response Time (ms)', key: 'responseTime', width: 18 },
      { header: 'Records', key: 'recordCount', width: 10 },
      { header: 'Request Details', key: 'request', width: 50 },
      { header: 'Response Data', key: 'responseData', width: 80 },
      { header: 'Error', key: 'error', width: 40 },
    ];

    results.forEach(r => {
      sheet.addRow({
        timestamp: r.timestamp,
        testName: r.testName,
        iteration: r.iteration,
        status: r.status,
        responseTime: r.responseTime,
        recordCount: r.recordCount,
        request: JSON.stringify(r.request),
        responseData: r.responseData?.substring(0, 2000) || '',
        error: r.error || '',
      });
    });

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };

    // Color code status
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell(4);
        if (statusCell.value === 'PASS') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (statusCell.value === 'FAIL') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } };
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
      }
    });
  }

  // ========== ALL RESULTS SHEET ==========
  const allResultsSheet = workbook.addWorksheet('All Results');
  allResultsSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 22 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Test Name', key: 'testName', width: 35 },
    { header: 'Iteration', key: 'iteration', width: 10 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Response Time (ms)', key: 'responseTime', width: 18 },
    { header: 'Records', key: 'recordCount', width: 10 },
    { header: 'Request', key: 'request', width: 50 },
    { header: 'Response', key: 'responseData', width: 80 },
    { header: 'Error', key: 'error', width: 40 },
  ];

  allResults.forEach(r => {
    allResultsSheet.addRow({
      timestamp: r.timestamp,
      category: r.category,
      testName: r.testName,
      iteration: r.iteration,
      status: r.status,
      responseTime: r.responseTime,
      recordCount: r.recordCount,
      request: JSON.stringify(r.request),
      responseData: r.responseData?.substring(0, 2000) || '',
      error: r.error || '',
    });
  });

  allResultsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  allResultsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };

  // ========== PERFORMANCE ANALYSIS SHEET ==========
  const perfSheet = workbook.addWorksheet('Performance Analysis');
  perfSheet.columns = [
    { header: 'Test Name', key: 'testName', width: 40 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Total Runs', key: 'totalRuns', width: 12 },
    { header: 'Pass Rate', key: 'passRate', width: 12 },
    { header: 'Avg (ms)', key: 'avgTime', width: 12 },
    { header: 'Min (ms)', key: 'minTime', width: 12 },
    { header: 'Max (ms)', key: 'maxTime', width: 12 },
    { header: 'Std Dev', key: 'stdDev', width: 12 },
  ];

  // Group by test name
  const testGroups = {};
  allResults.forEach(r => {
    const key = `${r.category}|${r.testName}`;
    if (!testGroups[key]) {
      testGroups[key] = { category: r.category, testName: r.testName, times: [], passes: 0, total: 0 };
    }
    testGroups[key].times.push(r.responseTime);
    testGroups[key].total++;
    if (r.status === 'PASS') testGroups[key].passes++;
  });

  Object.values(testGroups).forEach(group => {
    const avg = group.times.reduce((a, b) => a + b, 0) / group.times.length;
    const variance = group.times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / group.times.length;
    const stdDev = Math.sqrt(variance);

    perfSheet.addRow({
      testName: group.testName,
      category: group.category,
      totalRuns: group.total,
      passRate: `${((group.passes / group.total) * 100).toFixed(1)}%`,
      avgTime: Math.round(avg),
      minTime: Math.min(...group.times),
      maxTime: Math.max(...group.times),
      stdDev: Math.round(stdDev),
    });
  });

  perfSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  perfSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7B1FA2' } };

  // Save file
  const filename = `LinkMeU_DETAILED_Test_Report_${new Date().toISOString().split('T')[0]}_${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(filename);
  console.log(`\n✅ Detailed Report saved: ${filename}`);

  return filename;
};

// ==================== MAIN TEST RUNNER ====================

const runAllTests = async () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     LinkMeU DETAILED Production Test Suite                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  URL: ${PRODUCTION_URL.padEnd(54)}║`);
  console.log(`║  Iterations: ${String(TEST_ITERATIONS).padEnd(48)}║`);
  console.log(`║  Started: ${new Date().toISOString().padEnd(50)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`  🔄 ITERATION ${i} of ${TEST_ITERATIONS}`);
    console.log(`${'═'.repeat(65)}`);

    await testDatabase(i);
    await testUsers(i);
    await testEvents(i);
    await testAttendees(i);
    await testListings(i);
    await testClubs(i);
    await testClubMembers(i);
    await testPages(i);

    if (i < TEST_ITERATIONS) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const reportFile = await generateDetailedReport();

  // Print summary
  const allResults = Object.values(detailedResults).flat();
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.status === 'PASS').length;
  const failedTests = allResults.filter(r => r.status === 'FAIL').length;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL TEST SUMMARY                        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests: ${String(totalTests).padEnd(47)}║`);
  console.log(`║  ✅ Passed: ${String(passedTests).padEnd(49)}║`);
  console.log(`║  ❌ Failed: ${String(failedTests).padEnd(49)}║`);
  console.log(`║  📊 Pass Rate: ${(((passedTests / totalTests) * 100).toFixed(2) + '%').padEnd(46)}║`);
  console.log(`║  📁 Report: ${reportFile.padEnd(49)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  if (failedTests > 0) process.exit(1);
};

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
