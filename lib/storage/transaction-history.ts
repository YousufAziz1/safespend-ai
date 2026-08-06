export type RiskLevel = 'safe' | 'warning' | 'danger' | 'blocked' | string;
export type TransactionStatus = 'success' | 'failed' | 'pending' | string;

export interface TransactionRecord {
    signature: string;
    recipient: string;
    amount: number;
    riskLevel: RiskLevel;
    status: TransactionStatus;
    timestamp: number;
}

export const STORAGE_KEY = 'safespend:tx_history';

/**
 * Retrieves the complete transaction history from local storage.
 * Executes safely within SSR contexts by dropping to an empty array.
 */
export function getTransactions(): TransactionRecord[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) return [];

        return JSON.parse(rawData) as TransactionRecord[];
    } catch (error) {
        console.error('[SafeSpend] Failed to access local transaction history:', error);
        return [];
    }
}

/**
 * Commits a single transaction record to local storage. 
 * Prepends the new unshifted record dynamically.
 */
export function saveTransaction(record: TransactionRecord): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const history = getTransactions();
        const updatedHistory = [record, ...history];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('[SafeSpend] Failed to persist transaction record:', error);
    }
}

/**
 * Completely drops all stored transaction history.
 */
export function clearTransactions(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('[SafeSpend] Failed to clear transaction history:', error);
    }
}
