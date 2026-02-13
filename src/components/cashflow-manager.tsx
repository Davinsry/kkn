'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TransactionItem {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
}

export default function CashflowManager() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/cashflow', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    amount: Number(amount),
                    type,
                    date,
                    category: 'Umum'
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            // Reset form
            setTitle('');
            setAmount('');
            setIsFormOpen(false);
            fetchTransactions();
        } catch (error) {
            alert('Gagal menyimpan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        try {
            await fetch(`/api/cashflow/${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch (error) {
            alert('Gagal menghapus');
        }
    };

    // Calculations
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="space-y-6">
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
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    placeholder="0"
                                />
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
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:bg-indigo-700"
                            >
                                SIMPAN
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transaction List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Memuat data...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-400">Belum ada data keuangan</p>
                    </div>
                ) : (
                    transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(t => (
                            <div key={t.id} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-20 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                        {t.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{t.title}</h4>
                                        <p className="text-xs font-medium text-slate-400">
                                            {format(new Date(t.date), 'd MMMM yyyy', { locale: idLocale })}
                                        </p>
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
                        ))
                )}
            </div>
        </div>
    );
}
