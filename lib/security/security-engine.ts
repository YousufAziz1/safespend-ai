import type { RiskLevel, Recommendation, ReasonType } from '@/types/transaction';
import { checkWallet } from './providers/goplus';
import { analyzeWallet } from './providers/helius';
import { analyzeToken } from './providers/birdeye';
import { logger } from '@/lib/logger';

export interface ProviderStatusInfo {
    name: string;
    status: 'online' | 'offline' | 'timeout';
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
}

export interface SecurityAnalysis {
    recommendation: Recommendation;
    confidence: number;
    riskScore: number;
    riskLevel: RiskLevel;

    wallet: {
        exists: boolean;
        ageDays: number | null;
        previousInteractions: number;
        blacklist: boolean;
        suspicious: boolean;
    };

    token: {
        verified: boolean;
        liquidityUSD: number | null;
        holders: number | null;
        suspicious: boolean;
    };

    reasons: { id: string; type: ReasonType; message: string }[];
    estimatedFee: number;
    providerStatus: ProviderStatusInfo[];
}

/**
 * Validates external API cycles monitoring runtime executions mapping latencies organically.
 * Allows pure non-throwing structures to explicitly expose their inner states cleanly to the downstream layers.
 */
async function executeWithMetrics<T>(
    name: string,
    execute: () => Promise<T>
): Promise<{ data: T; status: ProviderStatusInfo }> {
    const start = Date.now();
    try {
        const result = await execute();
        const latency = Date.now() - start;

        let success = true;
        let providerStatus: 'online' | 'timeout' | 'offline' = 'online';
        let errorMessage: string | undefined = undefined;

        const obj = result as { confidence?: number, error?: string };
        if (obj && obj.confidence === 50) {
            success = false;
            // Native heuristic mapping true aborts vs http 401 boundaries correctly
            providerStatus = latency >= 5000 ? 'timeout' : 'offline';
            errorMessage = latency >= 5000
                ? `${name} API connection timeout exceeded thresholds.`
                : `${name} API encountered an invalid HTTP response or execution lock.`;
        }

        return {
            data: result,
            status: {
                name,
                status: providerStatus,
                latencyMs: latency,
                success,
                errorMessage
            }
        };
    } catch (error) {
        let mappedError = 'Unknown fatal exception.';
        let providerStatus: 'timeout' | 'offline' = 'offline';
        if (error instanceof Error) {
            mappedError = error.message;
            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                providerStatus = 'timeout';
                mappedError = `Connection timeout threshold breached manually.`;
            }
        }
        return {
            data: null as unknown as T,
            status: {
                name,
                status: providerStatus,
                latencyMs: Date.now() - start,
                success: false,
                errorMessage: mappedError
            }
        };
    }
}

/**
 * Main Orchestration Endpoint Execution Layer
 * Single authoritative source parsing Provider.allSettled logics tracking metrics.
 */
