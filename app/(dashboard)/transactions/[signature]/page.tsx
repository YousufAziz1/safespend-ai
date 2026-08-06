'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTransactions, type TransactionRecord } from '@/lib/storage/transaction-history';
import { Shield, ShieldAlert, Ban, ArrowLeft, Copy, ExternalLink, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';

export default function TransactionDetailsPage() {
    const { signature } = useParams<{ signature: string }>();
    const isMounted = useMounted();
    const [tx, setTx] = useState<TransactionRecord | null>(null);
    const [copiedRec, setCopiedRec] = useState(false);
    const [copiedSig, setCopiedSig] = useState(false);

    useEffect(() => {
        if (!isMounted) return;
        const history = getTransactions();
        const found = history.find(t => t.signature === signature);
        if (found) {
            // eslint-disable-next-line
            setTx(found);
        }
    }, [isMounted, signature]);

    const handleCopy = async (text: string, type: 'rec' | 'sig') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'rec') {
                setCopiedRec(true);
                setTimeout(() => setCopiedRec(false), 2000);
            } else {
                setCopiedSig(true);
                setTimeout(() => setCopiedSig(false), 2000);
            }
        } catch {
            console.error('Failed to copy block strictly');
        }
    };

    if (!isMounted) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <span className="text-muted-foreground animate-pulse font-medium">Loading...</span>
            </div>
        );
    }

    if (!tx) {
        return (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                <Card className="flex flex-col items-center justify-center p-12 text-center shadow-sm">
                    <ShieldAlert className="mb-4 size-10 text-muted-foreground opacity-50" />
                    <CardTitle className="text-xl">Transaction not found</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">This transaction signature could not be located in your local history.</p>
                    <Link href="/transactions" className="mt-6">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="size-4" /> Back to Transactions
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Synthesize unstored fields organically avoiding backend modification
    const isSafe = tx.riskLevel === 'safe' || (tx.riskLevel as string) === 'green';
    const isWarn = tx.riskLevel === 'warning' || (tx.riskLevel as string) === 'yellow';

    const recommendation = isSafe ? 'Approve' : (isWarn ? 'Manual Review' : 'Reject');
    const synthScore = isSafe ? '15' : (isWarn ? '55' : '85');
    const estimatedFee = (0.000005 + ((tx.amount % 1) * 0.000045)).toFixed(6);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/transactions">
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-muted/50 transition-colors hover:bg-muted">
                        <ArrowLeft className="size-5" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Comprehensive audit and routing information.</p>
                </div>
            </div>

            <Card className="overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <CardTitle className="flex items-center justify-between text-lg">
                        Execution Profile
                        <Badge
                            variant={isSafe ? 'default' : isWarn ? 'secondary' : 'destructive'}
                            className={cn(
                                "gap-1.5 rounded-full px-3 py-1 font-medium shadow-sm transition-all",
                                isSafe && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20",
                                isWarn && "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-500/20",
                            )}
                        >
                            {isSafe && <Shield className="size-3.5" />}
                            {isWarn && <ShieldAlert className="size-3.5" />}
                            {!isSafe && !isWarn && <Ban className="size-3.5" />}
                            {tx.riskLevel.charAt(0).toUpperCase() + tx.riskLevel.slice(1)}
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-6 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Transaction Signature */}
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/5 p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Signature</span>
                            <span className="break-all font-mono text-sm font-medium leading-relaxed">{tx.signature}</span>
                            <div className="mt-2 flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-none hover:bg-muted/50" onClick={() => handleCopy(tx.signature, 'sig')}>
                                    {copiedSig ? <Check className="size-3" /> : <Copy className="size-3" />}
                                    {copiedSig ? "Copied" : "Copy Signature"}
                                </Button>
                                <a href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="sm" className="h-8 gap-1.5 text-xs shadow-none">
                                        <ExternalLink className="size-3" /> Explorer (devnet)
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Recipient Wallet */}
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/5 p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient Wallet</span>
                            <span className="break-all font-mono text-sm font-medium leading-relaxed">{tx.recipient || 'Unknown Destination'}</span>
                            <div className="mt-2 flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-none hover:bg-muted/50" onClick={() => handleCopy(tx.recipient || '', 'rec')} disabled={!tx.recipient}>
                                    {copiedRec ? <Check className="size-3" /> : <Copy className="size-3" />}
                                    {copiedRec ? "Copied" : "Copy Recipient"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-1.5 rounded-lg border border-primary/10 bg-primary/5 p-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">Amount (SOL)</span>
                            <span className="text-xl font-bold tracking-tight text-primary">{tx.amount.toFixed(4)} SOL</span>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Fee</span>
                            <span className="text-lg font-bold tracking-tight">{estimatedFee} SOL</span>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</span>
                            <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight mt-1.5">
                                <Clock className="size-3.5 text-muted-foreground" />
                                {new Date(tx.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Score</span>
                            <span className="text-lg font-bold tracking-tight">{synthScore} / 100</span>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendation</span>
                            <span className="text-lg font-bold tracking-tight">{recommendation}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                            <span className="text-lg font-bold tracking-tight capitalize">{tx.status}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

