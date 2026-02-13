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
        const title = formData.get('title') as string;
        const personName = formData.get('personName') as string;
        const rawDate = formData.get('date') as string; // yyyy-MM-dd

        console.log('[DEBUG] Upload Incoming:');
        console.log('- Raw Title:', title);
        console.log('- Raw Person:', personName);
        console.log('- Raw Date:', rawDate);
        console.log('- File Name:', file?.name);

        const safeTitle = title && title.trim() !== '' ? title : 'Tanpa-Judul';
        const safePerson = personName && personName.trim() !== '' ? personName : 'Anonim';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Format Date for Filename: dd/mm/yyyy -> dd-mm-yyyy for filesystem safety
        let formattedDate = '';
        if (rawDate) {
            const [y, m, d] = rawDate.split('-');
            formattedDate = `${d}-${m}-${y}`;
        } else {
            formattedDate = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
        }

        // Custom Filename: Judul Setor dd-mm-yyyy
        const customFilename = `${safeTitle} ${safePerson} ${formattedDate}`.replace(/[/\\?%*:|"<>]/g, '-');
        const extension = path.extname(file.name);
        const finalFilename = `${customFilename}${extension}`;

        // Check if Drive is Configured
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const incomeFolderId = process.env.GOOGLE_DRIVE_INCOME_FOLDER_ID || folderId;
        const outcomeFolderId = process.env.GOOGLE_DRIVE_OUTCOME_FOLDER_ID || folderId;

        const isEnabled = process.env.ENABLE_GOOGLE_DRIVE === 'true';

        if (folderId && isEnabled) {
            // ... existing drive logic ...
        }

        // --- N8N INTEGRATION ---
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        const enableN8n = process.env.ENABLE_N8N === 'true';

        console.log('[DEBUG] n8n Config Check:');
        console.log('- Webhook URL:', n8nUrl ? 'Set' : 'Missing');
        console.log('- Enabled (Env):', enableN8n);

        if (enableN8n && n8nUrl) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            try {
                console.log('[N8N] Pushing to:', n8nUrl);
                const targetFolderId = type === 'income' ? incomeFolderId : outcomeFolderId;

                const n8nFormData = new FormData();
                n8nFormData.append('data', file);
                n8nFormData.append('filename', finalFilename);
                n8nFormData.append('type', type || 'general');
                n8nFormData.append('folderId', targetFolderId || '');
                n8nFormData.append('title', safeTitle);
                n8nFormData.append('personName', safePerson);
                n8nFormData.append('date', formattedDate.replace(/-/g, '/'));

                const n8nRes = await fetch(n8nUrl, {
                    method: 'POST',
                    body: n8nFormData,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                const responseText = await n8nRes.text();

                if (n8nRes.ok) {
                    try {
                        const n8nData = JSON.parse(responseText);
                        console.log('[N8N] Success');
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
                    console.warn('[N8N] Webhook failed with status:', n8nRes.status, responseText);
                }
            } catch (n8nError: any) {
                clearTimeout(timeoutId);
                if (n8nError.name === 'AbortError') {
                    console.error('[N8N] Error: Request timed out after 15s');
                } else {
                    console.error('[N8N] Error during fetch to n8n:', n8nError);
                }
                // Continue to local fallback
            }
        }

        // Fallback: Local Upload
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, finalFilename);
        console.log('[LOCAL] Menyimpan file ke:', filepath);
        await writeFile(filepath, buffer);

        return NextResponse.json({
            url: `/api/uploads/${finalFilename}`,
            type: 'local'
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
