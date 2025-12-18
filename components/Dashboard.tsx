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
  const recentNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  return (
    <div className="p-8 h-full space-y-12 pb-48 overflow-y-auto scrollbar-hide bg-midnight animate-reveal">
      <header className="flex justify-between items-center pt-safe">
        <div>
          <h1 className="text-6xl font-black text-white tracking-tighter leading-none italic">OMNI.</h1>
          <p className="mono-tag mt-2">SYSTEM v4.0 ONLINE</p>
        </div>
        <button 
          onClick={onShowSettings} 
          className="w-14 h-14 nordic-card flex items-center justify-center active:scale-90"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </header>

      {/* Main Action Area */}
      <button 
        onClick={onNewNote}
        className="w-full bg-white text-black py-12 rounded-[2.5rem] shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center space-y-4 active:scale-[0.98] transition-all"
      >
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <span className="font-black uppercase tracking-[0.4em] text-[12px]">Capture Node</span>
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-10 nordic-card flex flex-col items-center justify-center space-y-2">
          <p className="mono-tag text-gray-500">Agenda</p>
          <p className="text-5xl font-black text-white">{events.length}</p>
        </div>
        <div className="p-10 nordic-card flex flex-col items-center justify-center space-y-2">
          <p className="mono-tag text-gray-500">Inbox</p>
          <p className="text-5xl font-black text-white">{emails.length}</p>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="mono-tag ml-2">Today's Protocol</h2>
        {events.length > 0 ? (
          <div className="p-10 nordic-card space-y-6">
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {new Date(events[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase text-white ring-1 ring-white/20">Active</div>
            </div>
            <h3 className="text-3xl font-bold text-white leading-tight">{events[0].summary}</h3>
            <div className="flex items-center space-x-3 text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span className="text-[11px] font-bold uppercase tracking-wider truncate">{events[0].location || 'Remote Session'}</span>
            </div>
          </div>
        ) : (
          <div className="p-16 nordic-card border-dashed border-gray-800 text-center">
            <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px]">Agenda Clear</p>
          </div>
        )}
      </section>

      <section className="pb-12 space-y-6">
        <h2 className="mono-tag ml-2">Vault Access</h2>
        <div className="space-y-4">
          {recentNotes.length > 0 ? recentNotes.map(note => (
            <div key={note.id} className="p-8 nordic-card active:scale-[0.99] flex justify-between items-center">
               <div className="flex-1 truncate pr-4">
                 <h3 className="font-bold text-white text-xl truncate">{note.title}</h3>
                 <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Ref: {note.id.slice(-4)} — {new Date(note.timestamp).toLocaleDateString()}</p>
               </div>
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          )) : (
            <p className="text-center text-gray-700 font-bold uppercase py-10 tracking-[0.4em] text-[10px]">Void</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;