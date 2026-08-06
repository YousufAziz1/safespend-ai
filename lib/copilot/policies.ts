export interface PaymentPolicy {
    id: string;
    name: string;
    recipientName: string;
    recipientAddress: string;
    maxAmount: number;
    token: string;
    network: string;
    expiresAt: number | null; // Unix timestamp or null for never expires
    enabled: boolean;
}

const STORAGE_KEY = 'safespend-policies-v1';

export function getPolicies(): PaymentPolicy[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as PaymentPolicy[];
    } catch {
        return [];
    }
}

export function savePolicy(policy: Omit<PaymentPolicy, 'id'>): PaymentPolicy {
    const policies = getPolicies();
    const newPolicy: PaymentPolicy = {
        ...policy,
        id: `pol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    policies.push(newPolicy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    return newPolicy;
}

export function updatePolicy(id: string, updates: Partial<PaymentPolicy>): PaymentPolicy | null {
    const policies = getPolicies();
    const index = policies.findIndex(p => p.id === id);
    if (index === -1) return null;

    policies[index] = { ...policies[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    return policies[index];
}

export function deletePolicy(id: string): boolean {
    const policies = getPolicies();
    const initialLength = policies.length;
    const filtered = policies.filter(p => p.id !== id);
    if (filtered.length === initialLength) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

export function findMatchingPolicy(recipientAddress: string, token: string = 'SOL'): PaymentPolicy | null {
    const policies = getPolicies();
    const now = Date.now();
    return policies.find(p =>
        p.recipientAddress === recipientAddress &&
        p.token.toLowerCase() === token.toLowerCase() &&
        p.enabled &&
        (p.expiresAt === null || p.expiresAt > now)
    ) || null;
}
