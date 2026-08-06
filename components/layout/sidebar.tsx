'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Send, Activity, ArrowLeftRight, Settings, Bot } from 'lucide-react';

const sidebarItems = [
    { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Send Payment', href: '/send', icon: Send },
    { title: 'AI Copilot', href: '/copilot', icon: Bot },
    { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { title: 'Analytics', href: '/analytics', icon: Activity },
    { title: 'Settings', href: '/settings', icon: Settings },
    { title: 'Scenarios', href: '/demo', icon: Bot },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-sidebar lg:block">
            <div className="flex h-full flex-col gap-2 p-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Navigation
                </p>
                <nav className="flex flex-col gap-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <Icon className="size-4 shrink-0" />
                                <span className="flex-1">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
