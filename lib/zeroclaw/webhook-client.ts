/**
 * ZeroClaw Webhook Client
 *
 * Sends messages to the ZeroClaw agent via the Next.js API proxy route.
 * All verdicts and policy decisions are computed by the agent and plugin.
 * The frontend only displays results — never computes them.
 */

export interface AgentReply {
    reply?: string;
    verdict?: 'Allow' | 'RequireApproval' | 'Deny';
    code?: string;
    runId?: string;
    recipient?: string;
    amount?: number;
    signature?: string;
    error?: string;
    status?: string;
}

/**
 * Send a natural-language transfer request to the ZeroClaw agent.
 */
export async function sendToAgent(message: string): Promise<AgentReply> {
    try {
        const res = await fetch('/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();
        return data as AgentReply;
    } catch {
        return {
            reply: 'Could not reach the ZeroClaw agent. Make sure it is running on port 42617.',
            status: 'agent_offline',
        };
    }
}

/**
 * Approve or reject a pending human-review checkpoint.
 */
export async function resolveCheckpoint(runId: string, action: 'approve' | 'reject'): Promise<AgentReply> {
    try {
        const res = await fetch('/api/checkpoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ runId, action }),
        });

        const data = await res.json();
        return data as AgentReply;
    } catch {
        return {
            reply: 'Could not resolve the checkpoint. Make sure the agent is running.',
            status: 'agent_offline',
        };
    }
}
