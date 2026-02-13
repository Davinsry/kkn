import { NextRequest, NextResponse } from 'next/server';
// Ver: 1.0.1 - Final ESLint Fix
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { GoogleDriveService } from '@/lib/drive';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'income' or 'expense'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check if Drive is Configured
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
        const absoluteCredPath = path.resolve(process.cwd(), credPath);
        const hasCredentials = credPath && fs.existsSync(absoluteCredPath);
        const isEnabled = process.env.ENABLE_GOOGLE_DRIVE === 'true';

        console.log('[DEBUG] Drive Config Check:');
        console.log('- Folder ID:', folderId ? 'Set' : 'Missing');
        console.log('- Cred Path (Env):', credPath);
        console.log('- Absolute Path:', absoluteCredPath);
        console.log('- File Exists:', hasCredentials);
        console.log('- Enabled (Env):', isEnabled);

        if (folderId && hasCredentials && isEnabled) {
            // Upload to Google Drive
            try {
                // Determine Subfolder
                let targetFolderId = folderId;
                if (type) {
                    const subfolderName = type === 'income' ? 'Cashflow - Pembayaran' : 'Cashflow - Pengeluaran';
                    const subId = await GoogleDriveService.getOrCreateSubfolder(folderId, subfolderName);
                    if (subId) targetFolderId = subId;
                }

                console.log(`Uploading to Google Drive (${type || 'root'})...`, file.name);
                const driveFile = await GoogleDriveService.uploadFile(file, targetFolderId);

                // Use webContentLink (download) or webViewLink (view)
                return NextResponse.json({
                    url: driveFile.webViewLink,
                    driveId: driveFile.id,
                    type: 'drive'
                });
            } catch (driveError: unknown) {
                if (driveError && typeof driveError === 'object' && 'code' in driveError && (driveError as { code: number }).code === 403) {
                    console.warn('[DRIVE] Quota Error (403): Robot tidak punya kuota di Drive Pribadi. Beralih ke penyimpanan Lokal Server...');
                } else {
                    console.error('[DRIVE] Gagal upload ke Drive, beralih ke Lokal:', driveError);
                }
                // Fallback continues below
            }
        }

        // Fallback: Local Upload
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '-' + file.name.replace(/\s/g, '-');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        console.log('[LOCAL] Menyimpan file ke:', filepath);
        await writeFile(filepath, buffer);

        return NextResponse.json({
            url: `/api/uploads/${filename}`,
            type: 'local'
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
