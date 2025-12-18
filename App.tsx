
import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import NoteTaking from './components/NoteTaking';
import OutlookIntegration from './components/OutlookIntegration';
import AIAssistant from './components/AIAssistant';
import NotesView from './components/NotesView';
import { AppTab, Note, Email, CalendarEvent, Folder, Theme } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isTakingNote, setIsTakingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>('light');
  
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'General', color: '#3b82f6' },
    { id: '2', name: 'Work Projects', color: '#10b981' },
    { id: '3', name: 'Meeting Minutes', color: '#8b5cf6' },
  ]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [emails, setEmails] = useState<Email[]>([
    { id: '1', from: 'Sarah HR', subject: 'Quarterly Review Schedule', snippet: 'Hi team, please find the schedule for...', receivedDateTime: new Date().toISOString(), isImportant: true },
    { id: '2', from: 'Git Notification', subject: 'Successful Deployment', snippet: 'Your latest build for omni-work is live...', receivedDateTime: new Date().toISOString(), isImportant: false },
    { id: '3', from: 'CEO Update', subject: 'Town Hall Meeting', snippet: 'Important updates regarding the new product launch...', receivedDateTime: new Date(Date.now() - 3600000).toISOString(), isImportant: true },
  ]);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', subject: 'Project Sync', start: new Date(Date.now() + 3600000).toISOString(), end: new Date(Date.now() + 7200000).toISOString(), location: 'Microsoft Teams' },
    { id: '2', subject: 'Product Design Deep Dive', start: new Date(Date.now() + 10800000).toISOString(), end: new Date(Date.now() + 14400000).toISOString(), location: 'Conference Room B' },
  ]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleNoteSaved = (note: Note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      if (exists) return prev.map(n => n.id === note.id ? note : n);
      return [note, ...prev];
    });
    setIsTakingNote(false);
    setEditingNote(undefined);
    setActiveTab('notes');
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleMoveNote = (noteId: string, folderId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, folderId } : n));
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Delete this workspace note forever?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsTakingNote(true);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300`}>
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <Dashboard 
            notes={notes} emails={emails} events={events} theme={theme} 
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
          />
        )}
        {activeTab === 'notes' && !isTakingNote && (
          <NotesView 
            notes={notes} folders={folders} 
            onCreateFolder={handleCreateFolder} 
            onMoveNote={handleMoveNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onNewNote={() => { setEditingNote(undefined); setIsTakingNote(true); }}
          />
        )}
        {activeTab === 'outlook' && <OutlookIntegration emails={emails} events={events} />}
        {activeTab === 'ai' && <AIAssistant notes={notes} emails={emails} events={events} />}
        
        {isTakingNote && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-950">
            <NoteTaking 
              folders={folders} 
              existingNote={editingNote}
              onNoteSaved={handleNoteSaved} 
              onCancel={() => { setIsTakingNote(false); setEditingNote(undefined); }} 
            />
          </div>
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setIsTakingNote(false);
        setEditingNote(undefined);
      }} />
    </div>
  );
};

export default App;
