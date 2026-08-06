import { type SecurityAnalysis } from '@/lib/security/security-engine';
import { type ExecutionPlan } from './planner';
import { type MemoryStats } from './memory';
import { type PaymentPolicy } from './policies';

export interface Suggestion {
    id: string;
    label: string;
    actionPayload: string; // The explicit string matched by the intent parser when clicked
    type: 'policy' | 'contact' | 'security' | 'action';
}

export interface SuggestionContext {
    analysis?: SecurityAnalysis;
    plan?: ExecutionPlan;
    memoryStats?: MemoryStats;
    policy?: PaymentPolicy | null;
    contactName?: string | null;
    address?: string | null;
    intentAmount?: number | null;
}

export function generateSuggestions(ctx: SuggestionContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Condition: Unsaved contact with previous history
    if (ctx.address && !ctx.contactName && ctx.memoryStats && ctx.memoryStats.totalTransfers > 0) {
        suggestions.push({
            id: 'save_contact',
            label: 'Save Trusted Contact',
            actionPayload: `Save ${ctx.address} as a contact`,
            type: 'contact'
        });
    }

    // Condition: No active policy for address
    if (ctx.address && !ctx.policy) {
        const name = ctx.contactName || ctx.address;
        suggestions.push({
            id: 'create_policy',
            label: 'Create protection policy',
            actionPayload: `Create policy for ${name}`,
            type: 'policy'
        });
    }

    // Condition: High risk analysis 
    if (ctx.analysis && (ctx.analysis.recommendation === 'reject' || ctx.analysis.recommendation === 'manual_review')) {
        suggestions.push({
            id: 'explain_security',
            label: 'Explain Security Report',
            actionPayload: `Explain the security risks for this transaction`,
            type: 'security'
        });
    } else if (ctx.analysis && ctx.analysis.recommendation === 'approve') {
        suggestions.push({
            id: 'view_provider_details',
            label: 'View Provider Details',
            actionPayload: `Show detailed provider reports for this transaction`,
            type: 'security'
        });
    }

    // Condition: Significantly larger payment than historical average
    if (ctx.intentAmount && ctx.memoryStats && ctx.memoryStats.averageAmount > 0) {
        if (ctx.intentAmount > ctx.memoryStats.averageAmount * 2) {
            suggestions.push({
                id: 'split_payment',
                label: 'Split payment into smaller transfers',
                actionPayload: `Cancel this and send ${Math.round((ctx.intentAmount / 2) * 100) / 100} SOL instead`,
                type: 'action'
            });
        }
    }

    // Condition: Execution explicitly failed at Simulation
    if (ctx.plan) {
        const simStep = ctx.plan.steps.find((s: { id: string; status: string }) => s.id === 'simulate');
        if (simStep && simStep.status === 'failed') {
            const name = ctx.contactName || ctx.address || 'them';
            suggestions.push({
                id: 'retry_sim',
                label: 'Retry simulation',
                actionPayload: `Retry sending ${ctx.intentAmount} SOL to ${name}`,
                type: 'action'
            });
        }
    }

    // Standard fallback UI hooks
    if (suggestions.length === 0) {
        suggestions.push({
            id: 'schedule_later',
            label: 'Schedule Later',
            actionPayload: `Schedule this transaction for later`,
            type: 'action'
        });
    }

    return suggestions.slice(0, 4); // Show max 4 suggestions
}
