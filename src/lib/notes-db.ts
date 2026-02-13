import fs from 'fs';
import path from 'path';

export interface Note {
    id: string;
    title: string;
    content: string;
    color: string; // tailwind class like 'bg-yellow-100' or hex
    created_at: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'notes.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize with empty array if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

export const NotesDB = {
    getAll(): Note[] {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data) as Note[];
        } catch (error) {
            console.error('Error reading notes:', error);
            return [];
        }
    },

    create(data: Omit<Note, 'id' | 'created_at'>): Note {
        const notes = this.getAll();
        const newNote: Note = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
        };

        notes.push(newNote);
        fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
        return newNote;
    },

    update(id: string, data: Partial<Omit<Note, 'id' | 'created_at'>>): Note | null {
        const notes = this.getAll();
        const index = notes.findIndex(n => n.id === id);

        if (index === -1) return null;

        const updatedNote = { ...notes[index], ...data };
        notes[index] = updatedNote;

        fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
        return updatedNote;
    },

    delete(id: string): boolean {
        const notes = this.getAll();
        const filtered = notes.filter(n => n.id !== id);

        if (filtered.length === notes.length) return false;

        fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
    }
};
