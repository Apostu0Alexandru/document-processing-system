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
        error_message TEXT
    )
`)

db.exec(`
    CREATE TABLE  IF NOT EXISTS extracted_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        data_type TEXT NOT NULL,
        content TEXT NOT NULL,
        extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES documents(id)
    )
`)


function saveDocument(fileName, fileType, fileSize) {
    try {
        const stmt = db.prepare(
            `INSERT INTO documents (filename, file_type, file_size, status ) VALUES (?,?,?,'pending')`
        );
        const result = stmt.run(fileName, fileType, fileSize);
        return result.lastInsertRowid;
    } catch (error) {
        console.error("Failed saving document:", { fileName, fileType, fileSize, error: error.message });
        throw error;
    }
}

function fetchDocuments() {
    try {
        const stmt = db.prepare(`
            SELECT id, filename, file_type, status, upload_time, file_size
            FROM documents
            ORDER BY upload_time DESC
            `);
        const result = stmt.all();
        return result;

    } catch (error) {
        console.error("Failed to get documents", { error: error.message });
        throw error;
    }
}

function fetchDocumentById(docId) {
    try {
        const stmt = db.prepare(`
            SELECT id, filename, file_type, file_size, status, upload_time, error_message
            FROM documents
            WHERE id = ?
            `);
        const document = stmt.get(docId);
        if (!document) {
            return null;
        }

        const extractedStmt = db.prepare(`
            SELECT id, data_type, content, extracted_at
            FROM extracted_data
            WHERE document_id = ?
            ORDER BY extracted_at DESC
        `);
        const extractedData = extractedStmt.all(docId);

        // Combine the document info with its extracted data
        // This creates a complete picture of the document
        return {
            ...document,
            extracted_data: extractedData
        };

    } catch (error) {
        console.error("Failed to get document with the id", docId, { error: error.message });
        throw error;
    }
}

export { db, saveDocument, fetchDocuments, fetchDocumentById }