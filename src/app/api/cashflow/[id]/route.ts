import { NextRequest, NextResponse } from 'next/server';
import { CashflowDB } from '@/lib/cashflow-db';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deleted = CashflowDB.delete(params.id);
        if (!deleted) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
