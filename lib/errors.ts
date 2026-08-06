/**
 * Module 22 — Central Error Code Registry
 * Standardizes architectural failure structures explicitly managing decoupling states gracefully.
 */

export enum ErrorCode {
    SECURITY_PROVIDER_TIMEOUT = 'SECURITY_PROVIDER_TIMEOUT',
    GOPLUS_REQUEST_FAILED = 'GOPLUS_REQUEST_FAILED',
    HELIUS_REQUEST_FAILED = 'HELIUS_REQUEST_FAILED',
    BIRDEYE_REQUEST_FAILED = 'BIRDEYE_REQUEST_FAILED',
    INVALID_RECIPIENT = 'INVALID_RECIPIENT',
    INVALID_AMOUNT = 'INVALID_AMOUNT',
    TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
    TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
    WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
    RPC_UNAVAILABLE = 'RPC_UNAVAILABLE',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type AppError = {
    code: ErrorCode;
    message: string;
    retryable: boolean;
};

/**
 * Standard utility constructing strongly typed fallback states.
 * Guarantees cross-engine logic never leaks generic JS Exceptions explicitly.
 */
export function createAppError(
    code: ErrorCode,
    message: string,
    retryable: boolean = false
): AppError {
    return {
        code,
        message,
        retryable
    };
}
