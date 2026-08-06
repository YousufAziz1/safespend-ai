'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, RefreshCw, CheckCircle2, Shield, Circle, Bot, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_SCENARIOS, type DemoScenario } from '@/lib/copilot/demo-scenarios';
import { CopilotInterface } from '../copilot/page';

export default function DemoPage() {
    const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
    const [progressSteps, setProgressSteps] = useState<string[]>([]);
    const [demoKey, setDemoKey] = useState(0);

    const handleScenarioSelect = (scenario: DemoScenario) => {
        setSelectedScenario(scenario);
        setProgressSteps([]);
        setDemoKey(prev => prev + 1);
    };

    const handleStepProgress = useCallback((step: string) => {
        setProgressSteps(prev => {
            if (prev.includes(step)) return prev;
            return [...prev, step];
        });
    }, []);

    const resetDemo = () => {
        if (selectedScenario) {
            handleScenarioSelect(selectedScenario);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-full overflow-hidden bg-background">
            {/* Left Orchestrator Sidebar */}
            <div className="w-full max-w-md shrink-0 border-r bg-muted/10 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="size-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight">Judge Demo Mode</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Select a scenario to witness the autonomous AI security pipeline execute locally in real-time.</p>
                </div>

                {/* Scenarios */}
                <div className="flex flex-col gap-3">
                    {DEMO_SCENARIOS.map((scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => handleScenarioSelect(scenario)}
                            className={cn(
                                "flex flex-col items-start text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
                                selectedScenario?.id === scenario.id
                                    ? "bg-primary/5 border-primary/40 shadow-sm"
                                    : "bg-background hover:bg-muted/50 border-border"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-1 w-full justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{scenario.icon}</span>
                                    <span className="font-semibold">{scenario.title}</span>
                                </div>
                                {selectedScenario?.id === scenario.id ? (
                                    <Badge variant="default" className="text-[10px] uppercase tracking-wider">Active</Badge>
                                ) : (
                                    <PlayCircle className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground ml-9">{scenario.description}</p>
                        </button>
                    ))}
                </div>

                {/* Progress Indicator */}
                {selectedScenario && (
                    <div className="mt-4 pt-6 border-t flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border px-2 py-1 bg-background rounded-md">
                                <Activity className="size-3 text-primary animate-pulse" />
                                Current Demo Step
                            </h3>
                            <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                {progressSteps.length} / 8
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 bg-background p-4 rounded-xl border shadow-sm">
                            <AnimatePresence>
                                {selectedScenario.steps.map((step) => {
                                    const isComplete = progressSteps.includes(step.name);
                                    return (
                                        <motion.div
                                            key={step.name}
                                            initial={{ opacity: 0.6, x: -5 }}
                                            animate={{ opacity: isComplete ? 1 : 0.6, x: isComplete ? 0 : -5 }}
                                            className="flex items-center gap-3"
                                        >
                                            {isComplete ? (
                                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            ) : (
                                                <Circle className="size-4 text-muted-foreground/30 shrink-0" />
                                            )}
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                isComplete ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {step.name}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {progressSteps.length >= 8 && (
                            <div className="text-xs text-center text-muted-foreground font-semibold px-2">
                                Demo Workflow Concluded!
                            </div>
                        )}

                        <Button variant="outline" size="sm" onClick={resetDemo} className="w-full mt-2 group relative overflow-hidden bg-background">
                            <div className="absolute inset-0 bg-primary/10 w-0 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
                            <span className="relative z-10 flex items-center gap-2"><RefreshCw className="size-4" /> Reset Scenario</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Right Copilot Mount */}
            <div className="flex-1 bg-background/50 relative overflow-hidden">
                {selectedScenario ? (
                    <CopilotInterface
                        key={demoKey} // Forces complete remount to isolate context cleanly
                        demoMode={true}
                        demoScenario={selectedScenario}
                        onStepProgress={handleStepProgress}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center p-12">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 max-w-sm">
                            <div className="size-20 rounded-2xl bg-muted border shadow-sm flex items-center justify-center">
                                <Bot className="size-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Awaiting Scenario</h3>
                                <p className="text-muted-foreground text-sm">Select one of the 5 Judge Demo permutations on the left to witness real decentralized logic execution integrated into UI workflows.</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
