/**
 * Module 19 - Configuration Layer
 * Centralizes environmental bounds orchestrating structural safety.
 */

const getEnvBool = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return defaultValue;
};

export const AppConfig = {
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'SafeSpend AI',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
    },

    solana: {
        network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        explorerUrl: process.env.NEXT_PUBLIC_SOLANA_EXPLORER_URL || 'https://explorer.solana.com',
    },

    security: {
        goPlusBaseUrl: process.env.GOPLUS_BASE_URL || 'https://api.gopluslabs.io/api/v1',
        heliusBaseUrl: process.env.HELIUS_BASE_URL || 'https://api.helius.xyz/v0',
        birdeyeBaseUrl: process.env.BIRDEYE_BASE_URL || 'https://public-api.birdeye.so/defi',
    },

    ai: {
        provider: process.env.AI_PROVIDER || 'gemini',
        model: process.env.AI_MODEL || 'gemini-1.5-pro',
        timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000', 10),
    },

    flags: {
        ENABLE_GOPLUS: getEnvBool(process.env.NEXT_PUBLIC_ENABLE_GOPLUS, true),
        ENABLE_HELIUS: getEnvBool(process.env.NEXT_PUBLIC_ENABLE_HELIUS, true),
        ENABLE_BIRDEYE: getEnvBool(process.env.NEXT_PUBLIC_ENABLE_BIRDEYE, true),
        ENABLE_AI_EXPLANATION: getEnvBool(process.env.NEXT_PUBLIC_ENABLE_AI_EXPLANATION, true),
    }
} as const;

/**
 * Structural type exporting native logic mapping completely decoupling upstream dependencies.
 */
export type AppConfiguration = typeof AppConfig;
