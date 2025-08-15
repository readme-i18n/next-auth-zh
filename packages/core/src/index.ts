/**
 *
 * :::warning Experimental
 * `@auth/core` 正处于积极开发阶段。
 * :::
 *
 * 这是 Auth.js 库的主要入口点。
 *
 * 基于 {@link https://developer.mozilla.org/en-US/docs/Web/API/Request Request}
 * 和 {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response} 网络标准 API。
 * 主要用于实现[框架](https://authjs.dev/getting-started/integrations)特定的包，
 * 但也可以直接使用。
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/core
 * ```
 *
 * ## 使用
 *
 * ```ts
 * import { Auth } from "@auth/core"
 *
 * const request = new Request("https://example.com")
 * const response = await Auth(request, {...})
 *
 * console.log(response instanceof Response) // true
 * ```
 *
 * ## 资源
 *
 * - [入门指南](https://authjs.dev/getting-started)
 * - [指南](https://authjs.dev/guides)
 *
 * @module @auth/core
 */

import { assertConfig } from "./lib/utils/assert.js"
import {
  AuthError,
  CredentialsSignin,
  ErrorPageLoop,
  isClientError,
} from "./errors.js"
import { AuthInternal, raw, skipCSRFCheck } from "./lib/index.js"
import { setEnvDefaults, createActionURL } from "./lib/utils/env.js"
import renderPage from "./lib/pages/index.js"
import { setLogger, type LoggerInstance } from "./lib/utils/logger.js"
import { toInternalRequest, toResponse } from "./lib/utils/web.js"

import type { Adapter, AdapterSession, AdapterUser } from "./adapters.js"
import type {
  Account,
  AuthAction,
  Awaitable,
  CookiesOptions,
  DefaultSession,
  PagesOptions,
  Profile,
  ResponseInternal,
  Session,
  Theme,
  User,
} from "./types.js"
import type { CredentialInput, Provider } from "./providers/index.js"
import { JWT, JWTOptions } from "./jwt.js"
import { isAuthAction } from "./lib/utils/actions.js"

export { customFetch } from "./lib/symbols.js"
export { skipCSRFCheck, raw, setEnvDefaults, createActionURL, isAuthAction }

export async function Auth(
  request: Request,
  config: AuthConfig & { raw: typeof raw }
): Promise<ResponseInternal>

export async function Auth(
  request: Request,
  config: Omit<AuthConfig, "raw">
): Promise<Response>

/**
 * Auth.js 提供的核心功能。
 *
 * 接收标准的 {@link Request} 并返回 {@link Response}。
 *
 * @example
 * ```ts
 * import { Auth } from "@auth/core"
 *
 * const request = new Request("https://example.com")
 * const response = await Auth(request, {
 *   providers: [Google],
 *   secret: "...",
 *   trustHost: true,
 * })
 *```
 * @see [文档](https://authjs.dev)
 */
