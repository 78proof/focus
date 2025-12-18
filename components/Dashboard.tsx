
import React from 'react';
import { Note, Email, CalendarEvent } from '../types';

interface DashboardProps {
  notes: Note[];
  emails: Email[];
  events: CalendarEvent[];
}

const Dashboard: React.FC<DashboardProps> = ({ notes, emails, events }) => {
  const importantEmails = emails.filter(e => e.isImportant).slice(0, 3);
  const recentNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  return (
    <div className="p-6 overflow-y-auto h-full space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Focus</h1>
        <p className="text-gray-500 mt-1">Ready for your work session?</p>
      </header>

      {/* Quick Stats/Alerts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-blue-600 text-sm font-semibold">Today's Events</p>
          <p className="text-2xl font-bold text-blue-900">{events.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
          <p className="text-orange-600 text-sm font-semibold">Pending Emails</p>
          <p className="text-2xl font-bold text-orange-900">{emails.length}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Upcoming Meetings</h2>
        </div>
        <div className="space-y-3">
          {events.length > 0 ? events.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                {new Date(event.start).getHours()}:00
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{event.subject}</h3>
                <p className="text-xs text-gray-500">{event.location || 'Online'}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 italic">No more meetings today.</p>
          )}
        </div>
      </section>

      {/* Important Emails */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-4">High Priority Emails</h2>
        <div className="space-y-3">
          {importantEmails.map(email => (
            <div key={email.id} className="bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-red-500">{email.from}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(email.receivedDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{email.subject}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{email.snippet}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Notes */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-4">Recent Notes</h2>
        <div className="space-y-3">
          {recentNotes.map(note => (
            <div key={note.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm">{note.title}</h3>
              {note.summary && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg italic">
                  {note.summary.split('\n')[0]}...
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
