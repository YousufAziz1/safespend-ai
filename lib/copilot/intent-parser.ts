/**
 * SafeSpend AI Copilot — Intent Parser
 * Module CP-02, Part 1
 *
 * Extracts structured intent from natural language without any AI model.
 * Supports: send/transfer/pay commands, wallet analysis, comparison, and explanation requests.
 */

export type IntentAction = 'send' | 'analyze' | 'compare' | 'explain' | 'unknown';

export interface ParsedIntent {
    action: IntentAction;
    amount: number | null;
    token: string;
    recipient: string | null;
    raw: string;
}

// Patterns for send/transfer/pay actions
const SEND_PATTERNS = [
    // "Send 5 SOL to John"
    /^(?:send|transfer|pay)\s+([\d.]+)\s*(sol)?\s*(?:to\s+)?(.+)?$/i,
    // "Pay Alice 1.5 SOL"
    /^(?:pay)\s+(.+?)\s+([\d.]+)\s*(sol)?$/i,
];

// Patterns for analysis actions
const ANALYZE_PATTERNS = [
    /(?:analyze|check|scan|inspect|is)\s+(?:this\s+)?(?:wallet|address)\s*(.+)?/i,
    /is\s+(?:this\s+)?(?:wallet|address)\s+safe/i,
];

// Patterns for comparison actions
const COMPARE_PATTERNS = [
    /compare\s+(?:these|this|two|the)\s+(?:two\s+)?(?:wallets|addresses)/i,
];

// Patterns for explanation actions
const EXPLAIN_PATTERNS = [
    /explain\s+(?:this\s+)?(?:transaction|tx|why)/i,
    /why\s+(?:is\s+)?(?:this\s+)?(?:transaction|tx)\s+(?:is\s+)?(?:risky|dangerous|suspicious|blocked)/i,
];

/**
 * Parse a natural language message into a structured intent.
 */
export function parseIntent(raw: string): ParsedIntent {
    const trimmed = raw.trim();

    // 1. Check explain patterns
    for (const pattern of EXPLAIN_PATTERNS) {
        if (pattern.test(trimmed)) {
            return { action: 'explain', amount: null, token: 'SOL', recipient: null, raw: trimmed };
        }
    }

    // 2. Check compare patterns
    for (const pattern of COMPARE_PATTERNS) {
        if (pattern.test(trimmed)) {
            return { action: 'compare', amount: null, token: 'SOL', recipient: null, raw: trimmed };
        }
    }

    // 3. Check analyze patterns
    for (const pattern of ANALYZE_PATTERNS) {
        if (pattern.test(trimmed)) {
            return { action: 'analyze', amount: null, token: 'SOL', recipient: null, raw: trimmed };
        }
    }

    // 4. Check send/transfer/pay patterns
    // Pattern: "Pay Alice 1.5 SOL"
    const payMatch = trimmed.match(SEND_PATTERNS[1]);
    if (payMatch) {
        const recipient = payMatch[1]?.trim() || null;
        const amount = parseFloat(payMatch[2]);
        return {
            action: 'send',
            amount: isNaN(amount) ? null : amount,
            token: 'SOL',
            recipient,
            raw: trimmed,
        };
    }

    // Pattern: "Send 5 SOL to John" / "Transfer 10 SOL to trading wallet"
    const sendMatch = trimmed.match(SEND_PATTERNS[0]);
    if (sendMatch) {
        const amount = parseFloat(sendMatch[1]);
        const recipient = sendMatch[3]?.trim() || null;
        return {
            action: 'send',
            amount: isNaN(amount) ? null : amount,
            token: 'SOL',
            recipient,
            raw: trimmed,
        };
    }

    return { action: 'unknown', amount: null, token: 'SOL', recipient: null, raw: trimmed };
}
