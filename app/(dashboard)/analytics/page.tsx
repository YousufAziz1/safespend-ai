'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
    Activity, ShieldCheck, ShieldAlert, Ban, TrendingUp, DollarSign,
    ArrowUpRight, BarChart3, Clock, Info, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getTransactions } from '@/lib/storage/transaction-history';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function AnalyticsPage() {
    const isMounted = useMounted();
    const txs = useMemo(() => isMounted ? getTransactions() : [], [isMounted]);

    const stats = useMemo(() => {
        if (!txs.length) return null;

        const totalTransactions = txs.length;
        const totalAmount = txs.reduce((acc, tx) => acc + tx.amount, 0);

        let safeCount = 0;
        let warningCount = 0;
        let blockedCount = 0;
        let confirmedCount = 0;
        let largestTx = 0;
        let latestTime = 0;

        txs.forEach(tx => {
            const risk = tx.riskLevel.toLowerCase();
            if (risk === 'safe' || risk === 'green') safeCount++;
            else if (risk === 'warning' || risk === 'yellow') warningCount++;
            else if (risk === 'blocked' || risk === 'danger' || risk === 'red') blockedCount++;

            if (tx.status === 'confirmed') confirmedCount++;
            if (tx.amount > largestTx) largestTx = tx.amount;
            if (tx.timestamp > latestTime) latestTime = tx.timestamp;
        });

        const successRate = totalTransactions > 0 ? (confirmedCount / totalTransactions) * 100 : 0;
        const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

        // Daily chart logic
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                id: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: 0
            };
        });

        txs.forEach(tx => {
            const txDate = new Date(tx.timestamp).toDateString();
            const day = last7Days.find(d => d.id === txDate);
            if (day) day.count++;
        });

        const maxDaily = Math.max(...last7Days.map(d => d.count), 1);

        return {
            totalTransactions,
            totalAmount,
            safeCount,
            warningCount,
            blockedCount,
            successRate,
            averageAmount,
            largestTx,
            latestTime,
            last7Days,
            maxDaily
        };
    }, [txs]);

    if (!isMounted) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center rounded-xl p-12">
                <Activity className="size-8 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
                    <p className="mt-2 text-muted-foreground">Comprehensive insights into your transaction execution patterns.</p>
                </div>
                <Separator />
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12 text-center shadow-sm">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                        <BarChart3 className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">No Data Available</h3>
                    <p className="mt-2 max-w-[300px] text-sm text-muted-foreground">
                        Execute transactions via the Composer securely to populate this engine with real-world aggregated records.
                    </p>
                    <Link href="/send" className={cn(buttonVariants({ variant: "default" }), "mt-6")}>
                        Go to Composer
                    </Link>
                </div>
            </div>
        );
    }

    const safePercentage = (stats.safeCount / stats.totalTransactions) * 100;
    const warningPercentage = (stats.warningCount / stats.totalTransactions) * 100;
    const blockedPercentage = (stats.blockedCount / stats.totalTransactions) * 100;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
                <p className="mt-2 text-muted-foreground">
                    Comprehensive insights into your transaction execution patterns, tracking risk models against deployment frequencies.
                </p>
            </div>

            <Separator />

            {/* Quick Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <Activity className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium flex items-center gap-1">
                            <TrendingUp className="size-3" /> System active
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SOL Sent</CardTitle>
                        <DollarSign className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalAmount.toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Aggregated Devnet volume</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Zap className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">On-chain finality</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Transfer</CardTitle>
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.averageAmount.toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground mt-1">SOL per execution</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Graphs & Charts */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Risk Distribution Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Risk Profile Distribution</CardTitle>
                        <CardDescription>Aggregate safety classifications across all executed requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="flex h-6 w-full -space-x-1 overflow-hidden rounded-full border shadow-sm">
                            <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${safePercentage}%` }} title="Safe" />
                            <div className="bg-yellow-500 transition-all duration-500" style={{ width: `${warningPercentage}%` }} title="Warning" />
                            <div className="bg-red-500 transition-all duration-500" style={{ width: `${blockedPercentage}%` }} title="Blocked" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                    <ShieldCheck className="size-3.5 text-emerald-500" /> Safe
                                </span>
                                <span className="text-xl font-bold">{safePercentage.toFixed(1)}%</span>
                                <span className="text-xs text-muted-foreground">{stats.safeCount} exact</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                    <ShieldAlert className="size-3.5 text-yellow-500" /> Warn
                                </span>
                                <span className="text-xl font-bold">{warningPercentage.toFixed(1)}%</span>
                                <span className="text-xs text-muted-foreground">{stats.warningCount} exact</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                    <Ban className="size-3.5 text-red-500" /> Block
                                </span>
                                <span className="text-xl font-bold">{blockedPercentage.toFixed(1)}%</span>
                                <span className="text-xs text-muted-foreground">{stats.blockedCount} exact</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Last 7 Days Histogram */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Execution Velocity</CardTitle>
                        <CardDescription>Execution payloads processed relative to the last 7 trailing days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.last7Days.every(d => d.count === 0) ? (
                            <div className="flex h-[130px] items-center justify-center rounded-lg border border-dashed bg-muted/10 text-sm font-medium text-muted-foreground">
                                No activity in the last 7 days.
                            </div>
                        ) : (
                            <div className="flex h-[130px] items-end justify-between gap-2 px-1">
                                {stats.last7Days.map((day, index) => {
                                    const isToday = index === 6;
                                    const height = day.count > 0 ? Math.max((day.count / stats.maxDaily) * 100, 10) : 0;
                                    return (
                                        <div key={day.id} className="group flex h-full w-full flex-col items-center justify-end gap-2">
                                            <div className="relative flex h-[100px] w-full items-end justify-center">
                                                {day.count > 0 && (
                                                    <span className="absolute -top-6 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
                                                        {day.count}
                                                    </span>
                                                )}
                                                <div
                                                    className={cn(
                                                        "w-full max-w-[2.5rem] rounded-md transition-all duration-500",
                                                        day.count > 0
                                                            ? (isToday ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500" : "bg-primary/90 hover:bg-primary")
                                                            : "bg-muted"
                                                    )}
                                                    style={{ height: height > 0 ? `${height}%` : '4px' }}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-[10px] uppercase tracking-wider",
                                                    isToday ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                                )}
                                            >
                                                {day.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Insights Row */}
            <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Info className="size-4 text-primary" /> Key Intelligent Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex flex-col gap-1 rounded-lg bg-background p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Most Common Risk Profile</span>
                        <span className="text-sm font-medium">
                            {safePercentage >= 50 ? `${safePercentage.toFixed(1)}% of your transactions are completely Safe.` : `High density of risk factors detected natively.`}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg bg-background p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Largest Transfer Hash</span>
                        <span className="text-sm font-medium">
                            Largest transfer maps strictly to {stats.largestTx.toFixed(4)} SOL on-chain.
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg bg-background p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Activeness</span>
                        <span className="text-sm font-medium flex items-center gap-1.5">
                            Last active: <Clock className="size-3" /> {new Date(stats.latestTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
