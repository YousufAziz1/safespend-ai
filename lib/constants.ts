import {
    LayoutDashboard,
    Activity,
    ArrowLeftRight,
    Settings,
    Shield,
    Brain,
    Zap,
    Lock,
    Send,
} from 'lucide-react';
import type { SidebarItem, FeatureCard } from '@/types';

export const dashboardSidebarItems: SidebarItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Send Payment',
        href: '/send',
        icon: Send,
    },
    {
        title: 'Analytics',
        href: '/dashboard',
        icon: Activity,
        badge: 'Soon',
        disabled: true,
    },
    {
        title: 'Transactions',
        href: '/dashboard',
        icon: ArrowLeftRight,
        badge: 'Soon',
        disabled: true,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export const landingFeatures: FeatureCard[] = [
    {
        title: 'AI-Powered Safety',
        description:
            'Intelligent risk analysis evaluates every transaction before it reaches the blockchain, catching threats humans miss.',
        icon: Shield,
    },
    {
        title: 'Smart Approvals',
        description:
            'Machine learning models analyze spending patterns and flag anomalies in real-time, adapting to your behavior.',
        icon: Brain,
    },
    {
        title: 'Instant Execution',
        description:
            'Once approved, transactions execute on Solana with sub-second finality. No delays, no bottlenecks.',
        icon: Zap,
    },
    {
        title: 'Rule Enforcement',
        description:
            'On-chain programs enforce spending limits, multi-sig requirements, and custom policies — immutably.',
        icon: Lock,
    },
];
