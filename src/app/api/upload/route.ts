import { NextRequest, NextResponse } from 'next/server';
// Ver: 1.0.1 - Final ESLint Fix
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

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
            // ... existing drive logic ...
            // (Keeping it for reference or if user switches back)
        }

        // --- N8N INTEGRATION ---
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        const enableN8n = process.env.ENABLE_N8N === 'true';

        console.log('[DEBUG] n8n Config Check:');
        console.log('- Webhook URL:', n8nUrl ? 'Set' : 'Missing');
        console.log('- Enabled (Env):', enableN8n);

        if (enableN8n && n8nUrl) {
            try {
                console.log('[N8N] Pushing to:', n8nUrl);
                console.log('[N8N] File:', file.name, 'Size:', file.size);

                const n8nFormData = new FormData();
                n8nFormData.append('data', file);
                n8nFormData.append('filename', file.name);
                n8nFormData.append('type', type || 'general');
                n8nFormData.append('folderId', folderId || '');

                const n8nRes = await fetch(n8nUrl, {
                    method: 'POST',
                    body: n8nFormData,
                });

                const responseText = await n8nRes.text();
                console.log('[N8N] Response Status:', n8nRes.status);
                console.log('[N8N] Response Body:', responseText);

                if (n8nRes.ok) {
                    try {
                        const n8nData = JSON.parse(responseText);
                        console.log('[N8N] Success Parse JSON');
                        if (n8nData.url || n8nData.webViewLink) {
                            return NextResponse.json({
                                url: n8nData.url || n8nData.webViewLink,
                                type: 'drive-n8n'
                            });
                        }
                    } catch {
                        console.warn('[N8N] Response not JSON, but status OK');
                    }
                } else {
                    console.warn('[N8N] Webhook failed with status:', n8nRes.status);
                }
            } catch (n8nError) {
                console.error('[N8N] Error during fetch to n8n:', n8nError);
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
