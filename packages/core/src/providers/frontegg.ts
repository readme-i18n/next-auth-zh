/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Frontegg</b> 集成登录。
 * </span>
 * <a href="https://frontegg.com" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/frontegg.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/frontegg
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Frontegg 返回的用户资料。[参考](https://docs.frontegg.com/docs/admin-portal-profile)。 */
export interface FronteggProfile {
  /** 用户的唯一 Frontegg ID */
  sub: string
  /** 用户的名称 */
  name: string
  /** 用户的电子邮件 */
  email: string
  /** 布尔值，表示用户的电子邮件是否已验证 */
  email_verified: boolean
  /** 用户的图片 */
  profilePictureUrl: string
  /** 用户的角色 */
  roles: string[]
  /** 用户的自定义属性 */
  [claim: string]: unknown
}

/**
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/frontegg
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Frontegg from "@auth/core/providers/frontegg"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Frontegg({
 *       clientId: AUTH_FRONTEGG_ID,
 *       clientSecret: AUTH_FRONTEGG_SECRET,
 *       issuer: AUTH_FRONTEGG_ISSUER
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 配置 Frontegg
 *
 * 按照以下步骤操作：
 *
 * 登录 [Frontegg 门户](https://portal.frontegg.com)
 *
 * 认证 > 登录方法 > 托管登录 > 在此处添加您的回调 URL
 *
 * 然后，在项目根目录创建一个 `.env.local` 文件，并添加以下条目：
 *
 * 从 Frontegg 门户获取以下信息：
 * ```
 * AUTH_FRONTEGG_ID="<Client ID>" # Environments > Your environment > Env settings
 * AUTH_FRONTEGG_SECRET="<API KEY>" # Environments > Your environment > Env settings
 * AUTH_FRONTEGG_ISSUER="<https://[YOUR_SUBDOMAIN].frontegg.com>" # Environments > Your environment > Env settings > Domains > Domain name
 * ```
 *
 * ### 资源
 *
 * - [Frontegg 文档](https://docs.frontegg.com/docs/how-to-use-our-docs)
 *
 * ### 注意事项
 *
 * Frontegg 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/frontegg.ts)。要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::info
 * 默认情况下，Auth.js 假设 Frontegg 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范
 * :::
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 */
export default function Frontegg(
  options: OIDCUserConfig<FronteggProfile>
): OIDCConfig<FronteggProfile> {
  return {
    id: "frontegg",
    name: "Frontegg",
    type: "oidc",
    authorization: `${options.issuer}/oauth/authorize`,
    token: `${options.issuer}/oauth/token`,
    userinfo: `${options.issuer}/identity/resources/users/v2/me`,
    wellKnown: `${options.issuer}/oauth/.well-known/openid-configuration`,
    issuer: options.issuer,
    options,
  }
}
