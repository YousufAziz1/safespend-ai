import { Metadata } from 'next';
import { BookOpen, Shield, Bot, Link as LinkIcon, Database } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Documentation',
    description: 'Learn how the SafeSpend AI Security Engine explicitly blocks malicious payloads.',
};

export default function DocsPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                    <BookOpen className="size-6 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">SafeSpend AI Documentation</h1>
            </div>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                SafeSpend AI is a deterministic security interceptor orchestrating multiple layers of intelligence against the Solana blockchain.
                Instead of executing unknown transactions directly via the wallet context, SafeSpend acts as an active gateway firewall, statically and dynamically analyzing payloads across premium intelligence algorithms before wallet signature invocation.
            </p>

            <div className="mt-16 space-y-16">
                <section>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Shield className="size-6 text-emerald-500" />
                        Single Orchestration Layer
                    </h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                        The core architectural principle of the platform is absolute isolation. Client-side React components never execute direct commands mapped against critical Web3 providers. Information securely flows structurally through our centralized <code>lib/security/security-engine.ts</code>. This prevents state contamination and enables completely deterministic AI explanations.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Database className="size-6 text-cyan-500" />
                        Intelligence Providers
                    </h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/20 p-6">
                            <h3 className="font-semibold text-foreground">GoPlus Security</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Checks global malicious labels including phishing interfaces, OFAC sanctions, and known mixer intersections natively.</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-6">
                            <h3 className="font-semibold text-foreground">Helius RPC</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Extracts entire interaction histories targeting wallet age limits mapping precise interaction counts avoiding blank slates.</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-6">
                            <h3 className="font-semibold text-foreground">Birdeye</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Validates Token signatures mapping global liquidity depths preventing phishing tokens from hijacking real assets organically.</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-6">
                            <h3 className="font-semibold text-foreground">Local Rule Engine</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Evaluates standard mathematical heuristics mapping amount velocities against account maturity safely scoring values securely.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Bot className="size-6 text-purple-500" />
                        AI Explainer Framework
                    </h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                        Rather than presenting the underlying risk evaluation heuristics organically, SafeSpend intercepts the JSON-formatted reason arrays translating them structurally into natural human descriptions. Users explicitly understand exactly why their Solana network connection gets blocked natively cleanly.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <LinkIcon className="size-6 text-blue-500" />
                        Get Started
                    </h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                        Jump straight into the actual deployment and experience the active Live Hooks blocking simulations seamlessly!
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/send"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                            Execute Test Payload
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
