/**
 * Comprehensive Data Submission & Retrieval Test Runner
 * Tests all database operations 10 times each
 * Run with: node scripts/data-test-runner.js
 */

import Dexie from 'dexie';

// Test configuration
const TEST_RUNS = 10;
const results = [];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test database connection
const db = new Dexie('EventsXDatabase');
db.version(1).stores({
  users: '++id, email, role',
  events: '++id, title, startDate, endDate, ownerId',
  attendees: '++id, eventId, name, email, contact, attended',
});

// Helper functions
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const timestamp = () => new Date().toISOString();

// Generate test data
const generateTestEvent = (index) => ({
  title: `Test Event ${index} - ${Date.now()}`,
  description: `This is a comprehensive test event #${index} with detailed description for testing purposes. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  eventType: ['conference', 'workshop', 'seminar', 'meetup', 'exhibition', 'networking'][index % 6],
  startDate: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
  endDate: new Date(Date.now() + ((index + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
  venue: `Test Venue ${index}, Singapore`,
  capacity: 100 + (index * 10),
  organisers: [
    { name: `Organiser ${index}A`, detail: 'Main organiser' },
    { name: `Organiser ${index}B`, detail: 'Co-organiser' }
  ],
  speakers: [
    { name: `Speaker ${index}`, title: 'Keynote Speaker', photo: null }
  ],
  sponsors: [
    { name: `Sponsor ${index}`, logo: null }
  ],
  createdAt: timestamp(),
  updatedAt: timestamp()
});

const generateTestUser = (index) => ({
  email: `testuser${index}_${Date.now()}@test.com`,
  password: `TestPass${index}!`,
  contact: `+65 9${String(index).padStart(7, '0')}`,
  role: 'owner',
  createdAt: timestamp()
});

const generateTestAttendee = (eventId, index) => ({
  eventId,
  name: `Attendee ${index}`,
  email: `attendee${index}_${Date.now()}@test.com`,
  contact: `+65 8${String(index).padStart(7, '0')}`,
  notes: `Registration notes for attendee ${index}`,
  attended: false,
  registeredAt: timestamp()
});

// Test functions
async function testEventCreation(runNumber) {
  const testName = `Event Creation - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const testEvent = generateTestEvent(runNumber);
    const id = await db.events.add(testEvent);
    
    if (id && id > 0) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, eventId: id, data: testEvent.title };
    } else {
      return { test: testName, status: 'FAIL', error: 'No ID returned', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testEventRetrieval(eventId, runNumber) {
  const testName = `Event Retrieval - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const event = await db.events.get(eventId);
    
    if (event && event.title) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, data: event.title };
    } else {
      return { test: testName, status: 'FAIL', error: 'Event not found', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testEventUpdate(eventId, runNumber) {
  const testName = `Event Update - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const updatedTitle = `Updated Event ${runNumber} - ${Date.now()}`;
    await db.events.update(eventId, { 
      title: updatedTitle,
      updatedAt: timestamp()
    });
    
    const event = await db.events.get(eventId);
    
    if (event && event.title === updatedTitle) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, data: updatedTitle };
    } else {
      return { test: testName, status: 'FAIL', error: 'Update not persisted', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testUserCreation(runNumber) {
  const testName = `User Creation - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const testUser = generateTestUser(runNumber);
    const id = await db.users.add(testUser);
    
    if (id && id > 0) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, userId: id, data: testUser.email };
    } else {
      return { test: testName, status: 'FAIL', error: 'No ID returned', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testUserRetrieval(email, runNumber) {
  const testName = `User Retrieval - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const user = await db.users.where('email').equals(email).first();
    
    if (user && user.email === email) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, data: user.email };
    } else {
      return { test: testName, status: 'FAIL', error: 'User not found', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testAttendeeCreation(eventId, runNumber) {
  const testName = `Attendee Creation - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const testAttendee = generateTestAttendee(eventId, runNumber);
    const id = await db.attendees.add(testAttendee);
    
    if (id && id > 0) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, attendeeId: id, data: testAttendee.name };
    } else {
      return { test: testName, status: 'FAIL', error: 'No ID returned', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testAttendeeRetrieval(eventId, runNumber) {
  const testName = `Attendee Retrieval - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const attendees = await db.attendees.where('eventId').equals(eventId).toArray();
    
    if (attendees && attendees.length > 0) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, count: attendees.length, data: `${attendees.length} attendees` };
    } else {
      return { test: testName, status: 'FAIL', error: 'No attendees found', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testBulkEventCreation(runNumber) {
  const testName = `Bulk Event Creation (5 events) - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const events = [];
    for (let i = 0; i < 5; i++) {
      events.push(generateTestEvent(runNumber * 10 + i));
    }
    
    const ids = await db.events.bulkAdd(events, { allKeys: true });
    
    if (ids && ids.length === 5) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, count: ids.length, data: `${ids.length} events created` };
    } else {
      return { test: testName, status: 'FAIL', error: 'Not all events created', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testEventDeletion(eventId, runNumber) {
  const testName = `Event Deletion - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    await db.events.delete(eventId);
    const event = await db.events.get(eventId);
    
    if (!event) {
      const duration = Date.now() - startTime;
      return { test: testName, status: 'PASS', duration: `${duration}ms`, data: `Event ${eventId} deleted` };
    } else {
      return { test: testName, status: 'FAIL', error: 'Event still exists', duration: `${Date.now() - startTime}ms` };
    }
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

async function testComplexQuery(runNumber) {
  const testName = `Complex Query (filter + sort) - Run ${runNumber}`;
  const startTime = Date.now();
  
  try {
    const events = await db.events
      .orderBy('startDate')
      .filter(e => e.capacity && e.capacity > 50)
      .toArray();
    
    const duration = Date.now() - startTime;
    return { test: testName, status: 'PASS', duration: `${duration}ms`, count: events.length, data: `${events.length} events matched` };
  } catch (error) {
    return { test: testName, status: 'FAIL', error: error.message, duration: `${Date.now() - startTime}ms` };
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(80), 'blue');
  log('  COMPREHENSIVE DATA SUBMISSION & RETRIEVAL TEST SUITE', 'bold');
  log('  Testing all database operations 10 times each', 'yellow');
  log('='.repeat(80) + '\n', 'blue');
  
  const allResults = [];
  const testEventIds = [];
  const testUserEmails = [];
  
  // Run tests 10 times
  for (let run = 1; run <= TEST_RUNS; run++) {
    log(`\n--- TEST RUN ${run}/${TEST_RUNS} ---\n`, 'yellow');
    
    // 1. Event Creation
    const eventResult = await testEventCreation(run);
    allResults.push(eventResult);
    log(`${eventResult.status === 'PASS' ? '✅' : '❌'} ${eventResult.test}: ${eventResult.status} (${eventResult.duration})`, eventResult.status === 'PASS' ? 'green' : 'red');
    if (eventResult.eventId) testEventIds.push(eventResult.eventId);
    
    // 2. Event Retrieval
    if (eventResult.eventId) {
      const retrieveResult = await testEventRetrieval(eventResult.eventId, run);
      allResults.push(retrieveResult);
      log(`${retrieveResult.status === 'PASS' ? '✅' : '❌'} ${retrieveResult.test}: ${retrieveResult.status} (${retrieveResult.duration})`, retrieveResult.status === 'PASS' ? 'green' : 'red');
    }
    
    // 3. Event Update
    if (eventResult.eventId) {
      const updateResult = await testEventUpdate(eventResult.eventId, run);
      allResults.push(updateResult);
      log(`${updateResult.status === 'PASS' ? '✅' : '❌'} ${updateResult.test}: ${updateResult.status} (${updateResult.duration})`, updateResult.status === 'PASS' ? 'green' : 'red');
    }
    
    // 4. User Creation
    const userResult = await testUserCreation(run);
    allResults.push(userResult);
    log(`${userResult.status === 'PASS' ? '✅' : '❌'} ${userResult.test}: ${userResult.status} (${userResult.duration})`, userResult.status === 'PASS' ? 'green' : 'red');
    if (userResult.data) testUserEmails.push(userResult.data);
    
    // 5. User Retrieval
    if (userResult.data) {
      const userRetrieveResult = await testUserRetrieval(userResult.data, run);
      allResults.push(userRetrieveResult);
      log(`${userRetrieveResult.status === 'PASS' ? '✅' : '❌'} ${userRetrieveResult.test}: ${userRetrieveResult.status} (${userRetrieveResult.duration})`, userRetrieveResult.status === 'PASS' ? 'green' : 'red');
    }
    
    // 6. Attendee Creation
    if (eventResult.eventId) {
      const attendeeResult = await testAttendeeCreation(eventResult.eventId, run);
      allResults.push(attendeeResult);
      log(`${attendeeResult.status === 'PASS' ? '✅' : '❌'} ${attendeeResult.test}: ${attendeeResult.status} (${attendeeResult.duration})`, attendeeResult.status === 'PASS' ? 'green' : 'red');
    }
    
    // 7. Attendee Retrieval
    if (eventResult.eventId) {
      const attendeeRetrieveResult = await testAttendeeRetrieval(eventResult.eventId, run);
      allResults.push(attendeeRetrieveResult);
      log(`${attendeeRetrieveResult.status === 'PASS' ? '✅' : '❌'} ${attendeeRetrieveResult.test}: ${attendeeRetrieveResult.status} (${attendeeRetrieveResult.duration})`, attendeeRetrieveResult.status === 'PASS' ? 'green' : 'red');
    }
    
    // 8. Bulk Event Creation
    const bulkResult = await testBulkEventCreation(run);
    allResults.push(bulkResult);
    log(`${bulkResult.status === 'PASS' ? '✅' : '❌'} ${bulkResult.test}: ${bulkResult.status} (${bulkResult.duration})`, bulkResult.status === 'PASS' ? 'green' : 'red');
    
    // 9. Complex Query
    const queryResult = await testComplexQuery(run);
    allResults.push(queryResult);
    log(`${queryResult.status === 'PASS' ? '✅' : '❌'} ${queryResult.test}: ${queryResult.status} (${queryResult.duration})`, queryResult.status === 'PASS' ? 'green' : 'red');
  }
  
  // 10. Event Deletion (clean up first 5 test events)
  log('\n--- CLEANUP TESTS ---\n', 'yellow');
  for (let i = 0; i < Math.min(5, testEventIds.length); i++) {
    const deleteResult = await testEventDeletion(testEventIds[i], i + 1);
    allResults.push(deleteResult);
    log(`${deleteResult.status === 'PASS' ? '✅' : '❌'} ${deleteResult.test}: ${deleteResult.status} (${deleteResult.duration})`, deleteResult.status === 'PASS' ? 'green' : 'red');
  }
  
  // Generate summary
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const total = allResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  log('\n' + '='.repeat(80), 'blue');
  log('  TEST SUMMARY', 'bold');
  log('='.repeat(80), 'blue');
  log(`\n  Total Tests: ${total}`, 'reset');
  log(`  Passed: ${passed}`, 'green');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`  Pass Rate: ${passRate}%\n`, passRate === '100.0' ? 'green' : 'yellow');
  
  // Calculate average durations by test type
  const testTypes = [...new Set(allResults.map(r => r.test.replace(/ - Run \d+/, '')))];
  log('  Average Durations:', 'yellow');
  testTypes.forEach(type => {
    const typeResults = allResults.filter(r => r.test.startsWith(type));
    const avgDuration = typeResults.reduce((sum, r) => sum + parseInt(r.duration), 0) / typeResults.length;
    log(`    ${type}: ${avgDuration.toFixed(1)}ms`, 'reset');
  });
  
  log('\n' + '='.repeat(80) + '\n', 'blue');
  
  return { allResults, summary: { total, passed, failed, passRate } };
}

// Run tests
runAllTests().then(({ summary }) => {
  console.log('Test run complete. Results saved.');
  process.exit(summary.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
