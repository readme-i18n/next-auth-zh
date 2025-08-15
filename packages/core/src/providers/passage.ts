/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Passage by 1Password</b> 集成。</span>
 * <a href="https://passage.1password.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/passage.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/passage
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/** @see [支持的 Scopes](https://docs.passage.id/hosted-login/oidc-client-configuration#supported-scopes) */
export interface PassageProfile {
  iss: string
  /** 用户在 Passage 中的唯一标识符 */
  sub: string
  aud: string[]
  exp: number
  iat: number
  auth_time: number
  azp: string
  client_id: string
  at_hash: string
  c_hash: string
  /** 用户的电子邮件地址 */
  email: string
  /** 用户是否已验证其电子邮件地址 */
  email_verified: boolean
  /** 用户的电话号码 */
  phone: string
  /** 用户是否已验证其电话号码 */
  phone_number_verified: boolean
}

/**
 * 向您的页面添加 Passage 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/passage
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Passage from "@auth/core/providers/passage"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Passage({
 *       clientId: PASSAGE_ID,
 *       clientSecret: PASSAGE_SECRET,
 *       issuer: PASSAGE_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Passage OIDC 文档](https://docs.passage.id/hosted-login/oidc-client-configuration)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Passage 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Passage 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/passage.ts)。
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
export default function Passage(
  config: OAuthUserConfig<PassageProfile>
): OAuthConfig<PassageProfile> {
  return {
    id: "passage",
    name: "Passage",
    type: "oidc",
    client: { token_endpoint_auth_method: "client_secret_basic" },
    style: {
      brandColor: "#3d53f6",
    },
    options: config,
  }
}
