/**
 * Module 21 — Central Logger
 * Native logging singleton abstracting stdout pipelines strictly enforcing timestamps and environment restrictions.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class CentralLogger {
    private isProduction: boolean;

    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    private format(level: LogLevel, message: string, meta?: unknown): string {
        const timestamp = new Date().toISOString();
        let payload = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (meta !== undefined) {
            try {
                payload += ` | Meta: ${JSON.stringify(meta)}`;
            } catch {
                payload += ` | Meta: (unserializable output)`;
            }
        }

        return payload;
    }

    public info(message: string, meta?: unknown): void {
        console.info(this.format('info', message, meta));
    }

    public warn(message: string, meta?: unknown): void {
        console.warn(this.format('warn', message, meta));
    }

    public error(message: string, meta?: unknown): void {
        console.error(this.format('error', message, meta));
    }

    public debug(message: string, meta?: unknown): void {
        if (this.isProduction) return;
        console.debug(this.format('debug', message, meta));
    }
}

export const logger = new CentralLogger();
