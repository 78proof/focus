
import React, { useState, useEffect } from 'react';
import { Email, CalendarEvent } from '../types';
import { GoogleService } from '../services/googleService';

interface GoogleProps {
  emails: Email[];
  events: CalendarEvent[];
  onDataUpdate: (emails: Email[], events: CalendarEvent[]) => void;
  onRequestSettings: () => void;
}

const GoogleIntegration: React.FC<GoogleProps> = ({ emails, events, onDataUpdate, onRequestSettings }) => {
  const [view, setView] = useState<'mail' | 'calendar'>('mail');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await GoogleService.login();
      const [mail, cal] = await Promise.all([
        GoogleService.fetchEmails(),
        GoogleService.fetchEvents()
      ]);
      onDataUpdate(mail, cal);
      setIsConnected(true);
    } catch (err: any) {
      if (err.message === "GOOGLE_CLIENT_ID_MISSING") {
        onRequestSettings();
      } else {
        alert("Google Sign-in failed. Ensure your Client ID is correct.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-zinc-900 dark:bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
           <svg className="w-10 h-10 text-white dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.2-1.84 4.12-1.16 1.16-2.92 2.4-5.92 2.4-4.8 0-8.68-3.88-8.68-8.68s3.88-8.68 8.68-8.68c2.6 0 4.56 1.04 5.96 2.36l2.32-2.32C18.6 1.12 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c3.72 0 6.52-1.24 8.72-3.52 2.28-2.28 3-5.48 3-8.08 0-.8-.08-1.52-.2-2.24H12.48z"/>
           </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Personal Workspace</h2>
        <p className="text-gray-400 dark:text-zinc-500 mb-10 leading-relaxed max-w-xs font-bold text-sm">
          Connect your Gmail and Google Calendar. No corporate Azure setup required.
        </p>
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full max-w-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all"
        >
          {isLoading ? "Syncing..." : "Sign in with Google"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe border-b border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tighter">Live Sync</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setView('mail')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'mail' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-gray-400'}`}
            >
              Gmail ({emails.length})
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-gray-400'}`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-hide">
        {view === 'mail' ? (
          <div className="space-y-4">
            {emails.map(email => (
              <div key={email.id} className="p-6 rounded-[2.2rem] bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 transition-all active:scale-[0.98]">
                <div className="flex justify-between mb-1">
                  <span className="font-black text-blue-600 text-[9px] uppercase tracking-widest truncate max-w-[150px]">{email.from}</span>
                  {email.isImportant && <span className="bg-amber-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Starred</span>}
                </div>
                <h3 className="font-black text-gray-900 dark:text-zinc-100 text-sm mb-2">{email.subject}</h3>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{email.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="flex p-5 rounded-[2.2rem] bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800">
                <div className="w-12 border-r border-gray-200 dark:border-zinc-800 mr-4 flex flex-col justify-center">
                   <p className="text-lg font-black text-zinc-900 dark:text-white">{new Date(event.start).getHours()}</p>
                   <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">AM/PM</p>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-zinc-100 text-sm">{event.summary}</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{event.location || 'Google Meet'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleIntegration;
