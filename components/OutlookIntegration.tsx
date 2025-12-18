
import React, { useState, useEffect } from 'react';
import { Email, CalendarEvent } from '../types';
import { OutlookService } from '../services/outlookService';

interface OutlookProps {
  emails: Email[];
  events: CalendarEvent[];
  onDataUpdate: (emails: Email[], events: CalendarEvent[]) => void;
}

const OutlookIntegration: React.FC<OutlookProps> = ({ emails, events, onDataUpdate }) => {
  const [view, setView] = useState<'mail' | 'calendar'>('mail');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await OutlookService.login();
      const mail = await OutlookService.fetchEmails();
      const calendar = await OutlookService.fetchEvents();
      onDataUpdate(mail, calendar);
      setIsConnected(true);
    } catch (error) {
      alert("Real Outlook connection failed. Please ensure your browser allows popups.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const mail = await OutlookService.fetchEmails();
      const calendar = await OutlookService.fetchEvents();
      onDataUpdate(mail, calendar);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-10 animate-in zoom-in duration-500">
           <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 0L0 0V24L24 24V0L12 0ZM22 22H2V2H22V22Z"/>
           </svg>
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Live Outlook</h2>
        <p className="text-gray-500 dark:text-zinc-500 mb-12 leading-relaxed max-w-xs mx-auto">
          Connect your actual work account. Gemini will be able to see your schedule and summarize your unread mail.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center"
        >
          {isConnecting ? (
            <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Waiting for Login...
            </span>
          ) : "Sign In with Microsoft"}
        </button>
        <p className="mt-8 text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">OAuth 2.0 Secure Protocol</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Work Desk</h2>
          <button 
            onClick={handleRefresh}
            className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
        <div className="flex bg-gray-200 dark:bg-zinc-800 rounded-2xl p-1.5">
          <button
            onClick={() => setView('mail')}
            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
              view === 'mail' ? 'bg-white dark:bg-zinc-700 shadow-xl text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Inbox ({emails.length})
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
              view === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-xl text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Today's Events
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-hide">
        {view === 'mail' ? (
          <div className="space-y-4">
            {emails.length === 0 && <p className="text-center text-gray-400 mt-20 font-bold">No emails found or access denied.</p>}
            {emails.map((email) => (
              <div key={email.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wider">{email.from}</span>
                  {email.isImportant && (
                    <span className="bg-red-500 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-red-500/20">HOT</span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 dark:text-zinc-100 text-lg mb-2 leading-tight">{email.subject}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-3 leading-relaxed">{email.snippet}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800 flex justify-between">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     {new Date(email.receivedDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Summarize</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             {events.length === 0 && <p className="text-center text-gray-400 mt-20 font-bold">Your schedule is clear today.</p>}
             {events.map((event) => (
              <div key={event.id} className="flex space-x-5 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="w-14 flex-shrink-0 text-center flex flex-col justify-center">
                  <p className="text-lg font-black text-gray-900 dark:text-zinc-100">
                    {new Date(event.start).getHours()}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">HRS</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 dark:text-zinc-100 text-lg">{event.subject}</h3>
                  <div className="flex items-center mt-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                     <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                       {event.location || 'Microsoft Teams'}
                     </p>
                  </div>
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
