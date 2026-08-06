'use server';

/**
 * Birdeye Security Adapter
 * Module 13 - Comprehensive Token Risk Analytics resolving global pricing and liquidity health accurately.
 */
import { logger } from '@/lib/logger';

export interface BirdeyeTokenAnalysis {
    tokenExists: boolean;
    symbol: string | null;
    name: string | null;
    liquidityUSD: number | null;
    holders: number | null;
    volume24hUSD: number | null;
    priceUSD: number | null;
    marketCapUSD: number | null;
    verified: boolean;
    suspicious: boolean;
    confidence: number;
}

export interface BirdeyeApiResponse {
    success: boolean;
    data?: {
        address?: string;
        name?: string;
        symbol?: string;
        decimals?: number;
        liquidity?: number;
        v24hUSD?: number;
        mc?: number;
        price?: number;
        holder?: number;
    } | null;
}

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so/defi/token_overview';

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

const parseBirdeyeResponse = (response: BirdeyeApiResponse): BirdeyeTokenAnalysis => {
    if (!response.success || !response.data) {
        return {
            tokenExists: false,
            symbol: null,
            name: null,
            liquidityUSD: null,
            holders: null,
            volume24hUSD: null,
            priceUSD: null,
            marketCapUSD: null,
            verified: false,
            suspicious: false,
            confidence: 90
        };
    }

    const { data } = response;

    const liquidity = typeof data.liquidity === 'number' ? data.liquidity : null;
    const holders = typeof data.holder === 'number' ? data.holder : null;
    const volume = typeof data.v24hUSD === 'number' ? data.v24hUSD : null;

    const suspicious = (liquidity !== null && liquidity < 100) || (holders !== null && holders < 10);
    const verified = (liquidity !== null && liquidity > 50000) && (holders !== null && holders > 1000);

    return {
        tokenExists: true,
        symbol: data.symbol || null,
        name: data.name || null,
        liquidityUSD: liquidity,
        holders,
        volume24hUSD: volume,
        priceUSD: typeof data.price === 'number' ? data.price : null,
        marketCapUSD: typeof data.mc === 'number' ? data.mc : null,
        verified,
        suspicious,
        confidence: 95
    };
};

export const analyzeToken = async (tokenAddress: string, retries = 3): Promise<BirdeyeTokenAnalysis> => {
    let attempt = 0;

    const apiKey = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || process.env.BIRDEYE_API_KEY || '';
    const endpoint = `${BIRDEYE_BASE_URL}?address=${tokenAddress}`;
    const safeEndpoint = endpoint; // Query params hold no API Key securely (mapped in Headers)

    while (attempt < retries) {
        try {
            logger.debug(`[Birdeye Adapter] Executing Request (Attempt ${attempt + 1})`, { url: safeEndpoint, keyLength: apiKey.length });

            const response = await fetchWithTimeout(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-API-KEY': apiKey
                },
                timeout: 5000
            });

            logger.debug(`[Birdeye Adapter] Response Status Resolved`, { status: response.status });

            if (!response.ok) {
                const bodyText = await response.text().catch(() => 'Unable to read response body');

                logger.error(`[Birdeye Adapter] HTTP Failure executing analysis natively`, {
                    url: safeEndpoint,
                    status: response.status,
                    body: bodyText
                });

                throw new Error(`Birdeye HTTP Integrity Exception: ${response.status}`);
            }

            logger.info(`[Birdeye Adapter] Execution Resolved`, {
                url: safeEndpoint,
                status: response.status
            });

            const data = (await response.json()) as BirdeyeApiResponse;

            return parseBirdeyeResponse(data);
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                logger.warn(`[Birdeye Adapter] Failed parsing ${tokenAddress} explicitly. Overriding bounding.`, {
                    error: error instanceof Error ? error.message : String(error)
                });

                return {
                    tokenExists: false,
                    symbol: null,
                    name: null,
                    liquidityUSD: null,
                    holders: null,
                    volume24hUSD: null,
                    priceUSD: null,
                    marketCapUSD: null,
                    verified: false,
                    suspicious: false,
                    confidence: 50
                };
            }
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
    }

    throw new Error('Unreachable exception executed.');
};
