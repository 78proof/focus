
import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import NoteTaking from './components/NoteTaking';
import OutlookIntegration from './components/OutlookIntegration';
import AIAssistant from './components/AIAssistant';
import { AppTab, Note, Email, CalendarEvent } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
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

  const handleNoteCreated = (note: Note) => {
    setNotes(prev => [note, ...prev]);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 font-sans">
      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && <Dashboard notes={notes} emails={emails} events={events} />}
        {activeTab === 'notes' && <NoteTaking onNoteCreated={handleNoteCreated} />}
        {activeTab === 'outlook' && <OutlookIntegration emails={emails} events={events} />}
        {activeTab === 'ai' && <AIAssistant notes={notes} emails={emails} events={events} />}
      </main>

      {/* Navigation */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
