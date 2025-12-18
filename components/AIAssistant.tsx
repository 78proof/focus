import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Note, Email, CalendarEvent, Todo } from '../types';

interface AIAssistantProps {
  notes: Note[];
  emails: Email[];
  events: CalendarEvent[];
  todos: Todo[];
  onAddTodo: (task: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ notes, emails, events, todos, onAddTodo }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Omni Intelligence online. Establish objective." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = `
      TASKS: ${todos.map(t => (t.completed ? '[X] ' : '[ ] ') + t.task).join(', ')}
      EVENTS: ${events.map(ev => `${ev.summary} @ ${new Date(ev.start).getHours()}:00`).join(' | ')}
    `;

    try {
      const result = await GeminiService.assistantChat(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
      if (result.newTodo) onAddTodo(result.newTodo);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Handshake failure. Sync configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden animate-reveal">
      <div className="p-10 pt-safe bg-zinc-950/50 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Omni.AI</h2>
          <div className="flex items-center mt-3">
            <div className={`w-2 h-2 rounded-full mr-3 ${isLoading ? 'bg-white animate-pulse' : 'bg-zinc-800'}`}></div>
            <span className="mono-label text-zinc-600">{isLoading ? 'Synthesizing' : 'Linked'}</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-12 pb-48 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-10 rounded-[3rem] text-[15px] font-bold leading-relaxed transition-all duration-700 ${
              m.role === 'user' 
                ? 'bg-white text-black rounded-tr-none shadow-2xl' 
                : 'glass-pill text-zinc-300 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-3 p-6 opacity-30">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <div className="fixed bottom-32 left-0 right-0 p-8 z-40">
        <div className="max-w-md mx-auto flex items-center bg-zinc-900/40 backdrop-blur-3xl rounded-full p-2 border border-white/10 shadow-3xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Input directive..."
            className="flex-1 bg-transparent text-white px-8 py-5 border-none focus:ring-0 text-[11px] font-black uppercase tracking-[0.2em] placeholder:text-zinc-800"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform disabled:opacity-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;