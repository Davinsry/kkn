import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '@/lib/json-db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { applyToAll, ...data } = body;

        if (applyToAll) {
            // Find the schedule to get its kegiatan name
            const all = JsonDB.getAll();
            const target = all.find(s => s.id === params.id);
            if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            // Update time only for all matching kegiatan
            const updateData: Record<string, string> = {};
            if (data.jam_mulai) updateData.jam_mulai = data.jam_mulai;
            if (data.jam_selesai) updateData.jam_selesai = data.jam_selesai;

            const count = JsonDB.updateAllByKegiatan(target.kegiatan, updateData);
            return NextResponse.json({ success: true, updated: count });
        }

        const updated = JsonDB.update(params.id, data);
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deleted = JsonDB.delete(params.id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }
}
