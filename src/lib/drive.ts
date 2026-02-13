import { google } from 'googleapis';
import path from 'path';

// Load credentials from environment variable or default location
const KEY_FILE_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.join(process.cwd(), 'kknmh-487307-eb652448f0d0.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

export const GoogleDriveService = {
    async uploadFile(file: File, folderId: string) {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);

            const response = await drive.files.create({
                requestBody: {
                    name: file.name,
                    parents: [folderId], // Upload to specific folder
                },
                media: {
                    mimeType: file.type,
                    body: bufferStream,
                },
                fields: 'id, name, webViewLink, webContentLink',
            });

            return response.data;
        } catch (error) {
            console.error('Google Drive Upload Error:', error);
            throw error;
        }
    },
};
