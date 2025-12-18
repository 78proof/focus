
import React, { useState } from 'react';
import { Email, CalendarEvent } from '../types';

interface OutlookProps {
  emails: Email[];
  events: CalendarEvent[];
}

const OutlookIntegration: React.FC<OutlookProps> = ({ emails, events }) => {
  const [view, setView] = useState<'mail' | 'calendar'>('mail');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth Login Flow
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-8 animate-in zoom-in duration-500">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.5 1h-10c-.8 0-1.5.7-1.5 1.5v21c0 .8.7 1.5 1.5 1.5h10c.8 0 1.5-.7 1.5-1.5v-21c0-.8-.7-1.5-1.5-1.5zm.5 22.5c0 .3-.2.5-.5.5h-10c-.3 0-.5-.2-.5-.5v-21c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v21zM23 4.5h-8c-.8 0-1.5.7-1.5 1.5v12c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5v-12c0-.8-.7-1.5-1.5-1.5zm.5 13.5c0 .3-.2.5-.5.5h-8c-.3 0-.5-.2-.5-.5v-12c0-.3.2-.5.5-.5h8c.3 0 .5.2.5.5v12z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Connect Outlook</h2>
        <p className="text-gray-500 dark:text-zinc-500 mb-10 leading-relaxed">
          Access your work emails and calendar directly in OmniWork. We'll use your schedule to help Gemini provide smarter meeting notes.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          {isConnecting ? (
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
            </div>
          ) : (
            <>
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0L0 0V24L24 24V0L12 0ZM22 22H2V2H22V22Z"/></svg>
              Sign In with Microsoft
            </>
          )}
        </button>
        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure OAuth 2.0 Connection</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Outlook Workspace</h2>
          <button onClick={() => setIsConnected(false)} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Logout</button>
        </div>
        <div className="flex bg-gray-200 dark:bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setView('mail')}
            className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${
              view === 'mail' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Mail
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${
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
              <div key={email.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all active:bg-gray-50 dark:active:bg-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-blue-700 dark:text-blue-400 text-xs">{email.from}</span>
                  {email.isImportant && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">IMPORTANT</span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 dark:text-zinc-200 text-sm mb-1">{email.subject}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">{email.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             {events.map((event) => (
              <div key={event.id} className="flex space-x-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-transform">
                <div className="w-16 flex-shrink-0 text-center border-r border-gray-100 dark:border-zinc-800 pr-4">
                  <p className="text-sm font-black text-gray-900 dark:text-zinc-200">
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Start</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 dark:text-zinc-200">{event.subject}</h3>
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
