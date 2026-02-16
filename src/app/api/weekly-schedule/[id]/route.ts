import { NextRequest, NextResponse } from 'next/server';
import { WeeklyDB } from '@/lib/weekly-db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await req.json();
        const updated = WeeklyDB.update(params.id, data);
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = WeeklyDB.delete(params.id);
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
