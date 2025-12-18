
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
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const playAudio = async (data: Uint8Array) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioCtxRef.current;
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setIsSpeaking(false);
    setIsSpeaking(true);
    source.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = `
      TASKS: ${todos.map(t => t.task).join(', ')}
      EMAILS: ${emails.map(e => e.subject).join(', ')}
      EVENTS: ${events.map(ev => ev.subject).join(', ')}
    `;

    try {
      const result = await GeminiService.assistantChat(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
      
      if (result.newTodo) {
        onAddTodo(result.newTodo);
      }

      // Voice output
      const audioData = await GeminiService.speakText(result.reply);
      if (audioData) await playAudio(audioData);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to Gemini." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">OmniAI</h2>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Listening</p>
        </div>
        {isSpeaking && <div className="flex space-x-1"><div className="w-1 h-4 bg-blue-500 animate-pulse"></div><div className="w-1 h-4 bg-blue-500 animate-pulse delay-75"></div><div className="w-1 h-4 bg-blue-500 animate-pulse delay-150"></div></div>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-bold leading-relaxed ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-800 rounded-tl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="w-12 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 pb-24">
        <div className="flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask to create a task or summarize..."
            className="flex-1 bg-gray-100 dark:bg-zinc-800 dark:text-white rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
          />
          <button onClick={handleSend} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
