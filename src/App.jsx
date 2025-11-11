import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EventList from './pages/EventList';
import EventForm from './pages/EventForm';
import EventDetails from './pages/EventDetails';
import FlyerView from './pages/FlyerView';
import RegistrationForm from './pages/RegistrationForm';
import CheckIn from './pages/CheckIn';

function App() {
  return (
    <Router basename="/event">
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/new" element={<EventForm />} />
          <Route path="/:id/edit" element={<EventForm />} />
          <Route path="/:id" element={<EventDetails />} />
          <Route path="/:id/flyer" element={<FlyerView />} />
          <Route path="/:id/register" element={<RegistrationForm />} />
          <Route path="/:id/checkin" element={<CheckIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
