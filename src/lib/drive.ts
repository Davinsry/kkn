import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

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
            const stream = Readable.from(buffer);

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

    async getOrCreateSubfolder(parentId: string, folderName: string) {
        try {
            // Check if folder exists
            const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
            const listRes = await drive.files.list({
                q,
                fields: 'files(id, name)',
                spaces: 'drive',
            });

            if (listRes.data.files && listRes.data.files.length > 0) {
                return listRes.data.files[0].id;
            }

            // Create if not exists
            const createRes = await drive.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId],
                },
                fields: 'id',
            });

            return createRes.data.id;
        } catch (error) {
            console.error('Error getting/creating subfolder:', error);
            throw error;
        }
    }
};
