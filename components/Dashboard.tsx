
import React from 'react';
import { Note, Email, CalendarEvent, Theme } from '../types';

interface DashboardProps {
  notes: Note[];
  emails: Email[];
  events: CalendarEvent[];
  theme: Theme;
  onToggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ notes, emails, events, theme, onToggleTheme }) => {
  const importantEmails = emails.filter(e => e.isImportant).slice(0, 3);
  const recentNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  return (
    <div className="p-6 overflow-y-auto h-full space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Daily Focus</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Ready for your work session?</p>
        </div>
        <button 
          onClick={onToggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-300"
        >
          {theme === 'light' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" /></svg>
          )}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Events</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{events.length}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
          <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">Mails</p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{emails.length}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Meetings</h2>
        <div className="space-y-3">
          {events.length > 0 ? events.map(event => (
            <div key={event.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                {new Date(event.start).getHours()}:00
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-zinc-200">{event.subject}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500">{event.location || 'Online'}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 italic">No more meetings today.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Urgent Emails</h2>
        <div className="space-y-3">
          {importantEmails.map(email => (
            <div key={email.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border-l-4 border-red-500 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-red-500">{email.from}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-600">
                  {new Date(email.receivedDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-200 text-sm line-clamp-1">{email.subject}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-1">{email.snippet}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
