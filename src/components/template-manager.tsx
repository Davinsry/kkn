'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Pencil, Trash2, Save, ListChecks } from 'lucide-react';
import { EventTemplate } from '@/lib/types';

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

interface TemplateManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TemplateManager({ open, onOpenChange }: TemplateManagerProps) {
    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({ nama: '', jam_mulai: '', jam_selesai: '', pj: '', pengisi: '' });

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setTemplates(data);
        } catch { }
    };

    useEffect(() => {
        if (open) loadTemplates();
    }, [open]);

    const resetForm = () => {
        setForm({ nama: '', jam_mulai: '', jam_selesai: '', pj: '', pengisi: '' });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleSave = async () => {
        if (!form.nama || !form.jam_mulai || !form.jam_selesai || !form.pj) {
            alert('Mohon isi semua field yang wajib!');
            return;
        }

        try {
            if (editingId) {
                await fetch(`/api/templates/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
            } else {
                await fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
            }
            resetForm();
            loadTemplates();
        } catch { }
    };

    const handleEdit = (template: EventTemplate) => {
        setEditingId(template.id);
        setForm({
            nama: template.nama,
            jam_mulai: template.jam_mulai,
            jam_selesai: template.jam_selesai,
            pj: template.pj,
            pengisi: template.pengisi || '',
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus template acara ini?')) return;
        try {
            await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            loadTemplates();
        } catch { }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full rounded-t-[2.5rem] border-t border-slate-200 bg-white p-6 pb-12 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full sm:inset-x-4 sm:top-[50%] sm:bottom-auto sm:max-w-lg sm:translate-y-[-50%] sm:rounded-2xl sm:p-8 sm:pb-8 overflow-y-auto max-h-[85vh]">
                    <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-slate-100 sm:hidden" />

                    <Dialog.Title className="flex items-center gap-3 text-xl font-black text-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
                            <ListChecks className="h-5 w-5" />
                        </div>
                        Kelola Template Acara
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        TAMBAH, EDIT, ATAU HAPUS TEMPLATE
                    </Dialog.Description>

                    {/* Add / Edit Form */}
                    {showAddForm ? (
                        <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                                {editingId ? '✏️ Edit Template' : '➕ Template Baru'}
                            </p>
                            <input
                                type="text"
                                placeholder="Nama Acara *"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="time"
                                    value={form.jam_mulai}
                                    onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 [color-scheme:light]"
                                />
                                <input
                                    type="time"
                                    value={form.jam_selesai}
                                    onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 [color-scheme:light]"
                                />
                            </div>
                            <select
                                value={form.pj}
                                onChange={(e) => setForm({ ...form, pj: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                            >
                                <option value="" disabled>Pilih PJ *</option>
                                {PJ_OPTIONS.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Pengisi Acara (opsional)"
                                value={form.pengisi}
                                onChange={(e) => setForm({ ...form, pengisi: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    BATAL
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                                >
                                    <Save className="h-4 w-4" />
                                    SIMPAN
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-black text-emerald-600 transition-all hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            TAMBAH TEMPLATE BARU
                        </button>
                    )}

                    {/* Template List */}
                    <div className="mt-4 space-y-2">
                        {templates.length === 0 ? (
                            <p className="text-center py-8 text-sm text-slate-400 font-bold">Belum ada template acara</p>
                        ) : (
                            templates.map((t) => (
                                <div
                                    key={t.id}
                                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">{t.nama}</p>
                                        <p className="text-[11px] text-slate-400 font-bold">
                                            {t.jam_mulai} - {t.jam_selesai} · {t.pj}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

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
