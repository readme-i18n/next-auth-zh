import type { Profile } from "../types.js"
import CredentialsProvider from "./credentials.js"
import type { CredentialsConfig, CredentialsProviderId } from "./credentials.js"
import type EmailProvider from "./email.js"
import type { EmailConfig, EmailProviderId } from "./email.js"
import type {
  OAuth2Config,
  OAuthConfig,
  OAuthProviderId,
  OIDCConfig,
} from "./oauth.js"
import type { WebAuthnConfig, WebAuthnProviderType } from "./webauthn.js"

export * from "./credentials.js"
export * from "./email.js"
export * from "./oauth.js"

/**
 * 传递给 Auth.js 的提供者必须定义以下类型之一。
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 * @see [Email or Passwordless Authentication](https://authjs.dev/concepts/oauth)
 * @see [Credentials-based Authentication](https://authjs.dev/concepts/credentials)
 */
export type ProviderType =
  | "oidc"
  | "oauth"
  | "email"
  | "credentials"
  | WebAuthnProviderType

/** 在所有 {@link ProviderType} 之间共享 */
export interface CommonProviderOptions {
  /**
   * 在 {@link AuthConfig.providers} 中唯一标识提供者
   * 它也是 URL 的一部分
   */
  id: string
  /**
   * 默认登录页面上登录按钮使用的提供者名称。
   * 例如，如果是 "Google"，相应的按钮将显示：
   * "使用 Google 登录"
   */
  name: string
  /** 参见 {@link ProviderType} */
  type: ProviderType
}

interface InternalProviderOptions {
  /** 用于将用户提供的配置与默认配置深度合并
   */
  options?: Record<string, unknown>
}

/**
 * 必须是一个支持的身份验证提供者配置：
 * - {@link OAuthConfig}
 * - {@link EmailConfigInternal}
 * - {@link CredentialsConfigInternal}
 *
 * 更多信息，请参阅指南：
 *
 * @see [OAuth/OIDC 指南](https://authjs.dev/guides/providers/custom-provider)
 * @see [Email (Passwordless) 指南](https://authjs.dev/guides/providers/email)
 * @see [Credentials 指南](https://authjs.dev/guides/providers/credentials)
 */
export type Provider<P extends Profile = any> = (
  | ((
      | OIDCConfig<P>
      | OAuth2Config<P>
      | EmailConfig
      | CredentialsConfig
      | WebAuthnConfig
    ) &
      InternalProviderOptions)
  | ((
      ...args: any
    ) => (
      | OAuth2Config<P>
      | OIDCConfig<P>
      | EmailConfig
      | CredentialsConfig
      | WebAuthnConfig
    ) &
      InternalProviderOptions)
) &
  InternalProviderOptions

export type BuiltInProviders = Record<
  OAuthProviderId,
  (config: Partial<OAuthConfig<any>>) => OAuthConfig<any>
> &
  Record<CredentialsProviderId, typeof CredentialsProvider> &
  Record<EmailProviderId, typeof EmailProvider> &
  Record<
    WebAuthnProviderType,
    (config: Partial<WebAuthnConfig>) => WebAuthnConfig
  >

export type AppProviders = Array<
  Provider | ReturnType<BuiltInProviders[keyof BuiltInProviders]>
>

export interface AppProvider extends CommonProviderOptions {
  signinUrl: string
  callbackUrl: string
}

export type ProviderId =
  | CredentialsProviderId
  | EmailProviderId
  | OAuthProviderId
  | WebAuthnProviderType
  | (string & {}) // HACK: To allow user-defined providers in `signIn`
