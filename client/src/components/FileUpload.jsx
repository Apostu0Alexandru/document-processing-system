import { useState } from "react";

export default function FileUpload() {
    const [trackFile, setTrackFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileSelect = (event) => {
        // event.target is the file input element
        // event.target.files is a FileList containing selected files
        // event.target.files[0] is the first (and only) file for single file upload
        const selectedFile = event.target.files[0];

        // Store the selected file in state
        setTrackFile(selectedFile);

        // Clear any previous upload status message
        setUploadStatus("");
    };

    async function handleUpload() {
        try {
            if (!trackFile) {
                console.log("There is no selected document");
                return;
            }

            const doc = new FormData();
            doc.append('file', trackFile);

            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                body: doc,
            })
            const data = await response.json();
            if (response.ok) {

                setUploadStatus(`Success! File "${trackFile.name}" uploaded successfully`);

                // Clear the selected file so user can upload another
                setTrackFile(null);

                // Reset the file input element
                document.querySelector('input[type="file"]').value = '';
            } else {
                setUploadStatus(`Error: ${data.error || 'Upload failed'}`);
            }
        } catch (error) {
            setUploadStatus(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div>
            <h2>Upload a Document</h2>

            <input
                type="file"
                onChange={handleFileSelect}
                accept=".csv,.pdf,.jpg,.jpeg,.png,.gif,.webp"
            />
            <button
                onClick={handleUpload}
                disabled={!trackFile || isUploading}
            >
                {isUploading ? 'Uploading...' : 'Upload File'}
            </button>

            {uploadStatus && (
                <p style={{
                    color: uploadStatus.includes('Success') ? 'green' : 'red'
                }}>
                    {uploadStatus}
                </p>
            )}
        </div>
    )
}