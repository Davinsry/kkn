import { NextRequest, NextResponse } from 'next/server';
import { CashflowDB } from '@/lib/cashflow-db';

export async function GET() {
    try {
        const transactions = CashflowDB.getAll();
        return NextResponse.json(transactions);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch cashflow' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, amount, type, date, category, person_name, proof_image } = body;

        if (!title || !amount || !type || !date || !person_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTransaction = CashflowDB.create({
            title,
            amount: Number(amount),
            type,
            date,
            category: category || 'Umum',
            person_name,
            proof_image
        });

        return NextResponse.json(newTransaction);
    } catch {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
