/**
 * LinkMeU/EventsX Comprehensive Test Suite
 * Tests all edge cases 20 times each
 * 
 * Run: node comprehensive-test-suite.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Test configuration
const ITERATIONS = 20;
const TEST_PREFIX = 'TEST_' + Date.now() + '_';

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
const log = (msg, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${msg}${colors.reset}`);
};

const randomString = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

const randomEmail = () => `${TEST_PREFIX}${randomString()}@test.com`;

const randomPhone = () => `+65${Math.floor(10000000 + Math.random() * 90000000)}`;

const randomDate = (future = true) => {
  const date = new Date();
  const offset = future ? Math.floor(Math.random() * 365) : -Math.floor(Math.random() * 365);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test runner
async function runTest(name, testFn, iterations = ITERATIONS) {
  log(`\n${'='.repeat(60)}`, 'info');
  log(`TEST: ${name}`, 'info');
  log(`Running ${iterations} iterations...`, 'info');
  log('='.repeat(60), 'info');

  const testResults = {
    name,
    iterations,
    passed: 0,
    failed: 0,
    errors: [],
    durations: []
  };

  for (let i = 1; i <= iterations; i++) {
    const start = Date.now();
    try {
      await testFn(i);
      testResults.passed++;
      const duration = Date.now() - start;
      testResults.durations.push(duration);
      log(`  ✓ Iteration ${i}/${iterations} (${duration}ms)`, 'success');
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ iteration: i, error: error.message });
      log(`  ✗ Iteration ${i}/${iterations}: ${error.message}`, 'error');
    }
    // Small delay between iterations
    await sleep(100);
  }

  const avgDuration = testResults.durations.length > 0 
    ? Math.round(testResults.durations.reduce((a, b) => a + b, 0) / testResults.durations.length)
    : 0;

  log(`\nResults: ${testResults.passed}/${iterations} passed (avg: ${avgDuration}ms)`, 
    testResults.failed === 0 ? 'success' : 'error');

  results.passed += testResults.passed;
  results.failed += testResults.failed;
  results.tests.push(testResults);

  return testResults;
}

// =====================================================
// USER TESTS
// =====================================================

async function testUserRegistration(iteration) {
  const email = randomEmail();
  const password = 'Test@' + randomString(8) + '123';
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password: password,
      role: 'owner',
      contact: randomPhone(),
      first_name: 'Test',
      last_name: 'User' + iteration
    })
    .select()
    .single();

  if (error) throw new Error(`Registration failed: ${error.message}`);
  if (!data.id) throw new Error('No user ID returned');
  if (data.email !== email.toLowerCase()) throw new Error('Email mismatch');
  
  // Cleanup
  await supabase.from('users').delete().eq('id', data.id);
}

async function testDuplicateEmailPrevention(iteration) {
  const email = randomEmail();
  
  // Create first user
  const { data: user1 } = await supabase
    .from('users')
    .insert({ email, password: 'Test123!', role: 'owner' })
    .select()
    .single();

  // Try to create duplicate
  const { error } = await supabase
    .from('users')
    .insert({ email, password: 'Test456!', role: 'owner' })
    .select()
    .single();

  // Cleanup
  if (user1) await supabase.from('users').delete().eq('id', user1.id);

  if (!error) throw new Error('Duplicate email should have been rejected');
}

async function testUserLoginValidation(iteration) {
  const email = randomEmail();
  const password = 'ValidPass123!';
  
  // Create user
  const { data: user } = await supabase
    .from('users')
    .insert({ email, password, role: 'owner' })
    .select()
    .single();

  // Test valid login
  const { data: validLogin } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .single();

  if (!validLogin) throw new Error('Valid user not found');
  if (validLogin.password !== password) throw new Error('Password mismatch');

  // Cleanup
  await supabase.from('users').delete().eq('id', user.id);
}

async function testCaseInsensitiveEmail(iteration) {
  const baseEmail = randomEmail();
  const variations = [
    baseEmail.toLowerCase(),
    baseEmail.toUpperCase(),
    baseEmail.charAt(0).toUpperCase() + baseEmail.slice(1).toLowerCase()
  ];

  // Create with lowercase
  const { data: user } = await supabase
    .from('users')
    .insert({ email: variations[0], password: 'Test123!', role: 'owner' })
    .select()
    .single();

  // Query with different cases
  for (const variant of variations) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .ilike('email', variant)
      .single();
    
    if (!data) throw new Error(`Email case sensitivity failed for: ${variant}`);
  }

  // Cleanup
  await supabase.from('users').delete().eq('id', user.id);
}

// =====================================================
// EVENT TESTS
// =====================================================

async function testEventCreation(iteration) {
  const eventData = {
    title: `Test Event ${iteration} - ${randomString()}`,
    description: 'Test description with special chars: <>&"\'',
    event_type: 'conference',
    start_date: randomDate(true),
    end_date: randomDate(true),
    venue: 'Test Venue, Singapore',
    capacity: Math.floor(Math.random() * 1000) + 10,
    status: 'active',
    organisers: [{ name: 'Organizer 1', detail: 'CEO' }],
    speakers: [{ name: 'Speaker 1', title: 'Expert' }],
    sponsors: []
  };

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw new Error(`Event creation failed: ${error.message}`);
  if (!data.id) throw new Error('No event ID returned');
  if (data.title !== eventData.title) throw new Error('Title mismatch');

  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithMaxCapacity(iteration) {
  const maxCapacity = 999999;
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Max Capacity Test ${iteration}`,
      capacity: maxCapacity,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Max capacity event failed: ${error.message}`);
  if (data.capacity !== maxCapacity) throw new Error('Capacity mismatch');

  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithZeroCapacity(iteration) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Zero Capacity Test ${iteration}`,
      capacity: 0,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Zero capacity event failed: ${error.message}`);
  if (data.capacity !== 0) throw new Error('Capacity should be 0');

  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventDateValidation(iteration) {
  // Test past date event
  const pastDate = randomDate(false);
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Past Date Test ${iteration}`,
      start_date: pastDate,
      end_date: pastDate,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Past date event failed: ${error.message}`);
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithLongTitle(iteration) {
  const longTitle = 'A'.repeat(500); // Very long title
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: longTitle,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Long title event failed: ${error.message}`);
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithSpecialCharacters(iteration) {
  const specialTitle = `Test <script>alert('xss')</script> & "quotes" 'apostrophe' ${iteration}`;
  const specialDesc = `Description with émojis 🎉🎊 and unicode: 日本語 العربية`;
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: specialTitle,
      description: specialDesc,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Special chars event failed: ${error.message}`);
  if (data.title !== specialTitle) throw new Error('Special chars not preserved');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventUpdate(iteration) {
  // Create event
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `Update Test ${iteration}`,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  // Update event
  const newTitle = `Updated Title ${iteration} - ${randomString()}`;
  const { data: updated, error } = await supabase
    .from('events')
    .update({ title: newTitle, updated_at: new Date().toISOString() })
    .eq('id', event.id)
    .select()
    .single();

  if (error) throw new Error(`Event update failed: ${error.message}`);
  if (updated.title !== newTitle) throw new Error('Update not applied');

  // Cleanup
  await supabase.from('events').delete().eq('id', event.id);
}

async function testEventSoftDelete(iteration) {
  // Create event
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `Delete Test ${iteration}`,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  // Soft delete
  await supabase
    .from('events')
    .update({ status: 'deleted' })
    .eq('id', event.id);

  // Verify not returned in active queries
  const { data: activeEvents } = await supabase
    .from('events')
    .select('*')
    .eq('id', event.id)
    .neq('status', 'deleted');

  if (activeEvents && activeEvents.length > 0) {
    throw new Error('Soft deleted event still returned');
  }

  // Hard delete for cleanup
  await supabase.from('events').delete().eq('id', event.id);
}

async function testConcurrentEventCreation(iteration) {
  const promises = [];
  const eventIds = [];

  // Create 5 events concurrently
  for (let i = 0; i < 5; i++) {
    promises.push(
      supabase
        .from('events')
        .insert({
          title: `Concurrent ${iteration}-${i}`,
          start_date: randomDate(true),
          status: 'active'
        })
        .select()
        .single()
    );
  }

  const results = await Promise.all(promises);
  
  for (const result of results) {
    if (result.error) throw new Error(`Concurrent creation failed: ${result.error.message}`);
    eventIds.push(result.data.id);
  }

  // Cleanup
  for (const id of eventIds) {
    await supabase.from('events').delete().eq('id', id);
  }
}

// =====================================================
// ATTENDEE TESTS
// =====================================================

async function testAttendeeRegistration(iteration) {
  // Create event first
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `Attendee Test Event ${iteration}`,
      start_date: randomDate(true),
      capacity: 100,
      status: 'active'
    })
    .select()
    .single();

  // Register attendee
  const { data: attendee, error } = await supabase
    .from('attendees')
    .insert({
      event_id: event.id,
      name: `Test Attendee ${iteration}`,
      email: randomEmail(),
      contact: randomPhone(),
      attended: false
    })
    .select()
    .single();

  if (error) throw new Error(`Attendee registration failed: ${error.message}`);
  if (attendee.event_id !== event.id) throw new Error('Event ID mismatch');

  // Cleanup
  await supabase.from('attendees').delete().eq('id', attendee.id);
  await supabase.from('events').delete().eq('id', event.id);
}

async function testAttendeeCheckIn(iteration) {
  // Create event
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `CheckIn Test ${iteration}`,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active'
    })
    .select()
    .single();

  // Register attendee
  const { data: attendee } = await supabase
    .from('attendees')
    .insert({
      event_id: event.id,
      name: `CheckIn Attendee ${iteration}`,
      email: randomEmail(),
      attended: false
    })
    .select()
    .single();

  // Check in
  const checkInTime = new Date().toISOString();
  const { data: checkedIn, error } = await supabase
    .from('attendees')
    .update({ attended: true, check_in_time: checkInTime })
    .eq('id', attendee.id)
    .select()
    .single();

  if (error) throw new Error(`Check-in failed: ${error.message}`);
  if (!checkedIn.attended) throw new Error('Attended status not updated');

  // Cleanup
  await supabase.from('attendees').delete().eq('id', attendee.id);
  await supabase.from('events').delete().eq('id', event.id);
}

async function testBulkAttendeeRegistration(iteration) {
  // Create event
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `Bulk Attendee Test ${iteration}`,
      start_date: randomDate(true),
      capacity: 1000,
      status: 'active'
    })
    .select()
    .single();

  // Register 50 attendees
  const attendees = [];
  for (let i = 0; i < 50; i++) {
    attendees.push({
      event_id: event.id,
      name: `Bulk Attendee ${iteration}-${i}`,
      email: randomEmail(),
      attended: false
    });
  }

  const { data, error } = await supabase
    .from('attendees')
    .insert(attendees)
    .select();

  if (error) throw new Error(`Bulk registration failed: ${error.message}`);
  if (data.length !== 50) throw new Error(`Expected 50 attendees, got ${data.length}`);

  // Cleanup
  await supabase.from('attendees').delete().eq('event_id', event.id);
  await supabase.from('events').delete().eq('id', event.id);
}

async function testAttendeeSearch(iteration) {
  // Create event
  const { data: event } = await supabase
    .from('events')
    .insert({
      title: `Search Test ${iteration}`,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  const uniqueName = `SearchTarget_${randomString(10)}`;
  
  // Register attendees
  await supabase.from('attendees').insert([
    { event_id: event.id, name: uniqueName, email: randomEmail() },
    { event_id: event.id, name: 'Other Person', email: randomEmail() },
    { event_id: event.id, name: 'Another One', email: randomEmail() }
  ]);

  // Search
  const { data: found } = await supabase
    .from('attendees')
    .select('*')
    .eq('event_id', event.id)
    .ilike('name', `%${uniqueName}%`);

  if (!found || found.length !== 1) throw new Error('Search failed to find exact match');

  // Cleanup
  await supabase.from('attendees').delete().eq('event_id', event.id);
  await supabase.from('events').delete().eq('id', event.id);
}

// =====================================================
// LISTING TESTS
// =====================================================

async function testListingCreation(iteration) {
  const categories = ['parttime', 'business', 'property', 'wedding', 'events'];
  const category = categories[iteration % categories.length];

  const { data, error } = await supabase
    .from('listings')
    .insert({
      category,
      title: `Test Listing ${iteration} - ${randomString()}`,
      description: 'Test description',
      location: 'Singapore',
      budget_min: 100,
      budget_max: 1000,
      currency: 'SGD',
      contact: randomPhone(),
      email: randomEmail(),
      status: 'active',
      images: []
    })
    .select()
    .single();

  if (error) throw new Error(`Listing creation failed: ${error.message}`);
  if (data.category !== category) throw new Error('Category mismatch');

  // Cleanup
  await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingWithImages(iteration) {
  const images = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg',
    'https://example.com/image5.jpg'
  ];

  const { data, error } = await supabase
    .from('listings')
    .insert({
      category: 'property',
      title: `Image Test ${iteration}`,
      images,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Listing with images failed: ${error.message}`);
  if (data.images.length !== 5) throw new Error('Images not saved correctly');

  // Cleanup
  await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingBudgetRange(iteration) {
  const budgetMin = Math.floor(Math.random() * 10000);
  const budgetMax = budgetMin + Math.floor(Math.random() * 50000);

  const { data, error } = await supabase
    .from('listings')
    .insert({
      category: 'business',
      title: `Budget Test ${iteration}`,
      budget_min: budgetMin,
      budget_max: budgetMax,
      currency: 'USD',
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Budget listing failed: ${error.message}`);
  if (data.budget_min !== budgetMin || data.budget_max !== budgetMax) {
    throw new Error('Budget values mismatch');
  }

  // Cleanup
  await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingStatusTransitions(iteration) {
  // Create listing
  const { data: listing } = await supabase
    .from('listings')
    .insert({
      category: 'events',
      title: `Status Test ${iteration}`,
      status: 'pending'
    })
    .select()
    .single();

  const statuses = ['pending', 'active', 'rejected', 'expired', 'deleted'];
  
  for (const status of statuses) {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listing.id);
    
    if (error) throw new Error(`Status transition to ${status} failed`);
  }

  // Cleanup
  await supabase.from('listings').delete().eq('id', listing.id);
}

async function testListingFilterByCategory(iteration) {
  const category = 'parttime';
  
  // Create test listings
  const listingIds = [];
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase
      .from('listings')
      .insert({
        category,
        title: `Filter Test ${iteration}-${i}`,
        status: 'active'
      })
      .select()
      .single();
    listingIds.push(data.id);
  }

  // Query by category
  const { data: filtered } = await supabase
    .from('listings')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .in('id', listingIds);

  if (!filtered || filtered.length !== 3) {
    throw new Error(`Expected 3 listings, got ${filtered?.length || 0}`);
  }

  // Cleanup
  for (const id of listingIds) {
    await supabase.from('listings').delete().eq('id', id);
  }
}

// =====================================================
// EDGE CASE TESTS
// =====================================================

async function testNullFieldHandling(iteration) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Null Test ${iteration}`,
      description: null,
      venue: null,
      logo: null,
      image: null,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Null field handling failed: ${error.message}`);
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEmptyArrayFields(iteration) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Empty Array Test ${iteration}`,
      start_date: randomDate(true),
      organisers: [],
      speakers: [],
      sponsors: [],
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Empty array handling failed: ${error.message}`);
  if (!Array.isArray(data.organisers)) throw new Error('Organisers not an array');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testLargeJSONPayload(iteration) {
  const largeOrganisers = [];
  for (let i = 0; i < 100; i++) {
    largeOrganisers.push({
      name: `Organizer ${i}`,
      detail: `Detail for organizer ${i} with some extra text to make it longer`,
      email: randomEmail()
    });
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Large JSON Test ${iteration}`,
      start_date: randomDate(true),
      organisers: largeOrganisers,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Large JSON failed: ${error.message}`);
  if (data.organisers.length !== 100) throw new Error('JSON data truncated');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testRapidFireOperations(iteration) {
  const operations = [];
  
  // Create 10 events rapidly
  for (let i = 0; i < 10; i++) {
    operations.push(
      supabase
        .from('events')
        .insert({
          title: `Rapid ${iteration}-${i}`,
          start_date: randomDate(true),
          status: 'active'
        })
        .select()
        .single()
    );
  }

  const results = await Promise.all(operations);
  const ids = results.filter(r => r.data).map(r => r.data.id);
  
  if (ids.length !== 10) throw new Error(`Only ${ids.length}/10 rapid operations succeeded`);

  // Cleanup
  for (const id of ids) {
    await supabase.from('events').delete().eq('id', id);
  }
}

async function testDatabaseConnectionResilience(iteration) {
  // Perform multiple sequential operations
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);
    
    if (error) throw new Error(`Connection test ${i} failed: ${error.message}`);
  }
}

async function testTimestampPrecision(iteration) {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: `Timestamp Test ${iteration}`,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Timestamp test failed: ${error.message}`);
  
  // Verify created_at is set
  if (!data.created_at) throw new Error('created_at not set');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testUnicodeHandling(iteration) {
  const unicodeTitle = `测试 テスト тест اختبار ${iteration} 🎉🎊🎈`;
  const unicodeDesc = `Émojis: 👨‍👩‍👧‍👦 🏳️‍🌈 🇸🇬\nSpecial: ñ ü ö ä\nSymbols: © ® ™ € £ ¥`;

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: unicodeTitle,
      description: unicodeDesc,
      start_date: randomDate(true),
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`Unicode test failed: ${error.message}`);
  if (data.title !== unicodeTitle) throw new Error('Unicode title not preserved');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', data.id);
}

async function testSQLInjectionPrevention(iteration) {
  const maliciousInputs = [
    "'; DROP TABLE events; --",
    "1; DELETE FROM users WHERE 1=1; --",
    "' OR '1'='1",
    "<script>alert('xss')</script>",
    "{{constructor.constructor('return this')()}}"
  ];

  for (const input of maliciousInputs) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: input,
        start_date: randomDate(true),
        status: 'active'
      })
      .select()
      .single();

    if (error) throw new Error(`SQL injection test failed for: ${input}`);
    if (data.title !== input) throw new Error('Input was modified');
    
    // Cleanup
    await supabase.from('events').delete().eq('id', data.id);
  }
}

async function testPaginationEdgeCases(iteration) {
  // Create 25 events
  const eventIds = [];
  for (let i = 0; i < 25; i++) {
    const { data } = await supabase
      .from('events')
      .insert({
        title: `Pagination ${iteration}-${i}`,
        start_date: randomDate(true),
        status: 'active'
      })
      .select()
      .single();
    eventIds.push(data.id);
  }

  // Test pagination
  const { data: page1 } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .range(0, 9);

  const { data: page2 } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .range(10, 19);

  const { data: page3 } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .range(20, 29);

  if (page1.length !== 10) throw new Error(`Page 1: expected 10, got ${page1.length}`);
  if (page2.length !== 10) throw new Error(`Page 2: expected 10, got ${page2.length}`);
  if (page3.length !== 5) throw new Error(`Page 3: expected 5, got ${page3.length}`);

  // Cleanup
  for (const id of eventIds) {
    await supabase.from('events').delete().eq('id', id);
  }
}

async function testOrderingAndSorting(iteration) {
  const dates = ['2025-01-01', '2025-06-15', '2025-03-20', '2025-12-31', '2025-09-10'];
  const eventIds = [];

  for (const date of dates) {
    const { data } = await supabase
      .from('events')
      .insert({
        title: `Sort Test ${iteration} - ${date}`,
        start_date: date,
        status: 'active'
      })
      .select()
      .single();
    eventIds.push(data.id);
  }

  // Test ascending order
  const { data: ascending } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .order('start_date', { ascending: true });

  // Verify order
  for (let i = 1; i < ascending.length; i++) {
    if (ascending[i].start_date < ascending[i-1].start_date) {
      throw new Error('Ascending order failed');
    }
  }

  // Cleanup
  for (const id of eventIds) {
    await supabase.from('events').delete().eq('id', id);
  }
}

// =====================================================
// MAIN TEST RUNNER
// =====================================================

async function runAllTests() {
  log('\n' + '═'.repeat(60), 'info');
  log('  LINKMEU/EVENTSX COMPREHENSIVE TEST SUITE', 'info');
  log('  Running all tests 20 times each', 'info');
  log('═'.repeat(60) + '\n', 'info');

  const startTime = Date.now();

  // User Tests
  await runTest('User Registration', testUserRegistration);
  await runTest('Duplicate Email Prevention', testDuplicateEmailPrevention);
  await runTest('User Login Validation', testUserLoginValidation);
  await runTest('Case Insensitive Email', testCaseInsensitiveEmail);

  // Event Tests
  await runTest('Event Creation', testEventCreation);
  await runTest('Event with Max Capacity', testEventWithMaxCapacity);
  await runTest('Event with Zero Capacity', testEventWithZeroCapacity);
  await runTest('Event Date Validation', testEventDateValidation);
  await runTest('Event with Long Title', testEventWithLongTitle);
  await runTest('Event with Special Characters', testEventWithSpecialCharacters);
  await runTest('Event Update', testEventUpdate);
  await runTest('Event Soft Delete', testEventSoftDelete);
  await runTest('Concurrent Event Creation', testConcurrentEventCreation);

  // Attendee Tests
  await runTest('Attendee Registration', testAttendeeRegistration);
  await runTest('Attendee Check-In', testAttendeeCheckIn);
  await runTest('Bulk Attendee Registration', testBulkAttendeeRegistration);
  await runTest('Attendee Search', testAttendeeSearch);

  // Listing Tests
  await runTest('Listing Creation', testListingCreation);
  await runTest('Listing with Images', testListingWithImages);
  await runTest('Listing Budget Range', testListingBudgetRange);
  await runTest('Listing Status Transitions', testListingStatusTransitions);
  await runTest('Listing Filter by Category', testListingFilterByCategory);

  // Edge Case Tests
  await runTest('Null Field Handling', testNullFieldHandling);
  await runTest('Empty Array Fields', testEmptyArrayFields);
  await runTest('Large JSON Payload', testLargeJSONPayload);
  await runTest('Rapid Fire Operations', testRapidFireOperations);
  await runTest('Database Connection Resilience', testDatabaseConnectionResilience);
  await runTest('Timestamp Precision', testTimestampPrecision);
  await runTest('Unicode Handling', testUnicodeHandling);
  await runTest('SQL Injection Prevention', testSQLInjectionPrevention);
  await runTest('Pagination Edge Cases', testPaginationEdgeCases);
  await runTest('Ordering and Sorting', testOrderingAndSorting);

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  // Final Report
  log('\n' + '═'.repeat(60), 'info');
  log('  FINAL TEST REPORT', 'info');
  log('═'.repeat(60), 'info');
  
  log(`\nTotal Tests: ${results.tests.length}`, 'info');
  log(`Total Iterations: ${results.passed + results.failed}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`, 'info');
  log(`Total Time: ${totalTime} seconds`, 'info');

  // Failed tests summary
  const failedTests = results.tests.filter(t => t.failed > 0);
  if (failedTests.length > 0) {
    log('\n⚠️  FAILED TESTS:', 'error');
    for (const test of failedTests) {
      log(`  - ${test.name}: ${test.failed}/${test.iterations} failed`, 'error');
      for (const err of test.errors.slice(0, 3)) {
        log(`    → Iteration ${err.iteration}: ${err.error}`, 'warn');
      }
    }
  }

  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.tests.length,
      totalIterations: results.passed + results.failed,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / (results.passed + results.failed)) * 100).toFixed(2) + '%',
      duration: totalTime + ' seconds'
    },
    tests: results.tests.map(t => ({
      name: t.name,
      passed: t.passed,
      failed: t.failed,
      avgDuration: t.durations.length > 0 
        ? Math.round(t.durations.reduce((a, b) => a + b, 0) / t.durations.length) + 'ms'
        : 'N/A',
      errors: t.errors
    }))
  };

  const fs = await import('fs');
  fs.writeFileSync(
    'test-results-comprehensive.json',
    JSON.stringify(reportData, null, 2)
  );
  log('\n📄 Results saved to test-results-comprehensive.json', 'info');

  log('\n' + '═'.repeat(60), 'info');
  log(results.failed === 0 ? '  ✅ ALL TESTS PASSED!' : '  ❌ SOME TESTS FAILED', results.failed === 0 ? 'success' : 'error');
  log('═'.repeat(60) + '\n', 'info');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
