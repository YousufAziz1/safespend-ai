import { getTransactions, type TransactionRecord } from '@/lib/storage/transaction-history';

export interface MemoryStats {
    totalTransfers: number;
    averageAmount: number;
    largestPayment: number;
    lastPaymentDate: number | null;
}

export function getRecipientHistory(recipientAddress: string): TransactionRecord[] {
    const txs = getTransactions();
    return txs.filter(tx => tx.recipient === recipientAddress && tx.status === 'confirmed');
}

export function getRecipientStats(recipientAddress: string): MemoryStats {
    const history = getRecipientHistory(recipientAddress);
    if (history.length === 0) {
        return {
            totalTransfers: 0,
            averageAmount: 0,
            largestPayment: 0,
            lastPaymentDate: null
        };
    }

    let sum = 0;
    let max = 0;
    let latest = 0;

    history.forEach(tx => {
        sum += tx.amount;
        if (tx.amount > max) max = tx.amount;
        if (tx.timestamp > latest) latest = tx.timestamp;
    });

    return {
        totalTransfers: history.length,
        averageAmount: Number((sum / history.length).toFixed(4)),
        largestPayment: max,
        lastPaymentDate: latest
    };
}

export function getMostFrequentRecipient(): { address: string, count: number } | null {
    const txs = getTransactions().filter(tx => tx.status === 'confirmed');
    if (txs.length === 0) return null;

    const counts: Record<string, number> = {};
    let maxCount = 0;
    let maxAddress = '';

    txs.forEach(tx => {
        counts[tx.recipient] = (counts[tx.recipient] || 0) + 1;
        if (counts[tx.recipient] > maxCount) {
            maxCount = counts[tx.recipient];
            maxAddress = tx.recipient;
        }
    });

    return { address: maxAddress, count: maxCount };
}

export function generateFinancialReasoning(intentAmount: number | null, stats: MemoryStats, contactName: string | null): string {
    const name = contactName || 'this wallet';

    if (stats.totalTransfers === 0) {
        return `This is your first interaction with ${name}.\n\nProceed carefully.`;
    }

    if (intentAmount !== null) {
        // Significantly larger logic (e.g. 5x average or strictly above largest + overhead)
        const threshold = Math.max(stats.averageAmount * 3, stats.largestPayment * 1.5);
        if (intentAmount > threshold && intentAmount > 0.5) { // Arbitrary small amount floor
            return `This payment is significantly larger than your historical average (${stats.averageAmount} SOL).\n\nAdditional verification is recommended.`;
        }
    }

    return `I noticed you have already sent funds to ${name} ${stats.totalTransfers} times.\n\nAverage payment: ${stats.averageAmount} SOL.\n\nToday's payment is consistent with your previous behaviour.`;
}
