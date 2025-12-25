/**
 * Logging utility for Bounzy frontend
 * Provides consistent, colored console logging for debugging
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

const colors: Record<LogLevel, string> = {
    info: '#3B82F6',     // blue
    success: '#22C55E',  // green
    warn: '#EAB308',     // yellow
    error: '#EF4444',    // red
    debug: '#8B5CF6',    // purple
};

const icons: Record<LogLevel, string> = {
    info: '[i]',
    success: '[OK]',
    warn: '[!]',
    error: '[X]',
    debug: '[?]',
};

function createLogger(module: string) {
    const log = (level: LogLevel, message: string, data?: unknown) => {
        if (!isDev && level === 'debug') return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${module}]`;
        const icon = icons[level];
        const color = colors[level];

        console.groupCollapsed(
            `%c${icon} ${prefix} ${message}`,
            `color: ${color}; font-weight: bold;`
        );
        console.log(`%cTime: ${timestamp}`, 'color: gray;');
        if (data !== undefined) {
            console.log('%cData:', 'color: gray; font-weight: bold;');
            console.log(data);
        }
        console.groupEnd();
    };

    return {
        info: (message: string, data?: unknown) => log('info', message, data),
        success: (message: string, data?: unknown) => log('success', message, data),
        warn: (message: string, data?: unknown) => log('warn', message, data),
        error: (message: string, data?: unknown) => log('error', message, data),
        debug: (message: string, data?: unknown) => log('debug', message, data),

        // Transaction-specific logging
        txStart: (action: string, args?: unknown) => {
            log('info', `Starting ${action}...`, args);
        },
        txPending: (action: string, hash?: string) => {
            log('info', `${action} pending confirmation`, { hash });
        },
        txSuccess: (action: string, hash?: string) => {
            log('success', `${action} confirmed!`, { hash });
        },
        txError: (action: string, error: unknown) => {
            log('error', `${action} failed`, error);
        },
    };
}

// Pre-configured loggers for each module
export const logger = {
    campaign: createLogger('Campaign'),
    evidence: createLogger('Evidence'),
    validator: createLogger('Validator'),
    claim: createLogger('Claim'),
    fhevm: createLogger('FHEVM'),
    wallet: createLogger('Wallet'),
};

// Default export for ad-hoc logging
export default createLogger;
