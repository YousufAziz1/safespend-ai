'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, History, Bot, ArrowLeftRight } from 'lucide-react';
import { WalletInfo } from '@/components/wallet/wallet-info';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { mockRiskScenarios } from '@/lib/mock-risk';
import { getTransactions, type TransactionRecord } from '@/lib/storage/transaction-history';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function DashboardPage() {
    const [history, setHistory] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const txs = getTransactions().slice(0, 5);
            // eslint-disable-next-line
            setHistory(txs);
            // eslint-disable-next-line
            setIsLoading(false);
        } catch (err) {
            console.error('[SafeSpend] Error surfacing dashboard history:', err);
            setIsLoading(false);
        }
    }, []);

    const recentActivity = mockRiskScenarios.slice(0, 3);
    const displayMocks = history.length === 0 && !isLoading;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            {/* Hero Section */}
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium tracking-tight text-emerald-500">Welcome back</p>
                    <h1 className="text-3xl font-bold tracking-tight">SafeSpend AI Dashboard</h1>
                    <p className="mt-2 text-lg leading-relaxed text-muted-foreground md:max-w-xl">
                        Your control center for secure, on-chain execution. Intercept, analyze, and approve transactions before they reach the blockchain.
                    </p>
                </div>
                <div className="flex shrink-0 items-center justify-start md:justify-center">
                    <Link href="/send" className={cn(buttonVariants({ size: 'lg' }), "gap-2 rounded-full px-6 shadow-sm")}>
                        Send Protected Payment <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left Column: Wallet & Quick Actions */}
                <div className="flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-semibold tracking-tight">Wallet Overview</h2>
                        <WalletInfo />
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/send" className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <ArrowLeftRight className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold">Send Payment</span>
                                    <span className="text-sm text-muted-foreground">Compose and analyze a new transaction</span>
                                </div>
                            </Link>

                            <Link href="/transactions" className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:bg-muted/50 hover:shadow-md">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <History className="size-5" />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-semibold">Transaction History</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">View all intercepted payments</span>
                                </div>
                            </Link>

                            <Link href="/analytics" className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Bot className="size-5" />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-semibold">AI Reports</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Detailed risk analysis models</span>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Right Column: System Status & Recent Activity */}
                <div className="flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-semibold tracking-tight">System Status</h2>
                        <Card className="shadow-sm">
                            <CardContent className="grid gap-4 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">Wallet Connected</span>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">Solana Devnet</span>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">AI Engine Ready</span>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">Risk Engine Online</span>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
                            <Link href="/send" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}>
                                View All
                            </Link>
                        </div>
                        <div className="grid gap-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                                    Loading history...
                                </div>
                            ) : displayMocks ? (
                                recentActivity.map(activity => (
                                    <Card key={activity.scenarioId} className="shadow-sm transition-colors hover:bg-muted/10">
                                        <CardContent className="flex items-center justify-between gap-4 p-4">
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <span className="truncate font-semibold">{activity.scenarioName}</span>
                                                <span className="text-xs text-muted-foreground">{activity.estimatedFee.toFixed(6)} SOL fee</span>
                                            </div>
                                            <Badge
                                                variant={activity.color === 'green' ? 'default' : activity.color === 'yellow' ? 'secondary' : 'destructive'}
                                                className={cn(
                                                    "shrink-0",
                                                    activity.color === 'green' && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
                                                    activity.color === 'yellow' && "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-500",
                                                )}
                                            >
                                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                history.map((tx) => {
                                    const isGreen = tx.riskLevel === 'safe' || tx.riskLevel === 'green';
                                    const isYellow = tx.riskLevel === 'warning' || tx.riskLevel === 'yellow';

                                    return (
                                        <Card key={tx.signature} className="shadow-sm transition-colors hover:bg-muted/10">
                                            <CardContent className="flex items-center justify-between gap-4 p-4">
                                                <div className="flex flex-col gap-1 overflow-hidden">
                                                    {tx.recipient ? (
                                                        <>
                                                            <span className="truncate font-semibold tracking-tight">
                                                                {tx.recipient.length > 20 ? `${tx.recipient.slice(0, 4)}...${tx.recipient.slice(-4)}` : tx.recipient}
                                                            </span>
                                                            <span className="truncate font-mono text-[11px] font-medium text-muted-foreground">
                                                                Tx: {tx.signature.slice(0, 6)}...{tx.signature.slice(-6)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="truncate font-mono text-sm font-semibold tracking-tight">
                                                            {tx.signature.slice(0, 6)}...{tx.signature.slice(-6)}
                                                        </span>
                                                    )}
                                                    <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                                                        {tx.amount.toFixed(4)} SOL
                                                    </span>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                    <Badge
                                                        variant={isGreen ? 'default' : isYellow ? 'secondary' : 'destructive'}
                                                        className={cn(
                                                            "shrink-0 font-medium",
                                                            isGreen && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
                                                            isYellow && "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-500",
                                                        )}
                                                    >
                                                        {tx.riskLevel.charAt(0).toUpperCase() + tx.riskLevel.slice(1)}
                                                    </Badge>
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
