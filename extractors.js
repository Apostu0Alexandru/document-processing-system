import { parse } from "csv-parse/sync";
import { PDFParse } from "pdf-parse";
import fs from 'fs';
import sharp from "sharp";



function extractCSVData(filePath) {
    try {
        const dataRecords = fs.readFileSync(filePath, "utf-8");

        let extractedRecords = parse(dataRecords, {
            skip_empty_lines: true,
            columns: true,
        })

        if (extractedRecords.length === 0) {
            throw new Error('CSV file contains no data rows')
        }

        const rowCount = extractedRecords.length;
        const columnsName = Object.keys(extractedRecords[0]);
        const previewData = extractedRecords.slice(0, 5);

        const result = [
            { data_type: 'rowCount', content: JSON.stringify(rowCount) },
            { data_type: 'columnsName', content: JSON.stringify(columnsName) },
            { data_type: 'previewData', content: JSON.stringify(previewData) }
        ];

        return result;
    } catch (error) {
        console.error("CSV extraction failed", error.message);
        throw new Error(`Failed to extract CSV data: ${error.message}`);
    }
}

async function extractPDFData(filePath) {
    try {
        const dataRecords = fs.readFileSync(filePath);

        let extractedRecords = await PDFParse(dataRecords);

        if (!extractedRecords.text) {
            throw new Error('PDF file contains no data');
        }

        const first1000characters = extractedRecords.text.substring(0, 1000);
        const numPages = extractedRecords.numpages;
        const metadata = extractedRecords.info;

        const result = [
            { data_type: "numPages", content: JSON.stringify(numPages) },
            { data_type: "characters", content: JSON.stringify(first1000characters) },
            { data_type: "metadata", content: JSON.stringify(metadata) },
        ];

        return result;
    } catch (error) {
        console.error("PDF extraction failed", error.message);
        throw new Error(`Failed to extract PDF data: ${error.message}`);
    }
}

async function extractImageData(filePath) {
    try {
        const dataRecords = fs.readFileSync(filePath);

        const extractedRecords = await sharp(dataRecords).metadata();

        const height = extractedRecords.height;
        const width = extractedRecords.width;

        const fileFormat = extractedRecords.format;
        const channels = extractedRecords.channels;
        const space = extractedRecords.space;
        const depth = extractedRecords.depth;
        const density = extractedRecords.density;
        const hasAlpha = extractedRecords.hasAlpha;
        const size = extractedRecords.size;

        const result = [
            { data_type: "height", content: JSON.stringify(height) },
            { data_type: "width", content: JSON.stringify(width) },
            { data_type: "size", content: JSON.stringify(size) },
            { data_type: "fileFormat", content: JSON.stringify(fileFormat) },
            { data_type: "channels", content: JSON.stringify(channels) },
            { data_type: "space", content: JSON.stringify(space) },
            { data_type: "depth", content: JSON.stringify(depth) },
            { data_type: "density", content: JSON.stringify(density) },
            { data_type: "hasAlpha", content: JSON.stringify(hasAlpha) },
        ];

        return result;
    } catch (error) {
        console.error("Image extraction failed", error.message);
        throw new Error(`Failed to extract image data: ${error.message}`);
    }
}

export { extractCSVData, extractPDFData, extractImageData }
