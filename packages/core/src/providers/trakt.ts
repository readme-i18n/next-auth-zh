/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Trakt</b> 集成。</span>
 * <a href="https://www.trakt.tv/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/trakt.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/trakt
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface TraktUser extends Record<string, any> {
  username: string
  private: boolean
  name: string
  vip: boolean
  vip_ep: boolean
  ids: { slug: string }
  joined_at: string
  location: string | null
  about: string | null
  gender: string | null
  age: number | null
  images: { avatar: { full: string } }
}

/**
 * 向您的页面添加 Trakt 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/trakt
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Trakt from "@auth/core/providers/trakt"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Trakt({ clientId: TRAKT_CLIENT_ID, clientSecret: TRAKT_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Trakt OAuth 文档](https://trakt.docs.apiary.io/#reference/authentication-oauth)
 *
 * 如果您在生产环境中通过调用 `api.trakt.tv` 使用该 API，请遵循示例。如果您希望在 Trakt 的沙盒环境中通过调用 `api-staging.trakt.tv` 进行开发，请更改 URL。
 *
 * 首先在 Trakt 上为生产或开发创建一个 OAuth 应用。然后在 .env 中设置 Client ID 和 Client Secret 为 TRAKT_ID 和 TRAKT_SECRET。
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Trakt 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::danger
 *
 * - Trakt 不允许热链接图片。即使是认证用户的个人资料图片。
 * - Trakt 不提供认证用户的电子邮件。
 *
 * :::
 *
 * :::tip
 *
 * Trakt 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/trakt.ts)。
 * 要为您的情况覆盖默认值，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序的任何偏离规范的行为，Auth.js 无法承担责任。您可以提交问题，但如果问题是不符合规范，我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Trakt<P extends TraktUser>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "trakt",
    name: "Trakt",
    type: "oauth",
    authorization: "https://trakt.tv/oauth/authorize?scope=",
    token: "https://api.trakt.tv/oauth/token",
    userinfo: {
      url: "https://api.trakt.tv/users/me?extended=full",
      async request({ tokens, provider }) {
        return await fetch(provider.userinfo?.url as URL, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "trakt-api-version": "2",
            "trakt-api-key": provider.clientId,
          },
        }).then(async (res) => await res.json())
      },
    },
    profile(profile) {
      return {
        id: profile.ids.slug,
        name: profile.name,
        email: null, // trakt does not provide user emails
        image: profile.images.avatar.full, // trakt does not allow hotlinking
      }
    },
    style: { bg: "#ED2224", text: "#fff" },
    options,
  }
}
