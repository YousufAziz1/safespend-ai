'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtendedRiskAnalysis } from '@/components/transaction/risk-analysis-card';

interface ApprovalFooterProps {
    analysis: ExtendedRiskAnalysis | null;
    onApprove: () => void;
    isLoading?: boolean;
}

export function ApprovalFooter({
    analysis,
    onApprove,
    isLoading = false,
}: ApprovalFooterProps) {
    if (!analysis) return null;

    const isSafe = analysis.color === 'green';
    const isWarn = analysis.color === 'yellow';
    const isDanger = analysis.color === 'red';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="mt-4 w-full"
        >
            <Card
                className={cn(
                    'overflow-hidden border shadow-sm transition-colors',
                    isSafe && 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
                    isWarn && 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/10',
                    isDanger && 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10'
                )}
            >
                <CardContent className="flex flex-col items-center justify-between gap-4 p-5 md:flex-row">
                    <div className="flex w-full items-center gap-3 md:w-auto">
                        {isSafe && (
                            <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
                        )}
                        {isWarn && (
                            <AlertTriangle className="size-6 shrink-0 text-yellow-500" />
                        )}
                        {isDanger && (
                            <ShieldAlert className="size-6 shrink-0 text-red-500" />
                        )}

                        <p
                            className={cn(
                                'text-sm font-semibold',
                                isSafe && 'text-emerald-700 dark:text-emerald-400',
                                isWarn && 'text-yellow-700 dark:text-yellow-500',
                                isDanger && 'text-red-700 dark:text-red-400'
                            )}
                        >
                            {isSafe && '✓ AI recommends proceeding.'}
                            {isWarn &&
                                'This transaction exhibits warning signs. Proceed with extreme caution.'}
                            {isDanger &&
                                'SafeSpend AI has blocked this transaction to protect your funds.'}
                        </p>
                    </div>

                    <div className="w-full shrink-0 md:w-auto">
                        {isSafe && (
                            <Button
                                size="lg"
                                className="w-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500 md:w-auto text-base font-semibold"
                                onClick={onApprove}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Approve & Sign Transaction
                            </Button>
                        )}

                        {isWarn && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full border-yellow-500/50 text-base font-semibold text-yellow-700 shadow-sm hover:bg-yellow-500/10 dark:text-yellow-500 dark:hover:bg-yellow-500/10 md:w-auto"
                                onClick={onApprove}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Proceed Anyway
                            </Button>
                        )}

                        {isDanger && (
                            <Button
                                size="lg"
                                variant="destructive"
                                className="w-full cursor-not-allowed text-base font-semibold opacity-90 shadow-sm md:w-auto"
                                disabled
                            >
                                Transaction Blocked
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
