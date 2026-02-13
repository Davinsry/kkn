import { NextResponse } from 'next/server';
import { WA } from '@/lib/whatsapp';

export async function GET() {
    try {
        await WA.init();
        const status = await WA.getStatus();
        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
    }
}
