'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { X, CalendarPlus, Save, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { MosqueIcon } from '@/components/mosque-icon';
import { Schedule, ScheduleFormData, EventTemplate } from '@/lib/types';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface ScheduleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ScheduleFormData, applyToAll?: boolean) => void;
    editingSchedule?: Schedule | null;
}

const PJ_OPTIONS = [
    "Muhammad Davin Surya",
    "Arrizka Nafisah Al Gall",
    "Fitria Sasyabela Andartina",
    "Echa Rosandar",
    "Agung Rezki",
    "Ristia Afrisabella",
    "Achmad Baiquni Afif Thaaha",
    "Nabilah El Khaira",
    "Aqbil Fauzan",
    "Nabila Alifiani",
    "Takmir",
    "PJ Bersama-sama"
];

export default function ScheduleForm({
    open,
    onOpenChange,
    onSubmit,
    editingSchedule,
}: ScheduleFormProps) {
    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [applyToAll, setApplyToAll] = useState(false);
    const [formData, setFormData] = useState<{
        kegiatan: string;
        tanggals: Date[];
        jam_mulai: string;
        jam_selesai: string;
        pj: string;
        pengisi: string;
    }>({
        kegiatan: '',
        tanggals: [],
        jam_mulai: '',
        jam_selesai: '',
        pj: '',
        pengisi: '',
    });

    // Load templates
    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(() => { });
    }, [open]);

    useEffect(() => {
        if (editingSchedule) {
            setFormData({
                kegiatan: editingSchedule.kegiatan,
                tanggals: [new Date(editingSchedule.tanggal)],
                jam_mulai: editingSchedule.jam_mulai,
                jam_selesai: editingSchedule.jam_selesai,
                pj: editingSchedule.pj,
                pengisi: editingSchedule.pengisi || '',
            });
            setSelectedTemplate('');
            setApplyToAll(false);
        } else {
            setFormData({
                kegiatan: '',
                tanggals: [],
                jam_mulai: '',
                jam_selesai: '',
                pj: '',
                pengisi: '',
            });
            setSelectedTemplate('');
            setApplyToAll(false);
        }
    }, [editingSchedule, open]);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setFormData(prev => ({
                ...prev,
                kegiatan: template.nama,
                jam_mulai: template.jam_mulai,
                jam_selesai: template.jam_selesai,
                pj: template.pj,
                pengisi: template.pengisi || '',
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.tanggals.length === 0) {
            alert("Pilih minimal satu tanggal!");
            return;
        }
        onSubmit({
            ...formData,
            tanggals: formData.tanggals.map(d => format(d, 'yyyy-MM-dd'))
        }, applyToAll);
        onOpenChange(false);
    };

    const isEditing = !!editingSchedule;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full translate-y-0 rounded-t-[2.5rem] border-t border-slate-200 bg-white p-6 pb-12 shadow-2xl shadow-slate-200/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full sm:inset-x-4 sm:top-[50%] sm:bottom-auto sm:max-w-lg sm:translate-y-[-50%] sm:rounded-2xl sm:p-8 sm:pb-8 overflow-y-auto max-h-[90vh]">
                    <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-slate-100 sm:hidden" />
                    <Dialog.Title className="flex items-center gap-3 text-xl font-black text-slate-900 leading-tight">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                            <MosqueIcon className="h-5 w-5" />
                        </div>
                        {isEditing ? 'Edit Kegiatan' : 'Tambah Baru'}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {isEditing ? 'UBAH RINCIAN KEGIATAN' : 'BUAT JADWAL KEGIATAN BARU'}
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Template Selector (only for new) */}
                        {!isEditing && templates.length > 0 && (
                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Pilih Template Acara
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-bold text-emerald-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat sm:py-3"
                                >
                                    <option value="">-- Pilih Acara --</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nama}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Kegiatan */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Nama Kegiatan
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.kegiatan}
                                onChange={(e) =>
                                    setFormData({ ...formData, kegiatan: e.target.value })
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 sm:py-3"
                                placeholder="Contoh: Kerja Bakti Desa"
                            />
                        </div>

                        {/* Tanggal (Multi) */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Pilih Tanggal
                            </label>
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 sm:py-3"
                                    >
                                        <span className={formData.tanggals.length === 0 ? "text-slate-400 font-normal" : ""}>
                                            {formData.tanggals.length > 0
                                                ? `${formData.tanggals.length} Tanggal Dipilih`
                                                : "Ketuk untuk memilih..."}
                                        </span>
                                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content
                                        className="z-[60] mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95"
                                        align="center"
                                        sideOffset={8}
                                    >
                                        <DayPicker
                                            mode="multiple"
                                            selected={formData.tanggals}
                                            onSelect={(dates) => setFormData({ ...formData, tanggals: dates || [] })}
                                            locale={idLocale}
                                            className="m-0"
                                            classNames={{
                                                day_selected: "bg-slate-900 text-white hover:bg-slate-800 rounded-lg",
                                                day_today: "text-slate-900 font-bold underline"
                                            }}
                                        />
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                            {formData.tanggals.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {formData.tanggals.map((date, i) => (
                                        <span key={i} className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                            {format(date, 'd MMM')}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Waktu */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.jam_mulai}
                                    onChange={(e) =>
                                        setFormData({ ...formData, jam_mulai: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 [color-scheme:light] sm:py-3"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Jam Selesai
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.jam_selesai}
                                    onChange={(e) =>
                                        setFormData({ ...formData, jam_selesai: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 [color-scheme:light] sm:py-3"
                                />
                            </div>
                        </div>

                        {/* Penanggung Jawab (Dropdown) */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Penanggung Jawab (PJ)
                            </label>
                            <select
                                required
                                value={formData.pj}
                                onChange={(e) =>
                                    setFormData({ ...formData, pj: e.target.value })
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat sm:py-3"
                            >
                                <option value="" disabled>Pilih Nama PJ</option>
                                {PJ_OPTIONS.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pengisi Acara (Optional) */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Pengisi Acara (Opsional)
                            </label>
                            <input
                                type="text"
                                value={formData.pengisi}
                                onChange={(e) =>
                                    setFormData({ ...formData, pengisi: e.target.value })
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 sm:py-3"
                                placeholder="Contoh: Ustadz ... / Takmir"
                            />
                        </div>

                        {/* Apply to All (only when editing) */}
                        {isEditing && (
                            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <input
                                    type="checkbox"
                                    id="applyToAll"
                                    checked={applyToAll}
                                    onChange={(e) => setApplyToAll(e.target.checked)}
                                    className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                                />
                                <label htmlFor="applyToAll" className="text-xs font-bold text-amber-700 cursor-pointer">
                                    Terapkan jam, PJ & pengisi ke <span className="underline">semua</span> jadwal &ldquo;{formData.kegiatan}&rdquo;
                                </label>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 sm:py-3"
                                >
                                    BATAL
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] sm:py-3"
                            >
                                <Save className="h-4 w-4" />
                                {isEditing ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN KEGIATAN'}
                            </button>
                        </div>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
