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
    { role: 'ai', text: "Omni Intelligence online. State your directive." }
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
      TASKS: ${todos.map(t => (t.completed ? '[COMPLETED] ' : '[PENDING] ') + t.task).join(', ')}
      UPCOMING EVENTS: ${events.map(ev => `${ev.summary} at ${new Date(ev.start).toLocaleTimeString()}`).join(' | ')}
      NOTES SUMMARY: ${notes.slice(0, 5).map(n => n.title).join(', ')}
    `;

    try {
      const result = await GeminiService.assistantChat(userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
      if (result.newTodo) {
        onAddTodo(result.newTodo);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Handshake failure. Verify connection parameters in Credentials Hub." }]);
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
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const transcription = await GeminiService.transcribeAudio(base64, 'audio/webm');
            if (transcription) {
              handleSend(transcription);
            }
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error("Transcription failed", e);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopVoiceCommand = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-midnight overflow-hidden animate-reveal relative">
      {/* HUD Header */}
      <div className="p-8 pt-safe bg-nordic/80 backdrop-blur-3xl border-b border-white/5 flex justify-between items-center z-20">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center">
            OMNI.AI
            <span className="ml-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </h2>
          <p className="mono-tag text-zinc-600 mt-1">NEURAL LINK ACTIVE</p>
        </div>
        <div className="flex space-x-2">
           <div className="px-3 py-1 rounded-md border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-black">
             Encrypted
           </div>
        </div>
      </div>

      {/* Chat Space */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 pb-64 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] text-[15px] font-bold leading-relaxed border transition-all ${
              m.role === 'user' 
                ? 'bg-white text-black border-transparent rounded-tr-none shadow-2xl' 
                : 'bg-zinc-900/50 text-zinc-200 border-white/5 rounded-tl-none backdrop-blur-sm'
            }`}>
              {m.text}
              <div className={`mt-2 text-[8px] font-black uppercase tracking-widest opacity-30 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.role === 'user' ? 'Directive Received' : 'Omni Response'}
              </div>
            </div>
          </div>
        ))}

        {(isLoading || transcribing) && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-zinc-900/30 p-6 rounded-[2rem] rounded-tl-none border border-white/5 flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {transcribing ? 'Decrypting Audio' : 'Synthesizing'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controller Area */}
      <div className="fixed bottom-28 left-0 right-0 p-6 z-40 bg-gradient-to-t from-midnight via-midnight/95 to-transparent">
        <div className="max-w-md mx-auto relative">
          
          {isRecording && (
            <div className="absolute -top-16 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-4">
              <div className="bg-red-500/10 border border-red-500/20 px-6 py-2 rounded-full flex items-center space-x-3 backdrop-blur-xl">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Listening...</span>
              </div>
            </div>
          )}

          <div className={`flex items-center bg-zinc-900/80 backdrop-blur-3xl rounded-[2.5rem] p-2 border transition-all duration-500 ${isRecording ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-2xl'}`}>
            <button 
              onMouseDown={startVoiceCommand}
              onMouseUp={stopVoiceCommand}
              onTouchStart={startVoiceCommand}
              onTouchEnd={stopVoiceCommand}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Listening to voice..." : "Type command..."}
              className="flex-1 bg-transparent text-white px-4 py-4 border-none focus:ring-0 text-[13px] font-bold placeholder:text-zinc-700"
              disabled={isRecording}
            />

            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading || isRecording}
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center mt-4">
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">Omni Interface v4.02 — Neural Sync</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;