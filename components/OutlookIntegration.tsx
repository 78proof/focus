
import React, { useState } from 'react';
import { Email, CalendarEvent } from '../types';

interface OutlookProps {
  emails: Email[];
  events: CalendarEvent[];
}

const OutlookIntegration: React.FC<OutlookProps> = ({ emails, events }) => {
  const [view, setView] = useState<'mail' | 'calendar'>('mail');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Outlook Workspace</h2>
        <div className="flex mt-4 bg-gray-200 dark:bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setView('mail')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              view === 'mail' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Mail
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              view === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Schedule
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {view === 'mail' ? (
          <div className="space-y-4">
            {emails.map((email) => (
              <div key={email.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">{email.from}</span>
                  {email.isImportant && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">URGENT</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-200 text-sm mb-1">{email.subject}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2">{email.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             {events.map((event) => (
              <div key={event.id} className="flex space-x-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="w-16 flex-shrink-0 text-center border-r border-gray-100 dark:border-zinc-800 pr-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-gray-400">Start</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-zinc-200">{event.subject}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location || 'Remote'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlookIntegration;
