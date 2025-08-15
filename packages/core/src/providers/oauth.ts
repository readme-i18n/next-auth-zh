import type { Client, PrivateKey } from "oauth4webapi"
import type { CommonProviderOptions } from "../providers/index.js"
import type { Awaitable, Profile, TokenSet, User } from "../types.js"
import type { AuthConfig } from "../index.js"
import type { conformInternal, customFetch } from "../lib/symbols.js"

// TODO: fix types
type AuthorizationParameters = any
type CallbackParamsType = any
type IssuerMetadata = any
type OAuthCallbackChecks = any
type OpenIDCallbackChecks = any

export type { OAuthProviderId } from "./provider-types.js"

export type OAuthChecks = OpenIDCallbackChecks | OAuthCallbackChecks

type PartialIssuer = Partial<Pick<IssuerMetadata, "jwks_endpoint" | "issuer">>

type UrlParams = Record<string, unknown>

type EndpointRequest<C, R, P> = (
  context: C & {
    /** 为了方便传递 Provider，同时也包含 `callbackUrl`。 */
    provider: OAuthConfigInternal<P> & {
      signinUrl: string
      callbackUrl: string
    }
  }
) => Awaitable<R> | void

/** 提供对给定端点请求的精细控制 */
interface AdvancedEndpointHandler<P extends UrlParams, C, R> {
  /** 端点 URL。可以包含参数。可选地，你可以使用 `params` */
  url?: string
  /** 这些将被前置到 `url` 前 */
  params?: P
  /**
   * 完全控制对应的 OAuth 端点请求。
   * 当你的提供者依赖某些自定义行为或与 OAuth 规范有差异时非常有用。
   *
   * - ⚠ **这是一个高级选项。**
   * 除非你非常熟悉使用高级选项，否则应**尽量避免使用高级选项**。
   */
  request?: EndpointRequest<C, R, P>
  /** @internal */
  conform?: (response: Response) => Awaitable<Response | undefined>
  clientPrivateKey?: CryptoKey | PrivateKey
}

/**
 * 可以是一个 URL（包含所有参数）或一个提供更精细控制的对象。
 * @internal
 */
export type EndpointHandler<
  P extends UrlParams,
  C = any,
  R = any,
> = AdvancedEndpointHandler<P, C, R>

export type AuthorizationEndpointHandler =
  EndpointHandler<AuthorizationParameters>

export type TokenEndpointHandler = EndpointHandler<
  UrlParams,
  {
    /**
     * 从请求 `/api/auth/callback/:providerId` 端点提取的参数。
     * 包含如 `state` 等参数。
     */
    params: CallbackParamsType
    /**
     * 使用此自定义流程时，确保执行所有必要的安全检查。
     * 此对象包含你必须与请求匹配的参数以确保其有效性。
     */
    checks: OAuthChecks
  },
  {
    tokens: TokenSet
  }
>

export type UserinfoEndpointHandler = EndpointHandler<
  UrlParams,
  { tokens: TokenSet },
  Profile
>

export type ProfileCallback<Profile> = (
  profile: Profile,
  tokens: TokenSet
) => Awaitable<User>

export type AccountCallback = (tokens: TokenSet) => TokenSet | undefined | void

export interface OAuthProviderButtonStyles {
  logo?: string
  /**
   * @deprecated
   */
  text?: string
  /**
   * @deprecated 请改用 'brandColor'
   */
  bg?: string
  brandColor?: string
}

