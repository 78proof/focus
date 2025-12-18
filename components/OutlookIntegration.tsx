
import React, { useState, useEffect } from 'react';
import { Email, CalendarEvent } from '../types';
import { OutlookService } from '../services/outlookService';

interface OutlookProps {
  emails: Email[];
  events: CalendarEvent[];
  onDataUpdate: (emails: Email[], events: CalendarEvent[]) => void;
  onRequestSettings: () => void;
}

const OutlookIntegration: React.FC<OutlookProps> = ({ emails, events, onDataUpdate, onRequestSettings }) => {
  const [view, setView] = useState<'mail' | 'calendar'>('mail');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorType, setErrorType] = useState<'MISSING_ID' | 'ADMIN_CONSENT' | 'OTHER' | null>(null);

  const handleConnect = async () => {
    setErrorType(null);
    setIsConnecting(true);
    try {
      await OutlookService.login();
      const mail = await OutlookService.fetchEmails();
      const calendar = await OutlookService.fetchEvents();
      onDataUpdate(mail, calendar);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Login Error Details:", err);
      if (err.message === "CLIENT_ID_MISSING") {
        setErrorType("MISSING_ID");
      } else if (err.errorMessage?.includes("AADSTS7000112") || err.message?.includes("consent")) {
        // This is the specific Microsoft error for admin consent
        setErrorType("ADMIN_CONSENT");
      } else {
        setErrorType("OTHER");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8">
           <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 0L0 0V24L24 24V0L12 0ZM22 22H2V2H22V22Z"/>
           </svg>
        </div>
        
        {errorType === "ADMIN_CONSENT" ? (
          <div className="animate-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Admin Approval Needed</h2>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] text-left mb-8 border border-red-100 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-400 font-bold mb-3">Your organization (lebua.com) requires an IT admin to approve this app.</p>
              <ol className="text-xs text-red-600/80 dark:text-red-400/60 space-y-2 list-decimal ml-4 font-bold">
                <li>Go to Azure Portal -> App Registrations.</li>
                <li>Select "OmniWork" -> "API Permissions".</li>
                <li>Click "Grant admin consent for lebua.com".</li>
              </ol>
            </div>
            <button
              onClick={handleConnect}
              className="w-full max-w-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all mb-4"
            >
              Try Again
            </button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer" onClick={() => setErrorType(null)}>Back to Sign In</p>
          </div>
        ) : errorType === "MISSING_ID" ? (
          <>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Connection Error</h2>
            <p className="text-gray-500 dark:text-zinc-500 mb-8 leading-relaxed max-w-xs">
              No Client ID found. Please update your settings to link your workspace.
            </p>
            <button
              onClick={onRequestSettings}
              className="w-full max-w-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all"
            >
              Open Connection Hub
            </button>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Work Hub</h2>
            <p className="text-gray-500 dark:text-zinc-500 mb-12 leading-relaxed max-w-xs mx-auto">
              Access your real Outlook unread mail and today's schedule. 
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center"
            >
              {isConnecting ? "Connecting..." : "Sign In with Microsoft"}
            </button>
            {errorType === "OTHER" && (
              <p className="mt-6 text-sm text-red-500 font-bold animate-pulse">Sign-in failed. Check pop-up blockers.</p>
            )}
          </>
        )}
        
        <p className="mt-10 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">OAuth 2.0 Secure Channel</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Live Workspace</h2>
          <button 
            onClick={async () => {
              const mail = await OutlookService.fetchEmails();
              const calendar = await OutlookService.fetchEvents();
              onDataUpdate(mail, calendar);
            }}
            className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
        <div className="flex bg-gray-200 dark:bg-zinc-800 rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => setView('mail')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              view === 'mail' ? 'bg-white dark:bg-zinc-700 shadow-xl text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Unread ({emails.length})
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              view === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-xl text-blue-600 dark:text-blue-400' : 'text-gray-500'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-hide">
        {view === 'mail' ? (
          <div className="space-y-4">
            {emails.length === 0 && (
              <div className="text-center mt-20 opacity-30">
                <p className="font-black uppercase tracking-widest text-xs">Inbox Cleared</p>
              </div>
            )}
            {emails.map((email) => (
              <div key={email.id} className="p-5 rounded-[2.2rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all active:scale-[0.98]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-wider">{email.from}</span>
                  {email.isImportant && (
                    <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Urgent</span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 dark:text-zinc-100 text-[15px] mb-2 leading-tight">{email.subject}</h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">{email.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             {events.length === 0 && <p className="text-center text-gray-400 mt-20 font-bold">No events today.</p>}
             {events.map((event) => (
              <div key={event.id} className="flex space-x-4 p-5 rounded-[2.2rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="w-12 flex-shrink-0 text-center flex flex-col justify-center border-r border-gray-50 dark:border-zinc-800 pr-4">
                  <p className="text-lg font-black text-gray-900 dark:text-zinc-100">
                    {new Date(event.start).getHours()}
                  </p>
                  <p className="text-[8px] font-black text-gray-400 uppercase">HRS</p>
                </div>
                <div className="flex-1">
                  {/* Fix: Use summary instead of subject for CalendarEvent */}
                  <h3 className="font-black text-gray-900 dark:text-zinc-100 text-md">{event.summary}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-bold uppercase tracking-widest">
                    {event.location}
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
