/**
 *
 * 该模块包含核心包的公共类型和接口。
 *
 * ## 安装
 *
 * ```bash npm2yarn
 * npm install @auth/core
 * ```
 *
 * 然后你可以从 `@auth/core/types` 导入这个子模块。
 *
 * ## 使用
 *
 * 即使你不使用 TypeScript，像 VS Code 这样的 IDE 也会获取类型以提供更好的开发体验。
 * 在输入时，你会得到关于某些对象/函数外观的建议，
 * 有时还会有文档、示例和其他有价值资源的链接。
 *
 * 通常，你不需要从这个模块导入类型。
 * 大多数情况下，当使用 `Auth` 函数和可选的 `AuthConfig` 接口时，
 * 里面的所有内容都已经类型化了。
 *
 * :::tip
 * 在 `Auth` 函数内部，你不需要使用这个模块的任何类型。
 *
 * @example
 * ```ts title=index.ts
 * import { Auth } from "@auth/core"
 *
 * const request = new Request("https://example.com")
 * const response = await Auth(request, {
 *   callbacks: {
 *     jwt(): JWT { // <-- 这是不必要的！
 *       return { foo: "bar" }
 *     },
 *     session(
 *        { session, token }: { session: Session; token: JWT } // <-- 这是不必要的！
 *     ) {
 *       return session
 *     },
 *   }
 * })
 * ```
 * :::
 *
 * ## 资源
 *
 * - [TypeScript - 基础](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
 * - [扩展内置类型](https://authjs.dev/getting-started/typescript#module-augmentation)
 *
 * @module types
 */

import type { SerializeOptions } from "./lib/vendored/cookie.js"
import type { TokenEndpointResponse } from "oauth4webapi"
import type { Adapter } from "./adapters.js"
import { AuthConfig } from "./index.js"
import type { JWTOptions } from "./jwt.js"
import type { Cookie } from "./lib/utils/cookie.js"
import type { LoggerInstance } from "./lib/utils/logger.js"
import type { WarningCode } from "./warnings.js"
import type {
  CredentialsConfig,
  EmailConfig,
  OAuthConfigInternal,
  OIDCConfigInternal,
  ProviderType,
} from "./providers/index.js"
import type {
  WebAuthnConfig,
  WebAuthnProviderType,
} from "./providers/webauthn.js"

export type { WebAuthnOptionsResponseBody } from "./lib/utils/webauthn-utils.js"
export type { AuthConfig } from "./index.js"
export type { LoggerInstance, WarningCode }
export type Awaitable<T> = T | PromiseLike<T>
export type Awaited<T> = T extends Promise<infer U> ? U : T

export type SemverString =
  | `v${number}`
  | `v${number}.${number}`
  | `v${number}.${number}.${number}`

/**
 * 更改内置页面的主题。
 *
 * [文档](https://authjs.dev/reference/core#theme) |
 * [页面](https://authjs.dev/guides/pages/signin)
 */
export interface Theme {
  colorScheme?: "auto" | "dark" | "light"
  logo?: string
  brandColor?: string
  buttonText?: string
}

/**
 * OAuth 提供商返回的不同令牌。
 * 其中一些以不同的大小写形式提供，
 * 但它们指的是相同的值。
 */
export type TokenSet = Partial<TokenEndpointResponse> & {
  /**
   * `access_token` 过期的日期，以秒为单位。
   * 这个值是根据 `expires_in` 值计算得出的。
   *
   * @see https://www.ietf.org/rfc/rfc6749.html#section-4.2.2
   */
  expires_at?: number
}

/**
 * 通常包含关于正在使用的提供商的信息
 * 并且扩展了 `TokenSet`，这是 OAuth 提供商返回的不同令牌。
 */
export interface Account extends Partial<TokenEndpointResponse> {
  /** 此账户的提供商 ID。例如 "google"。完整列表见 https://authjs.dev/reference/core/providers */
  provider: string
  /**
   * 这个值取决于用于创建账户的提供商类型。
   * - oauth/oidc: OAuth 账户的 ID，从 `profile()` 回调返回。
   * - email: 用户的电子邮件地址。
   * - credentials: 从 `authorize()` 回调返回的 `id`
   */
  providerAccountId: string
  /** 此账户的提供商类型 */
  type: ProviderType
  /**
   * 此账户所属用户的 ID
   *
   * @see https://authjs.dev/reference/core/adapters#adapteruser
   */
  userId?: string
  /**
   * 基于 {@link TokenEndpointResponse.expires_in} 计算得出的值。
   *
   * 它是 {@link TokenEndpointResponse.access_token} 过期的绝对时间戳（以秒为单位）。
   *
   * 这个值可以与 {@link TokenEndpointResponse.refresh_token} 一起用于实现令牌轮换。
   *
   * @see https://authjs.dev/guides/refresh-token-rotation#database-strategy
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-5.1
   */
  expires_at?: number
}

