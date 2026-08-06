'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, ArrowRight, User, Wallet, UserPlus, CheckCircle2, ShieldAlert, ShieldCheck, Shield, BrainCircuit, Loader2, XCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { parseIntent, type ParsedIntent } from '@/lib/copilot/intent-parser';
import { findContactByName, saveContact, isValidSolanaAddress, type Contact } from '@/lib/copilot/contacts';
import { analyzeTransaction, type SecurityAnalysis } from '@/lib/security/security-engine';
import { generateExplanation } from '@/lib/security/explain';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { findMatchingPolicy, savePolicy, type PaymentPolicy } from '@/lib/copilot/policies';
import { getRecipientStats, generateFinancialReasoning, type MemoryStats } from '@/lib/copilot/memory';
import { createExecutionPlan, updatePlanStep, markRemainingAs, type ExecutionPlan } from '@/lib/copilot/planner';
import { generateSuggestions, type Suggestion } from '@/lib/copilot/suggestions';
import { generateProviderExplanations } from '@/lib/copilot/explainer';
import { type DemoScenario } from '@/lib/copilot/demo-scenarios';
/* ──────────────────────────────── Types ──────────────────────────────── */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: ParsedIntent;
    resolvedAddress?: string;
    contactSaved?: Contact;
    isExplanationMode?: boolean;

    // AI Memory Layer
    memoryStats?: MemoryStats;

    // Execution Plan
    executionPlan?: ExecutionPlan;

    // Policy Integration
    policyValid?: { intent: ParsedIntent, address: string, policy: PaymentPolicy };
    policyViolation?: { intent: ParsedIntent, address: string, policy: PaymentPolicy };
    policyRequest?: { intent: ParsedIntent, address: string, recipientName: string };
    policyResolved?: boolean;

    // Security Pipeline State
    analysisFailed?: boolean;
    timelineFinished?: boolean;
    analysis?: SecurityAnalysis;
    explanation?: string;
    securityAction?: 'continue' | 'cancel' | 'edit';

    // Execution Pipeline State
    isExecuting?: boolean;
    executionTimelineFinished?: boolean;
    executionFailed?: boolean;
    executionError?: string;

    // Signing & Confirmation Pipeline State
    isSigning?: boolean;
    isConfirmed?: boolean;
    finalSignature?: string;
}

type ConversationState =
    | { type: 'idle' }
    | { type: 'awaiting_address'; recipientName: string; pendingIntent: ParsedIntent };

/* ──────────────────────────────── Constants ──────────────────────────── */

const WELCOME_SUGGESTIONS = [
    { icon: '💸', label: 'Send 2 SOL to John' },
    { icon: '🔄', label: 'Transfer 10 SOL to my trading wallet' },
    { icon: '🔍', label: 'Is this wallet safe?' },
    { icon: '⚖️', label: 'Compare these two wallets' },
    { icon: '⚠️', label: 'Explain why this transaction is risky' },
];

/* ──────────────────────────────── Helpers ──────────────────────────────── */

