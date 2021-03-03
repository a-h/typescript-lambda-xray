type Log = (msg: string, data?: unknown) => void;
type LogError = (msg: string, data: unknown, err?: Error) => void;

export type Logger = {
  error: LogError;
  info: Log;
  debug: Log;
  warn: Log;
};

export const logError: LogError = (msg, data, err) =>
  console.error(
    JSON.stringify({
      time: new Date().toISOString(),
      level: "ERROR",
      msg,
      ...(data as Record<string, unknown>),
    }),
    err ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : ""
  );

export const log: Log = (msg, data) =>
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      level: "INFO",
      msg,
      ...(data as Record<string, unknown>),
    })
  );

export const logWarn: Log = (msg, data) =>
  console.warn(
    JSON.stringify({
      time: new Date().toISOString(),
      level: "WARN",
      msg,
      ...(data as Record<string, unknown>),
    })
  );

export const logDebug: Log = (msg, data) => {
  console.debug(
    JSON.stringify({
      time: new Date().toISOString(),
      level: "DEBUG",
      msg,
      ...(data as Record<string, unknown>),
    })
  );
};

const defaultExport: Logger = {
  error: logError,
  info: log,
  debug: logDebug,
  warn: logWarn,
};

export default defaultExport;
