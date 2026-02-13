'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, StickyNote } from 'lucide-react';

interface Note {
    id: string;
    title: string;
    content: string;
    color: string;
    created_at: string;
}

const COLORS = [
    { name: 'Kuning', value: 'bg-yellow-200 text-yellow-900 border-yellow-300' },
    { name: 'Biru', value: 'bg-blue-200 text-blue-900 border-blue-300' },
    { name: 'Hijau', value: 'bg-green-200 text-green-900 border-green-300' },
    { name: 'Pink', value: 'bg-pink-200 text-pink-900 border-pink-300' },
    { name: 'Ungu', value: 'bg-purple-200 text-purple-900 border-purple-300' },
    { name: 'Putih', value: 'bg-white text-slate-900 border-slate-200' },
];

export default function NotesManager() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState(COLORS[0].value);

    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch('/api/notes');
            const data = await res.json();
            setNotes(data);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/notes', {
                method: 'POST',
                body: JSON.stringify({ title, content, color }),
                headers: { 'Content-Type': 'application/json' }
            });

            setTitle('');
            setContent('');
            setColor(COLORS[0].value);
            setIsFormOpen(false);
            fetchNotes();
        } catch {
            alert('Gagal menyimpan catatan');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening if we add click-to-edit later
        if (!confirm('Hapus catatan ini?')) return;

        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        } catch {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20">
                        <StickyNote className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none">Catatan</h2>
                        <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Papan Informasi & Reminder
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    <span>CATATAN BARU</span>
                </button>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-slate-900">Tulis Catatan</h3>
                            <button onClick={() => setIsFormOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Judul</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-amber-500 focus:outline-none"
                                    placeholder="Judul catatan..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Isi Catatan</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-amber-500 focus:outline-none resize-none"
                                    placeholder="Tulis sesuatu..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Warna Kertas</label>
                                <div className="flex gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className={`h-8 w-8 rounded-full border-2 transition-all ${c.value.split(' ')[0]} ${color === c.value ? 'scale-110 border-slate-900 shadow-md' : 'border-transparent hover:scale-105'
                                                }`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-amber-400 py-3 text-sm font-black text-amber-900 hover:bg-amber-500"
                                >
                                    TEMPEL CATATAN
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            {loading ? (
                <div className="text-center py-10 text-slate-400 text-xs">Memuat catatan...</div>
            ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10">
                    <div className="mb-2 rounded-full bg-slate-100 p-3 text-slate-300">
                        <StickyNote className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Belum ada catatan tempel</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className={`group relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${note.color}`}
                        >
                            <div>
                                <h4 className="font-black text-lg leading-tight mb-2">{note.title}</h4>
                                <p className="whitespace-pre-wrap text-sm font-medium opacity-90 leading-relaxed">
                                    {note.content}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                                <span className="text-[10px] font-bold opacity-60">
                                    {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(note.id, e)}
                                    className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
