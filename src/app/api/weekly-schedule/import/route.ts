import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { WeeklyDB, WeeklyItem } from '@/lib/weekly-db';

export async function POST() {
    try {
        const mdPath = path.join(process.cwd(), 'jadwal.md');
        if (!fs.existsSync(mdPath)) {
            return NextResponse.json({ error: 'File jadwal.md tidak ditemukan' }, { status: 404 });
        }

        const content = fs.readFileSync(mdPath, 'utf-8');
        const sections = content.split(/# Jadwal Kuliah /i).filter(s => s.trim() !== '');

        const itemsToSave: Omit<WeeklyItem, 'id'>[] = [];

        sections.forEach(section => {
            const lines = section.split('\n');
            const person = lines[0].trim();

            // Find table lines
            const tableLines = lines.filter(l => l.includes('|') && !l.includes('---') && !l.toLowerCase().includes('hari'));

            tableLines.forEach(line => {
                const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
                // Expected format: | Hari | Jam | Kode | Mata Kuliah | Kelas | Dosen | Ruang |
                // Parts will be: [Hari, Jam, Kode, Mata Kuliah, Kelas, Dosen, Ruang]
                if (parts.length >= 4) {
                    itemsToSave.push({
                        person,
                        day: parts[0],
                        timeRange: parts[1],
                        subject: parts[3],
                        room: parts[6] || '',
                        color: '' // Will be assigned by client or DB logic if empty
                    });
                }
            });
        });

        // Clear existing data to avoid duplicates from MD?
        // Or just append? User said "impor" usually implies refresh or merge.
        // Let's clear and re-import to keep it clean with the MD as source of truth.
        WeeklyDB.saveAll([]);

        itemsToSave.forEach(item => {
            WeeklyDB.create(item);
        });

        return NextResponse.json({ success: true, count: itemsToSave.length });
    } catch (error) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: 'Gagal impor data' }, { status: 500 });
    }
}
