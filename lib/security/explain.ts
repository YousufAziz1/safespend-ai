import type { SecurityAnalysis } from './security-engine';

/**
 * ────────────────────────────────────────────────────────────────────────────
 * PROVIDER AGNOSTIC EXPLANATION INTERFACE
 * Allows swapping between dynamic LLMs effortlessly bridging the orchestration outputs
 * natively mapping explicit structured prompts.
 * ────────────────────────────────────────────────────────────────────────────
 */
export interface ExplanationProvider {
    /**
     * @param prompt The strict structured instructional schema passed to the Language Model explicitly.
     * @param analysis The original unmutated orchestration payload passed securely assuring fallback evaluation logic.
     */
    explain(prompt: string, analysis: SecurityAnalysis): Promise<string>;
}

/**
 * Default Explanation Provider
 * Returns deterministic text bypassing external API limits isolating the pipeline natively.
 */
export class DefaultExplanationProvider implements ExplanationProvider {
    async explain(_prompt: string, analysis: SecurityAnalysis): Promise<string> {
        const sentences: string[] = [];

        // 1. Process Temporal/Historical limits
        if (analysis.wallet.previousInteractions === 0) {
            sentences.push('This wallet has no previous interaction history.');
        } else {
            sentences.push(`This wallet has ${analysis.wallet.previousInteractions} previous successful interactions.`);
        }

        if (analysis.wallet.ageDays !== null) {
            sentences.push(`The wallet age is ${analysis.wallet.ageDays} ${analysis.wallet.ageDays === 1 ? 'day' : 'days'}.`);
        }

        // 2. Process GoPlus Security bounds
        if (analysis.wallet.blacklist) {
            sentences.push('GoPlus detected active blacklist signatures on this address.');
        } else if (analysis.wallet.suspicious) {
            sentences.push('GoPlus flagged this address as suspicious.');
        } else {
            sentences.push('GoPlus did not detect blacklist activity.');
        }

        // 3. Token Liquidity mapping limits natively defined
        if (analysis.token.suspicious) {
            sentences.push('The associated token is highly suspicious.');
        } else if (analysis.token.verified) {
            sentences.push('The associated token is verified by global authorities.');
        } else if (analysis.token.liquidityUSD !== null && analysis.token.liquidityUSD < 10000) {
            sentences.push('The token liquidity is extremely low.');
        }

        // 4. Recommendation Mapping securely ensuring UI bounds identically output pure logic
        if (analysis.recommendation === 'approve') {
            sentences.push('We dynamically recommend approving this payment execution safely.');
        } else if (analysis.recommendation === 'manual_review') {
            sentences.push('We recommend manual review before approving this payment.');
        } else {
            sentences.push('We strongly recommend blocking this dangerous transaction.');
        }

        return sentences.join(' ');
    }
}

// TODO: Create `GeminiExplanationProvider` implementing Gemini API execution loops natively.
// TODO: Create `OpenRouterExplanationProvider` mapping arbitrary logic limits identically.
// TODO: Create `OpenAIExplanationProvider` orchestrating explicit explicit reasoning safely.

// Statically instantiated isolating state entirely 
const activeProvider: ExplanationProvider = new DefaultExplanationProvider();

/**
 * Main AI Explanation Execution Payload
 * Converts structural security analyses into natural human formats dynamically.
 * 
 * @param analysis The identical unmutated SecurityAnalysis output resolving structural boundaries precisely.
 * @returns natural language string mapped recursively explicitly bypassing UI/DOM states.
 */
export const generateExplanation = async (analysis: SecurityAnalysis): Promise<string> => {

    // 1. Produce a rigidly structured prompt internally avoiding API mutation scopes
    // Enforcing strict bounds explicitly commanding the LLM NOT to calculate any risk natively.
    const prompt = `
You are a security analyst for SafeSpend AI. Explain the following transaction risk analysis to the user in a natural, professional tone. 
CRITICAL RULES:
- Do not calculate new risk. 
- Do not change the recommendation. 
- Only explain the facts provided below.

Analysis Data:
- Wallet Exists: ${analysis.wallet.exists}
- Wallet Age (Days): ${analysis.wallet.ageDays !== null ? analysis.wallet.ageDays : 'Unknown'}
- Previous Interactions: ${analysis.wallet.previousInteractions}
- GoPlus Blacklist: ${analysis.wallet.blacklist}
- GoPlus Suspicious: ${analysis.wallet.suspicious}
- Token Verified: ${analysis.token.verified}
- Token Liquidity USD: ${analysis.token.liquidityUSD !== null ? analysis.token.liquidityUSD : 'Unknown'}
- Token Holders: ${analysis.token.holders !== null ? analysis.token.holders : 'Unknown'}
- Token Suspicious: ${analysis.token.suspicious}

Final Risk Score: ${analysis.riskScore} / 100
Risk Level: ${analysis.riskLevel}
Recommendation: ${analysis.recommendation}

Please provide a short 2-3 sentence explanation mapping explicitly to the exact limits stated.
`;

    // 2. Delegate the explicitly instantiated prompt recursively across swappable providers identically
    return await activeProvider.explain(prompt, analysis);
};
