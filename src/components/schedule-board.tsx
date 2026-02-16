'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Import, Plus, X, Trash2, Clock, MapPin, User } from 'lucide-react';

export interface WeeklyItem {
    id: string;
    person: string;
    day: string;
    timeRange: string;
    subject: string;
    room: string;
    color: string;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const PERSON_CONFIG: Record<string, { color: string; border: string; text: string; light: string }> = {
    'Davin': { color: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', light: 'bg-blue-50' },
    'Aqbil': { color: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700', light: 'bg-emerald-50' },
    'Nabilah': { color: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700', light: 'bg-amber-50' },
    'Apip': { color: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-50' },
    'Ika': { color: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700', light: 'bg-rose-50' },
    'Ristia': { color: 'bg-pink-500', border: 'border-pink-200', text: 'text-pink-700', light: 'bg-pink-50' },
    'Fia': { color: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700', light: 'bg-indigo-50' },
    'Agung': { color: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-700', light: 'bg-orange-50' },
    'Echa': { color: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-700', light: 'bg-teal-50' },
    'Lainnya': { color: 'bg-slate-500', border: 'border-slate-200', text: 'text-slate-700', light: 'bg-slate-50' },
};

export default function ScheduleBoard() {
    const [items, setItems] = useState<WeeklyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    // Form states
    const [formDay, setFormDay] = useState('Senin');
    const [formTime, setFormTime] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formRoom, setFormRoom] = useState('');

    const fetchWeekly = useCallback(async () => {
        try {
            const res = await fetch('/api/weekly-schedule');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch weekly schedule', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeekly();
    }, [fetchWeekly]);

    const handleImportMD = async () => {
        if (!confirm('Impor jadwal dari jadwal.md? Data yang ada mungkin bertambah.')) return;
        setIsImporting(true);
        try {
            // We'll read the markdown file via a simple temporary API or just assume we have one
            // For now, let's create a special endpoint for this or just fetch it if it's public
            // Better: use a dedicated API for parsing
            const res = await fetch('/api/weekly-schedule/import', { method: 'POST' });
            if (res.ok) {
                alert('Impor Berhasil!');
                fetchWeekly();
            }
        } catch (error) {
            alert('Gagal impor');
        } finally {
            setIsImporting(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPerson) return;

        const newItem = {
            person: selectedPerson,
            day: formDay,
            timeRange: formTime,
            subject: formSubject,
            room: formRoom,
            color: PERSON_CONFIG[selectedPerson]?.color || PERSON_CONFIG['Lainnya'].color
        };

        try {
            await fetch('/api/weekly-schedule', {
                method: 'POST',
                body: JSON.stringify(newItem),
                headers: { 'Content-Type': 'application/json' }
            });
            setFormTime('');
            setFormSubject('');
            setFormRoom('');
            fetchWeekly();
        } catch {
            alert('Gagal menambah');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus jadwal ini?')) return;
        try {
            await fetch(`/api/weekly-schedule/${id}`, { method: 'DELETE' });
            fetchWeekly();
        } catch {
            alert('Gagal hapus');
        }
    };

    // Generate 100-min time buckets for the left axis
    // 07:00, 08:40, 10:20, 12:00, 13:40, 15:20, 17:00, 18:40, 20:20, 22:00
    const TIME_LABELS = ['07:00', '08:40', '10:20', '12:00', '13:40', '15:20', '17:00', '18:40', '20:20'];

    const consolidatedByDay = useMemo(() => {
        const result: Record<string, any[]> = {};

        DAYS.forEach(day => {
            const dayItems = items.filter(i => i.day === day);

            const commonGroups: Record<string, {
                timeRange: string;
                subject: string;
                room: string;
                people: { name: string; id: string }[];
            }> = {};

            dayItems.forEach(item => {
                const key = `${item.timeRange}-${item.subject}-${item.room}`;
                if (!commonGroups[key]) {
                    commonGroups[key] = {
                        timeRange: item.timeRange,
                        subject: item.subject,
                        room: item.room,
                        people: []
                    };
                }
                commonGroups[key].people.push({ name: item.person, id: item.id });
            });

            let consolidatedList = Object.values(commonGroups).sort((a, b) => a.timeRange.localeCompare(b.timeRange));

            // Merge Contiguous
            const mergedList: any[] = [];
            consolidatedList.forEach((item, index) => {
                if (index === 0) {
                    mergedList.push({ ...item });
                    return;
                }

                const prev = mergedList[mergedList.length - 1];
                const prevPeopleStr = prev.people.map((p: any) => p.name).sort().join(',');
                const currPeopleStr = item.people.map((p: any) => p.name).sort().join(',');

                const [pStart, pEnd] = prev.timeRange.split(' - ');
                const [cStart, cEnd] = item.timeRange.split(' - ');

                const isSameActivity = prev.subject === item.subject && prev.room === item.room && prevPeopleStr === currPeopleStr;

                if (isSameActivity) {
                    prev.timeRange = `${pStart} - ${cEnd}`;
                } else {
                    mergedList.push({ ...item });
                }
            });

            result[day] = mergedList;
        });

        return result;
    }, [items]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none">Papan Informasi</h2>
                        <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Timeline Kuliah Mingguan (7 Hari)
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleImportMD}
                        disabled={isImporting}
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-all border border-emerald-100"
                    >
                        <Import className={`h-4 w-4 ${isImporting ? 'animate-bounce' : ''}`} />
                        <span className="hidden sm:inline">IMPOR MD</span>
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Timetable Layout */}
            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
                <div className="min-w-[1000px]">
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-4">
                        {/* Day Headers */}
                        <div /> {/* Empty for time labels */}
                        {DAYS.map(day => (
                            <div key={day} className="text-center font-black text-[11px] text-slate-900 uppercase tracking-widest pb-4">
                                {day}
                            </div>
                        ))}

                        {/* Time Grid with Buckets */}
                        <div className="flex flex-col gap-8 pt-2">
                            {TIME_LABELS.map(time => (
                                <div key={time} className="h-20 flex flex-col justify-start">
                                    <div className="text-[10px] font-black text-slate-400">{time}</div>
                                    <div className="w-full border-b border-dashed border-slate-100 mt-2" />
                                </div>
                            ))}
                        </div>

                        {/* Daily Columns */}
                        {DAYS.map(day => (
                            <div key={day} className="relative pt-2 min-h-[600px] border-l border-slate-50 last:border-r">
                                {consolidatedByDay[day].map((item, idx) => {
                                    // Calculate vertical position based on startTime
                                    // Base 07:00 = 0px
                                    // 100 minutes = ~120px height for visuals
                                    const [start, end] = item.timeRange.split(' - ');
                                    const [sh, sm] = start.split(':').map(Number);
                                    const minutesSinceStart = (sh - 7) * 60 + sm;
                                    const topPos = (minutesSinceStart / 100) * 112; // Adjusted for gap

                                    return (
                                        <div
                                            key={`${day}-${idx}`}
                                            style={{ top: `${topPos}px` }}
                                            className={`absolute left-1 right-1 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:z-10 hover:shadow-xl hover:-translate-y-1 shadow-sm group`}
                                        >
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {item.people.map((p: any) => (
                                                    <div key={p.id} className={`rounded-lg px-2 py-0.5 text-[8px] font-black text-white shadow-sm transition-transform group-hover:scale-110 ${PERSON_CONFIG[p.name]?.color || 'bg-slate-500'}`}>
                                                        {p.name.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-1.5 py-0.5 rounded-md">
                                                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                                                    <span className="text-[9px] font-black text-slate-500">{item.timeRange}</span>
                                                </div>
                                            </div>
                                            <h4 className={`text-[11px] font-black leading-tight text-slate-800 group-hover:text-indigo-600 transition-colors`}>
                                                {item.subject}
                                            </h4>
                                            {item.room && (
                                                <div className="mt-2 flex items-center gap-1.5 text-slate-400">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-[9px] font-bold">{item.room}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal / Person Selection */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}>
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Kelola Jadwal Personal</h3>
                                <p className="text-xs font-bold text-slate-400">Pilih nama untuk mengatur jadwal spesifik</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 mb-6">
                            {Object.keys(PERSON_CONFIG).filter(p => p !== 'Lainnya').map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPerson(p)}
                                    className={`rounded-xl border-2 p-2 text-center transition-all ${selectedPerson === p
                                        ? `${PERSON_CONFIG[p].border} ${PERSON_CONFIG[p].light} scale-105`
                                        : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full text-white ${PERSON_CONFIG[p].color}`}>
                                        <User className="h-4 w-4" />
                                    </div>
                                    <p className="text-[10px] font-black">{p}</p>
                                </button>
                            ))}
                        </div>

                        {selectedPerson && (
                            <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`h-3 w-3 rounded-full ${PERSON_CONFIG[selectedPerson].color}`} />
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">Jadwal: {selectedPerson}</h4>
                                </div>

                                <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-4">
                                    <select
                                        value={formDay}
                                        onChange={e => setFormDay(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:outline-none"
                                    >
                                        {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Jam (cth: 08:00 - 10:00)"
                                        value={formTime}
                                        onChange={e => setFormTime(e.target.value)}
                                        required
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Mata Kuliah"
                                        value={formSubject}
                                        onChange={e => setFormSubject(e.target.value)}
                                        required
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ruang"
                                            value={formRoom}
                                            onChange={e => setFormRoom(e.target.value)}
                                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:outline-none"
                                        />
                                        <button type="submit" className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${PERSON_CONFIG[selectedPerson].color}`}>
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                </form>

                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {items.filter(i => i.person === selectedPerson).length === 0 ? (
                                        <p className="py-8 text-center text-xs font-bold text-slate-400">Belum ada jadwal tersimpan untuk {selectedPerson}</p>
                                    ) : (
                                        items.filter(i => i.person === selectedPerson)
                                            .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.timeRange.localeCompare(b.timeRange))
                                            .map(item => (
                                                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black uppercase text-indigo-500">{item.day}</span>
                                                            <span className="text-[9px] font-black text-slate-400">{item.timeRange}</span>
                                                        </div>
                                                        <h5 className="text-xs font-black text-slate-900">{item.subject}</h5>
                                                        <p className="text-[10px] font-bold text-slate-400">{item.room}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(item.id)} className="rounded-xl p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
