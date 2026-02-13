'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  ClipboardList,
  Plus,
  Clock,
  User,
  Settings,
  LogOut,
  Package,
} from 'lucide-react';
import { ScheduleService } from '@/lib/storage';
import { Schedule, ScheduleFormData } from '@/lib/types';
import ScheduleForm from '@/components/schedule-form';
import ScheduleCard from '@/components/schedule-card';
import DeleteDialog from '@/components/delete-dialog';
import CalendarView from '@/components/calendar-view';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { MosqueIcon } from '@/components/mosque-icon';

export default function HomePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadSchedules = useCallback(async () => {
    const data = await ScheduleService.getAll();
    setSchedules(data);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = async (data: ScheduleFormData) => {
    await ScheduleService.create(data);
    loadSchedules();
  };

  const handleUpdate = async (data: Partial<Schedule>) => {
    if (editingSchedule) {
      await ScheduleService.update(editingSchedule.id, data);
      setEditingSchedule(null);
      loadSchedules();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await ScheduleService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadSchedules();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await loadSchedules(); // Refresh from server
    setIsSyncing(false);
  };

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  };

  // Filter activities for the selected date
  const daySchedules = useMemo(() => {
    return schedules
      .filter((s) => s.tanggal === selectedDate)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
  }, [schedules, selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    return format(new Date(selectedDate + 'T00:00:00'), 'EEEE, d MMMM yyyy', {
      locale: idLocale,
    });
  }, [selectedDate]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header - Matching Screenshot */}
      <div className="sticky top-0 z-30 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
              <MosqueIcon className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 leading-none">
                KKN MH
              </h1>
              <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Jadwal & Catatan KKN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 ${isSyncing ? 'animate-pulse' : ''}`}
              title="Sincronisasikan Data Cloud"
            >
              <ClipboardList className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button className="hidden sm:flex rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Settings className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 text-blue-600 border border-blue-100">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-blue-600 text-[8px] sm:text-[10px] font-black text-white">
                A
              </div>
              <span className="text-[10px] sm:text-xs font-black">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Left Column: Calendar */}
          <div className="space-y-6">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              activities={schedules}
            />
          </div>

          {/* Right Column: Timeline/List */}
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {formattedSelectedDate}
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {daySchedules.length} KEGIATAN TERJADWAL
              </p>
            </div>

            {daySchedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ClipboardList className="h-7 w-7 text-slate-300" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-400">
                  Tidak ada kegiatan di hari ini
                </p>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-100">
                {daySchedules.map((schedule) => (
                  <div key={schedule.id} className="relative pl-8">
                    <div className="absolute left-[7px] top-6 h-1 w-1 rounded-full bg-slate-400" />
                    <ScheduleCard
                      schedule={schedule}
                      onEdit={openEdit}
                      onDelete={(id) =>
                        setDeleteTarget(
                          schedules.find((s) => s.id === id) || null
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB for mobile - Simple Plus */}
      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 sm:hidden"
        aria-label="Tambah Kegiatan"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Form Dialog */}
      <ScheduleForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingSchedule(null);
        }}
        onSubmit={editingSchedule ? handleUpdate : handleCreate}
        editingSchedule={editingSchedule}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={deleteTarget?.kegiatan || ''}
      />
    </div>
  );
}
