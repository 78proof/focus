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
      alert("Microphone access is required for Granola-style recording.");
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
      alert("Transcription failed. Check your Gemini API key.");
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
        title: content.split('\n')[0].substring(0, 40) || 'New Note',
        content: content,
        summary: result.summary,
        timestamp: Date.now(),
        type: 'voice',
        folderId: result.folderId || folders[0].id
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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-6 pt-safe">
      <div className="flex justify-between items-center mb-6 pt-4">
        <button onClick={onCancel} className="text-gray-400 font-black uppercase text-xs tracking-widest">Cancel</button>
        <button 
          onClick={handleFinalize}
          disabled={!content.trim() || isRecording || isTranscribing || isFinalizing}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30"
        >
          {isFinalizing ? 'Saving' : 'Finalize'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden mb-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tap the mic to record or start typing..."
          className="w-full h-full text-2xl font-black text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 resize-none placeholder-gray-200 dark:placeholder-zinc-800 leading-tight"
        />
      </div>

      {isTranscribing && (
        <div className="flex items-center space-x-3 mb-6 animate-pulse">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Transcribing audio...</span>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-zinc-900 rounded-[3rem] p-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
              {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
            </span>
            <span className={`text-2xl font-black ${isRecording && !isPaused ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(recordingTime)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isRecording ? (
              <>
                <button 
                  onClick={togglePause}
                  className="w-14 h-14 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                >
                  {isPaused ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"/></svg>
                  )}
                </button>
                <button 
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 animate-pulse-red"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"/></svg>
                </button>
              </>
            ) : (
              <button 
                onClick={startRecording}
                disabled={isTranscribing || isFinalizing}
                className="w-20 h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-2xl active:scale-90 disabled:opacity-30"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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