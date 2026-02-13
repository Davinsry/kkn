import fs from 'fs';
import path from 'path';
import { Schedule } from './types';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export const JsonDB = {
    read(): Schedule[] {
        try {
            if (!fs.existsSync(DATA_FILE)) {
                return [];
            }
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading JSON DB:', e);
            return [];
        }
    },

    write(schedules: Schedule[]): void {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), 'utf8');
        } catch (e) {
            console.error('Error writing JSON DB:', e);
        }
    },

    getAll(): Schedule[] {
        return this.read();
    },

    create(dataList: any[]): Schedule[] {
        const schedules = this.read();
        const newItems = dataList.map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));
        const updated = [...schedules, ...newItems];
        this.write(updated);
        return newItems;
    },

    update(id: string, data: Partial<Schedule>): Schedule | null {
        const schedules = this.read();
        const index = schedules.findIndex(s => s.id === id);
        if (index === -1) return null;

        schedules[index] = {
            ...schedules[index],
            ...data,
            updated_at: new Date().toISOString(),
        };
        this.write(schedules);
        return schedules[index];
    },

    delete(id: string): boolean {
        const schedules = this.read();
        const filtered = schedules.filter(s => s.id !== id);
        if (filtered.length === schedules.length) return false;
        this.write(filtered);
        return true;
    }
};
