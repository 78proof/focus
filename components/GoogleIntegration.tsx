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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await GoogleService.login();
      const [mail, cal] = await Promise.all([
        GoogleService.fetchEmails(),
        GoogleService.fetchEvents()
      ]);
      onDataUpdate(mail, cal);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Google Auth Interaction Error:", err);
      if (err.message === "GOOGLE_CLIENT_ID_MISSING") {
        onRequestSettings();
      } else if (err.error === "idpiframe_initialization_failed") {
        setError("Domain Mismatch. Check your Google Console Authorized Origins.");
      } else {
        setError("Handshake Failed. Check console for URI error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-midnight items-center justify-center p-12 text-center animate-reveal">
        <div className="w-28 h-28 bg-ghost rounded-full flex items-center justify-center mb-16 shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/10">
           <svg className="w-12 h-12 text-midnight" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.2-1.84 4.12-1.16 1.16-2.92 2.4-5.92 2.4-4.8 0-8.68-3.88-8.68-8.68s3.88-8.68 8.68-8.68c2.6 0 4.56 1.04 5.96 2.36l2.32-2.32C18.6 1.12 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c3.72 0 6.52-1.24 8.72-3.52 2.28-2.28 3-5.48 3-8.08 0-.8-.08-1.52-.2-2.24H12.48z"/>
           </svg>
        </div>
        <h2 className="text-6xl font-thin text-ghost tracking-tighter mb-6 italic">SYNC</h2>
        <p className="text-haze mb-20 leading-relaxed max-w-[280px] font-light text-[13px] uppercase tracking-[0.5em]">
          Authorize workspace synchronization.
        </p>
        
        {error && (
          <div className="mb-10 p-6 rounded-3xl bg-red-950/20 border border-red-900/30">
            <p className="text-red-400 text-[10px] font-mono uppercase tracking-widest">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full max-w-xs btn-nordic py-7 text-[13px] shadow-2xl disabled:opacity-30"
        >
          {isLoading ? "Negotiating..." : "Connect Identity"}
        </button>
        
        <button 
          onClick={onRequestSettings}
          className="mt-16 text-[10px] text-zinc-700 font-light uppercase tracking-[0.8em] hover:text-ghost transition-colors"
        >
          Configure Client ID
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-midnight overflow-hidden animate-reveal">
      <div className="p-10 pt-safe bg-nordic/40 backdrop-blur-3xl border-b border-white/5">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-thin tracking-tighter italic">HUB</h2>
          <div className="flex bg-midnight/50 p-1.5 rounded-full border border-white/5">
            <button 
              onClick={() => setView('mail')}
              className={`px-10 py-3 rounded-full text-[11px] font-light uppercase tracking-widest transition-all ${view === 'mail' ? 'bg-ghost text-midnight' : 'text-zinc-600'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-10 py-3 rounded-full text-[11px] font-light uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-ghost text-midnight' : 'text-zinc-600'}`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 pb-52 scrollbar-hide space-y-8">
        {view === 'mail' ? (
          emails.length > 0 ? emails.map(email => (
            <div key={email.id} className="p-12 nordic-card active:scale-[0.98]">
              <div className="flex justify-between mb-8 opacity-40">
                <span className="mono-tag text-[9px] truncate max-w-[220px]">{email.from}</span>
              </div>
              <h3 className="font-thin text-ghost text-3xl mb-6 tracking-tighter leading-tight">{email.subject}</h3>
              <p className="text-[14px] text-haze leading-relaxed font-light tracking-tight line-clamp-2 uppercase italic">{email.snippet}</p>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-96 opacity-10">
               <p className="mono-tag">Stream Offline</p>
            </div>
          )
        ) : (
          events.length > 0 ? events.map(event => (
            <div key={event.id} className="flex p-12 nordic-card items-center space-x-12">
              <div className="w-20 flex-shrink-0 flex flex-col justify-center border-r border-white/5 pr-8">
                 <p className="text-5xl font-thin text-ghost tracking-tighter leading-none">{new Date(event.start).getHours()}</p>
                 <p className="mono-tag mt-3">HRS</p>
              </div>
              <div className="flex-1">
                <h3 className="font-thin text-ghost text-3xl tracking-tighter leading-tight">{event.summary}</h3>
                <p className="mono-tag text-zinc-600 mt-6">{event.location || 'Global Session'}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-96 opacity-10">
               <p className="mono-tag">Agenda Clear</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GoogleIntegration;