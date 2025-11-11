import Dexie from 'dexie';

export const db = new Dexie('EventLiteDB');

db.version(1).stores({
  events: '++id, title, date',
  attendees: '++id, eventId, name, email, contact, attended',
});

// Helper functions
export const saveEvent = async (eventData) => {
  try {
    const id = await db.events.put(eventData);
    return id;
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
};

export const getEvent = async (id) => {
  try {
    return await db.events.get(id);
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    return await db.events.toArray();
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    await db.attendees.where('eventId').equals(id).delete();
    await db.events.delete(id);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const saveAttendee = async (attendeeData) => {
  try {
    const id = await db.attendees.add(attendeeData);
    return id;
  } catch (error) {
    console.error('Error saving attendee:', error);
    throw error;
  }
};

export const getAttendeesByEvent = async (eventId) => {
  try {
    return await db.attendees.where('eventId').equals(eventId).toArray();
  } catch (error) {
    console.error('Error getting attendees:', error);
    throw error;
  }
};

export const updateAttendeeStatus = async (id, attended) => {
  try {
    await db.attendees.update(id, { attended });
  } catch (error) {
    console.error('Error updating attendee:', error);
    throw error;
  }
};

export const searchAttendees = async (eventId, query) => {
  try {
    const attendees = await db.attendees.where('eventId').equals(eventId).toArray();
    const lowerQuery = query.toLowerCase();
    return attendees.filter(a => 
      a.name.toLowerCase().includes(lowerQuery) ||
      a.email.toLowerCase().includes(lowerQuery) ||
      (a.contact && a.contact.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching attendees:', error);
    throw error;
  }
};
