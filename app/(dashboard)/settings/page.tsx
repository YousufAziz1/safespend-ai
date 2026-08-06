import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeSwitch } from '@/components/theme-switch';
import { CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your account preferences, theme, and system configuration.
                </p>
            </div>

            <Separator />

            <div className="grid gap-8 md:grid-cols-2">
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold tracking-tight">Appearance</h2>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Theme Preference</CardTitle>
                            <CardDescription>Toggle between dark and light mode automatically.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <span className="text-sm font-medium">Dark Mode Toggle</span>
                            <ThemeSwitch />
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold tracking-tight">Profile (Mock)</h2>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Placeholder values for the current session.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Name</span>
                                <span className="font-medium">Satoshi Nakamoto</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="font-medium">satoshi@safespend.ai</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-4 md:col-span-2">
                    <h2 className="text-xl font-semibold tracking-tight">System Info</h2>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Application Specifications</CardTitle>
                            <CardDescription>Crucial debug and network information.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="flex flex-col gap-1 rounded-lg border p-4">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Version <CheckCircle2 className="size-3 text-emerald-500" />
                                </span>
                                <span className="font-medium font-mono text-sm">v0.1.0-alpha</span>
                            </div>
                            <div className="flex flex-col gap-1 rounded-lg border p-4">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Build <CheckCircle2 className="size-3 text-emerald-500" />
                                </span>
                                <span className="font-medium font-mono text-sm">b_78a2f9c</span>
                            </div>
                            <div className="flex flex-col gap-1 rounded-lg border p-4">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Network <CheckCircle2 className="size-3 text-emerald-500" />
                                </span>
                                <span className="font-medium font-mono text-sm text-primary">Solana Devnet</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
