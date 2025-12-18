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
    <div className="h-full flex flex-col bg-black overflow-hidden animate-reveal">
      <header className="p-10 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-6xl font-black text-white tracking-tighter leading-none italic">VAULT.</h2>
          <button 
            onClick={onNewNote}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedFolderId(null)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${!selectedFolderId ? 'bg-white text-black shadow-xl' : 'glass-pill text-zinc-600'}`}
          >
            Universe
          </button>
          {folders.map(f => (
            <button 
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${selectedFolderId === f.id ? 'bg-white text-black shadow-xl' : 'glass-pill text-zinc-600'}`}
            >
              {f.name}
            </button>
          ))}
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 glass-pill text-zinc-800 border-dashed"
          >
            + New Map
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-48 scrollbar-hide">
        {isCreatingFolder && (
          <div className="bg-zinc-900/50 p-10 rounded-6xl border border-dashed border-white/20 animate-in zoom-in-95 duration-500">
             <input 
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Designation..."
              className="w-full bg-black rounded-full px-8 py-5 mb-8 border-none font-black text-sm text-white"
             />
             <div className="flex space-x-4">
               <button onClick={handleCreateFolder} className="flex-1 bg-white text-black py-5 rounded-full font-black text-[10px] uppercase tracking-widest">Create</button>
               <button onClick={() => setIsCreatingFolder(false)} className="flex-1 glass-pill text-zinc-500 py-5 rounded-full font-black text-[10px] uppercase tracking-widest">Cancel</button>
             </div>
          </div>
        )}

        {filteredNotes.length > 0 ? filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => onEditNote(note)}
            className="p-10 rounded-6xl glass-pill active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="mono-label text-zinc-600">
                {folders.find(f => f.id === note.folderId)?.name || 'Inbox'}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                className="p-2 text-zinc-800 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <h3 className="font-black text-white text-3xl mb-4 tracking-tighter leading-tight line-clamp-2">{note.title}</h3>
            
            {note.summary && (
              <p className="text-[13px] text-zinc-600 leading-relaxed font-bold italic mb-8 uppercase tracking-tight">
                {note.summary}
              </p>
            )}
            
            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
              <span className="mono-label text-zinc-800">
                {new Date(note.timestamp).toLocaleDateString()}
              </span>
              {note.type === 'voice' && (
                <div className="flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                   <span className="mono-label text-zinc-500">Audio Node</span>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-32 opacity-10">
            <p className="text-white font-black text-7xl tracking-tighter italic uppercase">Void</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;