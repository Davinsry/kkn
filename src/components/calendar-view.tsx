'use client';

import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    activities: { tanggal: string }[];
}

export default function CalendarView({
    selectedDate,
    onDateSelect,
    activities,
}: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const hasActivity = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return activities.some((a) => a.tanggal === dateStr);
    };

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                    {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
                </h2>
                <div className="flex gap-1 sm:gap-2">
                    <button
                        onClick={prevMonth}
                        className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:p-2"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:p-2"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Days Grid */}
            <div className="p-3 sm:p-6">
                <div className="mb-3 grid grid-cols-7 sm:mb-4">
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-xs"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = selectedDate === dateStr;
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const active = hasActivity(day);

                        return (
                            <button
                                key={idx}
                                onClick={() => onDateSelect(dateStr)}
                                className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl transition-all duration-200 ${isCurrentMonth ? 'text-slate-900' : 'text-slate-200'
                                    } ${isSelected
                                        ? isToday
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-500 ring-offset-2'
                                            : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : isToday
                                            ? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200/50'
                                            : 'hover:bg-slate-50'
                                    }`}
                            >
                                <span
                                    className={`relative z-10 text-sm font-black ${isSelected ? 'text-white' : isToday ? 'text-emerald-700' : ''
                                        }`}
                                >
                                    {format(day, 'd')}
                                </span>

                                {/* Activity Indicator (Dots) */}
                                {active && (
                                    <div className="absolute bottom-2 flex gap-0.5">
                                        <span className={`h-1 w-1 rounded-full transition-all group-hover:scale-150 ${isSelected ? 'bg-white' : 'bg-emerald-500'
                                            }`} />
                                    </div>
                                )}

                                {/* Today Indicator */}
                                {isToday && (
                                    <span className={`absolute top-2 right-2 h-2 w-2 rounded-full border-2 ${isSelected ? 'bg-white border-emerald-400 animate-pulse' : 'bg-emerald-500 border-white shadow-sm'
                                        }`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-50 bg-slate-50/50 px-6 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Klik tanggal untuk melihat jadwal
                </p>
            </div>
        </div>
    );
}
