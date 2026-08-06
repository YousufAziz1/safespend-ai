'use client';

import { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resolveCheckpoint, type AgentReply } from '@/lib/zeroclaw/webhook-client';

interface ApprovalCheckpointProps {
    runId: string;
    recipient: string;
    amount: number;
    code: string;
    onResolved?: (result: AgentReply) => void;
}

/**
 * Renders an explicit human-review approval checkpoint.
 * The user must click Approve or Reject — there is no way to bypass this.
 * The action is forwarded to the real ZeroClaw agent checkpoint endpoint.
 */
export function ApprovalCheckpoint({ runId, recipient, amount, code, onResolved }: ApprovalCheckpointProps) {
    const [status, setStatus] = useState<'pending' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('pending');
    const [result, setResult] = useState<AgentReply | null>(null);

    const handleAction = async (action: 'approve' | 'reject') => {
        setStatus(action === 'approve' ? 'approving' : 'rejecting');

        const reply = await resolveCheckpoint(runId, action);
        setResult(reply);
        setStatus(action === 'approve' ? 'approved' : 'rejected');
        onResolved?.(reply);
    };

    const truncatedRecipient = recipient.length > 16
        ? `${recipient.slice(0, 6)}...${recipient.slice(-6)}`
        : recipient;

    return (
        <Card className="border-amber-500/30 bg-amber-50/30 shadow-md dark:bg-amber-950/10 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-400">
                    <Shield className="size-4 text-amber-600" />
                    Human Approval Required
                    <Badge variant="secondary" className="ml-auto bg-amber-500/15 text-amber-700 dark:text-amber-400">{code}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">Recipient</span>
                        <p className="font-mono font-semibold tracking-tight">{truncatedRecipient}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Amount</span>
                        <p className="font-semibold">{amount} SOL</p>
                    </div>
                </div>

                {status === 'pending' && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleAction('approve')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            <CheckCircle2 className="size-4" /> Approve
                        </Button>
                        <Button
                            onClick={() => handleAction('reject')}
                            variant="destructive"
                            className="flex-1 gap-2"
                        >
                            <XCircle className="size-4" /> Reject
                        </Button>
                    </div>
                )}

                {(status === 'approving' || status === 'rejecting') && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {status === 'approving' ? 'Approving transfer...' : 'Rejecting transfer...'}
                    </div>
                )}

                {status === 'approved' && result?.signature && (
                    <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" /> Transfer Confirmed
                        </div>
                        <a
                            href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
                        >
                            {result.signature.slice(0, 12)}...{result.signature.slice(-8)}
                            <ExternalLink className="size-3" />
                        </a>
                    </div>
                )}

                {status === 'approved' && !result?.signature && (
                    <div className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="size-4" /> Approved. {result?.reply || 'Waiting for agent to process.'}
                    </div>
                )}

                {status === 'rejected' && (
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <XCircle className="size-4" /> Transfer rejected. No funds were moved.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
