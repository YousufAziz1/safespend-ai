'use client';

import { useState } from 'react';
import {
    Search, Copy, CheckCircle2, History, ArrowUpDown, ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTransactions } from '@/lib/storage/transaction-history';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
    const isMounted = useMounted();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const allHistory = isMounted ? getTransactions() : [];

    const handleCopy = (text: string) => {
        try {
            navigator.clipboard.writeText(text);
        } catch {
            // Graceful local fallback ignoring secure context constraints locally
        }
    };

    const filteredHistory = allHistory.filter(tx => {
        if (filterRisk !== 'all') {
            const risk = tx.riskLevel.toLowerCase();
            if (filterRisk === 'safe' && risk !== 'safe' && risk !== 'green') return false;
            if (filterRisk === 'warning' && risk !== 'warning' && risk !== 'yellow') return false;
            if (filterRisk === 'blocked' && risk !== 'blocked' && risk !== 'danger' && risk !== 'red') return false;
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            const rec = tx.recipient?.toLowerCase() || '';
            const sig = tx.signature.toLowerCase();
            if (!rec.includes(term) && !sig.includes(term)) return false;
        }

        return true;
    }).sort((a, b) => {
        return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
                <p className="mt-2 text-muted-foreground">
                    View, search, and audit your complete blockchain transaction log and AI analysis results.
                </p>
            </div>

            <Separator />

            {/* Controls: Search, Filter, Sort */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by address or signature..."
                        className="pl-9 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
                        <Button
                            variant={filterRisk === 'all' ? 'secondary' : 'ghost'}
                            onClick={() => setFilterRisk('all')}
                            size="sm"
                            className="h-7 text-xs font-medium"
                        >
                            All
                        </Button>
                        <Button
                            variant={filterRisk === 'safe' ? 'secondary' : 'ghost'}
                            onClick={() => setFilterRisk('safe')}
                            size="sm"
                            className="h-7 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                        >
                            Safe
                        </Button>
                        <Button
                            variant={filterRisk === 'warning' ? 'secondary' : 'ghost'}
                            onClick={() => setFilterRisk('warning')}
                            size="sm"
                            className="h-7 text-xs font-medium text-yellow-600 dark:text-yellow-500"
                        >
                            Warning
                        </Button>
                        <Button
                            variant={filterRisk === 'blocked' ? 'secondary' : 'ghost'}
                            onClick={() => setFilterRisk('blocked')}
                            size="sm"
                            className="h-7 text-xs font-medium text-red-600 dark:text-red-400"
                        >
                            Blocked
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        className="h-9 gap-2 shadow-sm font-medium"
                    >
                        <ArrowUpDown className="size-4" />
                        {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    </Button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="grid gap-4">
                {!isMounted ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 shadow-sm">
                        <History className="mb-4 size-8 animate-pulse text-muted-foreground" />
                        <h3 className="text-lg font-semibold tracking-tight">Loading history...</h3>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-center shadow-sm">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                            <History className="size-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">No transactions found</h3>
                        <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
                            Expand your search filters or start executing via the Send logic sequence to map local Devnet records.
                        </p>
                    </div>
                ) : (
                    filteredHistory.map((tx) => {
                        const isGreen = tx.riskLevel === 'safe' || tx.riskLevel === 'green';
                        const isYellow = tx.riskLevel === 'warning' || tx.riskLevel === 'yellow';

                        return (
                            <Card key={tx.signature} className="shadow-sm transition-colors hover:bg-muted/10">
                                <CardContent className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between">
                                    {/* Identifier Column */}
                                    <div className="flex flex-col gap-2 overflow-hidden md:max-w-[240px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-muted-foreground">Recipient</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-semibold tracking-tight">
                                                {tx.recipient ? tx.recipient : 'Unknown'}
                                            </span>
                                            {tx.recipient && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 text-muted-foreground/50 hover:text-foreground shrink-0"
                                                    onClick={() => handleCopy(tx.recipient)}
                                                >
                                                    <Copy className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Signature Column */}
                                    <div className="flex flex-col gap-2 overflow-hidden md:max-w-[260px]">
                                        <span className="text-sm font-bold text-muted-foreground">Signature</span>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-mono text-sm tracking-tight text-foreground/80">
                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 text-muted-foreground/50 hover:text-foreground shrink-0"
                                                onClick={() => handleCopy(tx.signature)}
                                            >
                                                <Copy className="size-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Amount & Status */}
                                    <div className="flex shrink-0 flex-col gap-2 md:items-end">
                                        <span className="text-sm font-bold text-muted-foreground">Amount</span>
                                        <span className="font-medium text-foreground tracking-tight">{tx.amount.toFixed(4)} SOL</span>
                                    </div>

                                    {/* Risk & Output Configs */}
                                    <div className="flex shrink-0 flex-col items-start gap-2.5 md:items-end">
                                        <span className="text-sm font-bold text-muted-foreground">Security</span>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={isGreen ? 'default' : isYellow ? 'secondary' : 'destructive'}
                                                className={cn(
                                                    "shrink-0 rounded-md font-semibold font-sans tracking-wide",
                                                    isGreen && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
                                                    isYellow && "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-500",
                                                )}
                                            >
                                                {tx.riskLevel.charAt(0).toUpperCase() + tx.riskLevel.slice(1)}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                                                <CheckCircle2 className="size-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{tx.status === 'confirmed' ? 'Confirmed' : tx.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Connectors */}
                                    <div className="flex shrink-0 flex-col gap-1 items-start md:items-end w-full md:w-auto">
                                        <span className="hidden md:block text-xs font-semibold text-transparent">&nbsp;</span>
                                        <div className="flex items-center gap-3 w-full md:justify-end mt-2 md:mt-0">
                                            <div className="flex-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
                                                {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <a
                                                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 shadow-sm whitespace-nowrap h-8 text-xs font-bold")}
                                            >
                                                View Explorer <ExternalLink className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
