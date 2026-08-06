export type DemoScenario = {
    id: string;
    title: string;
    description: string;
    icon: string;
    command: string;
    color: string;
    steps: { name: string; complete: boolean }[];
};

export const DEMO_SCENARIOS: DemoScenario[] = [
    {
        id: 'safe_payment',
        title: 'Safe Payment',
        description: 'Trusted contact, low amount, healthy wallet.',
        icon: '🟢',
        color: 'from-emerald-500 to-emerald-400',
        command: 'Send 2 SOL to John',
        steps: [
            { name: 'Intent Parsing', complete: false },
            { name: 'Contact Resolution', complete: false },
            { name: 'AI Memory', complete: false },
            { name: 'Policy Engine', complete: false },
            { name: 'Multi-Provider Security', complete: false },
            { name: 'AI Explainability', complete: false },
            { name: 'Simulation', complete: false },
            { name: 'Secure Execution', complete: false },
        ]
    },
    {
        id: 'new_recipient',
        title: 'New Recipient',
        description: 'Unknown wallet, no previous history.',
        icon: '🟡',
        color: 'from-yellow-500 to-yellow-400',
        command: 'Send 1 SOL to 87TvGrfS9mGt6SaKdTSKePfB1fWpvAPGnDtjHqi9dqp4',
        steps: [
            { name: 'Intent Parsing', complete: false },
            { name: 'Contact Resolution', complete: false },
            { name: 'AI Memory', complete: false },
            { name: 'Policy Engine', complete: false },
            { name: 'Multi-Provider Security', complete: false },
            { name: 'AI Explainability', complete: false },
            { name: 'Simulation', complete: false },
            { name: 'Secure Execution', complete: false },
        ]
    },
    {
        id: 'large_transfer',
        title: 'Large Transfer',
        description: 'Amount exceeds historical average.',
        icon: '🟠',
        color: 'from-orange-500 to-orange-400',
        command: 'Send 50 SOL to John',
        steps: [
            { name: 'Intent Parsing', complete: false },
            { name: 'Contact Resolution', complete: false },
            { name: 'AI Memory', complete: false },
            { name: 'Policy Engine', complete: false },
            { name: 'Multi-Provider Security', complete: false },
            { name: 'AI Explainability', complete: false },
            { name: 'Simulation', complete: false },
            { name: 'Secure Execution', complete: false },
        ]
    },
    {
        id: 'policy_violation',
        title: 'Policy Violation',
        description: 'Amount exceeds configured policy.',
        icon: '🔴',
        color: 'from-red-500 to-red-400',
        command: 'Send 150 SOL to John',
        steps: [
            { name: 'Intent Parsing', complete: false },
            { name: 'Contact Resolution', complete: false },
            { name: 'AI Memory', complete: false },
            { name: 'Policy Engine', complete: false },
            { name: 'Multi-Provider Security', complete: false },
            { name: 'AI Explainability', complete: false },
            { name: 'Simulation', complete: false },
            { name: 'Secure Execution', complete: false },
        ]
    },
    {
        id: 'malicious_wallet',
        title: 'Malicious Wallet',
        description: 'Blacklisted or dangerous wallet detected.',
        icon: '⚫',
        color: 'from-slate-800 to-slate-700',
        command: 'Send 5 SOL to 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // Blacklisted test wallet
        steps: [
            { name: 'Intent Parsing', complete: false },
            { name: 'Contact Resolution', complete: false },
            { name: 'AI Memory', complete: false },
            { name: 'Policy Engine', complete: false },
            { name: 'Multi-Provider Security', complete: false },
            { name: 'AI Explainability', complete: false },
            { name: 'Simulation', complete: false },
            { name: 'Secure Execution', complete: false },
        ]
    }
];
