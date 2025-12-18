import React, { useState } from 'react';
import { Note, Folder } from '../types';

interface NotesViewProps {
  notes: Note[];
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onMoveNote: (noteId: string, folderId: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onNewNote: () => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, folders, onCreateFolder, onMoveNote, onEditNote, onDeleteNote, onNewNote }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredNotes = selectedFolderId 
    ? notes.filter(n => n.folderId === selectedFolderId)
    : notes;

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <header className="p-6 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 pt-safe">
        <div className="flex justify-between items-center mb-6 pt-4">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">Vault</h2>
          <button 
            onClick={onNewNote}
            className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedFolderId(null)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${!selectedFolderId ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'}`}
          >
            All Items
          </button>
          {folders.map(f => (
            <button 
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${selectedFolderId === f.id ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'}`}
            >
              {f.name}
            </button>
          ))}
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 bg-gray-100 dark:bg-zinc-800 text-gray-400 border border-dashed border-gray-300 dark:border-zinc-700"
          >
            + New
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 scrollbar-hide">
        {isCreatingFolder && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95">
             <input 
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Name..."
              className="w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl px-5 py-4 mb-4 border-none font-black text-sm dark:text-white"
             />
             <div className="flex space-x-2">
               <button onClick={handleCreateFolder} className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Create</button>
               <button onClick={() => setIsCreatingFolder(false)} className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
             </div>
          </div>
        )}

        {filteredNotes.length > 0 ? filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => onEditNote(note)}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[2.2rem] shadow-sm border border-gray-100 dark:border-zinc-800 active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {folders.find(f => f.id === note.folderId)?.name || 'Inbox'}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <h3 className="font-black text-gray-900 dark:text-zinc-100 text-lg mb-2 tracking-tight line-clamp-1">{note.title}</h3>
            
            {note.summary && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium mb-3">
                {note.summary}
              </p>
            )}
            
            <div className="pt-3 border-t border-gray-50 dark:border-zinc-800/50 flex justify-between items-center">
              <span className="text-[9px] text-gray-300 dark:text-zinc-600 font-black uppercase tracking-widest">
                {new Date(note.timestamp).toLocaleDateString()}
              </span>
              {note.type === 'voice' && (
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/></svg>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 opacity-20">
            <p className="text-zinc-300 dark:text-zinc-800 font-black text-4xl tracking-tighter uppercase">No Entries</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;