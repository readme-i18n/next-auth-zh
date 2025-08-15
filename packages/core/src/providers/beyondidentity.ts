/**
 * <div class="provider" style={{backgroundColor: "#5077c5", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Beyond Identity</b> 集成。</span>
 * <a href="https://www.beyondidentity.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/beyondidentity.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/beyondidentity
 */

import type { OIDCConfig, OIDCUserConfig } from "./index.js"

/** @see [Beyond Identity 开发者文档](https://developer.beyondidentity.com/) */
export interface BeyondIdentityProfile {
  /** 用户的唯一标识符。 */
  sub: string
  /** 用户的全名。 */
  name: string
  /** 用户的首选用户名。 */
  preferred_username: string
  /** 用户的电子邮件地址。 */
  email: string
}

/**
 * 在您的页面中添加 Beyond Identity 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/beyondidentity
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import BeyondIdentity from "@auth/core/providers/beyondidentity"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     BeyondIdentity({
 *       clientId: BEYOND_IDENTITY_CLIENT_ID,
 *       clientSecret: BEYOND_IDENTITY_CLIENT_SECRET,
 *       issuer: BEYOND_IDENTITY_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Beyond Identity 开发者文档](https://developer.beyondidentity.com/)
 *
 * ### 备注
 *
 * 默认情况下，Auth.js 假设 BeyondIdentity 提供者基于 [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * BeyondIdentity 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/beyondidentity.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */

export default function BeyondIdentity(
  config: OIDCUserConfig<BeyondIdentityProfile>
): OIDCConfig<BeyondIdentityProfile> {
  return {
    id: "beyondidentity",
    name: "Beyond Identity",
    type: "oidc",
    profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: null,
        preferred_username: profile.preferred_username,
      }
    },
    style: {
      bg: "#5077c5",
      text: "#fff",
    },
    options: config,
  }
}
