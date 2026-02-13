'use client';

import { Clock, User, Pencil, Trash2, Edit } from 'lucide-react';
import { Schedule } from '@/lib/types';

interface ScheduleCardProps {
    schedule: Schedule;
    onEdit: (schedule: Schedule) => void;
    onDelete: (id: string) => void;
}

export default function ScheduleCard({
    schedule,
    onEdit,
    onDelete,
}: ScheduleCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                        {schedule.kegiatan}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {schedule.jam_mulai} - {schedule.jam_selesai}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <User className="h-3.5 w-3.5" />
                            <span>{schedule.pj}</span>
                        </div>
                        {schedule.pengisi && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <span className="text-[10px] uppercase opacity-60">Pengisi:</span>
                                <span>{schedule.pengisi}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(schedule)}
                        className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(schedule.id)}
                        className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all active:scale-90"
                        title="Hapus"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
