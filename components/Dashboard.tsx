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
    <div className="p-10 h-full space-y-20 pb-52 overflow-y-auto scrollbar-hide bg-midnight animate-reveal">
      <header className="flex justify-between items-start pt-safe">
        <div>
          <h1 className="text-8xl font-thin text-ghost tracking-tighter leading-[0.8]">OMNI</h1>
          <p className="mono-tag mt-6">Protocol v4.0.0 — Synchronized</p>
        </div>
        <button 
          onClick={onShowSettings} 
          className="w-16 h-16 nordic-card flex items-center justify-center active:scale-90"
        >
          <svg className="w-5 h-5 text-haze" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </button>
      </header>

      {/* Nordic Action Area */}
      <button 
        onClick={onNewNote}
        className="group relative w-full bg-ghost text-midnight py-24 rounded-[4rem] shadow-2xl flex flex-col items-center justify-center space-y-6 overflow-hidden active:scale-[0.98] transition-transform"
      >
        <div className="w-20 h-20 rounded-full bg-midnight/5 border border-midnight/10 flex items-center justify-center">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <span className="font-light uppercase tracking-[0.8em] text-[12px] opacity-60">Initialize Audio Node</span>
      </button>

      <div className="grid grid-cols-2 gap-8">
        <div className="p-12 nordic-card flex flex-col items-center justify-center space-y-4">
          <p className="mono-tag">Agenda</p>
          <p className="text-6xl font-thin text-ghost">{events.length}</p>
        </div>
        <div className="p-12 nordic-card flex flex-col items-center justify-center space-y-4">
          <p className="mono-tag">Inbox</p>
          <p className="text-6xl font-thin text-ghost">{emails.length}</p>
        </div>
      </div>

      <section className="space-y-10">
        <h2 className="mono-tag ml-4">Current Stream</h2>
        {events.length > 0 ? (
          <div className="p-12 rounded-[3.5rem] bg-nordic/40 border border-white/5 space-y-10">
            <div className="flex justify-between items-center">
               <span className="text-[12px] font-thin text-haze uppercase tracking-widest italic">
                {new Date(events[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse"></div>
            </div>
            <h3 className="text-5xl font-thin text-ghost leading-tight tracking-tighter">{events[0].summary}</h3>
            <p className="text-[10px] font-light uppercase tracking-[0.4em] text-haze">
              {/* Fix: Use events[0].location instead of the global 'event' which is typed as 'Event' */}
              {events[0].location || 'Remote Session'}
            </p>
          </div>
        ) : (
          <div className="p-24 border border-white/5 rounded-[4rem] text-center bg-nordic/20">
            <p className="text-zinc-800 font-light uppercase tracking-[0.6em] text-[11px]">No active events</p>
          </div>
        )}
      </section>

      <section className="pb-16 space-y-10">
        <h2 className="mono-tag ml-4">Knowledge Base</h2>
        <div className="space-y-6">
          {recentNotes.length > 0 ? recentNotes.map(note => (
            <div key={note.id} className="p-12 nordic-card active:scale-[0.99]">
               <div className="flex justify-between items-center mb-8">
                 <span className="mono-tag opacity-40">Entry {note.id.slice(-4)}</span>
                 <span className="mono-tag opacity-40">
                   {new Date(note.timestamp).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="font-thin text-ghost text-3xl tracking-tighter truncate">{note.title}</h3>
            </div>
          )) : (
            <p className="text-center text-zinc-900 font-light uppercase py-16 tracking-[0.8em] text-[10px]">Archives are empty</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;