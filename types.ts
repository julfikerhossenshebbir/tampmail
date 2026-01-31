export interface Message {
  id: string;
  sender: string;
  subject: string;
  date: string; // The raw string or timestamp from API
  timestamp: number;
}

export interface UserCredentials {
  email: string;
  accessKey: string;
}

export interface MessageContent {
  id: string;
  content: string; // HTML content
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  messages?: any[]; // Raw API often returns partial objects in list
  data?: any;
  email?: string;
  password?: string;
  content?: string;
}
