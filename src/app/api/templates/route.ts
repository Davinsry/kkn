import { NextRequest, NextResponse } from 'next/server';
import { TemplateDB } from '@/lib/template-db';

export async function GET() {
    try {
        const templates = TemplateDB.getAll();
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nama, jam_mulai, jam_selesai, pj, pengisi } = body;
        if (!nama) return NextResponse.json({ error: 'Nama required' }, { status: 400 });
        const newTemplate = TemplateDB.create({ nama, jam_mulai, jam_selesai, pj, pengisi });
        return NextResponse.json(newTemplate);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
