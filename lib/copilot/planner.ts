export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'rejected';

export interface PlanStep {
    id: string;
    label: string;
    status: StepStatus;
}

export interface ExecutionPlan {
    id: string;
    steps: PlanStep[];
}

export function createExecutionPlan(): ExecutionPlan {
    return {
        id: `plan_${Date.now()}`,
        steps: [
            { id: 'resolve', label: 'Resolve recipient', status: 'pending' },
            { id: 'memory', label: 'Analyze context', status: 'pending' },
            { id: 'policy', label: 'Check payment policy', status: 'pending' },
            { id: 'security', label: 'Run security analysis', status: 'pending' },
            { id: 'simulate', label: 'Simulate transaction', status: 'pending' },
            { id: 'wallet', label: 'Request wallet signature', status: 'pending' },
            { id: 'confirm', label: 'Wait for confirmation', status: 'pending' },
            { id: 'history', label: 'Save history', status: 'pending' }
        ]
    };
}

export function updatePlanStep(plan: ExecutionPlan, stepId: string, status: StepStatus): ExecutionPlan {
    return {
        ...plan,
        steps: plan.steps.map(step =>
            step.id === stepId ? { ...step, status } : step
        )
    };
}

export function markRemainingAs(plan: ExecutionPlan, fromStepId: string, status: StepStatus): ExecutionPlan {
    const clone = { ...plan, steps: [...plan.steps] };
    const idx = clone.steps.findIndex(s => s.id === fromStepId);
    if (idx === -1) return clone;

    for (let i = idx; i < clone.steps.length; i++) {
        if (clone.steps[i].status === 'pending' || clone.steps[i].status === 'running') {
            clone.steps[i].status = status;
        }
    }

    return clone;
}
