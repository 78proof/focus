import React from 'react';
import { Note, Email, CalendarEvent, Theme } from '../types';

interface DashboardProps {
  notes: Note[];
  emails: Email[];
  events: CalendarEvent[];
  theme: Theme;
  onNewNote: () => void;
  onShowSettings: () => void;
  onToggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ notes, emails, events, theme, onNewNote, onShowSettings }) => {
  const recentNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp).slice(0, 2);

  return (
    <div className="p-10 h-full space-y-16 pb-48 overflow-y-auto scrollbar-hide bg-black animate-reveal">
      <header className="flex justify-between items-end pt-safe">
        <div>
          <h1 className="text-7xl font-black text-white italic tracking-tighter leading-[0.85]">OMNI<br/>WORK.</h1>
          <p className="mono-label mt-6">Workspace v3.14 — Active</p>
        </div>
        <button 
          onClick={onShowSettings} 
          className="w-16 h-16 glass-pill flex items-center justify-center active:scale-90"
        >
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </button>
      </header>

      {/* Hero Interaction */}
      <button 
        onClick={onNewNote}
        className="relative w-full bg-white text-black py-20 rounded-6xl shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center space-y-4 overflow-hidden"
      >
        <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <span className="font-black uppercase tracking-[0.8em] text-[11px] opacity-60">Initialize Session</span>
      </button>

      <div className="grid grid-cols-2 gap-10">
        <div className="p-12 glass-pill rounded-6xl flex flex-col items-center justify-center space-y-3">
          <p className="mono-label">Agenda</p>
          <p className="text-6xl font-black text-white">{events.length}</p>
        </div>
        <div className="p-12 glass-pill rounded-6xl flex flex-col items-center justify-center space-y-3">
          <p className="mono-label">Syncs</p>
          <p className="text-6xl font-black text-white">{emails.length}</p>
        </div>
      </div>

      <section>
        <h2 className="mono-label mb-10 ml-2">Priority Stream</h2>
        {events.length > 0 ? (
          <div className="p-12 rounded-6xl bg-zinc-900/50 border border-white/5 space-y-8">
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
              {new Date(events[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — INCOMING
            </p>
            <h3 className="text-4xl font-black text-white leading-tight tracking-tighter">{events[0].summary}</h3>
            <div className="flex items-center space-x-4 opacity-40 pt-4">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
               <p className="text-[10px] font-bold uppercase tracking-widest">
                 {events[0].location || 'Distributed Node'}
               </p>
            </div>
          </div>
        ) : (
          <div className="p-20 border border-dashed border-zinc-900 rounded-6xl text-center">
            <p className="text-zinc-800 font-black uppercase tracking-[0.4em] text-[10px]">Quiescence</p>
          </div>
        )}
      </section>

      <section className="pb-12">
        <h2 className="mono-label mb-10 ml-2">Recent Archives</h2>
        <div className="space-y-6">
          {recentNotes.length > 0 ? recentNotes.map(note => (
            <div key={note.id} className="p-10 glass-pill rounded-5xl">
               <div className="flex justify-between items-center mb-6">
                 <span className="mono-label text-zinc-600">Ref: {note.id.slice(-4)}</span>
                 <span className="mono-label text-zinc-700">
                   {new Date(note.timestamp).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="font-black text-white text-2xl tracking-tighter truncate">{note.title}</h3>
            </div>
          )) : (
            <p className="text-center text-zinc-900 font-black uppercase py-10 tracking-[0.5em] text-[9px]">Void</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;