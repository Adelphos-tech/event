# LinkMeU/EventsX Edge Case Test Documentation

## Overview
This document outlines all edge cases tested for the LinkMeU/EventsX application. Each test is designed to run 20 iterations to ensure reliability.

## Test Configuration
- **Iterations per test**: 20
- **Delay between iterations**: 500ms
- **Delay between test groups**: 2000ms
- **Max retries per operation**: 3
- **Retry backoff**: Exponential (1s, 2s, 3s)

---

## 1. USER EDGE CASES (4 tests × 20 iterations = 80 total)

### 1.1 Empty Password
- **Purpose**: Test system behavior with empty password
- **Input**: `password: ""`
- **Expected**: Should handle gracefully (app-level validation)
- **Iterations**: 20

### 1.2 Very Long Email
- **Purpose**: Test email field length limits
- **Input**: 200+ character email address
- **Expected**: Either accept or fail gracefully with error
- **Iterations**: 20

### 1.3 Special Characters in Name
- **Purpose**: Test XSS prevention and special char handling
- **Input**: `<script>alert('xss')</script> & "User"`
- **Expected**: Characters stored exactly as input (escaped in display)
- **Iterations**: 20

### 1.4 Unicode in User Fields
- **Purpose**: Test international character support
- **Input**: `用户 ユーザー пользователь` (Chinese, Japanese, Russian)
- **Expected**: Unicode preserved exactly
- **Iterations**: 20

---

## 2. EVENT EDGE CASES (13 tests × 20 iterations = 260 total)

### 2.1 Event with Null Fields
- **Purpose**: Test nullable field handling
- **Input**: `description: null, venue: null, logo: null, image: null`
- **Expected**: Event created successfully with null values
- **Iterations**: 20

### 2.2 Event with Empty Arrays
- **Purpose**: Test empty JSON array handling
- **Input**: `organisers: [], speakers: [], sponsors: []`
- **Expected**: Arrays stored as empty arrays, not null
- **Iterations**: 20

### 2.3 Event with Large JSON
- **Purpose**: Test large JSON payload handling
- **Input**: 50 organisers with detailed info (~10KB payload)
- **Expected**: All data preserved without truncation
- **Iterations**: 20

### 2.4 Event with Max Capacity
- **Purpose**: Test integer overflow prevention
- **Input**: `capacity: 2147483647` (max int32)
- **Expected**: Value stored correctly
- **Iterations**: 20

### 2.5 Event with Zero Capacity
- **Purpose**: Test zero value handling
- **Input**: `capacity: 0`
- **Expected**: Zero stored, not converted to null
- **Iterations**: 20

### 2.6 Event with Negative Capacity
- **Purpose**: Test negative number handling
- **Input**: `capacity: -100`
- **Expected**: Either reject or accept (schema dependent)
- **Iterations**: 20

### 2.7 Event with Past Date
- **Purpose**: Test historical event creation
- **Input**: Date 1 year in the past
- **Expected**: Event created (no date validation at DB level)
- **Iterations**: 20

### 2.8 Event with Far Future Date
- **Purpose**: Test far future date handling
- **Input**: Date 100 years in the future
- **Expected**: Date stored correctly
- **Iterations**: 20

### 2.9 Event Title with Emoji
- **Purpose**: Test emoji/unicode in title
- **Input**: `🎉 Party Time 🎊 Event 🎈🎁🎂`
- **Expected**: All emojis preserved
- **Iterations**: 20

### 2.10 Event with Very Long Title
- **Purpose**: Test title length limits
- **Input**: 1000 character title
- **Expected**: Either accept or fail gracefully
- **Iterations**: 20

### 2.11 Event with Very Long Description
- **Purpose**: Test text field limits
- **Input**: ~12,000 character description
- **Expected**: Full text stored
- **Iterations**: 20

### 2.12 Event Soft Delete
- **Purpose**: Test soft delete functionality
- **Steps**:
  1. Create event with status='active'
  2. Update status to 'deleted'
  3. Query with `neq('status', 'deleted')`
- **Expected**: Deleted event not returned in active queries
- **Iterations**: 20

### 2.13 Event Update
- **Purpose**: Test update operations
- **Steps**:
  1. Create event
  2. Update title
  3. Verify change persisted
- **Expected**: Update applied correctly
- **Iterations**: 20

---

## 3. ATTENDEE EDGE CASES (3 tests × 20 iterations = 60 total)

### 3.1 Attendee with Long Name
- **Purpose**: Test name field length
- **Input**: 500 character name
- **Expected**: Either accept or fail gracefully
- **Iterations**: 20

### 3.2 Attendee Check-In Toggle
- **Purpose**: Test check-in/check-out flow
- **Steps**:
  1. Create attendee with `attended: false`
  2. Update to `attended: true`
  3. Verify change
  4. Update back to `attended: false`
  5. Verify change
