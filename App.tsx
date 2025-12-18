import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import NoteTaking from './components/NoteTaking';
import GoogleIntegration from './components/GoogleIntegration';
import AIAssistant from './components/AIAssistant';
import NotesView from './components/NotesView';
import TodoView from './components/TodoView';
import { AppTab, Note, Email, CalendarEvent, Folder, Theme, Todo } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isTakingNote, setIsTakingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('GOOGLE_CLIENT_ID') || '');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('OMNI_THEME') as Theme) || 'light');
  
  const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem('OMNI_TODOS') || '[]'));
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('OMNI_NOTES') || '[]'));
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('OMNI_FOLDERS');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Meetings', color: '#000' },
      { id: '2', name: 'Ideas', color: '#666' }
    ];
  });

  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    localStorage.setItem('OMNI_TODOS', JSON.stringify(todos));
    localStorage.setItem('OMNI_NOTES', JSON.stringify(notes));
    localStorage.setItem('OMNI_FOLDERS', JSON.stringify(folders));
  }, [todos, notes, folders]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'monochrome', 'hyperbridge');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'monochrome') root.classList.add('monochrome');
    if (theme === 'hyperbridge') root.classList.add('hyperbridge');
    localStorage.setItem('OMNI_THEME', theme);
  }, [theme]);

  const handleAddTodo = (task: string) => {
    setTodos(prev => [{ id: Date.now().toString(), task, completed: false, createdAt: Date.now() }, ...prev]);
  };

  const handleNoteSaved = (note: Note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      if (exists) return prev.map(n => n.id === note.id ? note : n);
      return [note, ...prev];
    });
    setIsTakingNote(false);
    setEditingNote(undefined);
  };

  const startNewNote = () => {
    setEditingNote(undefined);
    setIsTakingNote(true);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('GOOGLE_CLIENT_ID', googleClientId);
    setShowSettings(false);
    window.location.reload();
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-500 ${theme}`}>
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <Dashboard 
            notes={notes} emails={emails} events={events} theme={theme} 
            onNewNote={startNewNote}
            onShowSettings={() => setShowSettings(true)}
            onToggleTheme={() => {}} 
          />
        )}
        
        {activeTab === 'notes' && !isTakingNote && (
          <NotesView 
            notes={notes} 
            folders={folders} 
            onCreateFolder={(name) => setFolders(prev => [...prev, { id: Date.now().toString(), name, color: '#000' }])} 
            onMoveNote={(nid, fid) => setNotes(prev => prev.map(n => n.id === nid ? {...n, folderId: fid} : n))}
            onEditNote={(note) => { setEditingNote(note); setIsTakingNote(true); }} 
            onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))} 
            onNewNote={startNewNote} 
          />
        )}

        {activeTab === 'todo' && (
          <TodoView 
            todos={todos} 
            onAddTodo={handleAddTodo} 
            onToggleTodo={(id) => setTodos(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} 
            onDeleteTodo={(id) => setTodos(prev => prev.filter(t => t.id !== id))} 
          />
        )}

        {activeTab === 'google' && (
          <GoogleIntegration 
            emails={emails} 
            events={events} 
            onDataUpdate={(em, ev) => { setEmails(em); setEvents(ev); }} 
            onRequestSettings={() => setShowSettings(true)} 
          />
        )}

        {activeTab === 'ai' && <AIAssistant notes={notes} emails={emails} events={events} todos={todos} onAddTodo={handleAddTodo} />}
        
        {isTakingNote && (
          <div className="absolute inset-0 z-[60] bg-white dark:bg-zinc-950 animate-in slide-in-from-bottom duration-500">
            <NoteTaking 
              folders={folders} 
              existingNote={editingNote} 
              onNoteSaved={handleNoteSaved} 
              onCancel={() => { setIsTakingNote(false); setEditingNote(undefined); }} 
            />
          </div>
        )}

        {showSettings && (
          <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 shadow-6xl border border-gray-100 dark:border-zinc-800">
               <h3 className="text-4xl font-black mb-2 tracking-tighter leading-none italic">Settings</h3>
               <p className="text-[9px] text-zinc-400 mb-10 font-black uppercase tracking-[0.3em]">Core Config</p>
               
               <div className="space-y-8 mb-10 text-left">
                 <div>
                   <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Google Client ID</label>
                   <input 
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Enter Client ID..."
                    className="w-full bg-gray-100 dark:bg-zinc-800 rounded-3xl p-6 border-none focus:ring-2 focus:ring-polkadot text-xs font-mono dark:text-white"
                   />
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">System Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['light', 'dark', 'monochrome', 'hyperbridge'].map(t => (
                         <button 
                           key={t} 
                           onClick={() => setTheme(t as Theme)}
                           className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 ring-2 ring-polkadot ring-offset-2 dark:ring-offset-zinc-900' : 'bg-gray-100 dark:bg-zinc-800 text-zinc-400'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>

               <button 
                onClick={handleSaveSettings}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-6 rounded-full font-black text-sm uppercase tracking-widest active:scale-95 shadow-2xl transition-transform"
               >Deploy Configuration</button>
               
               <button onClick={() => setShowSettings(false)} className="w-full py-6 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">Close Hub</button>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsTakingNote(false); }} />
    </div>
  );
};

export default App;