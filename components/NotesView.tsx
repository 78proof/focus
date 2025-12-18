
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
      <header className="p-6 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Workspace</h2>
          <button 
            onClick={onNewNote}
            className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl shadow-blue-500/30 active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedFolderId(null)}
            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${!selectedFolderId ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}
          >
            All Meeting Notes
          </button>
          {folders.map(f => (
            <button 
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedFolderId === f.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}
            >
              {f.name}
            </button>
          ))}
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border border-dashed border-gray-300 dark:border-zinc-700"
          >
            + New Folder
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 scrollbar-hide">
        {isCreatingFolder && (
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border-2 border-dashed border-blue-400 shadow-2xl animate-in zoom-in-95 duration-200">
             <input 
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name..."
              className="w-full bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 mb-4 border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
             />
             <div className="flex space-x-2">
               <button onClick={handleCreateFolder} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Create</button>
               <button onClick={() => setIsCreatingFolder(false)} className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 py-3 rounded-xl font-bold">Cancel</button>
             </div>
          </div>
        )}

        {filteredNotes.length > 0 ? filteredNotes.map(note => (
          <div key={note.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 group transition-all hover:border-blue-200 dark:hover:border-blue-900">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-widest">
                {folders.find(f => f.id === note.folderId)?.name || 'General'}
              </span>
              
              <div className="flex items-center space-x-2">
                 <button 
                  onClick={() => onEditNote(note)}
                  className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 </button>
                 <button 
                  onClick={() => onDeleteNote(note.id)}
                  className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
            </div>

            <h3 className="font-black text-gray-900 dark:text-zinc-100 text-xl mb-3 leading-tight">{note.title}</h3>
            
            {note.summary && (
              <div className="text-sm text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/50">
                {note.summary.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-1 last:mb-0">• {line.replace(/^[-*•]\s*/, '')}</p>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800/50">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {new Date(note.timestamp).toLocaleDateString()}
              </span>
              <div className="relative group/menu">
                 <button className="text-[10px] font-black text-gray-400 uppercase hover:text-blue-500">Move Folder</button>
                 <div className="hidden group-hover/menu:block absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-700 z-50 p-2 animate-in slide-in-from-bottom-2">
                    {folders.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => onMoveNote(note.id, f.id)}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                      >
                        {f.name}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center mt-32">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-600 font-black text-xl">Clean Slate.</p>
            <p className="text-zinc-400 dark:text-zinc-700 text-sm mt-2">Ready for your next big idea?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
