'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMounted } from '@/hooks/use-mounted';

export function WalletInfo() {
    const { connection } = useConnection();
    const { publicKey, connected, connecting } = useWallet();
    const mounted = useMounted();
    const balanceRef = useRef<number | null>(null);

    const subscribe = useCallback((callback: () => void) => {
        if (!publicKey) return () => { };

        // Subscription for updates
        const id = connection.onAccountChange(
            publicKey,
            (info) => {
                const newBalance = info.lamports / LAMPORTS_PER_SOL;
                if (newBalance !== balanceRef.current) {
                    balanceRef.current = newBalance;
                    callback();
                }
            },
            'confirmed'
        );

        // Immediate fetch
        connection.getBalance(publicKey).then(bal => {
            const newBalance = bal / LAMPORTS_PER_SOL;
            if (newBalance !== balanceRef.current) {
                balanceRef.current = newBalance;
                callback();
            }
        }).catch(console.error);

        return () => {
            connection.removeAccountChangeListener(id);
        };
    }, [connection, publicKey]);

    const getSnapshot = useCallback(() => balanceRef.current, []);

    const balance = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => null
    );

    if (!mounted || connecting) {
        return <Skeleton className="h-24 w-full rounded-xl" />;
    }

    if (!connected || !publicKey) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 p-6 text-center">
                <Badge variant="secondary" className="mb-2 text-muted-foreground">
                    Disconnected
                </Badge>
                <p className="text-sm text-muted-foreground">
                    Connect your wallet to view your Solana Devnet balance and address.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Network</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="relative flex size-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-semibold">Devnet</span>
                    </div>
                </div>
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                    Connected
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Wallet Address</p>
                    <p className="mt-1 font-mono text-sm break-all">
                        {publicKey.toBase58()}
                    </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">SOL Balance</p>
                    <div className="mt-1 text-2xl font-bold tracking-tight">
                        {balance !== null ? (
                            `${balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`
                        ) : (
                            <Skeleton className="h-8 w-24" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
