import Database from '@tauri-apps/plugin-sql';
import type { ReadingPosition } from '../types';

let db: Database | null = null;

// Initialize the database and create tables if they don't exist
export async function initDatabase(): Promise<void> {
  db = await Database.load('sqlite:reareader.db');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reading_positions (
      book_id TEXT PRIMARY KEY,
      position INTEGER NOT NULL,
      percentage REAL NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}

// Save or update reading position
export async function savePosition(pos: ReadingPosition): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.execute(
    `INSERT INTO reading_positions (book_id, position, percentage, updated_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(book_id) DO UPDATE SET
       position = $2,
       percentage = $3,
       updated_at = $4`,
    [pos.bookId, pos.position, pos.percentage, pos.updatedAt]
  );
}

// Load reading position for a book
export async function loadPosition(bookId: string): Promise<ReadingPosition | null> {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.select<ReadingPosition[]>(
    'SELECT book_id as bookId, position, percentage, updated_at as updatedAt FROM reading_positions WHERE book_id = $1',
    [bookId]
  );

  return rows.length > 0 ? rows[0] : null;
}
