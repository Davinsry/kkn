import { NextResponse } from 'next/server';
import { WA } from '@/lib/whatsapp';

export async function GET() {
    const status = await WA.getStatus();
    return NextResponse.json(status);
}
