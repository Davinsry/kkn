import fs from 'fs';
import path from 'path';

export interface WeeklyItem {
    id: string;
    person: string;
    day: string; // Senin, Selasa, etc.
    timeRange: string; // 08:50 - 10:30
    subject: string;
    room: string;
    color: string; // tailwind bg color
}

const DATA_FILE = path.join(process.cwd(), 'data', 'weekly-schedule.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize with empty array if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

export const WeeklyDB = {
    getAll(): WeeklyItem[] {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data) as WeeklyItem[];
        } catch (error) {
            console.error('Error reading weekly schedule:', error);
            return [];
        }
    },

    saveAll(items: WeeklyItem[]): void {
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
    },

    create(item: Omit<WeeklyItem, 'id'>): WeeklyItem {
        const items = this.getAll();
        const newItem: WeeklyItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
        };
        items.push(newItem);
        this.saveAll(items);
        return newItem;
    },

    update(id: string, data: Partial<Omit<WeeklyItem, 'id'>>): WeeklyItem | null {
        const items = this.getAll();
        const index = items.findIndex(i => i.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...data };
        this.saveAll(items);
        return items[index];
    },

    delete(id: string): boolean {
        const items = this.getAll();
        const filtered = items.filter(i => i.id !== id);
        if (filtered.length === items.length) return false;
        this.saveAll(filtered);
        return true;
    },

    deleteAllByPerson(person: string): void {
        const items = this.getAll();
        const filtered = items.filter(i => i.person !== person);
        this.saveAll(filtered);
    }
};
