import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoViewProps {
  todos: Todo[];
  onAddTodo: (task: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAddTodo(input.trim());
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden animate-reveal">
      <header className="p-10 pt-safe bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
        <h2 className="text-5xl font-black text-white tracking-tighter italic mb-10">AGENDA.</h2>
        <div className="flex space-x-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="New directive..."
            className="flex-1 glass-pill rounded-full px-8 py-4 border-none focus:ring-1 focus:ring-white/20 text-white font-black text-sm tracking-wide"
          />
          <button onClick={handleAdd} className="bg-white text-black px-8 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-90 transition-transform">Post</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-48 scrollbar-hide">
        {todos.length === 0 && (
          <div className="text-center mt-32 opacity-10">
            <p className="font-black uppercase tracking-[0.5em] text-[10px]">Nothingness</p>
          </div>
        )}
        {todos.map(todo => (
          <div key={todo.id} className={`flex items-center justify-between p-8 glass-pill rounded-5xl transition-all ${todo.completed ? 'opacity-30' : ''}`}>
            <div className="flex items-center space-x-6 flex-1">
              <button 
                onClick={() => onToggleTodo(todo.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-white border-white text-black' : 'border-zinc-800'}`}
              >
                {todo.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
              </button>
              <span className={`font-black text-white text-lg tracking-tight ${todo.completed ? 'line-through' : ''}`}>{todo.task}</span>
            </div>
            <button onClick={() => onDeleteTodo(todo.id)} className="text-zinc-800 hover:text-white transition-colors p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoView;