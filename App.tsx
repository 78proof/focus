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

  const factoryReset = () => {
    if (confirm("This will clear ALL settings and local data. Fixes 'Blank Screen' and login loops. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Origin URL Copied!");
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
                 <h3 className="text-3xl font-black tracking-tighter italic text-white uppercase">Sync Hub</h3>
                 <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
               
               <div className="space-y-8 mb-10 text-left">
                 <div className="p-6 bg-white/5 rounded-3xl border border-emerald-500/20 shadow-inner">
                   <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Important: Google Access</label>
                   <p className="text-[11px] text-gray-400 font-bold mb-4 leading-relaxed">
                     You MUST whitelist this exact URL in Google Cloud Console or login will fail:
                   </p>
                   
                   <div className="flex items-center bg-black p-3 rounded-xl border border-white/10 mb-4 overflow-hidden">
                     <code className="text-[9px] text-white flex-1 truncate mr-4">{window.location.origin}</code>
                     <button onClick={() => copyUrl(window.location.origin)} className="px-3 py-1 bg-white text-black text-[9px] font-black rounded uppercase flex-shrink-0">Copy</button>
                   </div>
                   
                   <div className="space-y-2">
                     <p className="text-[9px] text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        Authorized JavaScript origins
                     </p>
                     <p className="text-[9px] text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        Authorized redirect URIs
                     </p>
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block">Google Client ID</label>
                   <input 
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Enter Client ID"
                    className="w-full bg-black rounded-2xl p-5 border-white/10 text-[12px] font-mono text-white focus:border-white transition-all"
                   />
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block">Outlook Client ID</label>
                   <input 
                    value={outlookClientId}
                    onChange={(e) => setOutlookClientId(e.target.value)}
                    placeholder="Application ID"
                    className="w-full bg-black rounded-2xl p-5 border-white/10 text-[12px] font-mono text-white focus:border-white transition-all"
                   />
                 </div>

                 <button 
                  onClick={factoryReset}
                  className="w-full py-4 text-[9px] font-black text-red-500 uppercase tracking-[0.3em] border border-red-500/20 rounded-2xl hover:bg-red-500/5 transition-all"
                 >
                   Factory Reset (Fix Login Errors)
                 </button>
               </div>

               <button 
                onClick={handleSaveSettings}
                className="w-full bg-white text-black py-6 rounded-full font-black text-[14px] uppercase tracking-widest active:scale-95 transition-all shadow-2xl mb-4"
               >Save and Restart</button>
               
               <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest">Settings propagate in ~2 minutes</p>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsTakingNote(false); }} />
    </div>
  );
};

export default App;