import { NextRequest, NextResponse } from 'next/server';
import { NotesDB } from '@/lib/notes-db';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deleted = NotesDB.delete(params.id);
        if (!deleted) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const updated = NotesDB.update(params.id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}
