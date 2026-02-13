import { ScheduleStatus } from './types';

export function getStatusColor(status: ScheduleStatus): string {
    switch (status) {
        case 'Planned':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'Ongoing':
            return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'Completed':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
}

export function getStatusDot(status: ScheduleStatus): string {
    switch (status) {
        case 'Planned':
            return 'bg-blue-400';
        case 'Ongoing':
            return 'bg-amber-400 animate-pulse';
        case 'Completed':
            return 'bg-emerald-400';
    }
}

export function formatTime(time: string): string {
    return time; // Already in HH:mm format
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
