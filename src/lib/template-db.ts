import fs from 'fs';
import path from 'path';
import { EventTemplate } from './types';

const TEMPLATES_FILE = path.join(process.cwd(), 'templates.json');

export const TemplateDB = {
    read(): EventTemplate[] {
        try {
            if (!fs.existsSync(TEMPLATES_FILE)) {
                return [];
            }
            const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading templates:', e);
            return [];
        }
    },

    write(templates: EventTemplate[]): void {
        try {
            fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
        } catch (e) {
            console.error('Error writing templates:', e);
        }
    },

    getAll(): EventTemplate[] {
        return this.read();
    },

    create(data: Omit<EventTemplate, 'id'>): EventTemplate {
        const templates = this.read();
        const newTemplate: EventTemplate = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        templates.push(newTemplate);
        this.write(templates);
        return newTemplate;
    },

    update(id: string, data: Partial<EventTemplate>): EventTemplate | null {
        const templates = this.read();
        const index = templates.findIndex(t => t.id === id);
        if (index === -1) return null;
        templates[index] = { ...templates[index], ...data };
        this.write(templates);
        return templates[index];
    },

    delete(id: string): boolean {
        const templates = this.read();
        const filtered = templates.filter(t => t.id !== id);
        if (filtered.length === templates.length) return false;
        this.write(filtered);
        return true;
    }
};
