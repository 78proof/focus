
export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  timestamp: number;
  type: 'text' | 'voice';
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedDateTime: string;
  isImportant: boolean;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  location?: string;
}

export type AppTab = 'dashboard' | 'notes' | 'outlook' | 'ai';
