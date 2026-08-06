'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { WalletProvider } from '@/providers/wallet-provider';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <WalletProvider>
                <QueryProvider>{children}</QueryProvider>
            </WalletProvider>
        </ThemeProvider>
    );
}
