import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
import path from 'path';

// Module-level event bus — SSE route subscribes to this
export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const DB_PATH = process.env.DB_PATH ?? './baby_bets.db';
  const dbPath = path.isAbsolute(DB_PATH) ? DB_PATH : path.join(process.cwd(), DB_PATH);

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.exec(`
    CREATE TABLE IF NOT EXISTS guesses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      gender      TEXT    NOT NULL CHECK(gender IN ('boy', 'girl')),
      weight_lbs  INTEGER NOT NULL,
      weight_oz   INTEGER NOT NULL,
      birth_date  TEXT    NOT NULL,
      birth_time  TEXT    NOT NULL,
      length_in   REAL    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return _db;
}
