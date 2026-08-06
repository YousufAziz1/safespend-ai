'use client';

import { motion } from 'framer-motion';
import {
    ShieldCheck,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Shield,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { RiskAnalysis } from '@/types/transaction';

export interface ExtendedRiskAnalysis extends RiskAnalysis {
    confidence: number;
    estimatedFee: number;
    scenarioName?: string;
}

interface RiskAnalysisCardProps {
    analysis?: ExtendedRiskAnalysis | null;
}

export function RiskAnalysisCard({ analysis }: RiskAnalysisCardProps) {
    // Empty State
    if (!analysis) {
        return (
            <Card className="flex h-full min-h-[300px] flex-col items-center justify-center border-dashed bg-muted/20 p-8 text-center shadow-sm">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="size-7 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    No transaction analyzed yet.
                </h3>
                <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
                    When you submit a transaction, SafeSpend AI will evaluate the risk before
                    allowing blockchain execution.
                </p>
            </Card>
        );
    }

    const isSafe = analysis.color === 'green';
    const isWarn = analysis.color === 'yellow';
    const isDanger = analysis.color === 'red';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full"
        >
            <Card
                className={cn(
                    'flex h-full flex-col overflow-hidden border shadow-sm transition-colors',
                    isSafe && 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
                    isWarn && 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/10',
                    isDanger && 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10'
                )}
            >
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            {isSafe && <ShieldCheck className="size-5 text-emerald-500" />}
                            {isWarn && <AlertTriangle className="size-5 text-yellow-500" />}
                            {isDanger && <ShieldAlert className="size-5 text-red-500" />}
                            AI Security Review
                        </CardTitle>
                        <Badge
                            variant={isSafe ? 'default' : isWarn ? 'secondary' : 'destructive'}
                            className={cn(
                                'border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider',
                                isSafe &&
                                'border-emerald-500/20 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
                                isWarn &&
                                'border-yellow-500/20 bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/20 dark:border-yellow-500/20 dark:bg-yellow-500/10'
                            )}
                        >
                            {analysis.status}
                        </Badge>
                    </div>
                    {analysis.scenarioName && (
                        <CardDescription
                            className={cn(
                                isSafe && 'text-emerald-700/70 dark:text-emerald-400/70',
                                isWarn && 'text-yellow-700/70 dark:text-yellow-400/70',
                                isDanger && 'text-red-700/70 dark:text-red-400/70'
                            )}
                        >
                            {analysis.scenarioName}
                        </CardDescription>
                    )}
                </CardHeader>

                <Separator
                    className={cn(
                        isSafe && 'bg-emerald-500/15 dark:bg-emerald-500/20',
                        isWarn && 'bg-yellow-500/15 dark:bg-yellow-500/20',
                        isDanger && 'bg-red-500/15 dark:bg-red-500/20'
                    )}
                />

                <CardContent className="flex flex-col gap-6 pt-6">
                    {/* Header Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    'text-xs font-semibold uppercase tracking-wider',
                                    isSafe && 'text-emerald-600/70 dark:text-emerald-400/70',
                                    isWarn && 'text-yellow-600/70 dark:text-yellow-500/70',
                                    isDanger && 'text-red-600/70 dark:text-red-500/70'
                                )}
                            >
                                Risk Score
                            </span>
                            <span
                                className={cn(
                                    'tabular-nums text-2xl font-bold',
                                    isSafe && 'text-emerald-600 dark:text-emerald-400',
                                    isWarn && 'text-yellow-600 dark:text-yellow-500',
                                    isDanger && 'text-red-600 dark:text-red-500'
                                )}
                            >
                                {analysis.score}
                                <span className="text-sm font-normal opacity-50">/100</span>
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    'text-xs font-semibold uppercase tracking-wider',
                                    isSafe && 'text-emerald-600/70 dark:text-emerald-400/70',
                                    isWarn && 'text-yellow-600/70 dark:text-yellow-500/70',
                                    isDanger && 'text-red-600/70 dark:text-red-500/70'
                                )}
                            >
                                Confidence
                            </span>
                            <span className="tabular-nums text-2xl font-bold text-foreground">
                                {analysis.confidence}%
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    'text-xs font-semibold uppercase tracking-wider',
                                    isSafe && 'text-emerald-600/70 dark:text-emerald-400/70',
                                    isWarn && 'text-yellow-600/70 dark:text-yellow-500/70',
                                    isDanger && 'text-red-600/70 dark:text-red-500/70'
                                )}
                            >
                                Est. Fee
                            </span>
                            <span className="tabular-nums text-2xl font-bold text-foreground">
                                {analysis.estimatedFee.toFixed(5)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    'text-xs font-semibold uppercase tracking-wider',
                                    isSafe && 'text-emerald-600/70 dark:text-emerald-400/70',
                                    isWarn && 'text-yellow-600/70 dark:text-yellow-500/70',
                                    isDanger && 'text-red-600/70 dark:text-red-500/70'
                                )}
                            >
                                Action
                            </span>
                            <span className="mt-0.5 text-lg font-bold leading-tight capitalize text-foreground">
                                {analysis.recommendation.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-semibold tracking-tight">
                            AI Reasoning
                        </span>
                        <div className="flex flex-col gap-2">
                            {analysis.reasons.map((reason) => (
                                <div
                                    key={reason.id}
                                    className="flex items-start gap-3 rounded-lg border bg-background/60 p-3 shadow-sm backdrop-blur-sm dark:bg-background/40"
                                >
                                    {reason.type === 'positive' && (
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                    )}
                                    {reason.type === 'warning' && (
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-500" />
                                    )}
                                    {reason.type === 'critical' && (
                                        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
                                    )}
                                    <span className="text-sm font-medium leading-snug text-foreground/90">
                                        {reason.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