- **Expected**: Both transitions work correctly
- **Iterations**: 20

### 3.3 Multiple Attendees Per Event
- **Purpose**: Test bulk attendee creation
- **Input**: 10 attendees for single event
- **Expected**: All 10 created successfully
- **Iterations**: 20

---

## 4. LISTING EDGE CASES (4 tests × 20 iterations = 80 total)

### 4.1 Listing All Categories
- **Purpose**: Test all category values
- **Input**: Rotate through `parttime, business, property, wedding, events`
- **Expected**: All categories accepted
- **Iterations**: 20 (4 iterations per category)

### 4.2 Listing with Max Images
- **Purpose**: Test image array limit
- **Input**: 5 image URLs
- **Expected**: All 5 images stored
- **Iterations**: 20

### 4.3 Listing Budget Edge Cases
- **Purpose**: Test budget field boundaries
- **Input**: Various combinations:
  - `min: 0, max: 0`
  - `min: 0.01, max: 0.01`
  - `min: 999999999, max: 999999999`
  - `min: 100, max: 50` (invalid range)
- **Expected**: Handle all cases gracefully
- **Iterations**: 20

### 4.4 Listing Status Transitions
- **Purpose**: Test all status values
- **Steps**: Transition through `pending → active → rejected → expired → deleted`
- **Expected**: All transitions succeed
- **Iterations**: 20

---

## 5. SECURITY TESTS (1 test × 20 iterations = 20 total)

### 5.1 SQL Injection Prevention
- **Purpose**: Verify SQL injection protection
- **Input**: Various malicious strings:
  - `'; DROP TABLE events; --`
  - `1; DELETE FROM users; --`
  - `' OR '1'='1`
  - `'; UPDATE users SET role='superadmin'; --`
- **Expected**: 
  - Input stored as literal string
  - Tables remain intact
  - No SQL execution
- **Iterations**: 20

---

## 6. CONCURRENT OPERATIONS (1 test × 20 iterations = 20 total)

### 6.1 Concurrent Creation
- **Purpose**: Test race condition handling
- **Input**: 3 simultaneous event creations
- **Expected**: At least 2/3 succeed (allowing for minor conflicts)
- **Iterations**: 20

---

## 7. QUERY EDGE CASES (2 tests × 20 iterations = 40 total)

### 7.1 Pagination Boundary
- **Purpose**: Test pagination at boundaries
- **Steps**:
  1. Create 15 events
  2. Query page 1 (0-9): expect 10
  3. Query page 2 (10-19): expect 5
- **Expected**: Correct counts on each page
- **Iterations**: 20

### 7.2 Sorting Order
- **Purpose**: Test ORDER BY functionality
- **Input**: 5 events with different dates
- **Expected**: Ascending sort returns dates in order
- **Iterations**: 20

---

## Summary

| Category | Tests | Iterations | Total |
|----------|-------|------------|-------|
| User Edge Cases | 4 | 20 | 80 |
| Event Edge Cases | 13 | 20 | 260 |
| Attendee Edge Cases | 3 | 20 | 60 |
| Listing Edge Cases | 4 | 20 | 80 |
| Security Tests | 1 | 20 | 20 |
| Concurrent Operations | 1 | 20 | 20 |
| Query Edge Cases | 2 | 20 | 40 |
| **TOTAL** | **28** | **20 each** | **560** |

---

## Running the Tests

### Prerequisites
1. Configure Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Ensure database schema is set up (run `scripts/supabase-schema.sql`)

### Execute Tests
```bash
node edge-case-tests.js
```

### Output
- Console: Real-time progress with ✓/✗ indicators
- File: `edge-case-results.json` with detailed results

---

## Expected Results

### Pass Criteria
- **Success Rate**: ≥95% (532/560 iterations)
- **Critical Tests**: 100% pass rate required for:
  - SQL Injection Prevention
  - Event Soft Delete
  - Attendee Check-In Toggle

### Known Limitations
- Very long fields may be truncated by database constraints
- Negative capacity behavior depends on schema constraints
- Concurrent operations may have minor failures due to race conditions

---

## Test Files

| File | Purpose |
|------|---------|
| `edge-case-tests.js` | Main test suite with retry logic |
| `comprehensive-test-suite.js` | Extended test suite |
| `edge-case-results.json` | Test results output |
| `EDGE_CASE_TEST_DOCUMENTATION.md` | This documentation |

---

## Cleanup

All tests automatically clean up created data after each iteration. If tests are interrupted, run:

```sql
-- Clean up test data
DELETE FROM attendees WHERE name LIKE 'EDGE_%';
DELETE FROM events WHERE title LIKE 'EDGE_%';
DELETE FROM listings WHERE title LIKE 'EDGE_%';
DELETE FROM users WHERE email LIKE 'edge_%@test.com';
```
