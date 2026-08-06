import { Metadata } from 'next';
import { ShieldAlert, Fingerprint, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how SafeSpend limits local data retention across API networks.',
};

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

            <div className="mt-12 space-y-12 text-muted-foreground leading-relaxed">
                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <ShieldAlert className="size-5 text-primary" />
                        Information We Collect
                    </h2>
                    <p className="mb-4">
                        SafeSpend AI is fundamentally designed as a decentralized analysis tool. We strictly operate without backend databases tracking global behavioral records. The only persistent values are strictly stored directly inside your browser cache.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li><strong>Wallet Public Keys</strong>: Required dynamically parsing Devnet blockchains mapping behaviors.</li>
                        <li><strong>Transaction Outputs</strong>: Stored entirely locally mapping historical execution logs across your Dashboard.</li>
                        <li><strong>Provider Execution Times</strong>: Tracked anonymously during active browser sessions logging provider latencies purely securely.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <Lock className="size-5 text-primary" />
                        Security API Infrastructures
                    </h2>
                    <p className="mb-4">
                        In order to actively map comprehensive limits successfully calculating execution boundaries, minimal transaction metadata is distributed cleanly across the following partners dynamically:
                    </p>
                    <div className="space-y-4 rounded-xl border bg-muted/10 p-6">
                        <div>
                            <strong className="text-foreground">GoPlus Security</strong>
                            <p className="mt-1 text-sm">Recipient wallet addresses are queried strictly checking active global sanctions cleanly mapped securely without attaching IP address logs.</p>
                        </div>
                        <div>
                            <strong className="text-foreground">Helius Web3 RPC</strong>
                            <p className="mt-1 text-sm">Payload simulations evaluate execution boundaries dynamically routing raw block requests determining simulated network health limits directly.</p>
                        </div>
                        <div>
                            <strong className="text-foreground">Birdeye Analytics</strong>
                            <p className="mt-1 text-sm">Target token public keys query global liquidity maps restricting malicious tokens verifying valid contract states naturally.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                        <Fingerprint className="size-5 text-primary" />
                        Local Storage Constraints
                    </h2>
                    <p>
                        SafeSpend securely targets the native <code>localStorage</code> context capturing Transaction limits exactly isolating them accurately inside restricted browser bounds. If you access the configuration application limits triggering the clearing hook, absolute bounds are reset accurately permanently tracking zero network bounds actively.
                    </p>
                </section>
            </div>
        </div>
    );
}
