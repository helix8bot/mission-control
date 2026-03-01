"use client";

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  name: string;
  type: string;
  schedule: string;
  tz: string;
  description: string;
  nextRun?: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/calendar.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading calendar:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading calendar...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div className="bg-white shadow-md rounded-md p-4">
        {events.map(event => (
          <div key={event.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
            <h3 className="text-lg font-medium">{event.name}</h3>
            <p className="text-gray-500 text-sm">{event.description}</p>
            <p className="text-gray-400 text-xs mt-1">Type: {event.type} | Schedule: {event.schedule}</p>
            {event.nextRun && <p className="text-gray-400 text-xs">Next run: {new Date(event.nextRun).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
