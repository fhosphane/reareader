// Represents a book or document
export interface Book {
  id: string;
  title: string;
  author?: string;
  filePath: string;
  format: 'txt' | 'epub' | 'pdf' | 'mobi';
  addedAt: number;
  lastOpenedAt?: number;
}

// Reading position in a book
export interface ReadingPosition {
  bookId: string;
  position: number;      // Character position
  percentage: number;    // Reading progress as percentage
  updatedAt: number;
}

// Plugin contract — every plugin must implement this
export interface ReaderPlugin {
  name: string;
  version: string;
  supportedFormats: string[];
  canRead(filePath: string): boolean;
  readContent(filePath: string): Promise<string>;
}

// Application event types
export type AppEventType =
  | 'book:opened'
  | 'book:closed'
  | 'position:updated'
  | 'plugin:registered'
  | 'plugin:error';

// Event structure
export interface AppEvent<T = unknown> {
  type: AppEventType;
  payload: T;
  timestamp: number;
}
