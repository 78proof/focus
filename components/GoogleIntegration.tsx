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
      if (err.message === "GOOGLE_CLIENT_ID_MISSING") {
        onRequestSettings();
      } else {
        console.error("Google Auth Error", err);
        setError("Access Denied. Check Test User permissions.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-black items-center justify-center p-12 text-center animate-reveal">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(255,255,255,0.1)]">
           <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.2-1.84 4.12-1.16 1.16-2.92 2.4-5.92 2.4-4.8 0-8.68-3.88-8.68-8.68s3.88-8.68 8.68-8.68c2.6 0 4.56 1.04 5.96 2.36l2.32-2.32C18.6 1.12 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c3.72 0 6.52-1.24 8.72-3.52 2.28-2.28 3-5.48 3-8.08 0-.8-.08-1.52-.2-2.24H12.48z"/>
           </svg>
        </div>
        <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4">SYNC.</h2>
        <p className="text-zinc-600 mb-16 leading-relaxed max-w-[240px] font-bold text-[10px] uppercase tracking-[0.4em]">
          Establish secure handshake with workspace.
        </p>
        
        {error && <p className="text-white text-[10px] font-black uppercase mb-8 opacity-50">{error}</p>}
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full max-w-xs bg-white text-black py-7 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
        >
          {isLoading ? "Negotiating..." : "Connect Google"}
        </button>
        
        <button 
          onClick={onRequestSettings}
          className="mt-12 text-[8px] text-zinc-800 font-black uppercase tracking-widest hover:text-zinc-400 transition-colors"
        >
          Adjust Configuration
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden animate-reveal">
      <div className="p-10 pt-safe border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-black tracking-tighter italic">HUB.</h2>
          <div className="flex glass-pill p-1.5 rounded-full">
            <button 
              onClick={() => setView('mail')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'mail' ? 'bg-white text-black shadow-xl' : 'text-zinc-600'}`}
            >
              Stream
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-white text-black shadow-xl' : 'text-zinc-600'}`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-48 scrollbar-hide space-y-8">
        {view === 'mail' ? (
          emails.length > 0 ? emails.map(email => (
            <div key={email.id} className="p-10 rounded-6xl glass-pill transition-all active:scale-[0.98]">
              <div className="flex justify-between mb-6">
                <span className="mono-label text-zinc-500 truncate max-w-[200px]">{email.from}</span>
              </div>
              <h3 className="font-black text-white text-2xl mb-4 tracking-tighter leading-tight">{email.subject}</h3>
              <p className="text-[12px] text-zinc-600 leading-relaxed font-bold tracking-tight line-clamp-2 uppercase italic">{email.snippet}</p>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-20">
               <p className="mono-label">Zero Mails</p>
            </div>
          )
        ) : (
          events.length > 0 ? events.map(event => (
            <div key={event.id} className="flex p-10 rounded-6xl glass-pill items-center space-x-10">
              <div className="w-16 flex-shrink-0 flex flex-col justify-center border-r border-white/10 pr-6">
                 <p className="text-4xl font-black text-white tracking-tighter leading-none">{new Date(event.start).getHours()}</p>
                 <p className="mono-label text-zinc-700 mt-2">H</p>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white text-2xl tracking-tighter leading-tight">{event.summary}</h3>
                <p className="mono-label text-zinc-500 mt-4">{event.location || 'Distributed'}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-20">
               <p className="mono-label">Agenda Clear</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GoogleIntegration;