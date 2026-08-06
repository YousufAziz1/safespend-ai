import { NextRequest, NextResponse } from 'next/server';

const ZEROCLAW_WEBHOOK_URL = process.env.ZEROCLAW_WEBHOOK_URL || 'http://localhost:42617/webhook/transfer';
const ZEROCLAW_WEBHOOK_SECRET = process.env.ZEROCLAW_WEBHOOK_SECRET || '';

/**
 * Proxy POST requests from the Next.js frontend to the ZeroClaw agent webhook.
 * The frontend never computes verdicts — the agent and plugin own all logic.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const agentResponse = await fetch(ZEROCLAW_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZEROCLAW_WEBHOOK_SECRET}`,
            },
            body: JSON.stringify({ message: body.message }),
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
                reply: 'ZeroClaw agent is not reachable. Ensure the agent is running on port 42617.',
                error: message,
                status: 'agent_offline',
            },
            { status: 502 }
        );
    }
}
