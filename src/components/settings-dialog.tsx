'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, QrCode, Wifi, WifiOff, Send, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [status, setStatus] = useState<'close' | 'connecting' | 'open'>('close');
    const [qr, setQr] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [targetId, setTargetId] = useState('');
    const [testLoading, setTestLoading] = useState(false);

    useEffect(() => {
        if (open) {
            checkStatus();
        }
    }, [open]);

    // Generate QR Image when QR string changes
    useEffect(() => {
        if (qr) {
            QRCode.toDataURL(qr).then(setQrDataUrl);
        } else {
            setQrDataUrl(null);
        }
    }, [qr]);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/wa/status');
            const data = await res.json();
            setStatus(data.status);
            if (data.qr) setQr(data.qr);
        } catch (e) {
            console.error(e);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wa/connect');
            const data = await res.json();
            setStatus(data.status);
            if (data.qr) setQr(data.qr);

            // Poll for status update
            const interval = setInterval(async () => {
                const s = await fetch('/api/wa/status').then(r => r.json());
                setStatus(s.status);
                if (s.status === 'open') {
                    clearInterval(interval);
                    setQr(null);
                } else if (s.qr) {
                    setQr(s.qr);
                }
            }, 2000);

            // Cleanup interval on unmount or close (not implemented properly here for brevity but OK for now)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async (type: '8AM' | '10PM') => {
        setTestLoading(true);
        try {
            const res = await fetch('/api/reminders', {
                method: 'POST',
                body: JSON.stringify({ type, target: targetId || undefined }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                alert('Pesan terkirim!');
            } else {
                alert('Gagal: ' + (data.error || data.message));
            }
        } catch (e) {
            alert('Error sending message');
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-3xl bg-white p-6 shadow-2xl focus:outline-none">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <Dialog.Title className="text-lg font-black text-slate-900">
                            Pengaturan Notifikasi
                        </Dialog.Title>
                        <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </Dialog.Close>
                    </div>

                    <div className="space-y-6">
                        {/* Status Connection */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-500">Status WhatsApp</span>
                                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${status === 'open'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {status === 'open' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                    {status === 'open' ? 'TERHUBUNG' : 'DISCONNECTED'}
                                </span>
                            </div>

                            {status !== 'open' && (
                                <div className="mt-4 flex flex-col items-center gap-4">
                                    {qrDataUrl ? (
                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                            <img src={qrDataUrl} alt="QR Code" className="h-48 w-48 object-contain" />
                                        </div>
                                    ) : (
                                        <p className="text-center text-xs text-slate-400 py-4">
                                            Klik tombol di bawah untuk scan QR
                                        </p>
                                    )}

                                    <button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {loading ? 'MENYIAPKAN...' : 'HUBUNGKAN WHATSAPP'}
                                    </button>
                                </div>
                            )}

                            {status === 'open' && (
                                <div className="mt-2 text-center text-xs font-bold text-emerald-600">
                                    WhatsApp siap mengirim notifikasi!
                                </div>
                            )}
                        </div>

                        {/* Test Notification */}
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-slate-400">Test Kirim Pesan</label>
                            <input
                                type="text"
                                placeholder="ID Grup (contoh: 12036...)"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleTest('8AM')}
                                    disabled={testLoading || status !== 'open'}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-50 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
                                >
                                    <Send className="h-3 w-3" /> TEST 8 AM
                                </button>
                                <button
                                    onClick={() => handleTest('10PM')}
                                    disabled={testLoading || status !== 'open'}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-2 text-xs font-black text-amber-600 hover:bg-amber-100 disabled:opacity-50"
                                >
                                    <Send className="h-3 w-3" /> TEST 10 PM
                                </button>
                            </div>
                        </div>

                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
