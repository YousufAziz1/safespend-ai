import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
    name: 'SafeSpend AI',
    description:
        'AI-powered payment safety system built for Solana. The AI requests, the blockchain enforces.',
    version: '0.1.0',
    author: {
        name: 'Yousuf Aziz',
        url: 'https://github.com/YousufAziz1',
    },
    github: 'https://github.com/YousufAziz1/safespend-ai',
    url: 'https://safespend.ai',
    navigation: [
        { title: 'Home', href: '/' },
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/settings' },
    ],
    footerSections: [
        {
            title: 'Product',
            links: [
                { title: 'Features', href: '/#features' },
                { title: 'Architecture', href: '/#architecture' },
                { title: 'Dashboard', href: '/dashboard' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { title: 'Documentation', href: '/docs', external: false },
                {
                    title: 'GitHub',
                    href: 'https://github.com/YousufAziz1/safespend-ai',
                    external: true,
                },
            ],
        },
        {
            title: 'Legal',
            links: [
                { title: 'Privacy', href: '/privacy' },
                { title: 'Terms', href: '/terms' },
            ],
        },
    ],
};
