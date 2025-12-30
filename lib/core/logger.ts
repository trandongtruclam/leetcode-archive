type Level = 'info' | 'warn' | 'error'

interface LogMeta {
  [key: string]: unknown
}

function log(level: Level, message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  }

  const line = JSON.stringify(payload)

  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),
};
