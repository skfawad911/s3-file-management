const express = require('express');
const fileUpload = require('express-fileupload');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

// AWS S3 configuration
const s3Client = new S3Client({
    region: 'your-region',
    credentials: {
        accessKeyId: 'your-access-key-id',
        secretAccessKey: 'your-secret-access-key'
    }
});

const BUCKET_NAME = 'your-s3-bucket-name';

// List all files in S3
app.get('/files', async (req, res) => {
    try {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const data = await s3Client.send(command);
        const fileNames = data.Contents.map(file => file.Key);
        res.json(fileNames);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Upload a file to S3
app.post('/upload', async (req, res) => {
    try {
        const file = req.files.file;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.name,
            Body: file.data
        });
        await s3Client.send(command);
        res.send('File uploaded successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
});

// Download a file from S3
// app.get('/download/:fileName', async (req, res) => {
//     try {
//         const command = new GetObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: req.params.fileName
//         });
//         const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//         res.redirect(signedUrl);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

app.get('/download/:fileName', async (req, res) => {
    try {
        // Create the GetObjectCommand
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.params.fileName
        });

        // Fetch the file from S3
        const data = await s3Client.send(command);

        // Set headers to force download
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileName}"`);
        res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');

        // Pipe the S3 object data to the response
        data.Body.pipe(res);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Replace a file in S3
app.post('/replace', async (req, res) => {
    try {
        const file = req.files.file;
        const fileName = req.body.fileName;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: file.data
        });
        await s3Client.send(command);
        res.send('File replaced successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a file from S3
app.delete('/delete/:fileName', async (req, res) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.params.fileName
        });
        await s3Client.send(command);
        res.send('File deleted successfully.');
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
