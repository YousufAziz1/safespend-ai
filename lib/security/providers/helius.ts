'use server';

/**
 * Helius Security Adapter
 * Module 12 - Comprehensive wallet behavioral analytics using the Helius RPC suite natively.
 */
import { logger } from '@/lib/logger';

export interface HeliusWalletAnalysis {
    walletExists: boolean;
    firstSeen: string | null;
    transactionCount: number;
    previousInteractions: number;
    accountAgeDays: number | null;
    knownPrograms: string[];
    suspiciousPrograms: string[];
    recentActivity: string[];
    confidence: number;
}

export interface HeliusEnrichedTransaction {
    description?: string;
    type?: string;
    source?: string;
    timestamp?: number;
    signature?: string;
    transactionError?: unknown;
    instructions?: Array<{
        programId?: string;
    }>;
}

const HELIUS_BASE_URL = 'https://api.helius.xyz/v0/addresses';

const fetchWithTimeout = async (resource: string, options: RequestInit & { timeout?: number }) => {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const parseHeliusResponse = (data: HeliusEnrichedTransaction[]): HeliusWalletAnalysis => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return {
            walletExists: false,
            firstSeen: null,
            transactionCount: 0,
            previousInteractions: 0,
            accountAgeDays: null,
            knownPrograms: [],
            suspiciousPrograms: [],
            recentActivity: [],
            confidence: 90
        };
    }

    let minTimestamp: number | null = null;
    const programs = new Set<string>();
    const activities: string[] = [];

    let successCount = 0;

    for (const tx of data) {
        if (!tx.transactionError) {
            successCount++;
        }

        if (tx.timestamp) {
            const ms = tx.timestamp * 1000;
            if (minTimestamp === null || ms < minTimestamp) {
                minTimestamp = ms;
            }
        }

        if (tx.description && activities.length < 5) {
            activities.push(tx.description);
        }

        if (tx.instructions && Array.isArray(tx.instructions)) {
            for (const ix of tx.instructions) {
                if (ix.programId) {
                    programs.add(ix.programId);
                }
            }
        }
    }

    const firstSeenDate = minTimestamp ? new Date(minTimestamp) : null;
    const accountAgeDays = firstSeenDate
        ? Math.floor((Date.now() - firstSeenDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const allPrograms = Array.from(programs);

    const knownSet = ['11111111111111111111111111111111', 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'];
    const knownPrograms = allPrograms.filter(p => knownSet.includes(p));

    const suspiciousPrograms = allPrograms.filter(p => !knownSet.includes(p));

    return {
        walletExists: true,
        firstSeen: firstSeenDate ? firstSeenDate.toISOString() : null,
        transactionCount: data.length,
        previousInteractions: successCount,
        accountAgeDays,
        knownPrograms,
        suspiciousPrograms,
        recentActivity: activities,
        confidence: 95
    };
};

export const analyzeWallet = async (address: string, retries = 3): Promise<HeliusWalletAnalysis> => {
    let attempt = 0;

    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.HELIUS_API_KEY || '';
    const endpoint = `${HELIUS_BASE_URL}/${address}/transactions?api-key=${apiKey}`;
    const safeEndpoint = apiKey.length > 0 ? endpoint.replace(apiKey, '***') : endpoint;

    while (attempt < retries) {
        try {
            logger.debug(`[Helius Adapter] Executing Request (Attempt ${attempt + 1})`, { url: safeEndpoint, keyLength: apiKey.length });

            const response = await fetchWithTimeout(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                timeout: 5000
            });

            logger.debug(`[Helius Adapter] Response Status Resolved`, { status: response.status });

            if (!response.ok) {
                const bodyText = await response.text().catch(() => 'Unable to read response body');

                logger.error(`[Helius Adapter] HTTP Failure executing analysis natively`, {
                    url: safeEndpoint,
                    status: response.status,
                    body: bodyText
                });

                throw new Error(`Helius HTTP Integrity Exception: ${response.status}`);
            }

            logger.info(`[Helius Adapter] Execution Resolved`, {
                url: safeEndpoint,
                status: response.status
            });

            const data = (await response.json()) as HeliusEnrichedTransaction[];

            return parseHeliusResponse(data);
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                logger.warn(`[Helius Adapter] Failed parsing ${address} explicitly. Overriding bounding.`, {
                    error: error instanceof Error ? error.message : String(error)
                });

                return {
                    walletExists: false,
                    firstSeen: null,
                    transactionCount: 0,
                    previousInteractions: 0,
                    accountAgeDays: null,
                    knownPrograms: [],
                    suspiciousPrograms: [],
                    recentActivity: [],
                    confidence: 50
                };
            }
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
    }

    throw new Error('Unreachable exception executed.');
};
