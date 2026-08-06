'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TransactionDetails } from '@/types/transaction';

interface TransactionFormProps {
    onAnalyze: (details: TransactionDetails) => void;
    isAnalyzing?: boolean;
}

export function TransactionForm({
    onAnalyze,
    isAnalyzing = false,
}: TransactionFormProps) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient || !amount) return;

        // Trigger parent analysis handler
        onAnalyze({
            recipient,
            amount: parseFloat(amount),
            // Set to 0 temporarily; actual fee is pulled dynamically based on risk engine context
            fee: 0,
            network: 'devnet',
        });
    };

    return (
        <Card className="w-full shadow-sm">
            <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>
                    Enter the recipient wallet address and amount to transfer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase opacity-80">Hackathon Demo Scenarios</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20 dark:text-emerald-400 font-semibold transition-colors"
                            onClick={() => {
                                const addr = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Verified Devnet Token Address (Safe History)
                                const amt = '0.5';
                                setRecipient(addr); setAmount(amt);
                                onAnalyze({ recipient: addr, amount: parseFloat(amt), fee: 0, network: 'devnet' });
                            }}
                            disabled={isAnalyzing}
                        >
                            🟢 Safe Wallet
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 dark:text-yellow-500 font-semibold transition-colors"
                            onClick={() => {
                                const addr = '9hTDRV1y5m6hTDRV1y5m6hTDRV1y5m6hTDRV1y5m6hTD'; // Unknown Address
                                const amt = '65'; // Amount > 50 triggers manual review cleanly
                                setRecipient(addr); setAmount(amt);
                                onAnalyze({ recipient: addr, amount: parseFloat(amt), fee: 0, network: 'devnet' });
                            }}
                            disabled={isAnalyzing}
                        >
                            🟡 Suspicious
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20 dark:text-red-400 font-semibold transition-colors"
                            onClick={() => {
                                const addr = 'FRDzyjRchkv9F5j2SyTbfWdnpGT5HDsH23wXFGHs3Tqw'; // Unknown Address
                                const amt = '150'; // Amount > 100 triggers absolute critical rejection block
                                setRecipient(addr); setAmount(amt);
                                onAnalyze({ recipient: addr, amount: parseFloat(amt), fee: 0, network: 'devnet' });
                            }}
                            disabled={isAnalyzing}
                        >
                            🔴 Malicious
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="recipient">Recipient Wallet Address</Label>
                        <Input
                            id="recipient"
                            placeholder="e.g. 7Zj...kw9"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            disabled={isAnalyzing}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">Amount (SOL)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isAnalyzing}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full font-semibold"
                        size="lg"
                        disabled={isAnalyzing || !recipient || !amount}
                    >
                        {isAnalyzing ? 'Analyzing Risk...' : 'Analyze Transaction'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
