import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoViewProps {
  todos: Todo[];
  onAddTodo: (task: string, priority?: 'p1' | 'p2' | 'p3' | 'p4') => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');

  const handleAdd = () => {
    if (input.trim()) {
      onAddTodo(input.trim(), priority);
      setInput('');
      setPriority('p4');
    }
  };

  const getPriorityBorder = (p?: string) => {
    switch (p) {
      case 'p1': return 'border-todoist-p1';
      case 'p2': return 'border-todoist-p2';
      case 'p3': return 'border-todoist-p3';
      default: return 'border-todoist-p4';
    }
  };

  const getPriorityBg = (p?: string) => {
    switch (p) {
      case 'p1': return 'bg-todoist-p1';
      case 'p2': return 'bg-todoist-p2';
      case 'p3': return 'bg-todoist-p3';
      default: return 'bg-todoist-p4';
    }
  };

  return (
    <div className="h-full flex flex-col bg-midnight animate-reveal overflow-hidden">
      <header className="p-8 pt-safe border-b border-white/10 bg-nordic/50 backdrop-blur-md">
        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-8">AGENDA.</h2>
        
        <div className="space-y-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="What needs to be done?"
            className="w-full bg-slate px-6 py-5 rounded-[1.5rem] border-none text-white font-bold text-lg placeholder:text-gray-600 focus:ring-1 focus:ring-white/40 shadow-inner"
          />
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {(['p1', 'p2', 'p3', 'p4'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-[11px] font-black uppercase transition-all ${
                    priority === p 
                      ? `${getPriorityBg(p)} text-white border-white scale-110 shadow-lg` 
                      : 'border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={handleAdd} 
              disabled={!input.trim()}
              className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-20 transition-all shadow-lg"
            >
              Add task
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-48 space-y-3 scrollbar-hide">
        {todos.length === 0 && (
          <div className="text-center py-32 opacity-20">
            <p className="font-black uppercase tracking-[0.5em] text-[10px] italic">Protocol Clear</p>
          </div>
        )}
        
        {/* Active Directives */}
        {todos.filter(t => !t.completed).map(todo => (
          <div key={todo.id} className="group flex items-start p-6 bg-nordic/40 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all">
            <button 
              onClick={() => onToggleTodo(todo.id)}
              className={`w-7 h-7 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${getPriorityBorder(todo.priority)} bg-transparent hover:bg-white/10`}
            >
              <div className={`w-3 h-3 rounded-full opacity-0 group-hover:opacity-30 ${getPriorityBg(todo.priority)}`}></div>
            </button>
            <div className="ml-5 flex-1">
              <span className="font-bold text-white text-[17px] leading-tight block">{todo.task}</span>
              <div className="flex items-center space-x-3 mt-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityBorder(todo.priority)}`}>
                  Priority {todo.priority?.toUpperCase()}
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Entry: {new Date(todo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={() => onDeleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}

        {/* Archived Section */}
        {todos.some(t => t.completed) && (
          <div className="pt-12 pb-4 ml-4 border-b border-white/5">
            <p className="mono-tag text-gray-600">ARCHIVED DIRECTIVES</p>
          </div>
        )}

        {todos.filter(t => t.completed).map(todo => (
          <div key={todo.id} className="flex items-center p-5 opacity-30 hover:opacity-60 transition-all rounded-2xl">
            <button 
              onClick={() => onToggleTodo(todo.id)}
              className="w-6 h-6 rounded-full bg-white border-none flex-shrink-0 flex items-center justify-center text-black shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </button>
            <span className="ml-5 font-bold text-gray-400 text-[15px] line-through truncate">{todo.task}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoView;