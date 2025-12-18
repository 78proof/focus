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
    // Load the Google Script if not present
    if (!document.getElementById('google-gis-sdk')) {
      const script = document.createElement('script');
      script.id = 'google-gis-sdk';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await GoogleService.login();
      if (!token) throw new Error("No token received. Popup might have been closed.");
      
      const [mail, cal] = await Promise.all([
        GoogleService.fetchEmails(),
        GoogleService.fetchEvents()
      ]);
      
      onDataUpdate(mail, cal);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Connection Error:", err);
      if (err.message === "GOOGLE_CLIENT_ID_MISSING") {
        onRequestSettings();
      } else if (err.error === "popup_closed_by_user") {
        setError("Login popup was closed. Please try again.");
      } else if (err.error === "access_denied") {
        setError("Access denied. Please check 'Authorized Origins' in Google Console.");
      } else {
        setError(err.message || "Connection failed. Check your Credentials Hub settings.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-midnight items-center justify-center p-12 text-center animate-reveal relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6"></div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Authorizing...</p>
          </div>
        )}

        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl transition-transform hover:scale-110">
           <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.2-1.84 4.12-1.16 1.16-2.92 2.4-5.92 2.4-4.8 0-8.68-3.88-8.68-8.68s3.88-8.68 8.68-8.68c2.6 0 4.56 1.04 5.96 2.36l2.32-2.32C18.6 1.12 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c3.72 0 6.52-1.24 8.72-3.52 2.28-2.28 3-5.48 3-8.08 0-.8-.08-1.52-.2-2.24H12.48z"/>
           </svg>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">Identity</h2>
        <p className="text-gray-400 mb-12 leading-relaxed max-w-[260px] font-bold text-[11px] uppercase tracking-widest mx-auto">
          Establish secure handshake with workspace provider.
        </p>
        
        {error && (
          <div className="mb-10 p-6 nordic-card border-red-500/40 bg-red-950/20 text-left animate-in fade-in slide-in-from-top-2">
            <p className="text-red-400 text-[10px] font-black uppercase tracking-wider mb-2">Protocol Denied</p>
            <p className="text-gray-300 text-[11px] font-bold leading-relaxed">
              {error}
            </p>
          </div>
        )}
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full max-w-xs btn-nordic py-6 text-[14px] shadow-2xl disabled:opacity-30 active:scale-95 transition-all"
        >
          {isLoading ? "Negotiating..." : "Synchronize Google"}
        </button>
        
        <button 
          onClick={onRequestSettings}
          className="mt-12 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] hover:text-white transition-colors underline decoration-white/20"
        >
          Credentials Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-midnight overflow-hidden animate-reveal">
      <div className="p-8 pt-safe bg-nordic/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black tracking-tighter italic text-white uppercase">Hub</h2>
          <div className="flex bg-midnight p-1 rounded-full ring-1 ring-white/10">
            <button 
              onClick={() => setView('mail')}
              className={`px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'mail' ? 'bg-white text-black' : 'text-gray-500'}`}
            >
              Stream
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-white text-black' : 'text-gray-500'}`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-48 scrollbar-hide space-y-6">
        {view === 'mail' ? (
          emails.length > 0 ? emails.map(email => (
            <div key={email.id} className="p-8 nordic-card transition-all active:scale-[0.98] hover:bg-white/5">
              <div className="flex justify-between mb-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate max-w-[180px]">{email.from}</span>
                {email.isImportant && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
              </div>
              <h3 className="font-bold text-white text-xl mb-3 tracking-tight leading-snug">{email.subject}</h3>
              <p className="text-[13px] text-gray-300 leading-relaxed font-medium line-clamp-2 italic">{email.snippet}</p>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-20 space-y-6">
               <p className="mono-tag">Stream Clear</p>
               <button 
                onClick={handleConnect}
                className="text-[9px] font-black uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all"
               >Force Refresh</button>
            </div>
          )
        ) : (
          events.length > 0 ? events.map(event => (
            <div key={event.id} className="flex p-8 nordic-card items-center space-x-8 hover:bg-white/5 transition-all">
              <div className="w-16 flex-shrink-0 flex flex-col justify-center border-r border-white/10 pr-4">
                 <p className="text-3xl font-black text-white tracking-tighter leading-none">{new Date(event.start).getHours()}</p>
                 <p className="mono-tag mt-2 text-gray-600">HRS</p>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-xl tracking-tight leading-tight">{event.summary}</h3>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2 truncate">{event.location || 'Global Protocol'}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-20 space-y-6">
               <p className="mono-tag">Agenda Idle</p>
               <button 
                onClick={handleConnect}
                className="text-[9px] font-black uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all"
               >Sync Calendar</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GoogleIntegration;