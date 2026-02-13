'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
}

export default function DeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
}: DeleteDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed inset-x-4 top-[50%] z-50 mx-auto max-w-sm translate-y-[-50%] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <AlertTriangle className="h-7 w-7" />
                        </div>
                        <Dialog.Title className="mt-4 text-lg font-bold text-slate-900">
                            Hapus Kegiatan?
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Kegiatan <span className="font-bold text-slate-900">&quot;{title}&quot;</span> akan
                            dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </Dialog.Description>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Dialog.Close asChild>
                            <button className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900">
                                Batal
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={() => {
                                onConfirm();
                                onOpenChange(false);
                            }}
                            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]"
                        >
                            Ya, Hapus
                        </button>
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
