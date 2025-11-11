import { useState, useEffect } from "react";


export default function DisplayDocument() {
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [documentDetails, setDocumentDetails] = useState(null);

    useEffect(() => {
        const displayDocuments = async () => {
            try {
                const response = await fetch("http://localhost:3000/documents");
                if (!response.ok) throw new Error('Failed');
                const data = await response.json();
                setDocuments(data.documents);
            } catch (error) {
                console.error(error.message);
            }
        }

        displayDocuments();

        const autoRefreshing = setInterval(displayDocuments, 5000);

        return () => clearInterval(autoRefreshing);
    }, [])

    useEffect(() => {
        if (selectedDocumentId) {
            const selectDocument = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/documents/${selectedDocumentId}`);
                    if (!response.ok) throw new Error('Failed');
                    const data = await response.json();
                    setDocumentDetails(data.document);
                } catch (error) {
                    console.error(error.message);
                }
            }
            selectDocument();
        }
    }, [selectedDocumentId])


    return (
        <div>
            <h1>Uploaded documents:</h1>
            <div>
                {documents.map((element) => (
                    <div key={element.id}>
                        <div>
                            <p>Filename:  {element.filename}</p>
                            <p>Status: {element.status}</p>
                            <p>Type: {element.file_type}</p>
                            <p>Time uploaded: {element.upload_time}</p>
                            <button onClick={() => setSelectedDocumentId(element.id)}>View details</button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                {documentDetails && documentDetails.extracted_data && (
                    <div>
                        <p>Filename:  {documentDetails.filename}</p>
                        <p>Status: {documentDetails.status}</p>
                        <p>Type: {documentDetails.file_type}</p>
                        <p>Time uploaded: {documentDetails.upload_time}</p>

                        <div>
                            <p>Full details:</p>
                            {documentDetails.extracted_data.map((record, index) => {
                                const parsedContent = JSON.parse(record.content);

                                // basically i return the extracted data table 
                                // here i use the data_type and content object from the extractors.js   
                                return (
                                    <div key={index}>
                                        {record.data_type === "rowCount" && (
                                            <p>Row count: {parsedContent}</p>
                                        )}
                                        {record.data_type === "columnsName" && (
                                            <p>Columns name: {parsedContent.join(', ')}</p>
                                        )}
                                        {record.data_type === "previewData" && parsedContent.length > 0 && (
                                            <div>
                                                <strong>Preview:</strong>
                                                <table border="1">
                                                    <thead>
                                                        <tr>
                                                            {Object.keys(parsedContent[0]).map((columnName, colIndex) => (
                                                                <th key={colIndex}>{columnName}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {parsedContent.map((row, rowIndex) => (
                                                            <tr key={rowIndex}>
                                                                {Object.values(row).map((value, cellIndex) => (
                                                                    <td key={cellIndex}>{value}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {record.data_type === "numPages" && (
                                            <p>Num of pages: {parsedContent}</p>
                                        )}
                                        {record.data_type === "metadata" && (
                                            <p>Metadata: {JSON.stringify(parsedContent)}</p>
                                        )}
                                        {record.data_type === "characters" && (
                                            <p>Characters: {parsedContent}</p>
                                        )}
                                        {record.data_type === "height" && (
                                            <p>Height: {parsedContent}</p>
                                        )}
                                        {record.data_type === "width" && (
                                            <p>Width: {parsedContent}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}