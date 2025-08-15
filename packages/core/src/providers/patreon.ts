/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Patreon</b> 集成。</span>
 * <a href="https://www.patreon.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/patreon.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/patreon
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface PatreonProfile extends Record<string, any> {
  sub: string
  nickname: string
  email: string
  picture: string
}

/**
 * 向您的页面添加 Patreon 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/patreon
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Patreon from "@auth/core/providers/patreon"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Patreon({
 *       clientId: PATREON_CLIENT_ID,
 *       clientSecret: PATREON_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Patreon OAuth 文档](https://docs.patreon.com/#apiv2-oauth)
 *  - [Patreon 平台](https://www.patreon.com/portal/registration/register-clients)
 *  - [ApiV2 作用域](https://docs.patreon.com/#scopes)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Patreon 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Patreon 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/patreon.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Patreon<P extends PatreonProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "patreon",
    name: "Patreon",
    type: "oauth",
    authorization: {
      url: "https://www.patreon.com/oauth2/authorize",
      params: { scope: "identity identity[email]" },
    },
    token: "https://www.patreon.com/api/oauth2/token",
    userinfo: "https://www.patreon.com/api/oauth2/api/current_user",
    profile(profile) {
      return {
        id: profile.data.id,
        name: profile.data.attributes.full_name,
        email: profile.data.attributes.email,
        image: profile.data.attributes.image_url,
      }
    },
    style: { bg: "#e85b46", text: "#fff" },
    options,
  }
}
