// Database Adapter - Supabase for production
import * as SupabaseDB from './supabaseDatabase.js';

// Database mode - Always Supabase for production
const databaseMode = 'supabase';

console.log('🚀 Database Adapter initialized - Using Supabase');

// ==================== USER OPERATIONS ====================

export const registerUser = async (userData) => {
  return await SupabaseDB.registerUser(userData);
};

export const loginUser = async (email, password) => {
  return await SupabaseDB.loginUser(email, password);
};

export const getUserByEmail = async (email) => {
  return await SupabaseDB.getUserByEmail(email);
};

export const getAllUsers = async () => {
  return await SupabaseDB.getAllUsers();
};

// ==================== EVENT OPERATIONS ====================

export const addEvent = async (eventData) => {
  return await SupabaseDB.createEvent(eventData);
};

export const createEvent = async (eventData) => {
  return await SupabaseDB.createEvent(eventData);
};

export const getEvent = async (eventId) => {
  return await SupabaseDB.getEvent(eventId);
};

export const getAllEvents = async () => {
  return await SupabaseDB.getAllEvents();
};

export const updateEvent = async (eventId, eventData) => {
  return await SupabaseDB.updateEvent(eventId, eventData);
};

export const deleteEvent = async (eventId) => {
  return await SupabaseDB.deleteEvent(eventId);
};

// ==================== ATTENDEE OPERATIONS ====================

export const registerAttendee = async (attendeeData) => {
  return await SupabaseDB.registerAttendee(attendeeData);
};

export const addAttendee = async (attendeeData) => {
  return await SupabaseDB.registerAttendee(attendeeData);
};

export const getAttendeesByEvent = async (eventId) => {
  return await SupabaseDB.getAttendeesByEvent(eventId);
};

export const updateAttendeeStatus = async (attendeeId, attended) => {
  return await SupabaseDB.updateAttendeeStatus(attendeeId, attended);
};

export const markAttendance = async (attendeeId, attended) => {
  return await SupabaseDB.updateAttendeeStatus(attendeeId, attended);
};

export const searchAttendees = async (eventId, query) => {
  return await SupabaseDB.searchAttendees(eventId, query);
};

// ==================== DATABASE STATUS ====================

export const getDatabaseMode = () => {
  return databaseMode;
};

export const getDatabaseStatus = async () => {
  return await SupabaseDB.getDatabaseStatus();
};

// ==================== ANALYTICS (Simplified) ====================

export const getEventAnalytics = async (eventId) => {
  const attendees = await SupabaseDB.getAttendeesByEvent(eventId);
  return {
    total_registered: attendees.length,
    total_attended: attendees.filter(a => a.attended).length,
    pending_registrations: attendees.filter(a => !a.attended).length
  };
};

export const getDashboardStats = async (userId = null) => {
  const events = await SupabaseDB.getAllEvents();
  const filteredEvents = userId ? events.filter(e => e.ownerId === userId) : events;
  
  let totalAttendees = 0;
  let totalAttended = 0;
  
  for (const event of filteredEvents) {
    const attendees = await SupabaseDB.getAttendeesByEvent(event.id);
    totalAttendees += attendees.length;
    totalAttended += attendees.filter(a => a.attended).length;
  }
  
  const upcomingEvents = filteredEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    return eventDate >= new Date();
  }).length;
  
  return {
    total_events: filteredEvents.length,
    total_attendees: totalAttendees,
    total_attended: totalAttended,
    upcoming_events: upcomingEvents
  };
};
