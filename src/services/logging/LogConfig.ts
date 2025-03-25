const LogLevel = {
    Trace: 0,
    Debug: 1,
    Info: 2,
    Warn: 3,
    Error: 4,
} as const;

type LogLevelKey = keyof typeof LogLevel;

const resolveLogLevel = (): number => {
    const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || "info";
    switch (logLevel?.toLowerCase()) {
        case "trace":
            return LogLevel.Trace;
        case "debug":
            return LogLevel.Debug;
        case "info":
            return LogLevel.Info;
        case "warn":
            return LogLevel.Warn;
        case "error":
            return LogLevel.Error;
        default:
            return LogLevel.Info;
    }
};

const loggers: Record<string, ReturnType<typeof createLogger>> = {};

export const createLogger = (loggerName: string) => {
    const logLevel = resolveLogLevel();

    const log = (level: LogLevelKey, ...message: unknown[]) => {
        if (LogLevel[level] >= logLevel) {
            console.log(`[${level}] [${loggerName}]`, ...message);
        }
    };

    return {
        trace: (...message: unknown[]) => log("Trace", ...message),
        debug: (...message: unknown[]) => log("Debug", ...message),
        info: (...message: unknown[]) => log("Info", ...message),
        warn: (...message: unknown[]) => log("Warn", ...message),
        error: (...message: unknown[]) => log("Error", ...message),
    };
};

export const getLogger = (loggerName: string) => {
    if (!loggers[loggerName]) {
        loggers[loggerName] = createLogger(loggerName);
    }
    return loggers[loggerName];
};