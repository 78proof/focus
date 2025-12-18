
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
    { role: 'ai', text: "I'm ready. I have access to your emails, schedule, and tasks. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const playAudio = async (data: Uint8Array) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
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
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = `
      CURRENT TASKS: ${todos.map(t => (t.completed ? '[Done] ' : '') + t.task).join(', ')}
      UPCOMING EMAILS: ${emails.map(e => `${e.from}: ${e.subject}`).join(' | ')}
      // Fix: Use ev.summary instead of ev.subject for CalendarEvent
      CALENDAR TODAY: ${events.map(ev => `${ev.summary} at ${new Date(ev.start).getHours()}:00`).join(' | ')}
    `;

    try {
      const result = await GeminiService.assistantChat(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
      
      if (result.newTodo) {
        onAddTodo(result.newTodo);
      }

      // Voice output
      const audioData = await GeminiService.speakText(result.reply);
      if (audioData) {
        await playAudio(audioData);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my brain. Please check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <div className="p-6 pt-safe bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">OmniAssistant</h2>
          <div className="flex items-center mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpeaking ? 'Speaking' : 'Listening'}</span>
          </div>
        </div>
        {isSpeaking && (
          <div className="flex items-end space-x-0.5 h-4">
            <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite] h-full"></div>
            <div className="w-1 bg-blue-500 animate-[bounce_1.2s_infinite] h-2/3"></div>
            <div className="w-1 bg-blue-500 animate-[bounce_0.8s_infinite] h-full"></div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-5 rounded-[2.2rem] text-[15px] font-bold leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-2 p-4">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 pb-28">
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-[2rem] p-1 shadow-inner">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent dark:text-white px-6 py-4 border-none focus:ring-0 text-sm font-bold"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-transform disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
