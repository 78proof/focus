
import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import NoteTaking from './components/NoteTaking';
import OutlookIntegration from './components/OutlookIntegration';
import AIAssistant from './components/AIAssistant';
import NotesView from './components/NotesView';
import TodoView from './components/TodoView';
import { AppTab, Note, Email, CalendarEvent, Folder, Theme, Todo } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isTakingNote, setIsTakingNote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [clientId, setClientId] = useState(localStorage.getItem('OUTLOOK_CLIENT_ID') || '');
  const [theme, setTheme] = useState<Theme>('light');
  
  const [todos, setTodos] = useState<Todo[]>(JSON.parse(localStorage.getItem('OMNI_TODOS') || '[]'));
  const [notes, setNotes] = useState<Note[]>(JSON.parse(localStorage.getItem('OMNI_NOTES') || '[]'));
  const [folders] = useState<Folder[]>([
    { id: '1', name: 'General', color: '#3b82f6' },
    { id: '2', name: 'Work', color: '#10b981' }
  ]);

  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    localStorage.setItem('OMNI_TODOS', JSON.stringify(todos));
    localStorage.setItem('OMNI_NOTES', JSON.stringify(notes));
  }, [todos, notes]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleAddTodo = (task: string) => {
    setTodos(prev => [{ id: Date.now().toString(), task, completed: false, createdAt: Date.now() }, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <main className="flex-1 overflow-hidden relative">
        <button onClick={() => setShowSettings(true)} className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>

        {activeTab === 'dashboard' && <Dashboard notes={notes} emails={emails} events={events} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />}
        {activeTab === 'notes' && !isTakingNote && <NotesView notes={notes} folders={folders} onCreateFolder={() => {}} onMoveNote={() => {}} onEditNote={() => {}} onDeleteNote={() => {}} onNewNote={() => setIsTakingNote(true)} />}
        {activeTab === 'todo' && <TodoView todos={todos} onAddTodo={handleAddTodo} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} />}
        {activeTab === 'outlook' && <OutlookIntegration emails={emails} events={events} onDataUpdate={(em, ev) => { setEmails(em); setEvents(ev); }} />}
        {activeTab === 'ai' && <AIAssistant notes={notes} emails={emails} events={events} todos={todos} onAddTodo={handleAddTodo} />}
        
        {isTakingNote && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-950">
            <NoteTaking folders={folders} onNoteSaved={(n) => { setNotes(prev => [n, ...prev]); setIsTakingNote(false); }} onCancel={() => setIsTakingNote(false)} />
          </div>
        )}

        {showSettings && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
               <h3 className="text-2xl font-black mb-2 tracking-tighter">Connection Hub</h3>
               <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">Azure App Registration</p>
               <input 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Paste Client ID here..."
                className="w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl p-4 mb-4 border-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
               />
               <button 
                onClick={() => { localStorage.setItem('OUTLOOK_CLIENT_ID', clientId); setShowSettings(false); window.location.reload(); }}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 mb-2"
               >Save and Restart</button>
               <button onClick={() => setShowSettings(false)} className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsTakingNote(false); }} />
    </div>
  );
};

export default App;
