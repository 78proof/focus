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
    <div className={`p-8 h-full space-y-8 pb-32 overflow-y-auto scrollbar-hide bg-white dark:bg-zinc-950 transition-colors duration-300 ${theme === 'monochrome' ? 'monochrome' : ''}`}>
      <header className="flex justify-between items-start pt-4">
        <div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none uppercase">Omni.</h1>
          <p className="text-gray-400 dark:text-zinc-600 font-black mt-2 uppercase tracking-[0.25em] text-[9px]">High Signal Records</p>
        </div>
        <button 
          onClick={onShowSettings} 
          className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </header>

      {/* Primary Action - Large and central for recording */}
      <button 
        onClick={onNewNote}
        className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center space-y-2 active:scale-[0.98] transition-all border border-transparent"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center mb-2">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <span className="font-black uppercase tracking-[0.2em] text-xs">Capture Record</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-7 bg-gray-100 dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Agenda</p>
          <p className="text-4xl font-black tracking-tighter leading-none">{events.length}</p>
        </div>
        <div className="p-7 bg-gray-100 dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Inbox</p>
          <p className="text-4xl font-black tracking-tighter leading-none">{emails.length}</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Critical Path</h2>
        </div>
        {events.length > 0 ? (
          <div className={`p-8 rounded-[2.5rem] ${theme === 'monochrome' ? 'border-2 border-white' : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{new Date(events[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Focus</p>
            <h3 className="text-2xl font-black tracking-tighter mb-4 leading-none">{events[0].summary}</h3>
            <div className="flex items-center space-x-2">
               <div className="w-4 h-4 rounded-full border border-current opacity-30"></div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50 truncate">
                 {events[0].location || 'Digital HQ'}
               </p>
            </div>
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[2.5rem] text-center">
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Clear Agenda</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Recent Documents</h2>
        <div className="space-y-4">
          {recentNotes.length > 0 ? recentNotes.map(note => (
            <div key={note.id} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-sm">
               <div className="flex justify-between mb-2">
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Entry</span>
                 <span className="text-[9px] font-black text-gray-300 dark:text-zinc-700 uppercase tracking-widest">{new Date(note.timestamp).toLocaleDateString()}</span>
               </div>
               <h3 className="font-black text-gray-900 dark:text-zinc-100 text-lg tracking-tight truncate">{note.title}</h3>
            </div>
          )) : (
            <p className="text-center text-gray-300 dark:text-zinc-800 text-[10px] font-black uppercase py-8">Vault Empty</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;