import { NextRequest, NextResponse } from 'next/server';

const ZEROCLAW_GATEWAY = process.env.ZEROCLAW_WEBHOOK_URL?.replace('/webhook/transfer', '') || 'http://localhost:42617';
const ZEROCLAW_WEBHOOK_SECRET = process.env.ZEROCLAW_WEBHOOK_SECRET || '';

/**
 * Approve or reject a pending human-review checkpoint on the ZeroClaw agent.
 * POST body: { runId: string, action: "approve" | "reject" }
 */
export async function POST(req: NextRequest) {
    try {
        const { runId, action } = await req.json();

        if (!runId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'runId and action (approve|reject) are required.' }, { status: 400 });
        }

        const agentResponse = await fetch(`${ZEROCLAW_GATEWAY}/checkpoint/${runId}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZEROCLAW_WEBHOOK_SECRET}`,
            },
        });

        const contentType = agentResponse.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await agentResponse.json();
        } else {
            const text = await agentResponse.text();
            data = { reply: text, status: agentResponse.status };
        }

        return NextResponse.json(data, { status: agentResponse.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                reply: 'Failed to resolve checkpoint. Ensure the ZeroClaw agent is running.',
                error: message,
                status: 'agent_offline',
            },
            { status: 502 }
        );
    }
}
