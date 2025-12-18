
import React, { useState, useRef, useEffect } from 'react';
import { Note, Folder } from '../types';
import { GeminiService } from '../services/geminiService';

interface NoteTakingProps {
  folders: Folder[];
  existingNote?: Note;
  onNoteSaved: (note: Note) => void;
  onCancel: () => void;
}

const NoteTaking: React.FC<NoteTakingProps> = ({ folders, existingNote, onNoteSaved, onCancel }) => {
  const [content, setContent] = useState(existingNote?.content || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, isPaused]);

  // Handle mobile keyboard scroll
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [content]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(blob);
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      alert("Microphone access is required for Granola-style notes.");
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const transcription = await GeminiService.transcribeAudio(base64, 'audio/webm');
      if (transcription) {
        setContent(prev => prev + (prev ? '\n\n' : '') + transcription);
      }
    } catch (error) {
      console.error(error);
      alert("Transcription failed. Please check your internet.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFinalize = async () => {
    if (!content.trim()) return;
    setIsFinalizing(true);
    try {
      const result = await GeminiService.finalizeNote(content, folders);
      onNoteSaved({
        id: existingNote?.id || Date.now().toString(),
        title: content.split('\n')[0].substring(0, 40) || 'Meeting Note',
        content: content,
        summary: result.summary,
        timestamp: Date.now(),
        type: 'voice',
        folderId: result.folderId
      });
    } catch (error) {
      onNoteSaved({
        id: existingNote?.id || Date.now().toString(),
        title: content.split('\n')[0].substring(0, 40) || 'Meeting Note',
        content: content,
        timestamp: Date.now(),
        type: 'text',
        folderId: folders[0].id
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-6 pt-safe animate-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-6 pt-4">
        <button onClick={onCancel} className="text-gray-400 dark:text-zinc-500 font-black uppercase text-xs tracking-widest active:text-gray-900">Cancel</button>
        <div className="flex items-center space-x-3">
           {isTranscribing && (
             <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Processing...</span>
             </div>
           )}
           <button 
            onClick={handleFinalize}
            disabled={!content.trim() || isRecording || isTranscribing || isFinalizing}
            className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-95"
          >
            {isFinalizing ? 'Saving' : 'Save Note'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden mb-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start your workspace. Write notes or record audio to transcribe automatically..."
          className="flex-1 w-full text-xl font-bold text-gray-800 dark:text-zinc-100 bg-transparent border-none focus:ring-0 resize-none placeholder-gray-200 dark:placeholder-zinc-800 leading-relaxed"
        />
      </div>

      <div className="bg-gray-50 dark:bg-zinc-900 rounded-[2rem] p-5 shadow-inner border border-gray-100 dark:border-zinc-800 pb-safe">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
              {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Idle'}
            </span>
            <span className={`text-xl font-black ${isRecording && !isPaused ? 'text-red-500 animate-pulse-red' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(recordingTime)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isRecording ? (
              <>
                <button 
                  onClick={togglePause}
                  className="w-12 h-12 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  {isPaused ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"/></svg>
                  )}
                </button>
                <button 
                  onClick={stopRecording}
                  className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-500/40 active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"/></svg>
                </button>
              </>
            ) : (
              <button 
                onClick={startRecording}
                disabled={isTranscribing || isFinalizing}
                className="w-16 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform disabled:opacity-30"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTaking;