export const analyzeTransaction = async (
    recipient: string,
    amount: number,
    tokenAddress: string = 'So11111111111111111111111111111111111111112'
): Promise<SecurityAnalysis> => {

    const [goPlusOutcome, heliusOutcome, birdeyeOutcome] = await Promise.allSettled([
        executeWithMetrics('GoPlus', () => checkWallet(recipient)),
        executeWithMetrics('Helius', () => analyzeWallet(recipient)),
        executeWithMetrics('Birdeye', () => analyzeToken(tokenAddress))
    ]);

    const providerStatus: ProviderStatusInfo[] = [];

    const goPlusData = goPlusOutcome.status === 'fulfilled' && goPlusOutcome.value.data
        ? goPlusOutcome.value.data
        : { blacklist: false, suspicious: false, confidence: 50 };

    const heliusData = heliusOutcome.status === 'fulfilled' && heliusOutcome.value.data
        ? heliusOutcome.value.data
        : { walletExists: false, accountAgeDays: null, previousInteractions: 0, transactionCount: 0, confidence: 50 };

    const birdeyeData = birdeyeOutcome.status === 'fulfilled' && birdeyeOutcome.value.data
        ? birdeyeOutcome.value.data
        : { verified: false, liquidityUSD: null, holders: null, suspicious: false, confidence: 50 };

    const addToStatus = (name: string, outcome: PromiseSettledResult<{ data: unknown; status: ProviderStatusInfo }>) => {
        if (outcome.status === 'fulfilled') {
            providerStatus.push(outcome.value.status);
        } else {
            providerStatus.push({
                name, status: 'offline', latencyMs: 0, success: false, errorMessage: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
            });
        }
    };

    addToStatus('GoPlus', goPlusOutcome);
    addToStatus('Helius', heliusOutcome);
    addToStatus('Birdeye', birdeyeOutcome);

    // 4. Local Rule Engine Orchestration
    const ruleStart = Date.now();
    let riskScore = 0;
    const reasons: { id: string; type: ReasonType; message: string }[] = [];

    if (heliusData.previousInteractions === 0) {
        riskScore += 15;
        reasons.push({ id: 'r_first', type: 'warning', message: 'First interaction with this wallet address detected.' });
    }

    if (heliusData.accountAgeDays !== null && heliusData.accountAgeDays < 30) {
        riskScore += 20;
        reasons.push({ id: 'r_age', type: 'warning', message: 'Wallet was created less than 30 days ago.' });
    }

    if (amount > 100) {
        riskScore += 35;
        reasons.push({ id: 'r_amt_100', type: 'critical', message: 'Transaction amount exceeds 100 SOL limit.' });
    } else if (amount > 50) {
        riskScore += 25;
        reasons.push({ id: 'r_amt_50', type: 'warning', message: 'Transaction amount exceeds 50 SOL threshold.' });
    } else if (amount > 10) {
        riskScore += 15;
        reasons.push({ id: 'r_amt_10', type: 'warning', message: 'Transaction amount exceeds 10 SOL baseline.' });
    }

    if (goPlusData.blacklist) {
        riskScore += 50;
        reasons.push({ id: 'r_bl', type: 'critical', message: 'Recipient is blacklisted globally by GoPlus Security.' });
    }

    if (goPlusData.suspicious || birdeyeData.suspicious) {
        riskScore += 30;
        reasons.push({ id: 'r_sus', type: 'critical', message: 'Recipient flags suspicious behavior on leading providers.' });
    }

    if (!birdeyeData.verified) {
        riskScore += 20;
        reasons.push({ id: 'r_unver', type: 'warning', message: 'Token lacks verification standing natively.' });
    }

    // Checking if transaction history is missing locally
    const txCount = heliusData.transactionCount ?? 0;
    if (txCount === 0) {
        riskScore += 10;
        reasons.push({ id: 'r_notx', type: 'warning', message: 'Wallet exhibits no prior execution history.' });
    }

    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel: RiskLevel;
    let recommendation: Recommendation;

    if (riskScore <= 25) {
        riskLevel = 'safe';
        recommendation = 'approve';
    } else if (riskScore <= 50) {
        riskLevel = 'warning';
        recommendation = 'approve';
    } else if (riskScore <= 75) {
        riskLevel = 'warning';
        recommendation = 'manual_review';
    } else {
        riskLevel = 'danger';
        recommendation = 'reject';
    }

    providerStatus.push({
        name: 'Local Rule Engine',
        status: 'online',
        latencyMs: Date.now() - ruleStart,
        success: true
    });

    const confidence = Math.max(0, Math.min(100, Math.floor((goPlusData.confidence + heliusData.confidence + birdeyeData.confidence) / 3)));
    const estimatedFee = 0.000005 + ((amount % 1) * 0.000045);

    providerStatus.forEach(status => {
        logger.info(`Provider Execution: ${status.name}`, {
            success: status.success,
            latencyMs: status.latencyMs,
            httpStatus: 'N/A',
            errorMessage: status.errorMessage
        });
    });

    const externalProviders = providerStatus.filter(p => p.name !== 'Local Rule Engine');
    const allFailed = externalProviders.every(p => !p.success);

    if (allFailed) {
        return {
            recommendation: 'manual_review',
            confidence: 0,
            riskScore: 50,
            riskLevel: 'warning',
            wallet: { exists: false, ageDays: null, previousInteractions: 0, blacklist: false, suspicious: false },
            token: { verified: false, liquidityUSD: null, holders: null, suspicious: false },
            reasons: [{ id: 'sys_offline', type: 'warning', message: 'Security providers unavailable.' }],
            estimatedFee,
            providerStatus
        };
    }

    return {
        recommendation,
        confidence,
        riskScore,
        riskLevel,
        wallet: {
            exists: heliusData.walletExists,
            ageDays: heliusData.accountAgeDays,
            previousInteractions: heliusData.previousInteractions,
            blacklist: goPlusData.blacklist,
            suspicious: goPlusData.suspicious
        },
        token: {
            verified: birdeyeData.verified,
            liquidityUSD: birdeyeData.liquidityUSD,
            holders: birdeyeData.holders,
            suspicious: birdeyeData.suspicious
        },
        reasons,
        estimatedFee,
        providerStatus
    };
};
