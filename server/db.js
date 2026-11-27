import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || join(__dirname, 'data')
mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = process.env.DB_PATH || join(DATA_DIR, 'bookings.db')

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id           TEXT PRIMARY KEY,
    date         TEXT NOT NULL,
    time         TEXT NOT NULL,
    name         TEXT NOT NULL,
    phone        TEXT,
    service      TEXT,
    created_at   TEXT NOT NULL,
    slot_minutes INTEGER NOT NULL DEFAULT 60,
    UNIQUE(date, time)
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
`)

export const SLOT_MINUTES = 60
