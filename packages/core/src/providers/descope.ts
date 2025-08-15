/**
 * <div class="provider" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  内置的 <b>Descope</b> 集成登录。
 * </span>
 * <a href="https://descope.com" style={{backgroundColor: "#000000", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/descope.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/descope
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** 使用 profile 回调时从 Descope 返回的用户资料。
 * [参见加载用户](https://docs.descope.com/api/openapi/usermanagement/operation/LoadUser/)
 */
export interface DescopeProfile {
  /** 用户的唯一 Descope ID */
  sub: string
  /** 用户的名称 */
  name: string
  /** 用户的电子邮件 */
  email: string
  /** 布尔值，表示用户的电子邮件是否已验证 */
  email_verified: boolean
  /** 用户的电话号码 */
  phone_number: string
  /** 布尔值，表示用户的电话号码是否已验证 */
  phone_number_verified: boolean
  /** 用户的图片 */
  picture: string
  /** 用户的自定义属性 */
  [claim: string]: unknown
}

/**
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/descope
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Descope from "@auth/core/providers/descope"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, { providers: [Descope({ clientId: AUTH_DESCOPE_ID, clientSecret: AUTH_DESCOPE_SECRET, issuer: AUTH_DESCOPE_ISSUER })] })
 * ```
 *
 * ### 配置 Descope
 *
 * 按照以下步骤操作：
 *
 * 1. 登录 [Descope 控制台](https://app.descope.com)
 * 2. 遵循 [OIDC 说明](https://docs.descope.com/customize/auth/oidc)
 *
 * 然后，在项目根目录下创建一个 `.env.local` 文件，并添加以下条目：
 *
 * 从 Descope 的控制台获取以下信息：
 * ```
 * AUTH_DESCOPE_ID="<Descope Issuer's last url segment>" # Descope 的 Issuer 可以在 "Authentication Methods > SSO > Identity Provider" 中找到（也可以从 "Project > Project ID" 获取）
 * AUTH_DESCOPE_SECRET="<Descope Access Key>" # 管理 > 访问密钥
 * AUTH_DESCOPE_ISSUER="<Descope Issuer URL>" # 应用程序 -> OIDC 应用程序 -> Issuer
 * ```
 *
 * ### 资源
 *
 * - [Descope OIDC](https://docs.descope.com/customize/auth/oidc)
 * - [Descope 流程](https://docs.descope.com/customize/flows)
 *
 * ### 注意事项
 *
 * Descope 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/descope.ts)。要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::info
 * 默认情况下，Auth.js 假设 Descope 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范
 * :::
 *
 * ## 帮助
 *
 * 如果您认为在默认配置中发现了错误，可以[提出问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵循规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提出问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在[讨论](https://authjs.dev/new/github-discussions)中寻求更多帮助。
 */
export default function Descope(
  config: OIDCUserConfig<DescopeProfile>
): OIDCConfig<DescopeProfile> {
  config.issuer ??= `https://api.descope.com/${config.clientId}`
  return {
    id: "descope",
    name: "Descope",
    type: "oidc",
    style: { bg: "#1C1C23", text: "#ffffff" },
    checks: ["pkce", "state"],
    options: config,
  }
}
