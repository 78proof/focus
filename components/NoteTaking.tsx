
import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types';
import { GeminiService } from '../services/geminiService';

interface NoteTakingProps {
  onNoteCreated: (note: Note) => void;
}

const NoteTaking: React.FC<NoteTakingProps> = ({ onNoteCreated }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText(prev => prev + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setIsSummarizing(true);
    try {
      const summary = await GeminiService.summarizeNote(text);
      const newNote: Note = {
        id: Date.now().toString(),
        title: text.split('\n')[0].substring(0, 50) || 'Untitled Note',
        content: text,
        summary,
        timestamp: Date.now(),
        type: isRecording ? 'voice' : 'text'
      };
      onNoteCreated(newNote);
      setText('');
    } catch (error) {
      console.error('Failed to summarize note', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">New Note</h2>
        <button 
          onClick={handleSave}
          disabled={!text.trim() || isSummarizing}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50 transition-all hover:bg-blue-700 active:scale-95"
        >
          {isSummarizing ? 'Summarizing...' : 'Save'}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your notes here or tap the mic to start recording..."
        className="flex-1 w-full text-lg text-gray-700 bg-transparent border-none focus:ring-0 resize-none placeholder-gray-300"
      />

      <div className="mt-4 flex justify-center pb-8">
        <button
          onClick={toggleRecording}
          className={`relative p-8 rounded-full transition-all duration-300 transform active:scale-90 ${
            isRecording ? 'bg-red-500 shadow-red-200' : 'bg-blue-600 shadow-blue-200'
          } shadow-2xl`}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></span>
          )}
          <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NoteTaking;
