import { NextRequest, NextResponse } from 'next/server';
import { WAService } from '@/lib/wa-service';
import { WA } from '@/lib/whatsapp';
import { JsonDB } from '@/lib/json-db';

export async function POST(req: NextRequest) {
    try {
        const { type, target } = await req.json(); // target is optional override
        const schedules = JsonDB.getAll();

        let reminders = [];
        if (type === '8AM') {
            reminders = WAService.getTodayReminders(schedules);
        } else if (type === '10PM') {
            reminders = WAService.getTomorrowEarlyReminders(schedules);
        } else {
            return NextResponse.json({ error: 'Invalid type. Use 8AM or 10PM' }, { status: 400 });
        }

        if (reminders.length === 0) {
            return NextResponse.json({ message: 'No reminders found' });
        }

        const message = WAService.formatWAMessage(type, reminders);

        // Use env var for default target, or override
        // format: 1203630xxx@g.us (Group) or 628xxx@s.whatsapp.net (Private)
        const targetId = target || process.env.WA_TARGET_ID;

        if (!targetId) {
            return NextResponse.json({ error: 'No WA_TARGET_ID configured' }, { status: 500 });
        }

        await WA.sendMessage(targetId, message);
        return NextResponse.json({ success: true, message });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
    }
}
