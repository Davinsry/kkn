'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TransactionItem {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
    person_name: string;
    proof_image?: string;
}

// Helper for Image Modal
function ImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-h-[90vh] max-w-full overflow-hidden rounded-lg">
                <img src={src} alt="Bukti" className="h-full w-full object-contain" />
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
                >
                    <Trash2 className="h-5 w-5 rotate-45" /> {/* Use generic icon as close */}
                </button>
            </div>
        </div>
    );
}

export default function CashflowManager() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState(''); // Store as string with dots
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [viewDate, setViewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [personName, setPersonName] = useState('');
    const [proofImage, setProofImage] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // View State
    const [viewImage, setViewImage] = useState<string | null>(null);

    const handleNextDay = () => {
        const d = new Date(viewDate);
        d.setDate(d.getDate() + 1);
        setViewDate(format(d, 'yyyy-MM-dd'));
    };

    const handlePrevDay = () => {
        const d = new Date(viewDate);
        d.setDate(d.getDate() - 1);
        setViewDate(format(d, 'yyyy-MM-dd'));
    };

    const handleToday = () => {
        setViewDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
                    setSelectedFile(file);
                    break;
                }
            }
        }
    };

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch('/api/cashflow');
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') {
            setAmount('');
            return;
        }
        const formatted = new Intl.NumberFormat('id-ID').format(Number(value));
        setAmount(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            let currentProofImage = proofImage;

            // 1. Upload File IF Selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('type', type);
                formData.append('title', title);
                formData.append('personName', personName);
                formData.append('date', date);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) {
                    let errorMessage = 'Gagal upload bukti';
                    try {
                        const errorData = await uploadRes.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch {
                        errorMessage = `Upload Error ${uploadRes.status}: ${uploadRes.statusText}`;
                    }
                    throw new Error(errorMessage);
                }

                const uploadData = await uploadRes.json();
                if (uploadData.url) {
                    currentProofImage = uploadData.url;
                }
            }

            // 2. Save Transaction
            const processedAmount = amount.replace(/\./g, '').replace(/,/g, '');
            const rawAmount = Number(processedAmount);

            if (isNaN(rawAmount) || rawAmount <= 0) {
                throw new Error('Nominal tidak valid');
            }

            const cfRes = await fetch('/api/cashflow', {
                method: 'POST',
                body: JSON.stringify({
                    title: title || 'Tanpa Judul',
                    amount: rawAmount,
                    type,
                    date,
                    category: 'Umum',
                    person_name: personName || 'Anonim',
                    proof_image: currentProofImage
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!cfRes.ok) {
                throw new Error('Gagal simpan transaksi');
            }

            // Reset form
            setTitle('');
            setAmount('');
            setPersonName('');
            setProofImage(undefined);
            setSelectedFile(null);
            setIsFormOpen(false);
            fetchTransactions();
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        try {
            await fetch(`/api/cashflow/${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch {
            alert('Gagal menghapus');
        }
    };

    // Global Calculations
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    // Daily Calculations for viewDate
    const dailyIncome = transactions
        .filter(t => t.type === 'income' && t.date === viewDate)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const dailyExpense = transactions
        .filter(t => t.type === 'expense' && t.date === viewDate)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="space-y-6">
            {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none">Keuangan</h2>
                        <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Pemasukan & Pengeluaran
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    <span>TRANSAKSI BARU</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{formatRupiah(balance)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Pemasukan</p>
                    </div>
                    <p className="text-xl font-black text-emerald-700">{formatRupiah(totalIncome)}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <TrendingDown className="h-4 w-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Pengeluaran</p>
                    </div>
                    <p className="text-xl font-black text-rose-700">{formatRupiah(totalExpense)}</p>
                </div>
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="my-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
                    <form onPaste={handlePaste} onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Judul Transaksi</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    placeholder="Contoh: Iuran Makan"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
                                <input
                                    type="text"
                                    required
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">
                                    {type === 'income' ? 'Nama Penyetor' : 'Nama Penerima'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={personName}
                                    onChange={e => setPersonName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    placeholder={type === 'income' ? 'Siapa yang setor?' : 'Siapa yang terima/belanja?'}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Bukti Foto (Opsional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {uploading && <span className="absolute right-4 top-3 text-xs font-bold text-indigo-500 animate-pulse">Memproses...</span>}
                                    {selectedFile && !uploading && <span className="absolute right-4 top-3 text-xs font-bold text-emerald-500">Siap Kirim ✓</span>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Tipe</label>
                                <div className="flex gap-2 rounded-xl bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setType('income')}
                                        className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${type === 'income'
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        PEMASUKAN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${type === 'expense'
                                            ? 'bg-rose-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        PENGELUARAN
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            >
                                BATAL
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                SIMPAN
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Date Navigation */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevDay}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center min-w-[160px] px-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3 w-3 text-indigo-500" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {format(new Date(viewDate), 'EEEE', { locale: idLocale })}
                                </p>
                            </div>
                            <p className="text-sm font-black text-slate-900 leading-none">
                                {format(new Date(viewDate), 'dd/MM/yyyy')}
                            </p>
                        </div>
                        <button
                            onClick={handleNextDay}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleToday}
                        className="flex items-center gap-2 rounded-xl bg-indigo-50 px-5 py-2.5 text-[10px] font-black text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        HARI INI
                    </button>
                </div>

                {/* Daily Summary */}
                <div className="mt-4 flex items-center justify-center gap-6 border-t border-slate-50 pt-3">
                    <div className="text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 text-emerald-600">Terima Hari Ini</p>
                        <p className="text-xs font-black text-emerald-600">{formatRupiah(dailyIncome)}</p>
                    </div>
                    <div className="h-6 w-px bg-slate-100" />
                    <div className="text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 text-rose-600">Keluar Hari Ini</p>
                        <p className="text-xs font-black text-rose-600">{formatRupiah(dailyExpense)}</p>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Memuat data...</div>
                ) : transactions.filter(t => t.date === viewDate).length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-400">Tidak ada transaksi pada tanggal ini</p>
                    </div>
                ) : (
                    transactions
                        .filter(t => t.date === viewDate)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(t => (
                            <div key={t.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-opacity-20 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                            {t.type === 'income' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{t.title}</h4>
                                            {t.person_name && (
                                                <p className="text-xs font-medium text-slate-500">
                                                    Oleh: <span className="font-bold text-slate-700">{t.person_name}</span>
                                                </p>
                                            )}
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-slate-400">
                                                    {format(new Date(t.date), 'dd/MM/yyyy')}
                                                </p>
                                                {t.proof_image && (
                                                    <button
                                                        onClick={() => setViewImage(t.proof_image || null)}
                                                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100"
                                                    >
                                                        Lihat Bukti
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="rounded-lg p-2 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
