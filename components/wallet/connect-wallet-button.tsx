'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks/use-mounted';

export function ConnectWalletButton() {
    const { wallet, connected, connecting, disconnecting } = useWallet();
    const { setVisible } = useWalletModal();
    const mounted = useMounted();

    const isLoading = connecting || disconnecting || !mounted;

    if (isLoading) {
        return (
            <Button variant="outline" size="sm" disabled className="min-w-[120px]">
                Connecting...
            </Button>
        );
    }

    if (connected && wallet) {
        return (
            <Button variant="outline" size="sm" onClick={() => setVisible(true)}>
                <Shield className="size-4 text-primary" />
                <span className="hidden sm:inline-block">Connected</span>
            </Button>
        );
    }

    return (
        <Button variant="default" size="sm" onClick={() => setVisible(true)}>
            Connect Wallet
        </Button>
    );
}
