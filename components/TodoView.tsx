
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <header className="p-6 pt-safe bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Master List</h2>
        <div className="flex space-x-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new objective..."
            className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl px-5 py-3 border-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold text-sm"
          />
          <button onClick={handleAdd} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-90 transition-transform">Add</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 scrollbar-hide">
        {todos.length === 0 && (
          <div className="text-center mt-20 opacity-30">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="font-black uppercase tracking-widest text-xs">Inbox Zero</p>
          </div>
        )}
        {todos.map(todo => (
          <div key={todo.id} className={`flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all ${todo.completed ? 'opacity-50' : ''}`}>
            <div className="flex items-center space-x-4 flex-1">
              <button 
                onClick={() => onToggleTodo(todo.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-zinc-700'}`}
              >
                {todo.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
              </button>
              <span className={`font-bold text-gray-800 dark:text-zinc-200 ${todo.completed ? 'line-through' : ''}`}>{todo.task}</span>
            </div>
            <button onClick={() => onDeleteTodo(todo.id)} className="text-gray-300 hover:text-red-500 transition-colors px-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoView;