export async function Auth(
  request: Request,
  config: AuthConfig
): Promise<Response | ResponseInternal> {
  const logger = setLogger(config)

  const internalRequest = await toInternalRequest(request, config)
  // There was an error parsing the request
  if (!internalRequest) return Response.json(`Bad request.`, { status: 400 })

  const warningsOrError = assertConfig(internalRequest, config)

  if (Array.isArray(warningsOrError)) {
    warningsOrError.forEach(logger.warn)
  } else if (warningsOrError) {
    // If there's an error in the user config, bail out early
    logger.error(warningsOrError)
    const htmlPages = new Set<AuthAction>([
      "signin",
      "signout",
      "error",
      "verify-request",
    ])
    if (
      !htmlPages.has(internalRequest.action) ||
      internalRequest.method !== "GET"
    ) {
      const message =
        "There was a problem with the server configuration. Check the server logs for more information."
      return Response.json({ message }, { status: 500 })
    }

    const { pages, theme } = config

    // If this is true, the config required auth on the error page
    // which could cause a redirect loop
    const authOnErrorPage =
      pages?.error &&
      internalRequest.url.searchParams
        .get("callbackUrl")
        ?.startsWith(pages.error)

    // Either there was no error page configured or the configured one contains infinite redirects
    if (!pages?.error || authOnErrorPage) {
      if (authOnErrorPage) {
        logger.error(
          new ErrorPageLoop(
            `The error page ${pages?.error} should not require authentication`
          )
        )
      }

      const page = renderPage({ theme }).error("Configuration")
      return toResponse(page)
    }

    const url = `${internalRequest.url.origin}${pages.error}?error=Configuration`
    return Response.redirect(url)
  }

  const isRedirect = request.headers?.has("X-Auth-Return-Redirect")
  const isRaw = config.raw === raw
  try {
    const internalResponse = await AuthInternal(internalRequest, config)
    if (isRaw) return internalResponse

    const response = toResponse(internalResponse)
    const url = response.headers.get("Location")

    if (!isRedirect || !url) return response

    return Response.json({ url }, { headers: response.headers })
  } catch (e) {
    const error = e as Error
    logger.error(error)

    const isAuthError = error instanceof AuthError
    if (isAuthError && isRaw && !isRedirect) throw error

    // If the CSRF check failed for POST/session, return a 400 status code.
    // We should not redirect to a page as this is an API route
    if (request.method === "POST" && internalRequest.action === "session")
      return Response.json(null, { status: 400 })

    const isClientSafeErrorType = isClientError(error)
    const type = isClientSafeErrorType ? error.type : "Configuration"

    const params = new URLSearchParams({ error: type })
    if (error instanceof CredentialsSignin) params.set("code", error.code)

    const pageKind = (isAuthError && error.kind) || "error"
    const pagePath =
      config.pages?.[pageKind] ?? `${config.basePath}/${pageKind.toLowerCase()}`
    const url = `${internalRequest.url.origin}${pagePath}?${params}`

    if (isRedirect) return Response.json({ url })
    return Response.redirect(url)
  }
}

/**
 * 配置 {@link Auth} 方法。
 *
 * @example
 * ```ts
 * import Auth, { type AuthConfig } from "@auth/core"
 *
 * export const authConfig: AuthConfig = {...}
 *
 * const request = new Request("https://example.com")
 * const response = await AuthHandler(request, authConfig)
 * ```
 *
 * @see [初始化](https://authjs.dev/reference/core/types#authconfig)
 */
