import { PrismaClient } from '@prisma/client';
import { format, addDays, isWithinInterval, parseISO } from 'date-fns';

const prisma = new PrismaClient();

const PJ_MAP: { [key: string]: string } = {
    'Aqbil': 'Aqbil Fauzan',
    'Alifia': 'Nabila Alifiani',
    'Ristia': 'Ristia Afrisabella',
    'Ika': 'Fitria Sasyabela Andartina',
    'Davin': 'Muhammad Davin Surya',
    'Tyas': 'Echa Rosandar',
    'Agung': 'Agung Rezki',
    'All': 'PJ Bersama-sama',
    'Nabilah': 'Nabilah El Khaira',
    'Apip': 'Achmad Baiquni Afif Thaaha',
};

function getPJ(name: string) {
    return PJ_MAP[name] || name || 'PJ Bersama-sama';
}

async function main() {
    console.log('Seeding schedules...');

    const schedules = [
        // 1. Revitalisasi Ruang Masjid (1 Maret 2026) PJ: Aqbil
        { kegiatan: 'Revitalisasi Ruang Masjid', tanggal: '2026-03-01', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Aqbil') },

        // 2. Buka Bersama 18:00-19:00 (9 Maret 2026) PJ: Alifia
        { kegiatan: 'Buka Bersama', tanggal: '2026-03-09', jam_mulai: '18:00', jam_selesai: '19:00', pj: getPJ('Alifia') },

        // 3. Penayangan Film Anak Islami (21 & 28 Februari 2026) PJ: Ristia
        { kegiatan: 'Penayangan Film Anak Islami', tanggal: '2026-02-21', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Ristia') },
        { kegiatan: 'Penayangan Film Anak Islami', tanggal: '2026-02-28', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Ristia') },

        // 4. Kajian Ba'da Subuh (12 Februari - 12 Maret 2026) PJ: Ika
        ...generateRange('Kajian Ba\'da Subuh', '2026-02-12', '2026-03-12', '05:00', '06:00', getPJ('Ika')),

        // 5. Tadarus Ba'da Tarawih (12 Maret - 17 Maret 2026) PJ: Davin (Assuming corrected range)
        ...generateRange('Tadarus Ba\'da Tarawih', '2026-03-12', '2026-03-17', '21:00', '22:00', getPJ('Davin')),

        // 6. Mengajar TPA (12 Februari - 8 Maret 2026, setiap Kamis, Jumat, Sabtu) PJ: Tyas
        ...generateRange('Mengajar TPA', '2026-02-12', '2026-03-08', '16:00', '17:00', getPJ('Tyas'), [4, 5, 6]), // 4:Thu, 5:Fri, 6:Sat

        // 7. Pelatihan Khatib Jumat ( 5 & 10 Maret 2026) PJ: Agung
        { kegiatan: 'Pelatihan Khatib Jumat', tanggal: '2026-03-05', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Agung') },
        { kegiatan: 'Pelatihan Khatib Jumat', tanggal: '2026-03-10', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('Agung') },

        // 8. Happy Ramadan Kids ( 7 - 8 Maret 2026) PJ: All
        { kegiatan: 'Happy Ramadan Kids', tanggal: '2026-03-07', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('All') },
        { kegiatan: 'Happy Ramadan Kids', tanggal: '2026-03-08', jam_mulai: '07:00', jam_selesai: '08:00', pj: getPJ('All') },

        // 9. Gerakan Sedekah Masjid ( Open donasi 15 Februari - 3 Maret 2026) PJ: Nabilah
        ...generateRange('Gerakan Sedekah Masjid', '2026-02-15', '2026-03-03', '07:00', '08:00', getPJ('Nabilah')),

        // 10. Kunjungan UMKM 07:00 - selesai( Ahad, 15 Februari 2026) PJ: Apip
        { kegiatan: 'Kunjungan UMKM', tanggal: '2026-02-15', jam_mulai: '07:00', jam_selesai: '10:00', pj: getPJ('Apip') },

        // 11. Pengajian Aisyiyah 08:30-12:00 (Sabtu, 14 Februari 2026) PJ: All
        { kegiatan: 'Pengajian Aisyiyah', tanggal: '2026-02-14', jam_mulai: '08:30', jam_selesai: '12:00', pj: getPJ('All') },

        // 12. Pesantren Kilat 18:00-19:00( 5 Maret 2026) PJ: Agung
        { kegiatan: 'Pesantren Kilat', tanggal: '2026-03-05', jam_mulai: '18:00', jam_selesai: '19:00', pj: getPJ('Agung') },
    ];

    for (const s of schedules) {
        await prisma.schedule.create({
            data: s,
        });
    }

    console.log('Seed completed successfully.');
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

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
