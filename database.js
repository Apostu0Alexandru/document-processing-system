import Database from 'better-sqlite3';
const db = new Database('documents.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE  IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size REAL NOT NULL,
        status TEXT NOT NULL,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
    )
`)

db.exec(`
    CREATE TABLE  IF NOT EXISTS extracted_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        data_type TEXT NOT NULL,
        content TEXT NOT NULL,
        extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES documents(id)
    )
`)

export { db }