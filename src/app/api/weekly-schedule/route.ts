import { NextRequest, NextResponse } from 'next/server';
import { WeeklyDB, WeeklyItem } from '@/lib/weekly-db';

export async function GET() {
    return NextResponse.json(WeeklyDB.getAll());
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Handle bulk import or single create
        if (Array.isArray(data)) {
            // If importing by person, we might want to clear old data for that person first
            // but for simple import, we'll just add
            const items: WeeklyItem[] = data.map(item => ({
                id: Math.random().toString(36).substr(2, 9),
                ...item
            }));
            const existing = WeeklyDB.getAll();
            WeeklyDB.saveAll([...existing, ...items]);
            return NextResponse.json({ success: true, count: items.length });
        }

        const newItem = WeeklyDB.create(data);
        return NextResponse.json(newItem);
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
