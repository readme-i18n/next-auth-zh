/**
 * <div class="provider" style={{backgroundColor: "#fd4b2d", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Authentik</b> 集成。</span>
 * <a href="https://goauthentik.io/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/authentik.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/authentik
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface AuthentikProfile extends Record<string, any> {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  auth_time: number
  acr: string
  c_hash: string
  nonce: string
  at_hash: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  preferred_username: string
  nickname: string
  groups: string[]
}

/**
 * 向您的页面添加 Authentik 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/authentik
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Authentik from "@auth/core/providers/authentik"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Authentik({
 *       clientId: AUTHENTIK_CLIENT_ID,
 *       clientSecret: AUTHENTIK_CLIENT_SECRET,
 *       issuer: AUTHENTIK_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * :::note
 * issuer 应包含 slug 且不带尾部斜杠 – 例如，https://my-authentik-domain.com/application/o/My_Slug
 * :::
 *
 * ### 资源
 *
 *  - [Authentik OAuth 文档](https://goauthentik.io/docs/providers/oauth2)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Authentik 提供者基于 [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) 规范。
 *
 * :::tip
 *
 * Authentik 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/authentik.ts)。
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
export default function Authentik<P extends AuthentikProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "authentik",
    name: "Authentik",
    type: "oidc",
    options,
  }
}
