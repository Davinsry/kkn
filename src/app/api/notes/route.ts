import { NextRequest, NextResponse } from 'next/server';
import { NotesDB } from '@/lib/notes-db';

export async function GET() {
    try {
        const notes = NotesDB.getAll();
        return NextResponse.json(notes);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, content, color } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newNote = NotesDB.create({
            title,
            content,
            color: color || 'bg-yellow-200' // Default yellow sticky note
        });

        return NextResponse.json(newNote);
    } catch {
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
