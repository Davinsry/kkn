import { Schedule } from './types';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/**
 * WA Service logic for KKN Schedule reminders.
 * This service structures the data for reminders but doesn't handle the actual WA transport.
 * It's ready to be plugged into a WA library like Baileys or a Webhook.
 */

export interface ReminderConfig {
    type: '10PM' | '8AM';
    targetDate: Date;
}

export const WAService = {
    /**
     * Filter schedules for the 10 PM reminder (tomorrow dawn activities)
     */
    getTomorrowEarlyReminders(schedules: Schedule[]): Schedule[] {
        const tomorrow = addDays(new Date(), 1);
        const tomorrowDateStr = format(tomorrow, 'yyyy-MM-dd');

        return schedules
            .filter(s => s.tanggal === tomorrowDateStr)
            .filter(s => {
                const hour = parseInt(s.jam_mulai.split(':')[0]);
                return hour < 7; // Subuh period: before 7 AM
            })
            .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    },

    /**
     * Filter schedules for the 8 AM reminder (today's activities after Subuh)
     */
    getTodayReminders(schedules: Schedule[]): Schedule[] {
        const todayDateStr = format(new Date(), 'yyyy-MM-dd');

        return schedules
            .filter(s => s.tanggal === todayDateStr)
            .filter(s => {
                const hour = parseInt(s.jam_mulai.split(':')[0]);
                return hour >= 7; // After Subuh period
            })
            .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    },

    /**
     * Generate formated WA message string
     */
    formatWAMessage(type: '10PM' | '8AM', schedules: Schedule[]): string {
        if (schedules.length === 0) return "";

        const title = type === '10PM'
            ? "*📢 PENGINGAT KEGIATAN BESOK SUBUH*"
            : "*📢 PENGINGAT KEGIATAN HARI INI*";

        const dateText = format(new Date(schedules[0].tanggal), 'EEEE, d MMMM yyyy', { locale: idLocale });

        let message = `${title}\n📅 ${dateText}\n\n`;

        schedules.forEach((s, idx) => {
            message += `${idx + 1}. *${s.kegiatan}*\n`;
            message += `   ⏰ ${s.jam_mulai} - ${s.jam_selesai}\n`;
            message += `   👤 PJ: ${s.pj}\n\n`;
        });

        message += "_Semangat KKN!_ 💪✨";
        return message;
    }
};
