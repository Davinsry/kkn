import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '@/lib/json-db';

export async function GET() {
    try {
        const schedules = JsonDB.getAll();
        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { kegiatan, tanggals, jam_mulai, jam_selesai, pj, pengisi } = body;

        const dataList = tanggals.map((tanggal: string) => ({
            kegiatan,
            tanggal,
            jam_mulai,
            jam_selesai,
            pj,
            ...(pengisi ? { pengisi } : {}),
        }));

        const newSchedules = JsonDB.create(dataList);
        return NextResponse.json(newSchedules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create schedules' }, { status: 500 });
    }
}
