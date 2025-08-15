import { AuthError } from "../../errors.js"
import type { WarningCode } from "../../warnings.js"
import type { AuthConfig } from "../../index.js"

/**
 * 重写任意方法，其余将使用默认日志记录器。
 *
 * [文档](https://authjs.dev/reference/core#authconfig#logger)
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface LoggerInstance extends Record<string, Function> {
  warn: (code: WarningCode) => void
  error: (error: Error) => void
  debug: (message: string, metadata?: unknown) => void
}

const red = "\x1b[31m"
const yellow = "\x1b[33m"
const grey = "\x1b[90m"
const reset = "\x1b[0m"

const defaultLogger: LoggerInstance = {
  error(error) {
    const name = error instanceof AuthError ? error.type : error.name
    console.error(`${red}[auth][error]${reset} ${name}: ${error.message}`)
    if (
      error.cause &&
      typeof error.cause === "object" &&
      "err" in error.cause &&
      error.cause.err instanceof Error
    ) {
      const { err, ...data } = error.cause
      console.error(`${red}[auth][cause]${reset}:`, err.stack)
      if (data)
        console.error(
          `${red}[auth][details]${reset}:`,
          JSON.stringify(data, null, 2)
        )
    } else if (error.stack) {
      console.error(error.stack.replace(/.*/, "").substring(1))
    }
  },
  warn(code) {
    const url = `https://warnings.authjs.dev`
    console.warn(`${yellow}[auth][warn][${code}]${reset}`, `Read more: ${url}`)
  },
  debug(message, metadata) {
    console.log(
      `${grey}[auth][debug]:${reset} ${message}`,
      JSON.stringify(metadata, null, 2)
    )
  },
}

/**
 * 使用用户自定义实现覆盖内置日志记录器。
 * 任何 `undefined` 级别将使用默认日志记录器。
 */
export function setLogger(
  config: Pick<AuthConfig, "logger" | "debug">
): LoggerInstance {
  const newLogger: LoggerInstance = {
    ...defaultLogger,
  }

  // Turn off debug logging if `debug` isn't set to `true`
  if (!config.debug) newLogger.debug = () => {}

  if (config.logger?.error) newLogger.error = config.logger.error
  if (config.logger?.warn) newLogger.warn = config.logger.warn
  if (config.logger?.debug) newLogger.debug = config.logger.debug

  config.logger ??= newLogger
  return newLogger
}
