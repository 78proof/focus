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
  const [outlookClientId, setOutlookClientId] = useState(localStorage.getItem('OUTLOOK_CLIENT_ID') || '');
  
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

  const handleAddTodo = (task: string, priority?: 'p1' | 'p2' | 'p3' | 'p4') => {
    const newTodo: Todo = { 
      id: Date.now().toString(), 
      task, 
      completed: false, 
      createdAt: Date.now(),
      priority: priority || 'p4'
    };
    setTodos(prev => [newTodo, ...prev]);
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
    localStorage.setItem('OUTLOOK_CLIENT_ID', outlookClientId);
    setShowSettings(false);
    window.location.reload();
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert("Origin copied! Paste this into Google Cloud Console.");
  };

  return (
    <div className="flex flex-col h-full bg-midnight text-white overflow-hidden font-sans">
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <Dashboard 
            notes={notes} emails={emails} events={events} theme="monochrome" 
            onNewNote={startNewNote}
            onShowSettings={() => setShowSettings(true)}
            onToggleTheme={() => {}} 
          />
        )}
        
        {activeTab === 'notes' && !isTakingNote && (
          <NotesView 
            notes={notes} folders={folders} 
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
            emails={emails} events={events} 
            onDataUpdate={(em, ev) => { setEmails(em); setEvents(ev); }} 
            onRequestSettings={() => setShowSettings(true)} 
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistant 
            notes={notes} emails={emails} events={events} todos={todos} 
            onAddTodo={(task) => handleAddTodo(task, 'p2')} 
          />
        )}
        
        {isTakingNote && (
          <div className="absolute inset-0 z-[60] bg-midnight animate-in slide-in-from-bottom duration-500">
            <NoteTaking 
              folders={folders} existingNote={editingNote} 
              onNoteSaved={handleNoteSaved} onCancel={() => { setIsTakingNote(false); setEditingNote(undefined); }} 
            />
          </div>
        )}

        {showSettings && (
          <div className="absolute inset-0 z-[100] bg-midnight/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-nordic w-full max-w-md rounded-[2.5rem] p-8 border border-white/15 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-3xl font-black tracking-tighter italic text-white">SYNC SETTINGS</h3>
                 <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
               
               <div className="space-y-8 mb-10 text-left">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                   <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3 block">Fixing "Error 400" Redirect</label>
                   <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-4">
                     You must add this URL to your Google Cloud Console under "Authorized JavaScript origins":
                   </p>
                   <div className="flex items-center space-x-3 bg-black p-3 rounded-xl border border-white/5 mb-4">
                     <code className="text-[10px] text-white flex-1 truncate">{window.location.origin}</code>
                     <button onClick={copyOrigin} className="px-3 py-1 bg-white text-black text-[9px] font-black rounded-lg uppercase">Copy</button>
                   </div>
                   <p className="text-[9px] text-gray-500 italic">Settings take ~2-5 mins to propagate at Google.</p>
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Google Client ID</label>
                   <input 
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Enter Client ID"
                    className="w-full bg-black rounded-2xl p-5 border-white/10 text-[13px] font-bold text-white focus:border-white transition-all shadow-inner"
                   />
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Outlook Client ID</label>
                   <input 
                    value={outlookClientId}
                    onChange={(e) => setOutlookClientId(e.target.value)}
                    placeholder="Azure App ID"
                    className="w-full bg-black rounded-2xl p-5 border-white/10 text-[13px] font-bold text-white focus:border-white transition-all shadow-inner"
                   />
                 </div>
               </div>

               <button 
                onClick={handleSaveSettings}
                className="w-full bg-white text-black py-6 rounded-full font-black text-[14px] uppercase tracking-widest active:scale-95 transition-all shadow-2xl mb-4"
               >Update Configuration</button>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsTakingNote(false); }} />
    </div>
  );
};

export default App;