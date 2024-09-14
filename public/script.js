// Load existing files from S3
async function loadFiles() {
    const response = await fetch('/files');
    const files = await response.json();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    files.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${file}
            <button onclick="downloadFile('${file}')">Download</button>
            <button onclick="replaceFile('${file}')">Replace</button>
            <button onclick="deleteFile('${file}')">Delete</button>
        `;
        fileList.appendChild(li);
    });
}

// Upload a file to S3
async function uploadFile() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return alert('Please select a file to upload.');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('File uploaded successfully!');
        loadFiles();
    } else {
        alert('File upload failed.');
    }
}

// Download a file from S3
function downloadFile(fileName) {
    window.location.href = `/download/${fileName}`;
}

// Replace a file in S3
async function replaceFile(fileName) {
    const newFile = document.getElementById('fileInput').files[0];
    if (!newFile) return alert('Please select a file to replace with.');

    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('fileName', fileName);

    const response = await fetch('/replace', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('File replaced successfully!');
        loadFiles();
    } else {
        alert('File replacement failed.');
    }
}

// Delete a file from S3
async function deleteFile(fileName) {
    const response = await fetch(`/delete/${fileName}`, { method: 'DELETE' });
    if (response.ok) {
        alert('File deleted successfully!');
        loadFiles();
    } else {
        alert('File deletion failed.');
    }
}

// Load the files on page load
window.onload = loadFiles;
