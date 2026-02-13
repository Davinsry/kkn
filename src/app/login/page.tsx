'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, User, LogIn } from 'lucide-react';
import { MosqueIcon } from '@/components/mosque-icon';
import { signJWT } from '@/lib/auth';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Logic based on user request: admin / KKNMH001
        if (username === 'admin' && password === 'KKNMH001') {
            try {
                const token = await signJWT({ username: 'admin' });
                // Set cookie with 1 year max-age
                document.cookie = `auth_token=${token}; path=/; max-age=31536000; samesite=lax`;
                router.push('/');
            } catch (err) {
                setError('Terjadi kesalahan saat membuat sesi.');
                setLoading(false);
            }
        } else {
            setError('Username atau Password salah!');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
            {/* Background Glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-slate-200/40 blur-[120px]" />
                <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-purple-100/30 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl shadow-slate-200/60 border border-slate-100/50 sm:rounded-[2.5rem]">
                    {/* Logo Area */}
                    <div className="mb-6 flex flex-col items-center sm:mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 mb-4 sm:h-16 sm:w-16 sm:mb-6">
                            <MosqueIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 leading-tight sm:text-2xl">
                            KKN MH
                        </h1>
                        <p className="mt-1.5 text-xs font-bold text-slate-400 text-center px-4 sm:mt-2 sm:text-sm">
                            Masuk dengan username dan password
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                                Username
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-4 text-sm font-bold text-slate-900 placeholder-slate-300 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-4 text-sm font-bold text-slate-900 placeholder-slate-300 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                                    placeholder="Masukkan password"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-center text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer info */}
                <p className="mt-8 text-center text-xs font-bold uppercase tracking-tighter text-slate-400">
                    © 2026 KKN MH 001 — TIM UNIT
                </p>
            </div>
        </div>
    );
}
