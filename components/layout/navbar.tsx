'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeSwitch } from '@/components/theme-switch';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function Navbar() {
    const pathname = usePathname();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Shield className="size-5 text-primary" />
                        <span className="text-base">{siteConfig.name}</span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {siteConfig.navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted',
                                    pathname === item.href
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeSwitch />

                    <div className="hidden md:flex">
                        <ConnectWalletButton />
                    </div>

                    <Sheet>
                        <SheetTrigger
                            className={cn(
                                'inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
                            )}
                        >
                            <Menu className="size-5" />
                            <span className="sr-only">Open menu</span>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 p-0">
                            <SheetHeader className="border-b border-border/50 p-4">
                                <SheetTitle className="flex items-center gap-2 text-base">
                                    <Shield className="size-4 text-primary" />
                                    {siteConfig.name}
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 p-4">
                                {siteConfig.navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                                            pathname === item.href
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground'
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                                <div className="mt-4 border-t border-border/50 pt-4">
                                    <ConnectWalletButton />
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    );
}
