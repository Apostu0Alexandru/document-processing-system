import { getUnprocessedDocuments, markDocumentAsProcessing, markDocumentAsCompleted, markDocumentAsFailed } from "./database.js";
import { extractCSVData, extractPDFData, extractImageData } from "./extractors.js";
import fs from 'fs';
import path from "path";

async function documentProcessing() {
    let document = null;
    try {

        const unprocessedDoc = getUnprocessedDocuments();

        if (unprocessedDoc.length === 0) {
            console.log("There are none pending documents to process!");
            return;
        }
        document = unprocessedDoc[0];
        const fileType = document.file_type;

        markDocumentAsProcessing(document.id);

        // i get the filename from the db
        const filename = document.filename;
        const directory = './upload';

        // just because the files are saved with a timestamp like "123-records.csv". and saved in the database like "records.csv"
        const dirPath = fs.readdirSync(directory);

        // here i look into the upload directory to see if some elements end with the filename. 
        const findPath = dirPath.find((element) => element.endsWith(filename));

        // i use the join with path to actually get the full path of the file /upload/123-records.csv
        const filePath = path.join(directory, findPath)
        let extractedRecords = [];

        switch (fileType) {
            case "csv":
                extractedRecords = extractCSVData(filePath);
                break;
            case "pdf":
                extractedRecords = await extractPDFData(filePath);
                break;
            case "image":
                extractedRecords = await extractImageData(filePath);
                break;
            default:
                console.log("Invalid format!");
                break;
        }

        markDocumentAsCompleted(document.id, extractedRecords);

    } catch (error) {
        if (document)
            markDocumentAsFailed(document.id, error.message);
    }

}

setInterval(documentProcessing, 10000);