'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 px-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-2xl bg-destructive/10 p-4">
                            <AlertTriangle className="size-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Something went wrong
                        </h2>
                        <p className="max-w-md text-center text-sm text-muted-foreground">
                            An unexpected error occurred. Please try again or contact support
                            if the problem persists.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={this.handleReset}
                        className="gap-2"
                    >
                        <RotateCcw className="size-4" data-icon="inline-start" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
