import express from 'express'
import cors from 'cors'
import multer from 'multer';
import fs from 'fs'
import { saveDocument, fetchDocuments, fetchDocumentById } from './database.js';

const app = express();
const PORT = 3000;

const uploadDir = './upload';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB in bytes
    },
    fileFilter: (req, file, cb) => {

        const allowedTypes = ['text/csv', 'application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Invalid file type. Only CSV, PDF, and images are allowed.'));
        }
    }
});


app.use(cors());
app.use(express.json());


app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded or invalid file type",
                allowedTypes: ['CSV', 'PDF', 'JPG', 'PNG', 'GIF', 'WEBP']
            });
        }

        const filename = req.file.originalname;
        const fileSize = req.file.size;


        let fileType;
        if (req.file.mimetype === 'text/csv') {
            fileType = 'csv';
        } else if (req.file.mimetype === 'application/pdf') {
            fileType = 'pdf';
        } else if (req.file.mimetype.startsWith('image/')) {
            fileType = 'image';
        }

        const documentId = saveDocument(filename, fileType, fileSize);
        res.status(201).json({
            success: true,
            documentId,
            filename,
            message: "File uploaded successfully and queued for processing",
        });
    } catch (error) {
        console.error("Upload failed:", error);

        if (error.message.includes('File too large')) {
            return res.status(413).json({
                error: "File too large",
                message: "Maximum file size is 10MB"
            });
        }

        res.status(500).json({
            error: "Failed to upload document",
            message: error.message
        });
    }
})

app.get('/documents', (req, res) => {
    try {
        const documents = fetchDocuments();
        res.json({
            success: true,
            count: documents.length, // Nice to include the count
            documents
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get the documents info",
            message: error.message
        })
    }
})

app.get('/documents/:id', (req, res) => {
    try {
        const documentId = parseInt(req.params.id, 10);

        if (isNaN(documentId)) {
            return res.status(400).json({
                error: "Invalid document ID",
                message: "Document ID must be a number"
            });
        }

        const document = fetchDocumentById(documentId);

        if (!document) {
            return res.status(404).json({
                error: "Document not found",
                message: `No document exists with ID ${documentId}`
            });
        }

        res.json({
            success: true,
            document
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to get the document info",
            message: error.message
        })
    }
})

app.listen(PORT, () => {
    console.log("runnnig");
});
