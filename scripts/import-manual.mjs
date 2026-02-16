import fs from 'fs';
import path from 'path';

const mdPath = path.join(process.cwd(), 'jadwal.md');
const dbPath = path.join(process.cwd(), 'data', 'weekly-schedule.json');

const PERSON_COLORS = {
    'Davin': 'bg-blue-500',
    'Aqbil': 'bg-emerald-500',
    'Nabilah': 'bg-amber-500',
    'Apip': 'bg-purple-500',
    'Ika': 'bg-rose-500',
    'Ristia': 'bg-pink-500',
    'Fia': 'bg-indigo-500',
    'Agung': 'bg-orange-500',
    'Echa': 'bg-teal-500',
};

function parse() {
    if (!fs.existsSync(mdPath)) {
        console.error('jadwal.md not found');
        return;
    }

    const content = fs.readFileSync(mdPath, 'utf-8');
    const sections = content.split(/# Jadwal Kuliah /i).filter(s => s.trim() !== '');

    const items = [];

    sections.forEach(section => {
        const lines = section.split('\n');
        const person = lines[0].trim();
        const color = PERSON_COLORS[person] || 'bg-slate-500';

        const tableLines = lines.filter(l => l.includes('|') && !l.includes('---') && !l.toLowerCase().includes('hari'));

        tableLines.forEach(line => {
            const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
            if (parts.length >= 4) {
                items.push({
                    id: Math.random().toString(36).substr(2, 9),
                    person,
                    day: parts[0],
                    timeRange: parts[1],
                    subject: parts[3],
                    room: parts[6] || '',
                    color
                });
            }
        });
    });

    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`Successfully imported ${items.length} items to ${dbPath}`);
}

parse();
