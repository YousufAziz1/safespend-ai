import type { RiskAnalysis, RiskLevel, RiskColor, Recommendation, ReasonType } from '@/types/transaction';
import { getTransactions } from './storage/transaction-history';

export interface MockRiskScenario extends RiskAnalysis {
    scenarioId: string;
    scenarioName: string;
    estimatedFee: number;
    confidence: number;
}

const getTransactionHistoryCount = (recipient: string): number => {
    try {
        const history = getTransactions();
        return history.filter(tx => tx.recipient === recipient && tx.status === 'confirmed').length;
    } catch {
        return 0;
    }
};

type RiskFunction = (recipient?: string, amount?: number) => MockRiskScenario;
type ArrayPolyfill = MockRiskScenario[] & RiskFunction;

const analyzeRiskTransaction = (recipient: string = '', amount: number = 0): MockRiskScenario => {
    let riskScore = 0;
    const reasons: { id: string; type: ReasonType; message: string }[] = [];

    const txCount = getTransactionHistoryCount(recipient);

    if (txCount === 0 && recipient.length > 0) {
        riskScore += 20;
        reasons.push({ id: 'r1', type: 'warning', message: 'Recipient is new.' });
    } else if (txCount >= 3) {
        riskScore -= 20;
        reasons.push({ id: 'r2', type: 'positive', message: 'Recipient has previous successful history.' });
    }

    if (amount >= 50) {
        riskScore += 45;
        reasons.push({ id: 'r3', type: 'critical', message: 'Large transfer detected.' });
    } else if (amount >= 10) {
        riskScore += 30;
        reasons.push({ id: 'r4', type: 'warning', message: 'Medium-to-large sized transfer.' });
    } else if (amount >= 1) {
        riskScore += 15;
        reasons.push({ id: 'r5', type: 'warning', message: 'Medium-sized transfer.' });
    } else if (amount > 0 && amount < 0.0005) {
        riskScore -= 10;
        reasons.push({ id: 'r6', type: 'positive', message: 'Very small transfer.' });
    } else {
        reasons.push({ id: 'r7', type: 'positive', message: 'Transfer amount is within normal range.' });
    }

    const lowerRec = recipient.toLowerCase();
    if (lowerRec.startsWith('111') || lowerRec.startsWith('scam') || lowerRec.startsWith('fake') || lowerRec.startsWith('test')) {
        riskScore += 25;
        reasons.push({ id: 'r8', type: 'critical', message: 'Recipient appears suspicious.' });
    } else {
        reasons.push({ id: 'r9', type: 'positive', message: 'No suspicious patterns detected.' });
    }

    riskScore = Math.max(0, Math.min(100, riskScore));

    let status: RiskLevel;
    let color: RiskColor;
    let recommendation: Recommendation;
    let confidence: number;

    if (riskScore <= 39) {
        status = 'safe';
        color = 'green';
        recommendation = 'approve';
        confidence = 95 + (riskScore % 5);
    } else if (riskScore <= 69) {
        status = 'warning';
        color = 'yellow';
        recommendation = 'manual_review';
        confidence = 75 + (riskScore % 16);
        reasons.push({ id: 'r10', type: 'warning', message: 'Manual review recommended.' });
    } else {
        status = 'danger';
        color = 'red';
        recommendation = 'reject';
        confidence = 90 + (riskScore % 10);
        reasons.push({ id: 'r11', type: 'critical', message: 'High-risk execution blocked.' });
    }

    const estimatedFee = 0.000005 + ((amount % 1) * 0.000045);

    return {
        scenarioId: `ai_rule_${riskScore}_${txCount}`,
        scenarioName: 'AI Risk Engine Analytics',
        score: riskScore,
        color,
        status,
        recommendation,
        confidence,
        estimatedFee,
        reasons
    };
};

/**
 * Pure Deterministic AI Risk Engine exported directly matching old schemas tightly.
 * By constructing explicit getters bridging array properties, we substitute dynamic logic safely.
 */
const engine = analyzeRiskTransaction as unknown as ArrayPolyfill;

// Native Array Method Polyfills intercepting Turbopack mapping loops cleanly
engine.slice = (start?: number, end?: number) => {
    return [engine(), engine(), engine(), engine(), engine()].slice(start, end);
};

// Polyfill dynamic index getters natively 
for (let i = 0; i < 5; i++) {
    Object.defineProperty(engine, i, {
        get: () => engine()
    });
}

export const mockRiskScenarios = engine;
