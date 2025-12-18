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
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
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
            todos={todos} onAddTodo={handleAddTodo} 
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

        {activeTab === 'ai' && <AIAssistant notes={notes} emails={emails} events={events} todos={todos} onAddTodo={handleAddTodo} />}
        
        {isTakingNote && (
          <div className="absolute inset-0 z-[60] bg-black animate-in slide-in-from-bottom duration-700">
            <NoteTaking 
              folders={folders} existingNote={editingNote} 
              onNoteSaved={handleNoteSaved} onCancel={() => { setIsTakingNote(false); setEditingNote(undefined); }} 
            />
          </div>
        )}

        {showSettings && (
          <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="bg-zinc-900 w-full max-w-md rounded-[4rem] p-12 border border-white/10 shadow-3xl">
               <h3 className="text-4xl font-black mb-10 tracking-tighter italic">CORE.SETTINGS</h3>
               
               <div className="space-y-10 mb-12">
                 <div>
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Google Client ID</label>
                   <input 
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="76281398...apps.googleusercontent.com"
                    className="w-full bg-black rounded-3xl p-6 border-white/10 text-[10px] font-mono text-white placeholder:text-zinc-800"
                   />
                 </div>
               </div>

               <button 
                onClick={handleSaveSettings}
                className="w-full bg-white text-black py-7 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
               >Deploy Config</button>
               
               <button onClick={() => setShowSettings(false)} className="w-full py-8 text-zinc-600 font-bold text-[9px] uppercase tracking-widest">Abort</button>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsTakingNote(false); }} />
    </div>
  );
};

export default App;