function truncateAddress(addr: string): string {
    return addr.length > 12 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr;
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-primary/60"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────── Intent Card ──────────────────────────── */

function IntentCard({ intent, address }: { intent: ParsedIntent; address?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border bg-card/60 p-4 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-3">
                <Wallet className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transaction Intent</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                {intent.recipient && (
                    <div>
                        <p className="text-xs text-muted-foreground">Recipient</p>
                        <p className="font-semibold">{intent.recipient}</p>
                    </div>
                )}
                {address && (
                    <div>
                        <p className="text-xs text-muted-foreground">Wallet</p>
                        <p className="font-mono text-xs">{truncateAddress(address)}</p>
                    </div>
                )}
                {intent.amount !== null && (
                    <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-semibold">{intent.amount} {intent.token}</p>
                    </div>
                )}
                <div>
                    <p className="text-xs text-muted-foreground">Action</p>
                    <p className="font-semibold capitalize">{intent.action}</p>
                </div>
            </div>
        </motion.div>
    );
}

/* ──────────────────────── AI Execution Plan ─────────────────────── */

function ExecutionPlanCard({ plan }: { plan: ExecutionPlan }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm max-w-sm">
            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Execution Plan</span>
            </div>
            <div className="p-4 space-y-3">
                {plan.steps.map(step => (
                    <div key={step.id} className={cn("flex flex-col", (step.status === 'pending' || step.status === 'skipped') ? 'text-muted-foreground' : 'text-foreground', step.status === 'skipped' && 'opacity-50')}>
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 flex items-center justify-center">
                                {step.status === 'completed' ? <CheckCircle2 className="size-4 text-emerald-500" /> :
                                    step.status === 'failed' || step.status === 'rejected' ? <XCircle className="size-4 text-red-500" /> :
                                        step.status === 'running' ? <Loader2 className="size-4 animate-spin text-blue-500" /> :
                                            step.status === 'skipped' ? <XCircle className="size-4" /> :
                                                <div className="size-3.5 rounded-full border-2 border-muted-foreground/30" />}
                            </div>
                            <span className={cn("text-sm transition-colors", step.status === 'running' && 'text-blue-500 font-medium')}>{step.label}</span>
                            {step.status === 'failed' && <span className="ml-auto text-xs text-red-500 font-bold uppercase">Blocked</span>}
                            {step.status === 'rejected' && <span className="ml-auto text-xs text-red-500 font-bold uppercase">Rejected</span>}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}


/* ──────────────────────── Copilot Security Card ──────────────────── */

function CopilotSecurityCard({
    intent,
    address,
    analysis,
    explanation,
    actionState,
    onAction
}: {
    intent: ParsedIntent;
    address: string;
    analysis: SecurityAnalysis;
    explanation: string;
    actionState?: 'continue' | 'cancel' | 'edit';
    onAction: (action: 'continue' | 'cancel' | 'edit') => void;
}) {
    const isReject = analysis.recommendation === 'reject';
    const isManual = analysis.recommendation === 'manual_review';
    const isComplete = !!actionState;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
            className={cn(
                "mt-3 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm max-w-md w-full transition-opacity duration-500",
                isComplete && actionState !== 'continue' && "opacity-50 blur-[1px]",
                isComplete && actionState === 'continue' && "border-emerald-500/30 ring-1 ring-emerald-500/20"
            )}
        >
            {/* Header */}
            <div className="bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">Recipient</p>
                        <p className="font-semibold flex items-center gap-2">
                            {intent.recipient} <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{truncateAddress(address)}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-semibold">{intent.amount} {intent.token}</p>
                    </div>
                </div>
            </div>

            {!isComplete && (
                <>
                    <Separator />

                    <div className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                {isReject ? <ShieldAlert className="size-5 text-red-500" /> : isManual ? <Shield className="size-5 text-yellow-500" /> : <ShieldCheck className="size-5 text-emerald-500" />}
                                <span className="text-sm font-bold uppercase tracking-wide text-foreground">Security Result</span>
                            </div>
                            <Badge variant="outline" className={cn(
                                "bg-opacity-20",
                                isReject ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                    isManual ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
                                        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}>
                                {isReject ? "REJECT" : isManual ? "MANUAL REVIEW" : "APPROVE"}
                            </Badge>
                        </div>

                        {explanation && (
                            <div className="rounded-lg border border-indigo-500/20 bg-indigo-50/50 p-3 dark:bg-indigo-950/20">
                                <p className="text-xs leading-relaxed text-indigo-950/80 dark:text-indigo-200/80 whitespace-pre-wrap">{explanation}</p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1"
                                variant={isReject ? "destructive" : isManual ? "default" : "default"}
                                disabled={isReject}
                                onClick={() => onAction('continue')}
                            >
                                {isReject ? "Blocked" : isManual ? "Proceed Anyway" : "Continue"}
                            </Button>
                            <Button className="flex-1" variant="outline" onClick={() => onAction('cancel')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}



/* ──────────────────────── Policy & Memory UI components ──────────────────────────── */

function MemoryCard({ stats }: { stats: MemoryStats }) {
    if (stats.totalTransfers === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm max-w-sm">
            <div className="bg-primary/5 px-4 py-3 border-b flex items-center gap-2">
                <BrainCircuit className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Conversation Memory</span>
            </div>
            <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous transfers</span>
                    <span className="font-medium">{stats.totalTransfers}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Average amount</span>
                    <span className="font-medium">{stats.averageAmount} SOL</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Largest payment</span>
                    <span className="font-medium">{stats.largestPayment} SOL</span>
                </div>
                {stats.lastPaymentDate && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last payment</span>
                        <span className="font-medium">{new Date(stats.lastPaymentDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function PolicyRequestCard({
    request, onSave, isCompleted
}: {
    request: { intent: ParsedIntent, address: string, recipientName: string },
    onSave: (maxAmount: number, expiresAt: number | null) => void,
    isCompleted?: boolean
}) {
    const [maxAmount, setMaxAmount] = useState<string>(request.intent.amount?.toString() || '5');
    const [expiry, setExpiry] = useState<string>('30');
    const [saving, setSaving] = useState(false);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-3 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm max-w-sm transition-opacity duration-500", isCompleted && "opacity-50 blur-[1px] pointer-events-none")}>
            <div className="bg-emerald-500/10 px-4 py-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Create Payment Policy</span>
                </div>
            </div>
            <div className="p-4 space-y-4 text-sm">
                <div>
                    <label className="text-xs text-muted-foreground block mb-1">Recipient</label>
                    <div className="font-medium">{request.recipientName} <span className="text-xs text-muted-foreground font-mono bg-muted px-1 rounded-sm ml-1">{truncateAddress(request.address)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Max ({request.intent.token})</label>
                        <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="w-full bg-muted/50 border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Expiry</label>
                        <select value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-muted/50 border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50">
                            <option value="1">1 Day</option>
                            <option value="7">7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="0">Never</option>
                        </select>
                    </div>
                </div>
                {!isCompleted && (
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={saving || !maxAmount}
                        onClick={() => {
                            setSaving(true);
                            const days = parseInt(expiry);
                            const ms = days === 0 ? null : Date.now() + (days * 24 * 60 * 60 * 1000);
                            setTimeout(() => onSave(parseFloat(maxAmount) || 0, ms), 600);
                        }}
                    >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Policy"}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}

function SuggestionsCard({ suggestions, onSuggest }: { suggestions: Suggestion[], onSuggest: (payload: string) => void }) {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-muted/20 border border-primary/10 rounded-xl p-3 max-w-sm">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                    <button key={s.id} onClick={() => onSuggest(s.actionPayload)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background shadow-sm border border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-full text-[13px] font-medium transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        <CheckCircle2 className={cn("size-3.5", s.type === 'policy' || s.type === 'security' ? "text-blue-500" : s.type === 'contact' ? "text-emerald-500" : "text-primary")} />
                        {s.label}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function ExplanationCard({ analysis, plan, memory, policy, intentAmount }: { analysis: SecurityAnalysis, plan?: ExecutionPlan, memory?: MemoryStats, policy?: PaymentPolicy | null, intentAmount?: number | null }) {
    const explanations = useMemo(() => generateProviderExplanations(analysis, plan, memory, policy, intentAmount), [analysis, plan, memory, policy, intentAmount]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggle = (id: string) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const expandAll = () => setExpandedIds(explanations.map(e => e.provider));
    const collapseAll = () => setExpandedIds([]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-muted/20 border border-primary/10 rounded-xl overflow-hidden max-w-sm">
            <div className="bg-primary/5 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Why this decision?</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={expandAll} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Expand All</button>
                    <span className="text-muted-foreground/30 text-[10px]">|</span>
                    <button onClick={collapseAll} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Collapse All</button>
                </div>
            </div>
            <div className="flex flex-col">
                {explanations.map((exp, i) => {
                    const isExpanded = expandedIds.includes(exp.provider);
                    const isLast = i === explanations.length - 1;
                    return (
                        <div key={exp.provider} className={cn("flex flex-col border-b border-primary/5", isLast && "border-0")}>
                            <button onClick={() => toggle(exp.provider)} className="flex items-center justify-between p-3 hover:bg-primary/5 transition-colors text-left">
                                <div className="flex items-center gap-2">
                                    {exp.status === 'pass' && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                                    {exp.status === 'warn' && <ShieldAlert className="size-4 text-amber-500 shrink-0" />}
                                    {exp.status === 'fail' && <XCircle className="size-4 text-red-500 shrink-0" />}
                                    <span className="text-sm font-semibold">{exp.provider}</span>
                                </div>
                                {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-background/50">
                                        <div className="px-5 pb-4 pt-1 space-y-2">
                                            {exp.reasons.map((r, idx) => (
                                                <div key={idx} className="flex gap-2 text-xs text-muted-foreground/90">
                                                    <span className="select-none text-muted-foreground/40">•</span>
                                                    <span>{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

/* ──────────────────────── Message Bubble ──────────────────────────── */

function MessageBubble({
    msg,
    hookSignature,
    onSecurityAction,
    onPolicyCreated,
    onPolicyOverride,
    onSuggest
}: {
    msg: Message,
    hookSignature: string | null,
    onTimelineComplete: (id: string) => void,
    onSecurityAction: (id: string, action: 'continue' | 'cancel' | 'edit', intent: ParsedIntent, resolveAddress: string, plan: ExecutionPlan) => void,
    onPolicyCreated?: (msgId: string, maxAmount: number, expiresAt: number | null, request: { intent: ParsedIntent, address: string, recipientName: string }, plan: ExecutionPlan) => void,
    onPolicyOverride?: (msgId: string, intent: ParsedIntent, address: string, plan: ExecutionPlan) => void,
    onSuggest?: (payload: string) => void
}) {

    const suggestions = useMemo(() => {
        const isStable = msg.timelineFinished && !msg.isExecuting && !msg.isSigning && !msg.analysisFailed;
        if (!isStable || msg.role === 'user') return [];
        return generateSuggestions({
            analysis: msg.analysis,
            plan: msg.executionPlan,
            memoryStats: msg.memoryStats,
            policy: msg.policyValid?.policy || msg.policyViolation?.policy || null,
            contactName: msg.contactSaved?.name || msg.policyRequest?.recipientName,
            address: msg.resolvedAddress || msg.contactSaved?.address || msg.policyRequest?.address,
            intentAmount: msg.intent?.amount,
        });
    }, [msg]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'flex gap-3 rounded-xl px-4 py-4',
                msg.role === 'user' ? 'bg-transparent' : 'bg-muted/20 border shadow-sm'
            )}
        >
            <div
                className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                    msg.role === 'user'
                        ? 'bg-foreground/10'
                        : 'bg-gradient-to-br from-primary/80 to-cyan-500/80 shadow-sm shadow-primary/20'
                )}
            >
                {msg.role === 'user' ? (
                    <User className="size-3.5 text-foreground/70" />
                ) : (
                    <Bot className="size-3.5 text-white" />
                )}
            </div>
            <div className="flex-1 pt-0.5 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                    {msg.role === 'user' ? 'You' : 'SafeSpend AI'}
                </p>

                {msg.content && (
                    <p className={cn("text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words", msg.executionFailed && "text-red-500 font-medium")}>
                        {msg.content}
                    </p>
                )}

                {msg.executionError && (
                    <div className="mt-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-md">
                        {msg.executionError}
                    </div>
                )}

                {/* AI Memory Layer Card */}
                {msg.memoryStats && (
                    <MemoryCard stats={msg.memoryStats} />
                )}

                {/* AI Plan Execution Orchestrator */}
                {msg.executionPlan && (
                    <ExecutionPlanCard plan={msg.executionPlan} />
                )}

                {/* Intent Card */}
                {msg.intent && msg.resolvedAddress && !msg.analysis && !msg.executionPlan && !msg.policyRequest && (
                    <IntentCard intent={msg.intent} address={msg.resolvedAddress} />
                )}

                {/* Policy Integration Flows */}
                {msg.policyValid && !msg.timelineFinished && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl max-w-sm flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Trusted Recipient</p>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Maximum allowed: {msg.policyValid.policy.maxAmount} {msg.policyValid.policy.token}</p>
                            <p className="text-xs font-medium mt-1 text-emerald-600 dark:text-emerald-500/90">Policy valid.</p>
                        </div>
                    </motion.div>
                )}

                {msg.policyRequest && (
                    <PolicyRequestCard
                        request={msg.policyRequest}
                        isCompleted={msg.policyResolved}
                        onSave={(max, exp) => onPolicyCreated && onPolicyCreated(msg.id, max, exp, msg.policyRequest!, msg.executionPlan!)}
                    />
                )}

                {msg.policyViolation && !msg.policyResolved && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-card border rounded-xl shadow-sm max-w-sm overflow-hidden text-sm">
                        <div className="bg-red-500/5 px-4 py-3 border-b border-red-500/10 flex items-center gap-2">
                            <ShieldAlert className="size-4 text-red-500" />
                            <span className="font-bold uppercase tracking-wider text-xs text-red-500">Policy Violation</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Requested:</span>
                                <span className="font-medium text-red-500">{msg.policyViolation.intent.amount} {msg.policyViolation.intent.token}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Policy Allowed:</span>
                                <span className="font-medium">{msg.policyViolation.policy.maxAmount} {msg.policyViolation.policy.token}</span>
                            </div>
                            <div className="pt-2">
                                <Button className="w-full" onClick={() => onPolicyOverride && onPolicyOverride(msg.id, msg.policyViolation!.intent, msg.policyViolation!.address, msg.executionPlan!)}>
                                    Proceed with Manual Approval
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* Security Execution Map */}
                {msg.timelineFinished && msg.analysis && msg.explanation && msg.intent && msg.resolvedAddress && (
                    <div className="mt-2">
                        <CopilotSecurityCard
                            intent={msg.intent}
                            address={msg.resolvedAddress}
                            analysis={msg.analysis}
                            explanation={msg.explanation}
                            actionState={msg.securityAction}
                            onAction={(act) => onSecurityAction(msg.id, act, msg.intent!, msg.resolvedAddress!, msg.executionPlan!)}
                        />
                    </div>
                )}


                {/* Signing State Tracking execution via standard hook */}
                {msg.isSigning && (
                    <div className="mt-4 rounded-xl border bg-card/60 p-4 shadow-sm w-full max-w-md">
                        {hookSignature ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <CheckCircle2 className="size-5" />
                                    <span className="font-semibold text-sm">Transaction submitted</span>
                                </div>
                                <div className="p-3 bg-muted rounded-lg text-xs font-mono break-all text-muted-foreground">
                                    {hookSignature}
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                                        Waiting confirmation... <Loader2 className="size-3 animate-spin text-primary" />
                                    </span>
                                    <a href={`https://explorer.solana.com/tx/${hookSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                        Explorer <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Loader2 className="size-4 animate-spin text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Waiting for signature...</p>
                                    <p className="text-xs text-muted-foreground">Please approve the request in your Phantom wallet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Final Confirmed State */}
                {msg.isConfirmed && msg.finalSignature && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 shadow-sm w-full max-w-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 className="size-5" />
                                <span className="font-semibold text-sm uppercase tracking-wide">Transaction Confirmed</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Saved to history successfully.</p>
                        <a href={`https://explorer.solana.com/tx/${msg.finalSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="mt-3 block w-full text-center py-2 bg-emerald-500/10 text-emerald-600 rounded-md text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                            View on Explorer
                        </a>
                    </motion.div>
                )}

                {/* Contact Memory Hook */}
                {msg.contactSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm max-w-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="size-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Contact Saved</span>
                        </div>
                        <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Name:</span> <span className="font-semibold">{msg.contactSaved.name}</span></p>
                            <p><span className="text-muted-foreground">Address:</span> <span className="font-mono text-xs">{truncateAddress(msg.contactSaved.address)}</span></p>
                        </div>
                    </motion.div>
                )}

                {/* AI Explanation Mode */}
                {msg.isExplanationMode && msg.analysis && (
                    <ExplanationCard
                        analysis={msg.analysis}
                        plan={msg.executionPlan}
                        memory={msg.memoryStats}
                        policy={msg.policyValid?.policy || msg.policyViolation?.policy || null}
                        intentAmount={msg.intent?.amount}
                    />
                )}

                {/* AI Suggestions Block */}
                {suggestions.length > 0 && onSuggest && (
                    <SuggestionsCard suggestions={suggestions} onSuggest={onSuggest} />
                )}
            </div>
        </motion.div>
    );
}

/* ──────────────────────── Main Copilot Page ──────────────────────── */

export function CopilotInterface({
    demoMode = false,
    demoScenario,
    onStepProgress
}: {
    demoMode?: boolean;
    demoScenario?: DemoScenario;
    onStepProgress?: (step: string) => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [conversationState, setConversationState] = useState<ConversationState>({ type: 'idle' });
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesRef = useRef<Message[]>([]);
    const stepRef = useRef(onStepProgress);

    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { stepRef.current = onStepProgress; }, [onStepProgress]);


    // Standard hooks mapping strictly to SafeSpend runtime bounds natively decoupling ui state limits
    const { sendTransaction, simulatePayment, signature: activeSignature, error: hookError } = useSendTransaction();

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => { scrollToBottom(); }, [scrollToBottom, messages, isThinking, activeSignature]);

    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`; }
    }, [input]);

    const addAssistant = useCallback((content: string, extras?: Partial<Message>) => {
        const id = `a-${Date.now()}`;
        const msg: Message = { id, role: 'assistant', content, timestamp: new Date(), ...extras };
        setMessages((prev) => [...prev, msg]);
        return id;
    }, []);

    const updateAssistant = useCallback((id: string, updates: Partial<Message>) => {
        setMessages((prev) => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    /* ────────────── Security Analysis Flow ────────────── */

    // Wraps the generic backend check preventing UI bounds mutation naturally mappings exactly
    const triggerSecurityAnalysis = useCallback(async (msgId: string, intent: ParsedIntent, address: string, plan: ExecutionPlan) => {
        if (intent.amount === null) return;
        stepRef.current?.('Multi-Provider Security');

        const p1 = updatePlanStep(plan, 'security', 'running');
        updateAssistant(msgId, { executionPlan: p1 });

        try {
            const analysis = await analyzeTransaction(address, intent.amount);
            const explanation = await generateExplanation(analysis);

            const isReject = analysis.recommendation === 'reject';
            let nextPlan = updatePlanStep(p1, 'security', isReject ? 'failed' : 'completed');
            if (isReject) {
                nextPlan = markRemainingAs(nextPlan, 'simulate', 'skipped');
            }

            updateAssistant(msgId, {
                analysis,
                explanation,
                timelineFinished: true, // triggers CopilotSecurityCard component locally safely
                executionPlan: nextPlan
            });
        } catch {
            updateAssistant(msgId, { analysisFailed: true, executionPlan: updatePlanStep(p1, 'security', 'failed') });
        }
    }, [updateAssistant]);

    const handleTimelineComplete = useCallback((id: string) => {
        // Obsolete sync function bound previously. Left safely stubbed to bypass prop type refactors downstream!
        updateAssistant(id, { timelineFinished: true });
    }, [updateAssistant]);

    /* ────────────── Execution Simulation Flow ────────────── */

    // Wraps the native simulatePayment execution binding strictly propagating the unified execution plan recursively
    const onSecurityAction = useCallback(async (msgId: string, action: 'continue' | 'cancel' | 'edit', intent: ParsedIntent, address: string, plan: ExecutionPlan) => {
        // Freeze existing card rendering
        updateAssistant(msgId, { securityAction: action });

        if (action === 'cancel') {
            addAssistant('Transaction cancelled securely.', { executionPlan: markRemainingAs(plan, 'simulate', 'skipped') });
            return;
        }

        if (action === 'continue') {
            const p1 = updatePlanStep(plan, 'simulate', 'running');
            updateAssistant(msgId, { isExecuting: true, executionPlan: p1 });

            // Run natively via RPC
            const res = await simulatePayment(address, intent.amount!);
            if (!res.success) {
                const f1 = updatePlanStep(p1, 'simulate', 'failed');
                const f2 = markRemainingAs(f1, 'wallet', 'skipped');
                updateAssistant(msgId, {
                    executionPlan: f2,
                    executionFailed: true,
                    executionError: res.error || 'Simulation crashed contextually.'
                });
                return;
            }

            // Wallet Signing phase natively maps Phantom async bounds
            const p2 = updatePlanStep(p1, 'simulate', 'completed');
            const p3 = updatePlanStep(p2, 'wallet', 'running');
            updateAssistant(msgId, { executionTimelineFinished: true, isSigning: true, executionPlan: p3 });

            const signature = await sendTransaction(address, intent.amount!, 'safe');

            if (!signature) {
                const rej1 = updatePlanStep(p3, 'wallet', 'rejected');
                const rej2 = markRemainingAs(rej1, 'confirm', 'skipped');
                updateAssistant(msgId, {
                    isSigning: false,
                    executionPlan: rej2,
                    executionFailed: true,
                    executionError: hookError || 'User rejected signature.'
                });
                return;
            }

            const c1 = updatePlanStep(p3, 'wallet', 'completed');
            const c2 = updatePlanStep(c1, 'confirm', 'running');
            updateAssistant(msgId, { isSigning: false, isConfirmed: true, executionPlan: c2, finalSignature: signature });

            // Auto-complete confirmation/history logic seamlessly bounding sync UX
            setTimeout(() => {
                const f1 = updatePlanStep(c2, 'confirm', 'completed');
                const f2 = updatePlanStep(f1, 'history', 'completed');
                updateAssistant(msgId, { executionPlan: f2 });
            }, 1000);
        }
    }, [addAssistant, updateAssistant, simulatePayment, sendTransaction, hookError]);


    /* ────────────── Policy Check Flows ────────────── */

    const handlePolicyCreated = useCallback((msgId: string, maxAmount: number, expiresAt: number | null, request: { intent: ParsedIntent, address: string, recipientName: string }, plan: ExecutionPlan) => {
        updateAssistant(msgId, { policyResolved: true });

        const policy = savePolicy({
            name: `${request.recipientName} Policy`,
            recipientName: request.recipientName,
            recipientAddress: request.address,
            maxAmount,
            token: request.intent.token || 'SOL',
            network: 'devnet',
            expiresAt,
            enabled: true
        });

        const rp = updatePlanStep(plan, 'policy', 'completed');
        const analysisMsgId = addAssistant(
            `Policy saved! ✓ Trusted Recipient\nMaximum allowed: ${policy.maxAmount} ${request.intent.token}\n\nPolicy valid.\n\nPreparing security analysis now...`,
            { intent: request.intent, resolvedAddress: request.address, executionPlan: rp, policyValid: { intent: request.intent, address: request.address, policy } }
        );
        triggerSecurityAnalysis(analysisMsgId, request.intent, request.address, rp);
    }, [updateAssistant, addAssistant, triggerSecurityAnalysis]);

    const handlePolicyOverride = useCallback((msgId: string, intent: ParsedIntent, address: string, plan: ExecutionPlan) => {
        updateAssistant(msgId, { policyResolved: true });

        const rp = updatePlanStep(plan, 'policy', 'completed');
        const analysisMsgId = addAssistant(
            `Manual approval granted.\n\nPreparing security analysis now...`,
            { intent, resolvedAddress: address, executionPlan: rp }
        );
        triggerSecurityAnalysis(analysisMsgId, intent, address, rp);
    }, [updateAssistant, addAssistant, triggerSecurityAnalysis]);

    /* ────────────── Process User Message ────────────── */

    const processMessage = useCallback((content: string) => {
        // STATE: Awaiting address for unknown contact
        if (conversationState.type === 'awaiting_address') {
            const { recipientName, pendingIntent } = conversationState;
            const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
            let name = recipientName;
            let address = '';

            if (lines.length >= 2) {
                name = lines[0];
                address = lines[1];
            } else if (lines.length === 1) {
                address = lines[0];
            }

            if (!isValidSolanaAddress(address)) {
                addAssistant(`That doesn\u2019t look like a valid Solana address.\n\nPlease provide a valid base-58 public key for ${name}.`);
                return;
            }

            const saved = saveContact(name, address);
            if (!saved) {
                addAssistant('Failed to save contact. Please check the address and try again.');
                return;
            }

            addAssistant(
                `Contact saved successfully!\n\nYou can now simply say:\n\u201cSend ${pendingIntent.amount ?? '5'} SOL to ${saved.name}\u201d`,
                { contactSaved: saved }
            );

            setConversationState({ type: 'idle' });
            return;
        }

        // STATE: Idle — parse intent
        stepRef.current?.('Intent Parsing');
        const intent = parseIntent(content);

        switch (intent.action) {
            case 'send': {
                const basePlan = createExecutionPlan();

                if (!intent.recipient) {
                    addAssistant('I can see you want to send SOL, but I need a recipient.\n\nTry: "Send 5 SOL to John"', { executionPlan: updatePlanStep(basePlan, 'resolve', 'failed') });
                    return;
                }

                let resolvedAddress = '';
                let contactName = '';

                let plan = updatePlanStep(basePlan, 'resolve', 'running');

                if (isValidSolanaAddress(intent.recipient)) {
                    resolvedAddress = intent.recipient;
                    plan = updatePlanStep(plan, 'resolve', 'completed');
                    stepRef.current?.('Contact Resolution');
                } else {
                    const contact = findContactByName(intent.recipient);
                    if (contact) {
                        resolvedAddress = contact.address;
                        contactName = contact.name;
                        plan = updatePlanStep(plan, 'resolve', 'completed');
                        stepRef.current?.('Contact Resolution');
                    }
                }

                if (resolvedAddress) {
                    plan = updatePlanStep(plan, 'memory', 'running');
                    const stats = getRecipientStats(resolvedAddress);
                    stepRef.current?.('AI Memory');
                    const reasoning = generateFinancialReasoning(intent.amount, stats, contactName || truncateAddress(resolvedAddress));
                    plan = updatePlanStep(plan, 'memory', 'completed');

                    plan = updatePlanStep(plan, 'policy', 'running');
                    const policy = findMatchingPolicy(resolvedAddress, intent.token || 'SOL');

                    if (!policy) {
                        plan = updatePlanStep(plan, 'policy', 'failed');
                        stepRef.current?.('Policy Engine');
                        addAssistant(`${reasoning}\n\nRecipient not protected.\nCreate a payment policy?`, {
                            memoryStats: stats,
                            executionPlan: plan,
                            policyRequest: { intent, address: resolvedAddress, recipientName: contactName || truncateAddress(resolvedAddress) }
                        });
                        return;
                    }

                    if (intent.amount !== null && intent.amount > policy.maxAmount) {
                        plan = updatePlanStep(plan, 'policy', 'failed');
                        stepRef.current?.('Policy Engine');
                        addAssistant(`${reasoning}\n\nPolicy violation\n\nRequested: ${intent.amount} ${intent.token}\nAllowed: ${policy.maxAmount} ${intent.token}\n\nManual approval required.`, {
                            memoryStats: stats,
                            executionPlan: plan,
                            policyViolation: { intent, address: resolvedAddress, policy }
                        });
                        return;
                    }

                    plan = updatePlanStep(plan, 'policy', 'completed');
                    stepRef.current?.('Policy Engine');

                    const msgId = addAssistant(
                        `${reasoning}\n\n✓ Trusted Recipient\nMaximum allowed: ${policy.maxAmount} ${intent.token}\n\nPolicy valid.\n\nPreparing security analysis now...`,
                        { intent, resolvedAddress, memoryStats: stats, executionPlan: plan, policyValid: { intent, address: resolvedAddress, policy } }
                    );

                    triggerSecurityAnalysis(msgId, intent, resolvedAddress, plan);
                    return;
                }

                plan = updatePlanStep(plan, 'resolve', 'failed');
                addAssistant(
                    `I don\u2019t know who ${intent.recipient} is yet.\n\nPlease provide ${intent.recipient}\u2019s wallet address.\n\nExample:\n${intent.recipient}\n87TvGrfS9mGt6SaKdTSKePfB1fWpvAPGnDtjHqi9dqp4`,
                    { executionPlan: plan }
                );
                setConversationState({ type: 'awaiting_address', recipientName: intent.recipient, pendingIntent: intent });
                return;
            }

            case 'analyze':
                if (intent.recipient && isValidSolanaAddress(intent.recipient)) {
                    const basePlan = createExecutionPlan();
                    const rp1 = updatePlanStep(basePlan, 'resolve', 'completed');
                    const rp2 = updatePlanStep(rp1, 'memory', 'completed');
                    const rp3 = updatePlanStep(rp2, 'policy', 'skipped');

                    const stats = getRecipientStats(intent.recipient);
                    if (stats.totalTransfers === 0) {
                        const msgId = addAssistant('No previous interaction found.\n\nPreparing security analysis now...', { intent, resolvedAddress: intent.recipient, executionPlan: rp3 });
                        triggerSecurityAnalysis(msgId, intent, intent.recipient, rp3);
                        return;
                    } else {
                        const msgId = addAssistant(`I found ${stats.totalTransfers} prior interaction(s).\n\nPreparing security analysis now...`, { intent, resolvedAddress: intent.recipient, memoryStats: stats, executionPlan: rp3 });
                        triggerSecurityAnalysis(msgId, intent, intent.recipient, rp3);
                        return;
                    }
                }
                addAssistant('Wallet analysis mode activated.\n\nPlease paste the Solana wallet address you\u2019d like me to analyze.');
                return;
            case 'compare':
                addAssistant('Comparison mode coming soon.\n\nThis feature will let you compare two wallets side-by-side using our Security Engine.');
                return;
            case 'explain': {
                const last = messagesRef.current.slice().reverse().find(m => m.analysis);
                if (last && last.analysis) {
                    addAssistant('Here is a detailed breakdown of how I evaluated this transaction natively step-by-step.', {
                        isExplanationMode: true,
                        analysis: last.analysis,
                        executionPlan: last.executionPlan,
                        memoryStats: last.memoryStats,
                        policyValid: last.policyValid,
                        policyViolation: last.policyViolation,
                        intent: last.intent
                    });
                } else {
                    addAssistant('I don\'t have a recent security analysis to explain in this session. Try asking me to analyze a wallet or send a transaction first.');
                }
                return;
            }
            default:
                addAssistant('I\u2019m not sure what you mean.\n\nTry something like:\n\u2022 "Send 5 SOL to Alice"\n\u2022 "Is this wallet safe?"\n\u2022 "Explain why this transaction is risky"');
                return;
        }
    }, [conversationState, addAssistant, triggerSecurityAnalysis]);

    /* ────────────── Send Handler ────────────── */

    const handleSend = useCallback((text?: string) => {
        const content = (text ?? input).trim();
        if (!content || isThinking) return;

        const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        setTimeout(() => {
            processMessage(content);
            setIsThinking(false);
        }, 800);
    }, [input, isThinking, processMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // Demo Auto-Pilot Engine
    useEffect(() => {
        if (demoMode && demoScenario && messages.length === 0 && !isThinking) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleSend(demoScenario.command);
        }
    }, [demoMode, demoScenario, messages.length, isThinking, handleSend]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            {/* Header */}
            <div className="shrink-0 border-b bg-background/80 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-cyan-500/80 shadow-lg shadow-primary/20">
                        <Bot className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">SafeSpend AI Copilot</h1>
                        <p className="text-xs text-muted-foreground">
                            Describe your transaction naturally. I&apos;ll analyze, simulate and protect it before signing.
                        </p>
                    </div>
                </div>
            </div>

            {/* Conversation Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="relative mb-6">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-xl shadow-primary/30">
                                    <Sparkles className="size-8 text-white" />
                                </div>
                                <motion.div
                                    className="absolute -inset-2 rounded-2xl bg-primary/20 blur-xl"
                                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">How can I help you today?</h2>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Type a message below or choose a suggestion to get started. I can help you send SOL, analyze wallets, and protect your transactions.
                            </p>
                        </motion.div>

                        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {WELCOME_SUGGESTIONS.map((suggestion, i) => (
                                <motion.button
                                    key={suggestion.label}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
                                    onClick={() => handleSend(suggestion.label)}
                                    className="group flex items-center gap-3 rounded-xl border bg-card/50 px-4 py-3.5 text-left text-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                                >
                                    <span className="text-lg">{suggestion.icon}</span>
                                    <span className="flex-1 font-medium text-foreground/80 group-hover:text-foreground">
                                        {suggestion.label}
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    msg={msg}
                                    hookSignature={activeSignature}
                                    onTimelineComplete={handleTimelineComplete}
                                    onSecurityAction={onSecurityAction}
                                    onPolicyCreated={handlePolicyCreated}
                                    onPolicyOverride={handlePolicyOverride}
                                    onSuggest={handleSend}
                                />
                            ))}
                        </AnimatePresence>

                        {isThinking && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 rounded-xl bg-muted/40 px-4 py-4 max-w-[200px]"
                            >
                                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-cyan-500/80 shadow-sm shadow-primary/20">
                                    <Bot className="size-3.5 text-white" />
                                </div>
                                <div className="flex-1 pt-0.5 min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                                        SafeSpend AI
                                    </p>
                                    <TypingIndicator />
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t bg-background/80 backdrop-blur-sm px-4 py-3">
                <div className="mx-auto flex max-w-3xl items-end gap-2">
                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                conversationState.type === 'awaiting_address'
                                    ? `Paste ${conversationState.recipientName}'s wallet address...`
                                    : 'Describe your transaction or ask a question...'
                            }
                            rows={1}
                            disabled={isThinking}
                            className={cn(
                                'w-full resize-none rounded-xl border bg-muted/30 px-4 py-3 pr-12 text-sm leading-relaxed',
                                'placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30',
                                'disabled:cursor-not-allowed disabled:opacity-60',
                                'transition-colors duration-200'
                            )}
                        />
                    </div>
                    <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isThinking}
                        className="mb-0.5 size-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-cyan-600 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                    Press Enter to send · Shift + Enter for a new line
                </p>
            </div>
        </div>
    );
}


export default function CopilotPage() { return <CopilotInterface />; }
