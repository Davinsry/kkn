import fs from 'fs';
import path from 'path';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
    person_name: string;
    proof_image?: string;
    created_at: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'cashflow.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize with empty array if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

export const CashflowDB = {
    getAll(): Transaction[] {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data) as Transaction[];
        } catch (error) {
            console.error('Error reading cashflow:', error);
            return [];
        }
    },

    create(data: Omit<Transaction, 'id' | 'created_at'>): Transaction {
        const transactions = this.getAll();
        const newTransaction: Transaction = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
        };

        transactions.push(newTransaction);
        fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
        return newTransaction;
    },

    delete(id: string): boolean {
        const transactions = this.getAll();
        const filtered = transactions.filter(t => t.id !== id);

        if (filtered.length === transactions.length) return false;

        fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
    },

    getSummary() {
        const transactions = this.getAll();
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            balance: income - expense
        };
    }
};
