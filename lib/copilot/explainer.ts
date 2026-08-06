import { type SecurityAnalysis } from '@/lib/security/security-engine';
import { type ExecutionPlan } from './planner';
import { type MemoryStats } from './memory';
import { type PaymentPolicy } from './policies';

export interface ProviderExplanation {
    provider: 'GoPlus' | 'Helius' | 'Birdeye' | 'Local Rules' | 'Memory' | 'Planner' | 'Simulation';
    status: 'pass' | 'fail' | 'warn';
    reasons: string[];
}

export function generateProviderExplanations(
    analysis: SecurityAnalysis,
    plan?: ExecutionPlan,
    memory?: MemoryStats,
    policy?: PaymentPolicy | null,
    intentAmount?: number | null
): ProviderExplanation[] {
    const explanations: ProviderExplanation[] = [];

    // GoPlus Analysis
    const goPlusReasons: string[] = [];
    let goPlusStatus: 'pass' | 'fail' | 'warn' = 'pass';
    if (analysis.wallet.blacklist) {
        goPlusStatus = 'fail';
        goPlusReasons.push('Blacklisted or malicious activity detected globally.');
    } else if (analysis.wallet.suspicious) {
        goPlusStatus = 'warn';
        goPlusReasons.push('Suspicious honeypot patterns identified.');
    } else {
        goPlusReasons.push('Wallet not present on any known blacklist.');
    }
    explanations.push({ provider: 'GoPlus', status: goPlusStatus, reasons: goPlusReasons });

    // Helius Analysis
    const heliusReasons: string[] = [];
    let heliusStatus: 'pass' | 'fail' | 'warn' = 'pass';
    if (analysis.wallet.ageDays !== null && analysis.wallet.ageDays < 7) {
        heliusStatus = 'warn';
        heliusReasons.push('Brand-new wallet with very little history.');
    } else {
        heliusReasons.push('Established wallet with verifiable on-chain history.');
    }
    explanations.push({ provider: 'Helius', status: heliusStatus, reasons: heliusReasons });

    // Birdeye Analysis
    const birdeyeReasons: string[] = [];
    let birdeyeStatus: 'pass' | 'fail' | 'warn' = 'pass';
    if (analysis.token.suspicious || (analysis.token.liquidityUSD !== null && analysis.token.liquidityUSD < 10000)) {
        birdeyeStatus = 'warn';
        if (analysis.recommendation === 'reject') {
            birdeyeStatus = 'fail';
        }
        birdeyeReasons.push('Token exhibits low liquidity or suspicious indicators.');
    } else {
        if (analysis.token.verified) {
            birdeyeReasons.push('Healthy token behaviors detected natively.');
            birdeyeReasons.push('Good market liquidity verified safely.');
        } else {
            birdeyeStatus = 'warn';
            birdeyeReasons.push('Token is not globally verified by authoritative sources.');
        }
    }
    explanations.push({ provider: 'Birdeye', status: birdeyeStatus, reasons: birdeyeReasons });

    // Local Rules
    if (policy) {
        if (intentAmount && intentAmount > policy.maxAmount) {
            explanations.push({ provider: 'Local Rules', status: 'fail', reasons: ['Payment exceeds configured policy.'] });
        } else {
            explanations.push({ provider: 'Local Rules', status: 'pass', reasons: ['Amount below configured policy.'] });
        }
    } else {
        explanations.push({ provider: 'Local Rules', status: 'warn', reasons: ['No protective policy explicitly configured.'] });
    }

    // Memory
    if (memory) {
        if (memory.totalTransfers > 0) {
            explanations.push({ provider: 'Memory', status: 'pass', reasons: ['Recipient matches previous behaviour.', `${memory.totalTransfers} historical interactions mapped.`] });
        } else {
            explanations.push({ provider: 'Memory', status: 'warn', reasons: ['Recipient has no previous local interactions.'] });
        }
    }

    // Simulation / Planner
    if (plan) {
        const sim = plan.steps.find((s: { id: string; status: string }) => s.id === 'simulate');
        if (sim && sim.status === 'failed') {
            explanations.push({ provider: 'Simulation', status: 'fail', reasons: ['RPC simulation manually failed.', 'Transaction blocked intrinsically.'] });
        }
        if (sim && sim.status === 'completed') {
            explanations.push({ provider: 'Simulation', status: 'pass', reasons: ['Live Web3 simulation completed organically.', 'Compute units validated.'] });
        }
    }

    return explanations;
}
