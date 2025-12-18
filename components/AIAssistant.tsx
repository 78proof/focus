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
    { role: 'ai', text: "OMNI System Active. Intelligence synced. What is your directive?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, transcribing]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    const context = `
      TASKS: ${todos.map(t => (t.completed ? '[X] ' : '[ ] ') + t.task).join(', ')}
      SCHEDULE: ${events.map(ev => `${ev.summary} at ${new Date(ev.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`).join(' | ')}
      EMAILS: ${emails.slice(0, 3).map(e => `${e.from}: ${e.subject}`).join(' | ')}
    `;

    try {
      const result = await GeminiService.assistantChat(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
      if (result.newTodo) {
        onAddTodo(result.newTodo);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "System error: Handshake refused. Verify API link in settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceCommand = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
          const transcription = await GeminiService.transcribeAudio(base64, 'audio/webm');
          if (transcription) {
            handleSend(transcription);
          }
        } catch (e) {
          console.error("Voice sync failed", e);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access is restricted.");
    }
  };

  const stopVoiceCommand = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-midnight overflow-hidden animate-reveal">
      {/* Cinematic HUD Header */}
      <div className="p-10 pt-safe bg-nordic/80 backdrop-blur-3xl border-b border-white/5 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase flex items-center leading-none">
            OMNI.AI
            <span className="ml-4 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </h2>
          <p className="mono-tag text-zinc-600 mt-3 font-black">NEURAL HANDSHAKE: STABLE</p>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 pb-64 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-700`}>
            <div className={`max-w-[90%] p-8 rounded-[2.5rem] text-[17px] font-bold leading-relaxed border shadow-2xl transition-all ${
              m.role === 'user' 
                ? 'bg-white text-black border-transparent rounded-tr-none' 
                : 'bg-zinc-900/50 text-zinc-100 border-white/10 rounded-tl-none backdrop-blur-xl italic'
            }`}>
              {m.text}
              <div className={`mt-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.role === 'user' ? 'Direct Input' : 'Omni Logic'}
              </div>
            </div>
          </div>
        ))}

        {(isLoading || transcribing) && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] rounded-tl-none border border-white/5 flex items-center space-x-4 backdrop-blur-md">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                {transcribing ? 'Synthesizing Audio' : 'Neural Processing'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Neural Interface Controller */}
      <div className="fixed bottom-28 left-0 right-0 p-8 z-40">
        <div className="max-w-md mx-auto relative group">
          
          {isRecording && (
            <div className="absolute -top-20 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-4">
              <div className="bg-red-500/10 border border-red-500/20 px-8 py-3 rounded-full flex items-center space-x-4 backdrop-blur-2xl">
                 <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                 <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.3em]">Listening...</span>
              </div>
            </div>
          )}

          <div className={`flex items-center bg-zinc-900/90 backdrop-blur-3xl rounded-[3rem] p-3 border transition-all duration-700 ${isRecording ? 'border-red-500/50 ring-4 ring-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]'}`}>
            <button 
              onMouseDown={startVoiceCommand}
              onMouseUp={stopVoiceCommand}
              onTouchStart={startVoiceCommand}
              onTouchEnd={stopVoiceCommand}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/50' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Hold to speak..." : "Input directive..."}
              className="flex-1 bg-transparent text-white px-6 py-5 border-none focus:ring-0 text-[15px] font-bold placeholder:text-zinc-700"
              disabled={isRecording}
            />

            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading || isRecording}
              className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform disabled:opacity-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center mt-6">
            <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em]">Omni Interface v5.1 — Neural Link Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;