/**
 * 从你的 OAuth 提供商返回的用户信息。
 *
 * @see https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface Profile {
  id?: string | null
  sub?: string | null
  name?: string | null
  given_name?: string | null
  family_name?: string | null
  middle_name?: string | null
  nickname?: string | null
  preferred_username?: string | null
  profile?: string | null
  picture?: string | null | any
  website?: string | null
  email?: string | null
  email_verified?: boolean | null
  gender?: string | null
  birthdate?: string | null
  zoneinfo?: string | null
  locale?: string | null
  phone_number?: string | null
  updated_at?: Date | string | number | null
  address?: {
    formatted?: string | null
    street_address?: string | null
    locality?: string | null
    region?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
  [claim: string]: unknown
}

/** [文档](https://authjs.dev/reference/core#cookies) */
export interface CookieOption {
  name: string
  options: SerializeOptions
}

/** [文档](https://authjs.dev/reference/core#cookies) */
export interface CookiesOptions {
  sessionToken: Partial<CookieOption>
  callbackUrl: Partial<CookieOption>
  csrfToken: Partial<CookieOption>
  pkceCodeVerifier: Partial<CookieOption>
  state: Partial<CookieOption>
  nonce: Partial<CookieOption>
  webauthnChallenge: Partial<CookieOption>
}

/** TODO: 检查所有这些是否被使用/正确 */
export type ErrorPageParam = "Configuration" | "AccessDenied" | "Verification"

/** TODO: 检查所有这些是否被使用/正确 */
export type SignInPageErrorParam =
  | "Signin"
  | "OAuthSignin"
  | "OAuthCallbackError"
  | "OAuthCreateAccount"
  | "EmailCreateAccount"
  | "Callback"
  | "OAuthAccountNotLinked"
  | "EmailSignin"
  | "CredentialsSignin"
  | "SessionRequired"

export interface PagesOptions {
  /**
   * 登录页面的路径。
   *
   * 可选的 "error" 查询参数设置为
   * {@link SignInPageErrorParam 可用} 值之一。
   *
   * @default "/signin"
   */
  signIn: string
  signOut: string
  /**
   * 错误页面的路径。
   *
   * 可选的 "error" 查询参数设置为
   * {@link ErrorPageParam 可用} 值之一。
   *
   * @default "/error"
   */
  error: string
  verifyRequest: string
  /** 如果设置，新用户首次登录时将定向到这里 */
  newUser: string
}

type ISODateString = string

export interface DefaultSession {
  user?: User
  expires: ISODateString
}

/** 登录用户的活跃会话。 */
export interface Session extends DefaultSession {}

export interface DefaultUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

/**
 * OAuth 提供商的 `profile` 回调中返回的对象的形状，
 * 在 `jwt` 和 `session` 回调中可用，
 * 或在使用数据库时的 `session` 回调的第二个参数中。
 */
export interface User extends DefaultUser {}

// Below are types that are only supposed be used by next-auth internally

/** @internal */
export type InternalProvider<T = ProviderType> = (T extends "oauth"
  ? OAuthConfigInternal<any>
  : T extends "oidc"
    ? OIDCConfigInternal<any>
    : T extends "email"
      ? EmailConfig
      : T extends "credentials"
        ? CredentialsConfig
        : T extends WebAuthnProviderType
          ? WebAuthnConfig
          : never) & {
  signinUrl: string
  /** @example `"https://example.com/api/auth/callback/id"` */
  callbackUrl: string
}

export interface PublicProvider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

