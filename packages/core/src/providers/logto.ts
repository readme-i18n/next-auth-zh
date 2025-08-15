/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Logto</b> 集成登录。
 * </span>
 * <a href="https://logto.io" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/logto.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/logto
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Logto 返回的用户资料。[参考](https://docs.logto.io/quick-starts/next-auth#scopes-and-claims)。 */
export interface LogtoProfile {
  /** 用户的唯一 ID */
  sub: string
  /** 用户的姓名 */
  name: string
  /** 用户的用户名 */
  username: string
  /** 用户的头像 */
  picture: string
  /** 用户的电子邮件 */
  email: string
  /** 布尔值，表示用户的电子邮件是否已验证 */
  email_verified: boolean
  /** 用户的电话号码 */
  phone_number: string
  /** 布尔值，表示用户的电话号码是否已验证 */
  phone_number_verified: boolean
  /** 用户的地址 */
  address: string
  /** 自定义字段 */
  custom_data: object
  /** 用户的关联身份 */
  identities: object
  /** 用户的关联 SSO 身份 */
  sso_identities: object[]
  /** 用户所属的组织 ID */
  organizations: string[]
  /** 用户所属的组织数据 */
  organization_data: object[]
  /** 用户所属的组织角色，格式为 organization_id:/role_name */
  organization_roles: string[]
  /** 用户的自定义属性 */
  [claim: string]: unknown
}

/**
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/logto
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Logto from "@auth/core/providers/logto"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Logto({
 *       clientId: LOGTO_ID,
 *       clientSecret: LOGTO_SECRET,
 *       issuer: LOGTO_ISSUER
 *     }),
 *   ],
 * })
 * ```
 *
 *
 * ### 资源
 *
 * - [Logto Auth.js 快速入门](https://docs.logto.io/quick-starts/next-auth)
 * - [在您的应用中集成 Logto](https://docs.logto.io/integrate-logto/integrate-logto-into-your-application)
 *
 * ### 注意事项
 *
 * Logto 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/logto.ts)。要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::info
 * 默认情况下，Auth.js 假设 Logto 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范
 * :::
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 */
export default function Logto(
  options: OIDCUserConfig<LogtoProfile>
): OIDCConfig<LogtoProfile> {
  return {
    id: "logto",
    name: "Logto",
    type: "oidc",
    authorization: {
      params: {
        scope: "offline_access openid email profile",
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? profile.username,
        email: profile.email,
        image: profile.picture,
      }
    },
    options,
  }
}
