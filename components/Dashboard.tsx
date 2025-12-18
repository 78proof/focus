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
    <div className={`p-8 h-full space-y-10 pb-40 overflow-y-auto scrollbar-hide bg-white dark:bg-zinc-950 transition-colors duration-300 ${theme === 'monochrome' ? 'monochrome' : ''} ${theme === 'hyperbridge' ? 'hyperbridge' : ''}`}>
      <header className="flex justify-between items-center pt-safe">
        <div className="flex-1">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none uppercase italic">Omni.</h1>
          <p className="text-zinc-400 dark:text-zinc-600 font-black mt-2 uppercase tracking-[0.3em] text-[8px]">Precision Workspace</p>
        </div>
        <button 
          onClick={onShowSettings} 
          className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </header>

      {/* Primary Recording Action */}
      <button 
        onClick={onNewNote}
        className="group relative w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center space-y-3 active:scale-[0.97] transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-polkadot/20 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></div>
        <div className="w-16 h-16 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center mb-1">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
           </svg>
        </div>
        <span className="font-black uppercase tracking-[0.3em] text-[10px] relative z-10">Start Capture</span>
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[3rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Events</p>
          <p className="text-5xl font-black tracking-tighter leading-none">{events.length}</p>
        </div>
        <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[3rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Unread</p>
          <p className="text-5xl font-black tracking-tighter leading-none">{emails.length}</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">Critical Path</h2>
        </div>
        {events.length > 0 ? (
          <div className={`p-10 rounded-[3.5rem] relative overflow-hidden ${theme === 'hyperbridge' ? 'border-polkadot border-2 bg-black' : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl'}`}>
            <div className="relative z-10">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${theme === 'hyperbridge' ? 'text-polkadot' : 'text-zinc-400'}`}>
                {new Date(events[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — UPCOMING
              </p>
              <h3 className="text-3xl font-black tracking-tighter mb-6 leading-tight">{events[0].summary}</h3>
              <div className="flex items-center space-x-3">
                 <div className={`w-3 h-3 rounded-full ${theme === 'hyperbridge' ? 'bg-polkadot' : 'bg-zinc-900 dark:bg-white'}`}></div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-50 truncate">
                   {/* Fix: use events[0].location instead of undefined variable event */}
                   {events[0].location || 'Distributed HQ'}
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3.5rem] text-center">
            <p className="text-zinc-300 dark:text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px]">Path Is Clear</p>
          </div>
        )}
      </section>

      <section className="pb-8">
        <h2 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6">Recent Vault</h2>
        <div className="space-y-6">
          {recentNotes.length > 0 ? recentNotes.map(note => (
            <div key={note.id} className="p-8 bg-white dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-sm active:scale-[0.98] transition-transform">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Capture Node</span>
                 <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                   {new Date(note.timestamp).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight truncate">{note.title}</h3>
            </div>
          )) : (
            <p className="text-center text-zinc-300 dark:text-zinc-800 text-[10px] font-black uppercase py-10 tracking-[0.3em]">No Records Active</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;