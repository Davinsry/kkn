import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { GoogleDriveService } from '@/lib/drive';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check if Drive is Configured
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
        const hasCredentials = credPath && fs.existsSync(path.resolve(credPath));

        if (folderId && hasCredentials) {
            // Upload to Google Drive
            try {
                console.log('Uploading to Google Drive...', file.name);
                const driveFile = await GoogleDriveService.uploadFile(file, folderId);

                // Use webContentLink (download) or webViewLink (view)
                // For <img> tags, we might need a proxy or public link. 
                // webContentLink works if file is public, but let's return webViewLink for now as "proof link"
                return NextResponse.json({
                    url: driveFile.webViewLink,
                    driveId: driveFile.id,
                    type: 'drive'
                });
            } catch (driveError) {
                console.error('Drive upload failed, falling back to local:', driveError);
                // Fallback continues below
            }
        }

        // Fallback: Local Upload
        console.log('Uploading to local storage...');
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '-' + file.name.replace(/\s/g, '-');

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({ url: `/uploads/${filename}`, type: 'local' });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
