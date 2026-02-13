import { JsonDB } from './src/lib/json-db';
import { format, addDays, parseISO } from 'date-fns';

const PJ_MAP: { [key: string]: string } = {
    'Aqbil': 'Aqbil Fauzan',
    'Alifia': 'Nabila Alifiani',
    'Ristia': 'Ristia Afrisabella',
    'Ika': 'Arrizka Nafisah Al Gall',
    'Davin': 'Muhammad Davin Surya',
    'Tyas': 'Fitria Sasyabela Andartina',
    'Agung': 'Agung Rezki',
    'All': 'PJ Bersama-sama',
    'Nabilah': 'Nabilah El Khaira',
    'Apip': 'Achmad Baiquni Afif Thaaha',
};

function getPJ(name: string) {
    return PJ_MAP[name] || name || 'PJ Bersama-sama';
}

function generateRange(kegiatan: string, start: string, end: string, jam_mulai: string, jam_selesai: string, pj: string, days?: number[]) {
    const result = [];
    let current = parseISO(start);
    const finish = parseISO(end);

    while (current <= finish) {
        if (!days || days.includes(current.getDay())) {
            result.push({
                kegiatan,
                tanggal: format(current, 'yyyy-MM-dd'),
                jam_mulai,
                jam_selesai,
                pj,
            });
        }
        current = addDays(current, 1);
    }
    return result;
}

const schedules = [
    { kegiatan: 'Revitalisasi Ruang Masjid', tanggal: '2026-03-01', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Aqbil') },
    { kegiatan: 'Buka Bersama', tanggal: '2026-03-09', jam_mulai: '18:00', jam_selesai: '19:00', pj: getPJ('Alifia') },
    { kegiatan: 'Penayangan Film Anak Islami', tanggal: '2026-02-21', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Ristia') },
    { kegiatan: 'Penayangan Film Anak Islami', tanggal: '2026-02-28', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Ristia') },
    ...generateRange('Kajian Ba\'da Subuh', '2026-02-12', '2026-03-12', '05:00', '06:00', getPJ('Ika')),
    ...generateRange('Tadarus Ba\'da Tarawih', '2026-03-12', '2026-03-17', '21:00', '22:00', getPJ('Davin')),
    ...generateRange('Mengajar TPA', '2026-02-12', '2026-03-08', '16:00', '17:00', getPJ('Tyas'), [4, 5, 6]),
    { kegiatan: 'Pelatihan Khatib Jumat', tanggal: '2026-03-05', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Agung') },
    { kegiatan: 'Pelatihan Khatib Jumat', tanggal: '2026-03-10', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Agung') },
    { kegiatan: 'Happy Ramadan Kids', tanggal: '2026-03-07', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('All') },
    { kegiatan: 'Happy Ramadan Kids', tanggal: '2026-03-08', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('All') },
    ...generateRange('Gerakan Sedekah Masjid', '2026-02-15', '2026-03-03', '07:00', '08:00', getPJ('Nabilah')),
    { kegiatan: 'Kunjungan UMKM', tanggal: '2026-02-15', jam_mulai: '07:00', jam_selesai: '10:00', pj: getPJ('Apip') },
    { kegiatan: 'Pengajian Aisyiyah', tanggal: '2026-02-14', jam_mulai: '08:30', jam_selesai: '12:00', pj: getPJ('All') },
    { kegiatan: 'Pesantren Kilat', tanggal: '2026-03-05', jam_mulai: '18:00', jam_selesai: '19:00', pj: getPJ('Agung') },
];

console.log('Seeding JSON DB...');
JsonDB.write(schedules.map(s => ({
    ...s,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
})));
console.log('Seed completed successfully.');
