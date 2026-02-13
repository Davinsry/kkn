import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

// Load credentials from environment variable or default location
const KEY_FILE_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.join(process.cwd(), 'kknmh-487307-eb652448f0d0.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

// Add timeout to prevent long delays when Drive is problematic
google.options({
    timeout: 5000,
    retry: false
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
                    parents: [folderId],
                },
                media: {
                    mimeType: file.type,
                    body: stream,
                },
                fields: 'id, name, webViewLink, webContentLink',
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getOrCreateSubfolder(parentId: string, folderName: string) {
        try {
            const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
            const listRes = await drive.files.list({
                q,
                fields: 'files(id, name)',
                spaces: 'drive',
            });

            if (listRes.data.files && listRes.data.files.length > 0) {
                return listRes.data.files[0].id;
            }

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
