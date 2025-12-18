
export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  timestamp: number;
  type: 'text' | 'voice';
  folderId: string;
}

export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  createdAt: number;
  priority?: 'p1' | 'p2' | 'p3' | 'p4';
  dueDate?: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isImportant: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
}

export type AppTab = 'dashboard' | 'notes' | 'todo' | 'google' | 'ai';
export type Theme = 'light' | 'dark' | 'monochrome' | 'hyperbridge';
