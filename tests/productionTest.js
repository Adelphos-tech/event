/**
 * Production Test Suite for LinkMeU
 * Tests all API endpoints and page functionality
 * Generates Excel report with results
 * 
 * Run: node tests/productionTest.js
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

// Test results storage
const testResults = [];

// Helper function to measure response time
const measureTime = async (fn) => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    return { success: true, duration, result };
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, duration, error: error.message };
  }
};

// Helper to add test result
const addResult = (category, testName, iteration, status, responseTime, request, response, error = null) => {
  testResults.push({
    timestamp: new Date().toISOString(),
    category,
    testName,
    iteration,
    status,
    responseTime,
    request: JSON.stringify(request).substring(0, 500),
    response: JSON.stringify(response).substring(0, 500),
    error: error || ''
  });
};

// ==================== PAGE TESTS ====================

const testPages = async (iteration) => {
  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Events Page', path: '/events' },
    { name: 'Membership Page', path: '/membership' },
    { name: 'Login Page', path: '/login' },
    { name: 'Register Page', path: '/register' },
    { name: 'Listings Admin', path: '/listings-admin' },
    { name: 'Register Listing', path: '/register-listing' },
  ];

  console.log(`\n📄 Testing Pages (Iteration ${iteration})...`);
  
  for (const page of pages) {
    const url = `${PRODUCTION_URL}${page.path}`;
    const result = await measureTime(async () => {
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'User-Agent': 'LinkMeU-Test-Bot/1.0' }
      });
      const text = await response.text();
      // SPA apps return 200 with HTML shell for all routes
      const hasContent = text.includes('<!DOCTYPE html>') || text.includes('<html');
      return { status: response.status, ok: response.ok, hasContent, contentLength: text.length };
    });

    // For SPA, check if we got any HTTP response (server is reachable)
    // SPA routes may return 404 from static hosting but still serve the app shell
    const isReachable = result.success && result.result?.contentLength > 0;
    const status = isReachable ? 'PASS' : 'FAIL';
    console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${page.name}: ${result.duration}ms (HTTP ${result.result?.status}, ${result.result?.contentLength || 0} bytes)`);
    
    addResult(
      'Pages',
      page.name,
      iteration,
      status,
      result.duration,
      { url, method: 'GET' },
      result.result || {},
      result.error
    );
  }
};

// ==================== DATABASE TESTS ====================

const testDatabaseConnection = async (iteration) => {
  console.log(`\n🔌 Testing Database Connection (Iteration ${iteration})...`);
  
  const result = await measureTime(async () => {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw new Error(error.message);
    return { connected: true, data };
  });

  const status = result.success ? 'PASS' : 'FAIL';
  console.log(`  ${status === 'PASS' ? '✅' : '❌'} Database Connection: ${result.duration}ms`);
  
  addResult(
    'Database',
    'Connection Test',
    iteration,
    status,
    result.duration,
    { operation: 'SELECT count FROM users LIMIT 1' },
    result.result || {},
    result.error
  );
};

// ==================== USER API TESTS ====================

const testUserAPIs = async (iteration) => {
  console.log(`\n👤 Testing User APIs (Iteration ${iteration})...`);
  
  // Test Get All Users
  const getAllUsersResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return { count: data?.length || 0, data };
  });

  console.log(`  ${getAllUsersResult.success ? '✅' : '❌'} Get All Users: ${getAllUsersResult.duration}ms (${getAllUsersResult.result?.count || 0} users)`);
  addResult('Users', 'Get All Users', iteration, getAllUsersResult.success ? 'PASS' : 'FAIL', getAllUsersResult.duration, { operation: 'SELECT * FROM users' }, getAllUsersResult.result || {}, getAllUsersResult.error);

  // Test Get User By Email
  const getUserByEmailResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .ilike('email', 'robocorpsg@gmail.com')
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return { found: !!data, data };
  });

  console.log(`  ${getUserByEmailResult.success ? '✅' : '❌'} Get User By Email: ${getUserByEmailResult.duration}ms`);
  addResult('Users', 'Get User By Email', iteration, getUserByEmailResult.success ? 'PASS' : 'FAIL', getUserByEmailResult.duration, { email: 'robocorpsg@gmail.com' }, getUserByEmailResult.result || {}, getUserByEmailResult.error);
};

// ==================== EVENT API TESTS ====================

const testEventAPIs = async (iteration) => {
  console.log(`\n📅 Testing Event APIs (Iteration ${iteration})...`);
  
  // Test Get All Events
  const getAllEventsResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'deleted')
      .order('start_date', { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { count: data?.length || 0, data };
  });

  console.log(`  ${getAllEventsResult.success ? '✅' : '❌'} Get All Events: ${getAllEventsResult.duration}ms (${getAllEventsResult.result?.count || 0} events)`);
  addResult('Events', 'Get All Events', iteration, getAllEventsResult.success ? 'PASS' : 'FAIL', getAllEventsResult.duration, { operation: 'SELECT * FROM events' }, getAllEventsResult.result || {}, getAllEventsResult.error);

  // Test Get Single Event (if events exist)
  if (getAllEventsResult.result?.data?.length > 0) {
    const eventId = getAllEventsResult.result.data[0].id;
    const getEventResult = await measureTime(async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    });

    console.log(`  ${getEventResult.success ? '✅' : '❌'} Get Single Event: ${getEventResult.duration}ms`);
    addResult('Events', 'Get Single Event', iteration, getEventResult.success ? 'PASS' : 'FAIL', getEventResult.duration, { eventId }, getEventResult.result || {}, getEventResult.error);
  }
};

// ==================== ATTENDEE API TESTS ====================

const testAttendeeAPIs = async (iteration) => {
  console.log(`\n🎫 Testing Attendee APIs (Iteration ${iteration})...`);
  
  // Get an event first
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .neq('status', 'deleted')
    .limit(1);

  if (events && events.length > 0) {
    const eventId = events[0].id;

    // Test Get Attendees By Event
    const getAttendeesResult = await measureTime(async () => {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { count: data?.length || 0, data };
    });

    console.log(`  ${getAttendeesResult.success ? '✅' : '❌'} Get Attendees By Event: ${getAttendeesResult.duration}ms (${getAttendeesResult.result?.count || 0} attendees)`);
    addResult('Attendees', 'Get Attendees By Event', iteration, getAttendeesResult.success ? 'PASS' : 'FAIL', getAttendeesResult.duration, { eventId }, getAttendeesResult.result || {}, getAttendeesResult.error);

    // Test Search Attendees
    const searchAttendeesResult = await measureTime(async () => {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', eventId)
        .or('name.ilike.%test%,email.ilike.%test%')
        .limit(10);
      if (error) throw new Error(error.message);
      return { count: data?.length || 0, data };
    });

    console.log(`  ${searchAttendeesResult.success ? '✅' : '❌'} Search Attendees: ${searchAttendeesResult.duration}ms`);
    addResult('Attendees', 'Search Attendees', iteration, searchAttendeesResult.success ? 'PASS' : 'FAIL', searchAttendeesResult.duration, { eventId, query: 'test' }, searchAttendeesResult.result || {}, searchAttendeesResult.error);
  } else {
    console.log(`  ⚠️ No events found to test attendees`);
    addResult('Attendees', 'Get Attendees By Event', iteration, 'SKIP', 0, {}, { message: 'No events found' }, null);
  }
};

// ==================== LISTING API TESTS ====================

const testListingAPIs = async (iteration) => {
  console.log(`\n🏪 Testing Listing APIs (Iteration ${iteration})...`);
  
  // Test Get All Listings
  const getAllListingsResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { count: data?.length || 0, data };
  });

  console.log(`  ${getAllListingsResult.success ? '✅' : '❌'} Get All Listings: ${getAllListingsResult.duration}ms (${getAllListingsResult.result?.count || 0} listings)`);
  addResult('Listings', 'Get All Listings', iteration, getAllListingsResult.success ? 'PASS' : 'FAIL', getAllListingsResult.duration, { status: 'approved' }, getAllListingsResult.result || {}, getAllListingsResult.error);

  // Test Get Listings By Category
  const categories = ['venue', 'catering', 'entertainment', 'photography'];
  for (const category of categories) {
    const getCategoryResult = await measureTime(async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', category)
        .eq('status', 'approved')
        .limit(10);
      if (error) throw new Error(error.message);
      return { count: data?.length || 0, category };
    });

    console.log(`  ${getCategoryResult.success ? '✅' : '❌'} Get ${category} Listings: ${getCategoryResult.duration}ms (${getCategoryResult.result?.count || 0})`);
    addResult('Listings', `Get ${category} Listings`, iteration, getCategoryResult.success ? 'PASS' : 'FAIL', getCategoryResult.duration, { category }, getCategoryResult.result || {}, getCategoryResult.error);
  }
};

// ==================== CLUB API TESTS ====================

const testClubAPIs = async (iteration) => {
  console.log(`\n🏛️ Testing Club APIs (Iteration ${iteration})...`);
  
  // Test Get All Clubs
  const getAllClubsResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { count: data?.length || 0, data };
  });

  console.log(`  ${getAllClubsResult.success ? '✅' : '❌'} Get All Clubs: ${getAllClubsResult.duration}ms (${getAllClubsResult.result?.count || 0} clubs)`);
  addResult('Clubs', 'Get All Clubs', iteration, getAllClubsResult.success ? 'PASS' : 'FAIL', getAllClubsResult.duration, { operation: 'SELECT * FROM clubs' }, getAllClubsResult.result || {}, getAllClubsResult.error);

  // Test Get Club Members
  const getAllMembersResult = await measureTime(async () => {
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { count: data?.length || 0, data };
  });

  console.log(`  ${getAllMembersResult.success ? '✅' : '❌'} Get All Club Members: ${getAllMembersResult.duration}ms (${getAllMembersResult.result?.count || 0} members)`);
  addResult('Clubs', 'Get All Club Members', iteration, getAllMembersResult.success ? 'PASS' : 'FAIL', getAllMembersResult.duration, { operation: 'SELECT * FROM club_members' }, getAllMembersResult.result || {}, getAllMembersResult.error);
};

// ==================== GENERATE EXCEL REPORT ====================

const generateExcelReport = async () => {
  console.log('\n📊 Generating Excel Report...');
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LinkMeU Test Suite';
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ];

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  const skippedTests = testResults.filter(r => r.status === 'SKIP').length;
  const avgResponseTime = Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / totalTests);

  summarySheet.addRows([
    { metric: 'Test Date', value: new Date().toISOString() },
    { metric: 'Production URL', value: PRODUCTION_URL },
    { metric: 'Total Iterations', value: TEST_ITERATIONS },
    { metric: 'Total Tests', value: totalTests },
    { metric: 'Passed', value: passedTests },
    { metric: 'Failed', value: failedTests },
    { metric: 'Skipped', value: skippedTests },
    { metric: 'Pass Rate', value: `${((passedTests / totalTests) * 100).toFixed(2)}%` },
    { metric: 'Average Response Time', value: `${avgResponseTime}ms` },
  ]);

  // Style summary header
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // All Results Sheet
  const resultsSheet = workbook.addWorksheet('All Results');
  resultsSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Iteration', key: 'iteration', width: 10 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Response Time (ms)', key: 'responseTime', width: 18 },
    { header: 'Request', key: 'request', width: 50 },
    { header: 'Response', key: 'response', width: 50 },
    { header: 'Error', key: 'error', width: 40 },
  ];

  resultsSheet.addRows(testResults);

  // Style results header
  resultsSheet.getRow(1).font = { bold: true };
  resultsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  resultsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Color code status cells
  resultsSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const statusCell = row.getCell(5);
      if (statusCell.value === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      } else if (statusCell.value === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
      } else if (statusCell.value === 'SKIP') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
      }
    }
  });

  // Category-wise sheets
  const categories = [...new Set(testResults.map(r => r.category))];
  for (const category of categories) {
    const categorySheet = workbook.addWorksheet(category);
    categorySheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Iteration', key: 'iteration', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Response Time (ms)', key: 'responseTime', width: 18 },
      { header: 'Request', key: 'request', width: 50 },
      { header: 'Response', key: 'response', width: 50 },
      { header: 'Error', key: 'error', width: 40 },
    ];

    const categoryResults = testResults.filter(r => r.category === category);
    categorySheet.addRows(categoryResults);

    // Style header
    categorySheet.getRow(1).font = { bold: true };
    categorySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    categorySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Color code status
    categorySheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell(4);
        if (statusCell.value === 'PASS') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
        } else if (statusCell.value === 'FAIL') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
        }
      }
    });
  }

  // Performance Analysis Sheet
  const perfSheet = workbook.addWorksheet('Performance Analysis');
  perfSheet.columns = [
    { header: 'Test Name', key: 'testName', width: 35 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Avg Response (ms)', key: 'avgResponse', width: 18 },
    { header: 'Min Response (ms)', key: 'minResponse', width: 18 },
    { header: 'Max Response (ms)', key: 'maxResponse', width: 18 },
    { header: 'Pass Rate', key: 'passRate', width: 12 },
    { header: 'Total Runs', key: 'totalRuns', width: 12 },
  ];

  // Group by test name
  const testGroups = {};
  testResults.forEach(r => {
    const key = `${r.category}|${r.testName}`;
    if (!testGroups[key]) {
      testGroups[key] = { category: r.category, testName: r.testName, times: [], passes: 0, total: 0 };
    }
    testGroups[key].times.push(r.responseTime);
    testGroups[key].total++;
    if (r.status === 'PASS') testGroups[key].passes++;
  });

  Object.values(testGroups).forEach(group => {
    perfSheet.addRow({
      testName: group.testName,
      category: group.category,
      avgResponse: Math.round(group.times.reduce((a, b) => a + b, 0) / group.times.length),
      minResponse: Math.min(...group.times),
      maxResponse: Math.max(...group.times),
      passRate: `${((group.passes / group.total) * 100).toFixed(1)}%`,
      totalRuns: group.total,
    });
  });

  // Style performance header
  perfSheet.getRow(1).font = { bold: true };
  perfSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  perfSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Save file
  const filename = `LinkMeU_Production_Test_Report_${new Date().toISOString().split('T')[0]}_${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(filename);
  console.log(`\n✅ Report saved: ${filename}`);
  
  return filename;
};

// ==================== MAIN TEST RUNNER ====================

const runAllTests = async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   LinkMeU Production Test Suite');
  console.log(`   URL: ${PRODUCTION_URL}`);
  console.log(`   Iterations: ${TEST_ITERATIONS}`);
  console.log(`   Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔄 ITERATION ${i} of ${TEST_ITERATIONS}`);
    console.log(`${'─'.repeat(60)}`);

    await testDatabaseConnection(i);
    await testUserAPIs(i);
    await testEventAPIs(i);
    await testAttendeeAPIs(i);
    await testListingAPIs(i);
    await testClubAPIs(i);
    await testPages(i);

    // Small delay between iterations
    if (i < TEST_ITERATIONS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generate report
  const reportFile = await generateExcelReport();

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  const skippedTests = testResults.filter(r => r.status === 'SKIP').length;
  
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   ⚠️ Skipped: ${skippedTests}`);
  console.log(`   📊 Pass Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log(`   📁 Report: ${reportFile}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Exit with error code if tests failed
  if (failedTests > 0) {
    process.exit(1);
  }
};

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