export interface AuthConfig {
  /**
   * 用于登录的认证提供者列表
   * （例如 Google、Facebook、Twitter、GitHub、Email 等）可以任意顺序排列。
   * 可以是内置提供者之一，也可以是带有自定义提供者的对象。
   *
   * @default []
   */
  providers: Provider[]
  /**
   * 用于哈希令牌、签名 cookies 和生成加密密钥的随机字符串。
   *
   * 要生成随机字符串，可以使用 Auth.js CLI：`npx auth secret`
   *
   * @note
   * 你也可以传递一个秘密数组，在这种情况下，第一个成功解密 JWT 的秘密将被使用。这对于在不使现有会话失效的情况下轮换秘密非常有用。
   * 新的秘密应添加到数组的开头，这将用于所有新会话。
   *
   */
  secret?: string | string[]
  /**
   * 配置你的会话，比如是否想要使用 JWT 或数据库，
   * 空闲会话多久过期，或者在使用数据库时限制写操作。
   */
  session?: {
    /**
     * 选择如何保存用户会话。
     * 默认为 `"jwt"`，即会话 cookie 中的加密 JWT (JWE)。
     *
     * 但如果使用 `adapter`，我们默认改为 `"database"`。
     * 你仍然可以通过显式定义 `"jwt"` 来强制使用 JWT 会话。
     *
     * 使用 `"database"` 时，会话 cookie 将只包含一个 `sessionToken` 值，
     * 用于在数据库中查找会话。
     *
     * [文档](https://authjs.dev/reference/core#authconfig#session) | [适配器](https://authjs.dev/reference/core#authconfig#adapter) | [关于 JSON Web Tokens](https://authjs.dev/concepts/session-strategies#jwt-session)
     */
    strategy?: "jwt" | "database"
    /**
     * 从现在开始的相对时间（秒），会话将过期
     *
     * @default 2592000 // 30 天
     */
    maxAge?: number
    /**
     * 会话应多久更新一次（秒）。
     * 如果设置为 `0`，则每次都会更新会话。
     *
     * @default 86400 // 1 天
     */
    updateAge?: number
    /**
     * 为基于数据库的会话生成自定义会话令牌。
     * 默认情况下，根据 Node.js 版本生成随机 UUID 或字符串。
     * 但是，你可以指定自己的自定义字符串（如 CUID）来使用。
     *
     * @default `randomUUID` 或 `randomBytes.toHex` 取决于 Node.js 版本
     */
    generateSessionToken?: () => string
  }
  /**
   * 如果你没有指定 {@link AuthConfig.adapter}，默认启用 JSON Web Tokens。
   * JSON Web Tokens 默认是加密的（JWE）。我们建议你保持这种行为。
   */
  jwt?: Partial<JWTOptions>
  /**
   * 指定 URL 如果你想创建自定义的登录、登出和错误页面。
   * 指定的页面将覆盖相应的内置页面。
   *
   * @default {}
   * @example
   *
   * ```ts
   *   pages: {
   *     signIn: '/auth/signin',
   *     signOut: '/auth/signout',
   *     error: '/auth/error',
   *     verifyRequest: '/auth/verify-request',
   *     newUser: '/auth/new-user'
   *   }
   * ```
   */
  pages?: Partial<PagesOptions>
  /**
   * 回调是异步函数，你可以用来控制在执行操作时发生什么。
   * 回调*极其强大*，特别是在涉及 JSON Web Tokens 的场景中，
   * 因为它们**允许你在没有数据库的情况下实现访问控制**，并且**与外部数据库或 API 集成**。
   */
  callbacks?: {
    /**
     * 控制用户是否被允许登录。
     * 返回 `true` 继续登录流程。
     * 返回 `false` 或抛出错误将停止登录流程并将用户重定向到错误页面。
     * 返回字符串将用户重定向到指定的 URL。
     *
     * 未处理的错误将抛出 `AccessDenied`，消息设置为原始错误。
     *
     * [`AccessDenied`](https://authjs.dev/reference/core/errors#accessdenied)
     *
     * @example
     * ```ts
     * callbacks: {
     *  async signIn({ profile }) {
     *   // 只允许电子邮件地址以 "yourdomain.com" 结尾的用户登录
     *   return profile?.email?.endsWith("@yourdomain.com")
     *  }
     * }
     * ```
     */
    signIn?: (params: {
      user: User | AdapterUser
      account?: Account | null
      /**
       * 如果使用 OAuth 提供者，它包含你的提供者返回的完整
       * OAuth 个人资料。
       */
      profile?: Profile
      /**
       * 如果使用电子邮件提供者，在第一次调用时，它包含一个
       * `verificationRequest: true` 属性，表示它是在验证请求流程中触发的。
       * 当用户在点击登录链接后调用回调时，
       * 此属性将不存在。你可以检查 `verificationRequest` 属性
       * 以避免向阻止列表中的地址或域名发送电子邮件，或仅显式为允许列表中的电子邮件地址生成它们。
       */
      email?: {
        verificationRequest?: boolean
      }
      /** 如果使用凭据提供者，它包含用户凭据 */
      credentials?: Record<string, CredentialInput>
    }) => Awaitable<boolean | string>
    /**
     * 每当用户被重定向到回调 URL（即登录或登出时）时调用此回调。
     * 默认情况下，只允许与来源相同主机上的 URL。
     * 你可以使用此回调来自定义该行为。
     *
     * [文档](https://authjs.dev/reference/core/types#redirect)
     *
     * @example
     * callbacks: {
     *   async redirect({ url, baseUrl }) {
     *     // 允许相对回调 URL
     *     if (url.startsWith("/")) return `${baseUrl}${url}`
     *
     *     // 允许同一来源上的回调 URL
     *     if (new URL(url).origin === baseUrl) return url
     *
     *     return baseUrl
     *   }
     * }
     */
    redirect?: (params: {
      /** 客户端提供的回调 URL */
      url: string
      /** 站点的默认基础 URL（可用作回退） */
      baseUrl: string
    }) => Awaitable<string>
    /**
     * 每当检查会话时调用此回调。
     * （即调用 `/api/session` 端点，使用 `useSession` 或 `getSession` 时）。
     * 返回值将暴露给客户端，所以在这里返回什么要小心！
     * 如果你想向客户端提供任何通过 JWT 回调添加到令牌中的内容，
     * 你也必须在这里显式返回它。
     *
     * :::note
     * ⚠ 默认情况下，为了增加安全性，
     * 只返回令牌的一个子集（电子邮件、名称、图像）。
     * :::
     *
     * 令牌参数仅在 jwt 会话策略可用时可用，而
     * 用户参数仅在数据库会话策略可用时可用。
     *
     * [`jwt` 回调](https://authjs.dev/reference/core/types#jwt)
     *
     * @example
     * ```ts
     * callbacks: {
     *   async session({ session, token, user }) {
     *     // 向客户端发送属性，如来自提供者的 access_token。
     *     session.accessToken = token.accessToken
     *
     *     return session
     *   }
     * }
     * ```
     */
    session?: (
      params: ({
        session: { user: AdapterUser } & AdapterSession
        /** 当 {@link AuthConfig.session} 设置为 `strategy: "database"` 时可用。 */
        user: AdapterUser
      } & {
        session: Session
        /** 当 {@link AuthConfig.session} 设置为 `strategy: "jwt"` 时可用 */
        token: JWT
      }) & {
        /**
         * 当使用 {@link AuthConfig.session} `strategy: "database"` 并触发会话更新时可用。
         *
         * :::note
         * 在使用此数据之前应验证它。
         * :::
         */
        newSession: any
        trigger?: "update"
      }
    ) => Awaitable<Session | DefaultSession>
    /**
     * 每当创建（即登录时）或更新（即每当在客户端访问会话时）JSON Web Token 时调用此回调。
     * 你在这里返回的任何内容都将保存在 JWT 中并转发到会话回调。
     * 在那里你可以控制应该返回给客户端的内容。其他任何内容
     * 都将对你的前端保密。默认情况下，JWT 通过你的
     * AUTH_SECRET 环境变量加密。
     *
     * [`session` 回调](https://authjs.dev/reference/core/types#session)
     */
    jwt?: (params: {
      /**
       * 当 `trigger` 是 `"signIn"` 或 `"signUp"` 时，它将是 {@link JWT} 的子集，
       * 包括 `name`、`email` 和 `image`。
       *
       * 否则，它将是后续调用的完整 {@link JWT}。
       */
      token: JWT
      /**
       * 要么是 {@link OAuthConfig.profile} 的结果，要么是 {@link CredentialsConfig.authorize} 回调的结果。
       * @note 当 `trigger` 是 `"signIn"` 或 `"signUp"` 时可用。
       *
       * 资源：
       * - [凭据提供者](https://authjs.dev/getting-started/authentication/credentials)
       * - [用户数据库模型](https://authjs.dev/guides/creating-a-database-adapter#user-management)
       */
      user: User | AdapterUser
      /**
       * 包含有关用于登录的提供者的信息。
       * 还包括 {@link TokenSet}
       * @note 当 `trigger` 是 `"signIn"` 或 `"signUp"` 时可用
       */
      account?: Account | null
      /**
       * 你的提供者返回的 OAuth 个人资料。
       * （在 OIDC 的情况下，它将是解码的 ID Token 或 /userinfo 响应）
       * @note 当 `trigger` 是 `"signIn"` 时可用。
       */
      profile?: Profile
      /**
       * 检查 jwt 回调被调用的原因。可能的原因是：
       * - 用户登录：第一次调用回调时，`user`、`profile` 和 `account` 将存在。
       * - 用户注册：第一次在数据库中创建用户（当 {@link AuthConfig.session}.strategy 设置为 `"database"` 时）
       * - 更新事件：由 `useSession().update` 方法触发。
       * 在后一种情况下，`trigger` 将是 `undefined`。
       */
      trigger?: "signIn" | "signUp" | "update"
      /** @deprecated 使用 `trigger === "signUp"` 代替 */
      isNewUser?: boolean
      /**
       * 当使用 {@link AuthConfig.session} `strategy: "jwt"` 时，这是从客户端通过 `useSession().update` 方法发送的数据。
       *
       * ⚠ 注意，在使用此数据之前应验证它。
       */
      session?: any
    }) => Awaitable<JWT | null>
  }
  /**
   * 事件是不返回响应的异步函数，它们对于审计日志记录非常有用。
   * 你可以为下面任何这些事件指定一个处理程序 - 例如用于调试或创建审计日志。
   * 消息对象的内容根据流程而变化
   * （例如 OAuth 或电子邮件认证流程，JWT 或数据库会话等），
   * 但通常包含用户对象和/或 JSON Web Token 的内容
   * 以及其他与事件相关的信息。
   *
   * @default {}
   */
  events?: {
    /**
     * 如果使用 `credentials` 类型的认证，用户是你的
     * 凭据提供者的原始响应。
     * 对于其他提供者，你将从适配器获取用户对象，账户，
     * 以及用户是否对你的适配器是新的指示器。
     */
    signIn?: (message: {
      user: User
      account?: Account | null
      profile?: Profile
      isNewUser?: boolean
    }) => Awaitable<void>
    /**
     * 消息对象将包含以下之一，取决于
     * 你使用的是 JWT 还是数据库持久会话：
     * - `token`：此会话的 JWT。
     * - `session`：来自你的适配器的正在结束的会话对象。
     */
    signOut?: (
      message:
        | { session: Awaited<ReturnType<Required<Adapter>["deleteSession"]>> }
        | { token: Awaited<ReturnType<JWTOptions["decode"]>> }
    ) => Awaitable<void>
    createUser?: (message: { user: User }) => Awaitable<void>
    updateUser?: (message: { user: User }) => Awaitable<void>
    linkAccount?: (message: {
      user: User | AdapterUser
      account: Account
      profile: User | AdapterUser
    }) => Awaitable<void>
    /**
     * 消息对象将包含以下之一，取决于
     * 你使用的是 JWT 还是数据库持久会话：
     * - `token`：此会话的 JWT。
     * - `session`：来自你的适配器的会话对象。
     */
    session?: (message: { session: Session; token: JWT }) => Awaitable<void>
  }
  /** 你可以使用 adapter 选项传入你的数据库适配器。 */
  adapter?: Adapter
  /**
   * 将 debug 设置为 true 以启用认证和数据库操作的调试消息。
   *
   * - ⚠ 如果你添加了自定义 {@link AuthConfig.logger}，此设置将被忽略。
   *
   * @default false
   */
  debug?: boolean
  /**
   * 覆盖任何日志级别（`undefined` 级别将使用内置日志记录器），
   * 并拦截 NextAuth 中的日志。你可以使用此选项将 NextAuth 日志发送到第三方日志服务。
   *
   * @example
   *
   * ```ts
   * // /auth.ts
   * import log from "logging-service"
   *
   * export const { handlers, auth, signIn, signOut } = NextAuth({
   *   logger: {
   *     error(code, ...message) {
   *       log.error(code, message)
   *     },
   *     warn(code, ...message) {
   *       log.warn(code, message)
   *     },
   *     debug(code, ...message) {
   *       log.debug(code, message)
   *     }
   *   }
   * })
   * ```
   *
   * - ⚠ 设置后，{@link AuthConfig.debug} 选项将被忽略
   *
   * @default console
   */
  logger?: Partial<LoggerInstance>
  /** 更改内置 {@link AuthConfig.pages} 的主题。 */
  theme?: Theme
  /**
   * 当设置为 `true` 时，NextAuth.js 设置的所有 cookies 将只能从 HTTPS URL 访问。
   * 此选项在 URL 以 `http://` 开头（例如 http://localhost:3000）时默认为 `false`，以便开发者方便。
   * 你可以手动将此选项设置为 `false` 以禁用此安全功能并允许 cookies
   * 从非安全 URL 访问（这不推荐）。
   *
   * - ⚠ **这是一个高级选项。** 高级选项的传递方式与基本选项相同，
   * 但**可能有复杂的含义**或副作用。
   * 你应该**尽量避免使用高级选项**，除非你非常熟悉它们。
   *
   * 默认为 HTTP `false` 和 HTTPS 站点 `true`。
   */
  useSecureCookies?: boolean
  /**
   * 你可以覆盖 Auth.js 使用的任何 cookies 的默认名称和选项。
   * 你可以指定一个或多个具有自定义属性的 cookies
   * 缺少的选项将使用 Auth.js 定义的默认值。
   * 如果你使用此功能，你可能希望创建条件行为
   * 以支持在开发和构建生产时设置不同的 cookies 策略，
   * 因为你将选择退出内置的动态策略。
   *
   * - ⚠ **这是一个高级选项。** 高级选项的传递方式与基本选项相同，
   * 但**可能有复杂的含义**或副作用。
   * 你应该**尽量避免使用高级选项**，除非你非常熟悉它们。
   *
   * @default {}
   */
  cookies?: Partial<CookiesOptions>
  /**
   * Auth.js 依赖于传入请求的 `host` 标头才能正常工作。因此，此属性需要设置为 `true`。
   *
   * 确保你的部署平台安全地设置 `host` 标头。
   *
   * :::note
   * 官方的基于 Auth.js 的库将尝试为一些已知安全设置 `host` 标头的部署平台（例如：Vercel）自动设置此值。
   * :::
   */
  trustHost?: boolean
  skipCSRFCheck?: typeof skipCSRFCheck
  raw?: typeof raw
  /**
   * 设置后，在 OAuth 登录流程中，
   * 授权请求的 `redirect_uri`
   * 将基于此值设置。
   *
   * 这在你 OAuth 提供者只支持单个 `redirect_uri`
   * 或你想在预览 URL（如 Vercel）上使用 OAuth 时非常有用，在那里你事先不知道最终的部署 URL。
   *
   * URL 需要包括初始化 Auth.js 的完整路径。
   *
   * @note 这将自动启用提供者上的 `state` {@link OAuth2Config.checks}。
   *
   * @example
   * ```
   * "https://authjs.example.com/api/auth"
   * ```
   *
   * 你也可以为每个提供者单独覆盖此设置。
   *
   * @example
   * ```ts
   * GitHub({
   *   ...
   *   redirectProxyUrl: "https://github.example.com/api/auth"
   * })
   * ```
   *
   * @default `AUTH_REDIRECT_PROXY_URL` 环境变量
   *
   * 另见：[指南：保护预览部署](https://authjs.dev/getting-started/deployment#securing-a-preview-deployment)
   */
  redirectProxyUrl?: string

  /**
   * 使用此选项启用实验性功能。
   * 启用时，它将在控制台打印警告消息。
   * @note 实验性功能不保证稳定，可能会更改或移除而不通知。请谨慎使用。
   * @default {}
   */
  experimental?: {
    /**
     * 启用 WebAuthn 支持。
     *
     * @default false
     */
    enableWebAuthn?: boolean
  }
  /**
   * Auth.js API 端点的基本路径。
   *
   * @default "/api/auth" 在 "next-auth" 中；所有其他框架为 "/auth"
   */
  basePath?: string
}
