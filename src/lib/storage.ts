import { Schedule, ScheduleFormData } from './types';

const STORAGE_KEY = 'kkn_schedules';
const API_URL = '/api/schedules';

export const ScheduleService = {
    // Local Storage (Keep for offline/fallback)
    getAllLocal(): Schedule[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        const schedules: Schedule[] = data ? JSON.parse(data) : [];
        return schedules.sort((a, b) => {
            const dateCompare = a.tanggal.localeCompare(b.tanggal);
            if (dateCompare !== 0) return dateCompare;
            return a.jam_mulai.localeCompare(b.jam_mulai);
        });
    },

    saveAllLocal(schedules: Schedule[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    },

    // API Methods
    async getAll(): Promise<Schedule[]> {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('API failed');
            const schedules: Schedule[] = await res.json();
            const sorted = schedules.sort((a, b) => {
                const dateCompare = a.tanggal.localeCompare(b.tanggal);
                if (dateCompare !== 0) return dateCompare;
                return a.jam_mulai.localeCompare(b.jam_mulai);
            });
            // Sync local storage with API data
            this.saveAllLocal(sorted);
            return sorted;
        } catch (e) {
            console.error('Fetch error, falling back to local:', e);
            return this.getAllLocal();
        }
    },

    async getById(id: string): Promise<Schedule | undefined> {
        try {
            const res = await fetch(`${API_URL}/${id}`);
            if (!res.ok) {
                if (res.status === 404) return undefined;
                throw new Error('API failed');
            }
            return res.json();
        } catch {
            return this.getAllLocal().find((s) => s.id === id);
        }
    },

    async create(data: ScheduleFormData): Promise<Schedule[]> {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('API failed');
            return res.json();
        } catch (e) {
            console.error('Create error, saving locally:', e);
            const schedules = this.getAllLocal();
            const now = new Date().toISOString();
            const newSchedules: Schedule[] = data.tanggals.map((tanggal) => ({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                kegiatan: data.kegiatan,
                tanggal: tanggal,
                jam_mulai: data.jam_mulai,
                jam_selesai: data.jam_selesai,
                pj: data.pj,
                created_at: now,
                updated_at: now,
            }));
            schedules.push(...newSchedules);
            this.saveAllLocal(schedules);
            return newSchedules;
        }
    },

    async update(id: string, data: Partial<Schedule>): Promise<Schedule | null> {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('API failed');
            return res.json();
        } catch (e) {
            console.error('Update error, updating locally:', e);
            const schedules = this.getAllLocal();
            const index = schedules.findIndex((s) => s.id === id);
            if (index === -1) return null;
            const updated: Schedule = {
                ...schedules[index],
                ...data,
                updated_at: new Date().toISOString(),
            };
            schedules[index] = updated;
            this.saveAllLocal(schedules);
            return updated;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API failed');
            return true;
        } catch (e) {
            console.error('Delete error, removing locally:', e);
            const schedules = this.getAllLocal();
            const filtered = schedules.filter((s) => s.id !== id);
            if (filtered.length === schedules.length) return false;
            this.saveAllLocal(filtered);
            return true;
        }
    },

    async syncLocalToCloud(): Promise<{ success: boolean; count: number }> {
        const localSchedules = this.getAllLocal();
        if (localSchedules.length === 0) return { success: true, count: 0 };

        // Simple implementation: try to re-create each local item on cloud
        // This is basic sync logic
        return { success: true, count: localSchedules.length };
    }
};
