/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>FourSquare</b> 集成。</span>
 * <a href="https://foursquare.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/foursquare.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/foursquare
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 为您的页面添加 FourSquare 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/foursquare
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import FourSquare from "@auth/core/providers/foursquare"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     FourSquare({
 *       clientId: FOURSQUARE_CLIENT_ID,
 *       clientSecret: FOURSQUARE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [FourSquare OAuth 文档](https://docs.foursquare.com/developer/reference/authentication)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 FourSquare 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::warning
 * Foursquare 需要一个额外的 apiVersion 参数，格式为 YYYYMMDD，这实质上表示“我已准备好接受此日期之前的 API 更改”。
 * :::
 *
 * :::tip
 *
 * FourSquare 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/foursquare.ts)。
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
export default function Foursquare(
  options: OAuthUserConfig<Record<string, any>> & { apiVersion?: string }
): OAuthConfig<Record<string, any>> {
  const { apiVersion = "20230131" } = options
  return {
    id: "foursquare",
    name: "Foursquare",
    type: "oauth",
    authorization: "https://foursquare.com/oauth2/authenticate",
    token: "https://foursquare.com/oauth2/access_token",
    userinfo: {
      url: `https://api.foursquare.com/v2/users/self?v=${apiVersion}`,
      async request({ tokens, provider }) {
        if (!provider.userinfo) return

        const url = new URL(provider.userinfo.url)
        url.searchParams.append("oauth_token", tokens.access_token!)
        return fetch(url).then((res) => res.json())
      },
    },
    profile({ response: { user: profile } }) {
      return {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.contact.email,
        image: profile.photo
          ? `${profile.photo.prefix}original${profile.photo.suffix}`
          : null,
      }
    },
    style: {
      bg: "#000",
      text: "#fff",
    },
    options,
  }
}
