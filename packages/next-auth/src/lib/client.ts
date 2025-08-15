"use client"

import * as React from "react"
import type { ProviderId, ProviderType } from "@auth/core/providers"
import type { LoggerInstance, Session } from "@auth/core/types"
import { AuthError } from "@auth/core/errors"

/** @todo */
class ClientFetchError extends AuthError {}

/** @todo */
export class ClientSessionError extends AuthError {}

export interface AuthClientConfig {
  baseUrl: string
  basePath: string
  baseUrlServer: string
  basePathServer: string
  /** 存储上一次会话的响应 */
  _session?: Session | null | undefined
  /** 用于记录自上次同步以来的时间戳（以秒为单位） */
  _lastSync: number
  /**
   * 存储 `SessionProvider` 的会话更新方法，以便能够从 `signIn` 或 `signOut` 等地方触发会话更新
   */
  _getSession: (...args: any[]) => any
}

export interface UseSessionOptions<R extends boolean> {
  required: R
  /** 默认为 `signIn` */
  onUnauthenticated?: () => void
}

export interface ClientSafeProvider {
  id: ProviderId
  name: string
  type: ProviderType
  signinUrl: string
  callbackUrl: string
  redirectTo: string
}

export interface SignInOptions<Redirect extends boolean = true>
  extends Record<string, unknown> {
  /** @deprecated 请改用 `redirectTo`。 */
  callbackUrl?: string
  /**
   * 指定用户登录成功后应重定向到哪里。
   *
   * 默认情况下，是发起登录的页面。
   */
  redirectTo?: string
  /**
   * 您可能希望在同一页面上处理登录响应，而不是重定向到另一个页面。
   * 例如，如果发生错误（如用户提供的凭据错误），您可能希望在输入字段上显示内联错误消息。
   *
   * 为此，您可以将此选项设置为 `redirect: false`。
   */
  redirect?: Redirect
}

export interface SignInResponse {
  error: string | undefined
  code: string | undefined
  status: number
  ok: boolean
  url: string | null
}

/**
 * 匹配 `new URLSearchParams(inputType)` 的 `inputType`
 * @internal
 */
export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams

/** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option-1) */
export interface SignOutResponse {
  url: string
}

export interface SignOutParams<Redirect extends boolean = true> {
  /** @deprecated 请改用 `redirectTo`。 */
  callbackUrl?: string
  /**
   * 如果您传递 `redirect: false`，页面将不会重新加载。
   * 会话将被删除，并且 `useSession` 会收到通知，因此任何关于用户的指示将自动显示为已注销。
   * 这可以给用户带来非常好的体验。
   */
  redirectTo?: string
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option-1 */
  redirect?: Redirect
}

/**
 
 * 如果您有30天（默认）或更长的会话过期时间，那么您可能不需要更改任何默认选项。
 *
 * 但是，如果您需要自定义会话行为和/或使用较短的会话过期时间，您可以向提供者传递选项以自定义 {@link useSession} 钩子的行为。
 */
export interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
  baseUrl?: string
  basePath?: string
  /**
   * 一个时间间隔（以秒为单位），在此之后会话将被重新获取。
   * 如果设置为 `0`（默认），则不会轮询会话。
   */
  refetchInterval?: number
  /**
   * `SessionProvider` 在用户切换窗口时自动重新获取会话。
   * 如果设置为 `true`（默认），此选项将激活此行为。
   */
  refetchOnWindowFocus?: boolean
  /**
   * 设置为 `false` 以在设备没有互联网访问离线时停止轮询（由 `navigator.onLine` 确定）
   *
   * [`navigator.onLine` 文档](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine)
   */
  refetchWhenOffline?: false
}

// ------------------------ Internal ------------------------

/**
 * 如果在 _app.js 中通过 getInitialProps() 传递了 'appContext'
 * 那么从 ctx 获取 req 对象并使用它作为 req 值，以允许 `fetchData` 在
 * 服务器端页面 *和* _app.js 中的 getInitialProps() 中无缝工作。
 * @internal
 */
export async function fetchData<T = any>(
  path: string,
  __NEXTAUTH: AuthClientConfig,
  logger: LoggerInstance,
  req: any = {}
): Promise<T | null> {
  const url = `${apiBaseUrl(__NEXTAUTH)}/${path}`
  try {
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(req?.headers?.cookie ? { cookie: req.headers.cookie } : {}),
      },
    }

    if (req?.body) {
      options.body = JSON.stringify(req.body)
      options.method = "POST"
    }

    const res = await fetch(url, options)
    const data = await res.json()
    if (!res.ok) throw data
    return data
  } catch (error) {
    logger.error(new ClientFetchError((error as Error).message, error as any))
    return null
  }
}

/** @internal */
export function apiBaseUrl(__NEXTAUTH: AuthClientConfig) {
  if (typeof window === "undefined") {
    // Return absolute path when called server side
    return `${__NEXTAUTH.baseUrlServer}${__NEXTAUTH.basePathServer}`
  }
  // Return relative path when called client side
  return __NEXTAUTH.basePath
}

/** @internal  */
export function useOnline() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : false
  )

  const setOnline = () => setIsOnline(true)
  const setOffline = () => setIsOnline(false)

  React.useEffect(() => {
    window.addEventListener("online", setOnline)
    window.addEventListener("offline", setOffline)

    return () => {
      window.removeEventListener("online", setOnline)
      window.removeEventListener("offline", setOffline)
    }
  }, [])

  return isOnline
}

/**
 * 返回自1970年1月1日 00:00:00 UTC以来经过的秒数。
 * @internal
 */
export function now() {
  return Math.floor(Date.now() / 1000)
}

/**
 * 返回一个类似 `URL` 的对象，用于从服务器端发起请求/重定向
 * @internal
 */
export function parseUrl(url?: string): {
  /** @default "http://localhost:3000" */
  origin: string
  /** @default "localhost:3000" */
  host: string
  /** @default "/api/auth" */
  path: string
  /** @default "http://localhost:3000/api/auth" */
  base: string
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string
} {
  const defaultUrl = new URL("http://localhost:3000/api/auth")

  if (url && !url.startsWith("http")) {
    url = `https://${url}`
  }

  const _url = new URL(url || defaultUrl)
  const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, "")

  const base = `${_url.origin}${path}`

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  }
}
