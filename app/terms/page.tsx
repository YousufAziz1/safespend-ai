import { Metadata } from 'next';
import { AlertOctagon, Scale, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Review the informational boundaries mapping SafeSpend execution constraints.',
};

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Effective Date: August 2026</p>

            <div className="mt-12 space-y-12">
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-sm text-yellow-700 dark:text-yellow-500 leading-relaxed">
                    <strong>Critical Notice:</strong> SafeSpend AI operates exclusively as an experimental risk analysis tool mapped against the Solana Devnet. The AI heuristics outputted
                    during execution are purely informational bounds and definitively DO NOT orchestrate absolute security limits cleanly.
                </div>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <Scale className="size-5 text-primary" />
                        1. Assumption of Risk
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By integrating a Phantom or Solflare wallet naturally into the execution context, explicitly checking payload limits, you unequivocally assume absolute liability targeting execution boundaries.
                        We actively attempt blocking Suspicious values explicitly via standard provider logics, but zero warranties exist surrounding zero-day token spoofing or deep smart contract logic bombs. You explicitly reserve full authority mapping signed executions.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <AlertOctagon className="size-5 text-primary" />
                        2. No Financial Advice
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Recommendations generating &quot;Safe&quot; or &quot;Approve&quot; targets are strictly contextual representations targeting parsed JSON schemas cleanly. They strictly do not constitute registered financial, investment, or legal limits. Users must actively execute secondary verification protocols smoothly ensuring structural checks dynamically properly smoothly.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <ShieldCheck className="size-5 text-primary" />
                        3. API Rate Limitations
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Dynamic executions evaluating GoPlus, Helius, and Birdeye targets map precisely checking constraints strictly. If global boundaries cap execution tracking loops dynamically properly, explicit bounds result in neutral 50-point values explicitly mapping manual review bounds cleanly cleanly protecting network outages smoothly.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        4. Governing Law
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These constraints execute evaluating local boundaries actively isolating limits accurately smoothly securing open-source standard protections explicitly smoothly.
                    </p>
                </section>
            </div>
        </div>
    );
}
