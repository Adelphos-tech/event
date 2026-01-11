# EventsX Production Test Checklist
## Test URL: http://linkmeu.com/events

Wait 2-3 minutes after push for GitHub Pages to deploy, then test each item below.

---

## 1. Events List Page (`/events`)

### Display Tests
- [ ] Page loads without errors
- [ ] Header shows "EX" logo and "EventsX" text
- [ ] "New Event" button is visible
- [ ] Events are displayed in cards (if any exist)
- [ ] Each event card shows: title, date, venue, image/placeholder
- [ ] Share button works on each event card
- [ ] "Today", "Upcoming", "Past" labels show correctly

### Navigation Tests
- [ ] Clicking event card navigates to event details
- [ ] "New Event" button navigates to `/new`
- [ ] Logo click works (if applicable)

### Authentication Tests
- [ ] Logout button appears when logged in
- [ ] Admin Panel button appears for super admin
- [ ] Login state persists after page refresh

---

## 2. Create Event Page (`/new`)

### Page Load Tests
- [ ] Page loads with light theme (not dark)
- [ ] Header shows back arrow + logo
- [ ] "Create Your Event" title displays
- [ ] Event type tabs are visible (Conference, Workshop, etc.)
- [ ] Decorative illustration shows on right (desktop)

### Event Type Tabs
- [ ] All 6 tabs clickable: Conference, Workshop, Seminar, Meetup, Exhibition, Networking
- [ ] Selected tab has dark background
- [ ] Tab selection persists while filling form

### Date Fields
- [ ] From Date picker works
- [ ] To Date picker works
- [ ] Cannot select past dates for From Date
- [ ] To Date minimum is set to From Date
- [ ] Error shows if end date < start date

### Title Field
- [ ] Input accepts text
- [ ] Character counter shows (0/200)
- [ ] Counter updates as you type
- [ ] Error shows for empty title on blur
- [ ] Error shows for title < 3 characters

### Venue & Capacity Fields
- [ ] Venue input accepts text
- [ ] Capacity accepts only numbers
- [ ] Capacity rejects 0 or negative
- [ ] Capacity shows error for invalid values

### Contact Information (when not logged in)
- [ ] Contact field with country code dropdown
- [ ] Email field with validation
- [ ] Password field (min 6 chars)
- [ ] All fields show inline errors

### Description Field
- [ ] Textarea accepts text
- [ ] Character counter shows (0/5000)
- [ ] Counter updates as you type

### Image Uploads
- [ ] Logo upload button works
- [ ] Event Banner upload button works
- [ ] Preview shows after upload
- [ ] Rejects non-image files (shows error)
- [ ] Rejects files > 5MB (shows error)

### Dynamic Lists (Organisers, Speakers, etc.)
- [ ] "Add" button adds new item
- [ ] Counter shows (0/20)
- [ ] Text fields work in items
- [ ] Image upload works in items
- [ ] Delete button removes item
- [ ] Confirmation shows when deleting item with content
- [ ] Cannot add more than 20 items

### Form Submission
- [ ] Submit button shows "Pay & Submit Event $1"
- [ ] Button disabled when form has errors
- [ ] Loading spinner shows during submission
- [ ] Error summary shows if validation fails
- [ ] Successful submission redirects to /events

---

## 3. Edit Event Page (`/:id/edit`)

### Access Control
- [ ] Only super admin can access edit page
- [ ] Non-admin users get alert and redirect
- [ ] Invalid event ID shows error and redirects

### Page Load
- [ ] Loading spinner shows while fetching event
- [ ] Form populates with existing event data
- [ ] Title shows "Edit Event" instead of "Create"
- [ ] Submit button shows "Update Event"

### Edit Functionality
- [ ] Can modify all fields
- [ ] Past dates allowed for existing events
- [ ] Changes save correctly
- [ ] Redirect to /events after save

---

## 4. Event Details Page (`/:id`)

### Display Tests
- [ ] Event title displays
- [ ] Event dates display correctly
- [ ] Venue displays
- [ ] Description displays
- [ ] Event image/logo displays
- [ ] Organisers list displays
- [ ] Speakers list displays
- [ ] Sponsors list displays

### Action Buttons
- [ ] Register button works
- [ ] Share button copies link
- [ ] Edit button (admin only) works
- [ ] View Flyer button works

---

## 5. Registration Form (`/:id/register`)

- [ ] Form loads correctly
- [ ] Name field required
- [ ] Email field required with validation
- [ ] Contact field works
- [ ] Submit creates attendee record
- [ ] Success message shows
- [ ] Capacity warning shows if event is full

---

## 6. Check-In Page (`/:id/checkin`)

- [ ] Page loads for authorized users
- [ ] Attendee list displays
- [ ] Search/filter works
- [ ] Check-in toggle works
- [ ] Attendance count updates

---

## 7. Flyer View (`/:id/flyer`)

- [ ] Flyer displays event details
- [ ] Print-friendly layout
- [ ] QR code displays (if implemented)

---

## 8. Login Page (`/login`)

- [ ] Form displays correctly
- [ ] Email validation works
- [ ] Password field works
- [ ] Show/hide password toggle works
- [ ] "User not found" error for invalid email
- [ ] "Invalid password" error for wrong password
- [ ] Successful login redirects to /events
- [ ] Case-insensitive email (robocorpsg@gmail.com works)

---

## 9. Admin Dashboard (`/admin`)

- [ ] Only accessible to super admin
- [ ] Shows event statistics
- [ ] Database admin tools work

---

## 10. Cross-Browser Testing

Test on:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)

---

## 11. Edge Cases to Test

### Empty States
- [ ] Events list with no events shows "No Events Yet"
- [ ] Dynamic lists with no items show placeholder text

### Error Handling
- [ ] Network error during form submission
- [ ] Invalid event ID in URL
- [ ] Expired session handling

### Performance
- [ ] Page loads within 3 seconds
- [ ] Image uploads don't freeze UI
- [ ] Form validation is responsive

---

## Test Credentials

**Super Admin:**
- Email: `robocorpsg@gmail.com`
- Password: `Admin@7990`

---

## How to Report Issues

For each failed test, note:
1. Test case name
2. Expected behavior
3. Actual behavior
4. Browser/device used
5. Screenshot if possible

---

## Deployment Status

After pushing changes, GitHub Pages typically takes 2-3 minutes to deploy.

Check deployment status at:
https://github.com/Adelphos-tech/event/actions