/**
 * Auth.js 支持的操作。每个操作对应一个 REST API 端点。
 * 一些操作有 `GET` 和 `POST` 变体，取决于操作是否改变服务器状态。
 *
 * - **`"callback"`**:
 *   - **`GET`**: 处理来自 [OAuth 提供商](https://authjs.dev/reference/core/providers#oauth2configprofile) 的回调。
 *   - **`POST`**: 处理来自 [Credentials 提供商](https://authjs.dev/getting-started/providers/credentials#credentialsconfigcredentialsinputs) 的回调。
 * - **`"csrf"`**: 返回原始的 CSRF 令牌，保存在 cookie 中（加密）。
 * 它用于 CSRF 保护，实现 [双提交 cookie](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie) 技术。
 * :::note
 * 一些框架有内置的 CSRF 保护，因此可以禁用此操作。在这种情况下，相应的端点将返回 404 响应。更多信息请阅读 [`skipCSRFCheck`](https://authjs.dev/reference/core#skipcsrfcheck)。
 * _⚠ 除非你知道你在做什么，否则我们不建议手动禁用 CSRF 保护。_
 * :::
 * - **`"error"`**: 渲染内置的错误页面。
 * - **`"providers"`**: 返回所有配置的提供商的客户端安全列表。
 * - **`"session"`**:
 *   - **`GET`**: 如果存在，返回用户的会话，否则返回 `null`。
 *   - **`POST`**: 更新用户的会话并返回更新后的会话。
 * - **`"signin"`**:
 *   - **`GET`**: 渲染内置的登录页面。
 *   - **`POST`**: 启动登录流程。
 * - **`"signout"`**:
 *   - **`GET`**: 渲染内置的登出页面。
 *   - **`POST`**: 启动登出流程。这将使用户的会话无效（删除 cookie，如果数据库中有会话，它也将被删除）。
 * - **`"verify-request"`**: 渲染内置的验证请求页面。
 * - **`"webauthn-options"`**:
 *   - **`GET`**: 返回 WebAuthn 认证和注册流程的选项。
 */
export type AuthAction =
  | "callback"
  | "csrf"
  | "error"
  | "providers"
  | "session"
  | "signin"
  | "signout"
  | "verify-request"
  | "webauthn-options"

/** @internal */
export interface RequestInternal {
  url: URL
  method: "GET" | "POST"
  cookies?: Partial<Record<string, string>>
  headers?: Record<string, any>
  query?: Record<string, any>
  body?: Record<string, any>
  action: AuthAction
  providerId?: string
  error?: string
}

// Should only be used by frameworks
export interface ResponseInternal<
  Body extends string | Record<string, any> | any[] | null = any,
> {
  status?: number
  headers?: Headers | HeadersInit
  body?: Body
  redirect?: string
  cookies?: Cookie[]
}

/**
 * 一个 webauthn 认证器。
 * 代表能够认证其引用的账户的实体，
 * 并包含认证器的凭据和相关信息。
 *
 * @see https://www.w3.org/TR/webauthn/#authenticator
 */
export interface Authenticator {
  /**
   * 此认证器所属用户的 ID。
   */
  userId?: string
  /**
   * 连接到认证器的提供商账户 ID。
   */
  providerAccountId: string
  /**
   * 认证器被使用的次数。
   */
  counter: number
  /**
   * 客户端认证器是否备份了凭据。
   */
  credentialBackedUp: boolean
  /**
   * Base64 编码的凭据 ID。
   */
  credentialID: string
  /**
   * Base64 编码的凭据公钥。
   */
  credentialPublicKey: string
  /**
   * 连接的传输标志。
   */
  transports?: string | null
  /**
   * 认证器的设备类型。
   */
  credentialDeviceType: string
}

/** @internal */
export interface InternalOptions<TProviderType = ProviderType> {
  providers: InternalProvider[]
  url: URL
  action: AuthAction
  provider: InternalProvider<TProviderType>
  csrfToken?: string
  /**
   * `true` 如果 [双提交 CSRF 检查](https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf) 成功
   * 或 [`skipCSRFCheck`](https://authjs.dev/reference/core#skipcsrfcheck) 被启用。
   */
  csrfTokenVerified?: boolean
  secret: string | string[]
  theme: Theme
  debug: boolean
  logger: LoggerInstance
  session: NonNullable<Required<AuthConfig["session"]>>
  pages: Partial<PagesOptions>
  jwt: JWTOptions
  events: NonNullable<AuthConfig["events"]>
  adapter: Required<Adapter> | undefined
  callbacks: NonNullable<Required<AuthConfig["callbacks"]>>
  cookies: Record<keyof CookiesOptions, CookieOption>
  callbackUrl: string
  /**
   * 如果为 true，OAuth 回调正被服务器代理到原始 URL。
   * 另见 {@link OAuthConfigInternal.redirectProxyUrl}。
   */
  isOnRedirectProxy: boolean
  experimental: NonNullable<AuthConfig["experimental"]>
  basePath: string
}
