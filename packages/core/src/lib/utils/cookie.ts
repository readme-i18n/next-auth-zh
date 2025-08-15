import type {
  CookieOption,
  CookiesOptions,
  LoggerInstance,
  RequestInternal,
} from "../../types.js"

// Uncomment to recalculate the estimated size
// of an empty session cookie
// import * as cookie from "../vendored/cookie.js"
// const { serialize } = cookie
// console.log(
//   "Cookie estimated to be ",
//   serialize(`__Secure.authjs.session-token.0`, "", {
//     expires: new Date(),
//     httpOnly: true,
//     maxAge: Number.MAX_SAFE_INTEGER,
//     path: "/",
//     sameSite: "strict",
//     secure: true,
//     domain: "example.com",
//   }).length,
//   " bytes"
// )

const ALLOWED_COOKIE_SIZE = 4096
// Based on commented out section above
const ESTIMATED_EMPTY_COOKIE_SIZE = 160
const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE

// REVIEW: Is there any way to defer two types of strings?

/** `JWT` 的字符串形式。使用 `jwt.decode` 提取内容。 */
export type JWTString = string

export type SetCookieOptions = Partial<CookieOption["options"]> & {
  expires?: Date | string
  encode?: (val: unknown) => string
}

/**
 * 如果 `options.session.strategy` 设置为 `jwt`，则这是一个字符串化的 `JWT`。
 * 如果是 `strategy: "database"`，则是数据库中会话的 `sessionToken`。
 */
export type SessionToken<T extends "jwt" | "database" = "jwt"> = T extends "jwt"
  ? JWTString
  : string

/**
 * 如果站点使用 HTTPS，则使用安全 cookies
 * 这种条件性设置允许 cookies 在非 HTTPS 的开发 URL 上工作
 * 尊重安全 cookie 选项，该选项设置 'secure' 并添加 '__Secure-'
 * 前缀，但如果站点 URL 是 HTTPS，则默认启用它们；但不适用于
 * 非 HTTPS URL，如开发中使用的 http://localhost）。
 * 有关前缀的更多信息，请参阅 https://googlechrome.github.io/samples/cookie-prefixes/
 *
 * @TODO 审查 cookie 设置（名称、选项）
 */
export function defaultCookies(useSecureCookies: boolean) {
  const cookiePrefix = useSecureCookies ? "__Secure-" : ""
  return {
    // default cookie options
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      // Default to __Host- for CSRF token for additional protection if using useSecureCookies
      // NB: The `__Host-` prefix is stricter than the `__Secure-` prefix.
      name: `${useSecureCookies ? "__Host-" : ""}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes in seconds
      },
    },
    state: {
      name: `${cookiePrefix}authjs.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes in seconds
      },
    },
    nonce: {
      name: `${cookiePrefix}authjs.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    webauthnChallenge: {
      name: `${cookiePrefix}authjs.challenge`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes in seconds
      },
    },
  } as const satisfies CookiesOptions
}

export interface Cookie extends CookieOption {
  value: string
}

type Chunks = Record<string, string>

export class SessionStore {
  #chunks: Chunks = {}
  #option: CookieOption
  #logger: LoggerInstance | Console

  constructor(
    option: CookieOption,
    cookies: RequestInternal["cookies"],
    logger: LoggerInstance | Console
  ) {
    this.#logger = logger
    this.#option = option
    if (!cookies) return

    const { name: sessionCookiePrefix } = option

    for (const [name, value] of Object.entries(cookies)) {
      if (!name.startsWith(sessionCookiePrefix) || !value) continue
      this.#chunks[name] = value
    }
  }

  /**
   * 从 cookie 块构建的 JWT 会话或数据库会话 ID。
   */
  get value() {
    // Sort the chunks by their keys before joining
    const sortedKeys = Object.keys(this.#chunks).sort((a, b) => {
      const aSuffix = parseInt(a.split(".").pop() || "0")
      const bSuffix = parseInt(b.split(".").pop() || "0")

      return aSuffix - bSuffix
    })

    // Use the sorted keys to join the chunks in the correct order
    return sortedKeys.map((key) => this.#chunks[key]).join("")
  }

  /** 给定一个 cookie，返回适合允许的 cookie 大小的 cookie 块列表。 */
  #chunk(cookie: Cookie): Cookie[] {
    const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE)

    if (chunkCount === 1) {
      this.#chunks[cookie.name] = cookie.value
      return [cookie]
    }

    const cookies: Cookie[] = []
    for (let i = 0; i < chunkCount; i++) {
      const name = `${cookie.name}.${i}`
      const value = cookie.value.substr(i * CHUNK_SIZE, CHUNK_SIZE)
      cookies.push({ ...cookie, name, value })
      this.#chunks[name] = value
    }

    this.#logger.debug("CHUNKING_SESSION_COOKIE", {
      message: `Session cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
      emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
      valueSize: cookie.value.length,
      chunks: cookies.map((c) => c.value.length + ESTIMATED_EMPTY_COOKIE_SIZE),
    })

    return cookies
  }

  /** 返回清理后的 cookie 块。 */
  #clean(): Record<string, Cookie> {
    const cleanedChunks: Record<string, Cookie> = {}
    for (const name in this.#chunks) {
      delete this.#chunks?.[name]
      cleanedChunks[name] = {
        name,
        value: "",
        options: { ...this.#option.options, maxAge: 0 },
      }
    }
    return cleanedChunks
  }

  /**
   * 给定一个 cookie 值，返回新的、分块的 cookies，以适应允许的 cookie 大小。
   * 如果 cookie 从分块变为未分块或反之亦然，
   * 它也会删除旧的 cookies。
   */
  chunk(value: string, options: Partial<Cookie["options"]>): Cookie[] {
    // Assume all cookies should be cleaned by default
    const cookies: Record<string, Cookie> = this.#clean()

    // Calculate new chunks
    const chunked = this.#chunk({
      name: this.#option.name,
      value,
      options: { ...this.#option.options, ...options },
    })

    // Update stored chunks / cookies
    for (const chunk of chunked) {
      cookies[chunk.name] = chunk
    }

    return Object.values(cookies)
  }

  /** 返回应清理的 cookies 列表。 */
  clean(): Cookie[] {
    return Object.values(this.#clean())
  }
}
