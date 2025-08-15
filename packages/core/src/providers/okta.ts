/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Okta</b> 集成。</span>
 * <a href="https://okta.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/okta.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/okta
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface OktaProfile extends Record<string, any> {
  iss: string
  ver: string
  sub: string
  aud: string
  iat: string
  exp: string
  jti: string
  auth_time: string
  amr: string
  idp: string
  nonce: string
  name: string
  nickname: string
  preferred_username: string
  given_name: string
  middle_name: string
  family_name: string
  email: string
  email_verified: string
  profile: string
  zoneinfo: string
  locale: string
  address: string
  phone_number: string
  picture: string
  website: string
  gender: string
  birthdate: string
  updated_at: string
  at_hash: string
  c_hash: string
}

/**
 * 向您的页面添加 Okta 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/okta
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Okta from "@auth/core/providers/okta"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Okta({
 *       clientId: OKTA_CLIENT_ID,
 *       clientSecret: OKTA_CLIENT_SECRET,
 *       issuer: OKTA_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Okta OAuth 文档](https://developer.okta.com/docs/reference/api/oidc)
 *
 * ### 说明
 *
 * 默认情况下，Auth.js 假设 Okta 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Okta 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/okta.ts)。
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
export default function Okta<P extends OktaProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "okta",
    name: "Okta",
    type: "oidc",
    style: { bg: "#000", text: "#fff" },
    checks: ["pkce", "state"],
    options,
  }
}