/** TODO: 文档 */
export interface OAuth2Config<Profile>
  extends CommonProviderOptions,
    PartialIssuer {
  /**
   * 当你想要登录到特定提供者时，标识该提供者。
   *
   * @example
   * ```ts
   * signIn('github') // "github" 是提供者 ID
   * ```
   */
  id: string
  /** 提供者的名称。显示在默认登录页面上。 */
  name: string
  /**
   * 符合 OpenID Connect (OIDC) 的提供者可以配置此项，
   * 而不是 `authorize`/`token`/`userinfo` 选项，
   * 在大多数情况下无需进一步配置。
   * 你仍然可以使用 `authorize`/`token`/`userinfo` 选项进行高级控制。
   *
   * [Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414#section-3)
   */
  wellKnown?: string
  issuer?: string
  /**
   * 登录过程将通过将用户发送到此 URL 来启动。
   *
   * [Authorization endpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1)
   */
  authorization?: string | AuthorizationEndpointHandler
  token?: string | TokenEndpointHandler
  userinfo?: string | UserinfoEndpointHandler
  type: "oauth"
  /**
   * 接收 OAuth 提供者返回的完整 {@link Profile}，并返回一个子集。
   * 用于在数据库中创建用户。
   *
   * 默认为: `id`, `email`, `name`, `image`
   *
   * @see [Database Adapter: User model](https://authjs.dev/reference/core/adapters#user)
   */
  profile?: ProfileCallback<Profile>
  /**
   * 接收 OAuth 提供者返回的完整 {@link TokenSet}，并返回一个子集。
   * 用于在数据库中创建与用户关联的账户。
   *
   * :::note
   * 你需要调整数据库的 [Account model](https://authjs.dev/reference/core/adapters#account) 以匹配返回的属性。
   * 查看你的 [database adapter](https://authjs.dev/reference/core/adapters) 文档获取更多信息。
   * :::
   *
   * 默认为: `access_token`, `id_token`, `refresh_token`, `expires_at`, `scope`, `token_type`, `session_state`
   *
   * @example
   * ```ts
   * import GitHub from "@auth/core/providers/github"
   * // ...
   * GitHub({
   *   account(account) {
   *     // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens#refreshing-a-user-access-token-with-a-refresh-token
   *     const refresh_token_expires_at =
   *       Math.floor(Date.now() / 1000) + Number(account.refresh_token_expires_in)
   *     return {
   *       access_token: account.access_token,
   *       expires_at: account.expires_at,
   *       refresh_token: account.refresh_token,
   *       refresh_token_expires_at
   *     }
   *   }
   * })
   * ```
   *
   * @see [Database Adapter: Account model](https://authjs.dev/reference/core/adapters#account)
   * @see https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
   * @see https://www.ietf.org/rfc/rfc6749.html#section-5.1
   */
  account?: AccountCallback
  /**
   * 在回调端点上执行的 CSRF 保护。
   * @default ["pkce"]
   *
   * @note 当设置了 `redirectProxyUrl` 或 {@link AuthConfig.redirectProxyUrl} 时，
   * `"state"` 将自动添加到检查中。
   *
   * [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4) |
   * [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1) |
   * [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) |
   */
  checks?: Array<"pkce" | "state" | "none">
  clientId?: string
  clientSecret?: string
  /**
   * 传递覆盖到底层的 OAuth 库。
   * 详情参见 [`oauth4webapi` client](https://github.com/panva/oauth4webapi/blob/main/docs/interfaces/Client.md)。
   */
  client?: Partial<Client & { token_endpoint_auth_method: string }>
  style?: OAuthProviderButtonStyles
  /**
   * 通常，当你使用 OAuth 提供者登录且另一个账户已存在相同的电子邮件地址时，
   * 账户不会自动链接。
   *
   * 在任意提供者之间自动链接账户登录是不安全的，
   * 默认情况下是禁用的。
   * 更多信息请参阅我们的 [Security FAQ](https://authjs.dev/concepts#security)。
   *
   * 然而，如果你信任相关提供者已安全验证了与账户关联的电子邮件地址，
   * 可能希望允许自动账户链接。设置 `allowDangerousEmailAccountLinking: true`
   * 以启用自动账户链接。
   */
  allowDangerousEmailAccountLinking?: boolean
  redirectProxyUrl?: AuthConfig["redirectProxyUrl"]
  /** @see {customFetch} */
  [customFetch]?: typeof fetch
  /**
   * 用户提供的选项。
   * 我们将对这些值与默认配置进行深度合并。
   *
   * @internal
   */
  /** @see {conformInternal} */
  [conformInternal]?: true
  options?: OAuthUserConfig<Profile>
}

/**
 * {@link OAuth2Config} 的扩展。
 *
 * @see https://openid.net/specs/openid-connect-core-1_0.html
 */
export interface OIDCConfig<Profile>
  extends Omit<OAuth2Config<Profile>, "type" | "checks"> {
  type: "oidc"
  checks?: Array<NonNullable<OAuth2Config<Profile>["checks"]>[number] | "nonce">
  /**
   * 如果设置为 `false`，将获取 `userinfo_endpoint` 以获取用户数据。
   * @note 在授权流程中仍然需要返回一个 `id_token`。
   */
  idToken?: boolean
}

export type OAuthConfig<Profile> = OIDCConfig<Profile> | OAuth2Config<Profile>

export type OAuthEndpointType = "authorization" | "token" | "userinfo"

/**
 * 我们解析了 `authorization`、`token` 和 `userinfo`
 * 以始终包含一个有效的 `URL`，带有参数
 * @internal
 */
export type OAuthConfigInternal<Profile> = Omit<
  OAuthConfig<Profile>,
  OAuthEndpointType | "redirectProxyUrl"
> & {
  authorization?: { url: URL }
  token?: {
    url: URL
    request?: TokenEndpointHandler["request"]
    clientPrivateKey?: CryptoKey | PrivateKey
    /**
     * @internal
     * @deprecated
     */
    conform?: TokenEndpointHandler["conform"]
  }
  userinfo?: { url: URL; request?: UserinfoEndpointHandler["request"] }
  /**
   * 从 {@link OAuth2Config.redirectProxyUrl} 重构，
   * 将回调动作和提供者 ID 添加到 URL 上。
   *
   * 如果定义，在授权请求中优先于 {@link OAuthConfigInternal.callbackUrl}。
   *
   * 当 {@link InternalOptions.isOnRedirectProxy} 设置时，实际值保存在解码的 `state.origin` 参数中。
   *
   * @example `"https://auth.example.com/api/auth/callback/:provider"`
   *
   */
  redirectProxyUrl?: OAuth2Config<Profile>["redirectProxyUrl"]
} & Pick<
    Required<OAuthConfig<Profile>>,
    "clientId" | "checks" | "profile" | "account"
  >

export type OIDCConfigInternal<Profile> = OAuthConfigInternal<Profile> & {
  checks: OIDCConfig<Profile>["checks"]
  idToken: OIDCConfig<Profile>["idToken"]
}

export type OAuthUserConfig<Profile> = Omit<
  Partial<OAuthConfig<Profile>>,
  "options" | "type"
>

export type OIDCUserConfig<Profile> = Omit<
  Partial<OIDCConfig<Profile>>,
  "options" | "type"
>
