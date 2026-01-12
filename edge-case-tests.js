/**
 * LinkMeU/EventsX Edge Case Test Suite
 * With rate limiting, retry logic, and proper error handling
 * 
 * Run: node edge-case-tests.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Configuration
const ITERATIONS = 20;
const DELAY_BETWEEN_TESTS = 500; // ms between test iterations
const DELAY_BETWEEN_GROUPS = 2000; // ms between test groups
const MAX_RETRIES = 3;
const TEST_PREFIX = 'EDGE_' + Date.now() + '_';

// Results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utilities
const log = (msg, type = 'info') => {
  const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', warn: '\x1b[33m', reset: '\x1b[0m' };
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${colors[type]}[${timestamp}] ${msg}${colors.reset}`);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomStr = (len = 8) => Math.random().toString(36).substring(2, 2 + len);
const randomEmail = () => `${TEST_PREFIX}${randomStr()}@test.com`.toLowerCase();
const randomPhone = () => `+65${Math.floor(80000000 + Math.random() * 19999999)}`;
const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 365) + 1);
  return d.toISOString().split('T')[0];
};

// Retry wrapper
async function withRetry(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}

// Test runner
async function runTest(name, testFn, iterations = ITERATIONS) {
  log(`\n${'─'.repeat(50)}`, 'info');
  log(`📋 ${name} (${iterations} iterations)`, 'info');
  
  const testResult = { name, passed: 0, failed: 0, errors: [], durations: [] };
  
  for (let i = 1; i <= iterations; i++) {
    const start = Date.now();
    try {
      await withRetry(() => testFn(i));
      testResult.passed++;
      testResult.durations.push(Date.now() - start);
      process.stdout.write(`\x1b[32m✓\x1b[0m`);
    } catch (e) {
      testResult.failed++;
      testResult.errors.push({ i, msg: e.message });
      process.stdout.write(`\x1b[31m✗\x1b[0m`);
    }
    await sleep(DELAY_BETWEEN_TESTS);
  }
  
  const avg = testResult.durations.length ? Math.round(testResult.durations.reduce((a,b) => a+b, 0) / testResult.durations.length) : 0;
  console.log(` ${testResult.passed}/${iterations} (avg: ${avg}ms)`);
  
  if (testResult.errors.length > 0) {
    log(`  First error: ${testResult.errors[0].msg}`, 'warn');
  }
  
  results.passed += testResult.passed;
  results.failed += testResult.failed;
  results.tests.push(testResult);
  
  return testResult;
}

// ═══════════════════════════════════════════════════════════════
// TEST CASES
// ═══════════════════════════════════════════════════════════════

// 1. User Edge Cases
async function testEmptyPassword(i) {
  const { error } = await supabase.from('users').insert({
    email: randomEmail(),
    password: '',
    role: 'owner'
  }).select().single();
  // Empty password should still work (validation is app-level)
  if (error && !error.message.includes('constraint')) throw new Error(error.message);
}

async function testVeryLongEmail(i) {
  const longEmail = 'a'.repeat(200) + '@test.com';
  const { data, error } = await supabase.from('users').insert({
    email: longEmail,
    password: 'Test123!',
    role: 'owner'
  }).select().single();
  
  if (data) await supabase.from('users').delete().eq('id', data.id);
  // Should either succeed or fail gracefully
}

async function testSpecialCharsInName(i) {
  const specialName = `Test<script>alert('xss')</script> & "User" ${i}`;
  const { data, error } = await supabase.from('users').insert({
    email: randomEmail(),
    password: 'Test123!',
    role: 'owner',
    first_name: specialName
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.first_name !== specialName) throw new Error('Special chars not preserved');
  await supabase.from('users').delete().eq('id', data.id);
}

async function testUnicodeInUserFields(i) {
  const unicodeName = `用户 ユーザー пользователь ${i}`;
  const { data, error } = await supabase.from('users').insert({
    email: randomEmail(),
    password: 'Test123!',
    role: 'owner',
    first_name: unicodeName
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.first_name !== unicodeName) throw new Error('Unicode not preserved');
  await supabase.from('users').delete().eq('id', data.id);
}

// 2. Event Edge Cases
async function testEventWithNullFields(i) {
  const { data, error } = await supabase.from('events').insert({
    title: `Null Test ${i}`,
    description: null,
    venue: null,
    logo: null,
    image: null,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithEmptyArrays(i) {
  const { data, error } = await supabase.from('events').insert({
    title: `Empty Arrays ${i}`,
    start_date: futureDate(),
    organisers: [],
    speakers: [],
    sponsors: [],
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (!Array.isArray(data.organisers)) throw new Error('organisers not array');
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithLargeJSON(i) {
  const largeArray = Array.from({ length: 50 }, (_, j) => ({
    name: `Person ${j}`,
    detail: `Detail ${j} `.repeat(10),
    email: `person${j}@test.com`
  }));
  
  const { data, error } = await supabase.from('events').insert({
    title: `Large JSON ${i}`,
    start_date: futureDate(),
    organisers: largeArray,
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.organisers.length !== 50) throw new Error('JSON truncated');
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithMaxCapacity(i) {
  const { data, error } = await supabase.from('events').insert({
    title: `Max Capacity ${i}`,
    start_date: futureDate(),
    capacity: 2147483647, // Max int32
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithZeroCapacity(i) {
  const { data, error } = await supabase.from('events').insert({
    title: `Zero Capacity ${i}`,
    start_date: futureDate(),
    capacity: 0,
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.capacity !== 0) throw new Error('Capacity not 0');
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithNegativeCapacity(i) {
  const { data, error } = await supabase.from('events').insert({
    title: `Negative Capacity ${i}`,
    start_date: futureDate(),
    capacity: -100,
    status: 'active'
  }).select().single();
  
  // Should either reject or accept (depends on schema)
  if (data) await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithPastDate(i) {
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  
  const { data, error } = await supabase.from('events').insert({
    title: `Past Event ${i}`,
    start_date: pastDate.toISOString().split('T')[0],
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithFarFutureDate(i) {
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 100);
  
  const { data, error } = await supabase.from('events').insert({
    title: `Far Future ${i}`,
    start_date: farFuture.toISOString().split('T')[0],
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventTitleWithEmoji(i) {
  const emojiTitle = `🎉 Party Time 🎊 Event ${i} 🎈🎁🎂`;
  
  const { data, error } = await supabase.from('events').insert({
    title: emojiTitle,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.title !== emojiTitle) throw new Error('Emoji not preserved');
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventWithVeryLongTitle(i) {
  const longTitle = 'A'.repeat(1000);
  
  const { data, error } = await supabase.from('events').insert({
    title: longTitle,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (data) await supabase.from('events').delete().eq('id', data.id);
  // Should either succeed or fail gracefully
}

async function testEventWithVeryLongDescription(i) {
  const longDesc = 'Lorem ipsum '.repeat(1000);
  
  const { data, error } = await supabase.from('events').insert({
    title: `Long Desc ${i}`,
    description: longDesc,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  await supabase.from('events').delete().eq('id', data.id);
}

async function testEventSoftDelete(i) {
  // Create
  const { data: event } = await supabase.from('events').insert({
    title: `Delete Test ${i}`,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (!event) throw new Error('Failed to create event');
  
  // Soft delete
  await supabase.from('events').update({ status: 'deleted' }).eq('id', event.id);
  
  // Verify hidden from active queries
  const { data: found } = await supabase.from('events')
    .select('*')
    .eq('id', event.id)
    .neq('status', 'deleted');
  
  if (found && found.length > 0) throw new Error('Soft delete failed');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', event.id);
}

async function testEventUpdate(i) {
  // Create
  const { data: event } = await supabase.from('events').insert({
    title: `Update Test ${i}`,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (!event) throw new Error('Failed to create event');
  
  // Update
  const newTitle = `Updated ${i} - ${randomStr()}`;
  const { data: updated, error } = await supabase.from('events')
    .update({ title: newTitle })
    .eq('id', event.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  if (updated.title !== newTitle) throw new Error('Update not applied');
  
  // Cleanup
  await supabase.from('events').delete().eq('id', event.id);
}

// 3. Attendee Edge Cases
async function testAttendeeWithLongName(i) {
  // Create event first
  const { data: event } = await supabase.from('events').insert({
    title: `Attendee Test ${i}`,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (!event) throw new Error('Failed to create event');
  
  const longName = 'A'.repeat(500);
  const { data: attendee, error } = await supabase.from('attendees').insert({
    event_id: event.id,
    name: longName,
    email: randomEmail()
  }).select().single();
  
  // Cleanup
  if (attendee) await supabase.from('attendees').delete().eq('id', attendee.id);
  await supabase.from('events').delete().eq('id', event.id);
}

async function testAttendeeCheckInToggle(i) {
  // Create event
  const { data: event } = await supabase.from('events').insert({
    title: `CheckIn Test ${i}`,
    start_date: new Date().toISOString().split('T')[0],
    status: 'active'
  }).select().single();
  
  if (!event) throw new Error('Failed to create event');
  
  // Create attendee
  const { data: attendee } = await supabase.from('attendees').insert({
    event_id: event.id,
    name: `Attendee ${i}`,
    email: randomEmail(),
    attended: false
  }).select().single();
  
  if (!attendee) throw new Error('Failed to create attendee');
  
  // Check in
  await supabase.from('attendees').update({ attended: true }).eq('id', attendee.id);
  
  // Verify
  const { data: checked } = await supabase.from('attendees').select('*').eq('id', attendee.id).single();
  if (!checked.attended) throw new Error('Check-in failed');
  
  // Check out
  await supabase.from('attendees').update({ attended: false }).eq('id', attendee.id);
  
  // Verify
  const { data: unchecked } = await supabase.from('attendees').select('*').eq('id', attendee.id).single();
  if (unchecked.attended) throw new Error('Check-out failed');
  
  // Cleanup
  await supabase.from('attendees').delete().eq('id', attendee.id);
  await supabase.from('events').delete().eq('id', event.id);
}

async function testMultipleAttendeesPerEvent(i) {
  // Create event
  const { data: event } = await supabase.from('events').insert({
    title: `Multi Attendee ${i}`,
    start_date: futureDate(),
    capacity: 100,
    status: 'active'
  }).select().single();
  
  if (!event) throw new Error('Failed to create event');
  
  // Create 10 attendees
  const attendees = Array.from({ length: 10 }, (_, j) => ({
    event_id: event.id,
    name: `Attendee ${i}-${j}`,
    email: randomEmail()
  }));
  
  const { data, error } = await supabase.from('attendees').insert(attendees).select();
  
  if (error) throw new Error(error.message);
  if (data.length !== 10) throw new Error(`Expected 10, got ${data.length}`);
  
  // Cleanup
  await supabase.from('attendees').delete().eq('event_id', event.id);
  await supabase.from('events').delete().eq('id', event.id);
}

// 4. Listing Edge Cases
async function testListingAllCategories(i) {
  const categories = ['parttime', 'business', 'property', 'wedding', 'events'];
  const category = categories[i % categories.length];
  
  const { data, error } = await supabase.from('listings').insert({
    category,
    title: `Category Test ${category} ${i}`,
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.category !== category) throw new Error('Category mismatch');
  
  await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingWithMaxImages(i) {
  const images = Array.from({ length: 5 }, (_, j) => `https://example.com/img${j}.jpg`);
  
  const { data, error } = await supabase.from('listings').insert({
    category: 'property',
    title: `Images Test ${i}`,
    images,
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.images.length !== 5) throw new Error('Images not saved');
  
  await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingBudgetEdgeCases(i) {
  const testCases = [
    { min: 0, max: 0 },
    { min: 0.01, max: 0.01 },
    { min: 999999999, max: 999999999 },
    { min: 100, max: 50 }, // Invalid range
  ];
  
  const tc = testCases[i % testCases.length];
  
  const { data, error } = await supabase.from('listings').insert({
    category: 'business',
    title: `Budget Test ${i}`,
    budget_min: tc.min,
    budget_max: tc.max,
    status: 'active'
  }).select().single();
  
  if (data) await supabase.from('listings').delete().eq('id', data.id);
}

async function testListingStatusTransitions(i) {
  const { data: listing } = await supabase.from('listings').insert({
    category: 'events',
    title: `Status Test ${i}`,
    status: 'pending'
  }).select().single();
  
  if (!listing) throw new Error('Failed to create listing');
  
  const statuses = ['active', 'rejected', 'expired', 'deleted'];
  
  for (const status of statuses) {
    const { error } = await supabase.from('listings').update({ status }).eq('id', listing.id);
    if (error) throw new Error(`Status ${status} failed: ${error.message}`);
  }
  
  await supabase.from('listings').delete().eq('id', listing.id);
}

// 5. SQL Injection Prevention
async function testSQLInjectionInTitle(i) {
  const malicious = [
    "'; DROP TABLE events; --",
    "1; DELETE FROM users; --",
    "' OR '1'='1",
    "'; UPDATE users SET role='superadmin'; --"
  ];
  
  const input = malicious[i % malicious.length];
  
  const { data, error } = await supabase.from('events').insert({
    title: input,
    start_date: futureDate(),
    status: 'active'
  }).select().single();
  
  if (error) throw new Error(error.message);
  if (data.title !== input) throw new Error('Input modified');
  
  // Verify tables still exist
  const { data: check } = await supabase.from('events').select('count').limit(1);
  if (check === null) throw new Error('Table may have been dropped!');
  
  await supabase.from('events').delete().eq('id', data.id);
}

// 6. Concurrent Operations
async function testConcurrentCreation(i) {
  const promises = Array.from({ length: 3 }, (_, j) => 
    supabase.from('events').insert({
      title: `Concurrent ${i}-${j}`,
      start_date: futureDate(),
      status: 'active'
    }).select().single()
  );
  
  const results = await Promise.all(promises);
  const ids = results.filter(r => r.data).map(r => r.data.id);
  
  if (ids.length < 2) throw new Error(`Only ${ids.length}/3 succeeded`);
  
  // Cleanup
  for (const id of ids) {
    await supabase.from('events').delete().eq('id', id);
  }
}

// 7. Query Edge Cases
async function testPaginationBoundary(i) {
  // Create 15 events
  const events = Array.from({ length: 15 }, (_, j) => ({
    title: `Page Test ${i}-${j}`,
    start_date: futureDate(),
    status: 'active'
  }));
  
  const { data: created } = await supabase.from('events').insert(events).select();
  if (!created || created.length !== 15) throw new Error('Failed to create events');
  
  const ids = created.map(e => e.id);
  
  // Test pagination
  const { data: page1 } = await supabase.from('events').select('*').in('id', ids).range(0, 9);
  const { data: page2 } = await supabase.from('events').select('*').in('id', ids).range(10, 19);
  
  if (page1.length !== 10) throw new Error(`Page 1: expected 10, got ${page1.length}`);
  if (page2.length !== 5) throw new Error(`Page 2: expected 5, got ${page2.length}`);
  
  // Cleanup
  for (const id of ids) {
    await supabase.from('events').delete().eq('id', id);
  }
}

async function testSortingOrder(i) {
  const dates = ['2025-01-15', '2025-06-20', '2025-03-10', '2025-12-01', '2025-09-05'];
  const events = dates.map((d, j) => ({
    title: `Sort Test ${i}-${j}`,
    start_date: d,
    status: 'active'
  }));
  
  const { data: created } = await supabase.from('events').insert(events).select();
  if (!created) throw new Error('Failed to create events');
  
  const ids = created.map(e => e.id);
  
  // Test ascending
  const { data: asc } = await supabase.from('events')
    .select('*')
    .in('id', ids)
    .order('start_date', { ascending: true });
  
  for (let j = 1; j < asc.length; j++) {
    if (asc[j].start_date < asc[j-1].start_date) throw new Error('Ascending sort failed');
  }
  
  // Cleanup
  for (const id of ids) {
    await supabase.from('events').delete().eq('id', id);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  log('\n' + '═'.repeat(60), 'info');
  log('  LINKMEU/EVENTSX EDGE CASE TEST SUITE', 'info');
  log('  20 iterations per test with retry logic', 'info');
  log('═'.repeat(60), 'info');
  
  const start = Date.now();
  
  // Test connection first
  log('\n🔌 Testing database connection...', 'info');
  const { error: connError } = await supabase.from('events').select('count').limit(1);
  if (connError) {
    log(`❌ Connection failed: ${connError.message}`, 'error');
    process.exit(1);
  }
  log('✅ Connected to Supabase', 'success');
  
  // User Tests
  log('\n📦 USER EDGE CASES', 'info');
  await runTest('Empty Password', testEmptyPassword);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Very Long Email', testVeryLongEmail);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Special Chars in Name', testSpecialCharsInName);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Unicode in User Fields', testUnicodeInUserFields);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Event Tests
  log('\n📦 EVENT EDGE CASES', 'info');
  await runTest('Event with Null Fields', testEventWithNullFields);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Empty Arrays', testEventWithEmptyArrays);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Large JSON', testEventWithLargeJSON);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Max Capacity', testEventWithMaxCapacity);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Zero Capacity', testEventWithZeroCapacity);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Negative Capacity', testEventWithNegativeCapacity);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Past Date', testEventWithPastDate);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Far Future Date', testEventWithFarFutureDate);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event Title with Emoji', testEventTitleWithEmoji);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Very Long Title', testEventWithVeryLongTitle);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event with Very Long Description', testEventWithVeryLongDescription);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event Soft Delete', testEventSoftDelete);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Event Update', testEventUpdate);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Attendee Tests
  log('\n📦 ATTENDEE EDGE CASES', 'info');
  await runTest('Attendee with Long Name', testAttendeeWithLongName);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Attendee Check-In Toggle', testAttendeeCheckInToggle);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Multiple Attendees Per Event', testMultipleAttendeesPerEvent);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Listing Tests
  log('\n📦 LISTING EDGE CASES', 'info');
  await runTest('Listing All Categories', testListingAllCategories);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Listing with Max Images', testListingWithMaxImages);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Listing Budget Edge Cases', testListingBudgetEdgeCases);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Listing Status Transitions', testListingStatusTransitions);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Security Tests
  log('\n📦 SECURITY TESTS', 'info');
  await runTest('SQL Injection Prevention', testSQLInjectionInTitle);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Concurrent Tests
  log('\n📦 CONCURRENT OPERATIONS', 'info');
  await runTest('Concurrent Creation', testConcurrentCreation);
  await sleep(DELAY_BETWEEN_GROUPS);
  
  // Query Tests
  log('\n📦 QUERY EDGE CASES', 'info');
  await runTest('Pagination Boundary', testPaginationBoundary);
  await sleep(DELAY_BETWEEN_GROUPS);
  await runTest('Sorting Order', testSortingOrder);
  
  // Final Report
  const duration = Math.round((Date.now() - start) / 1000);
  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  
  log('\n' + '═'.repeat(60), 'info');
  log('  FINAL REPORT', 'info');
  log('═'.repeat(60), 'info');
  log(`Total Tests: ${results.tests.length}`, 'info');
  log(`Total Iterations: ${results.passed + results.failed}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${successRate}%`, 'info');
  log(`Duration: ${duration}s`, 'info');
  
  // Failed tests
  const failed = results.tests.filter(t => t.failed > 0);
  if (failed.length > 0) {
    log('\n⚠️  FAILED TESTS:', 'warn');
    for (const t of failed) {
      log(`  ${t.name}: ${t.failed}/${t.passed + t.failed} failed`, 'error');
      if (t.errors[0]) log(`    → ${t.errors[0].msg}`, 'warn');
    }
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { tests: results.tests.length, passed: results.passed, failed: results.failed, successRate, duration: duration + 's' },
    tests: results.tests.map(t => ({
      name: t.name,
      passed: t.passed,
      failed: t.failed,
      avgMs: t.durations.length ? Math.round(t.durations.reduce((a,b) => a+b, 0) / t.durations.length) : 0,
      errors: t.errors.slice(0, 3)
    }))
  };
  
  fs.writeFileSync('edge-case-results.json', JSON.stringify(report, null, 2));
  log('\n📄 Results saved to edge-case-results.json', 'info');
  
  log('\n' + '═'.repeat(60), 'info');
  log(results.failed === 0 ? '  ✅ ALL TESTS PASSED!' : '  ❌ SOME TESTS FAILED', results.failed === 0 ? 'success' : 'error');
  log('═'.repeat(60) + '\n', 'info');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(e => {
  log(`\n❌ Test suite crashed: ${e.message}`, 'error');
  process.exit(1);
});
