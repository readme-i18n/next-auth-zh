/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Mastodon</b> 集成。</span>
 * <a href="https://mastodon.social">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/mastodon.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/mastodon
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface MastodonProfile extends Record<string, any> {
  id: string
  username: string
  acct: string
  display_name: string
  locked: boolean
  bot: boolean
  created_at: string
  note: string
  url: string
  avatar: string
  avatar_static: string
  header: string
  header_static: string
  followers_count: number
  following_count: number
  statuses_count: number
  last_status_at: string | null
}

/**
 * 向您的页面添加 Mastodon 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/mastodon
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Mastodon from "@auth/core/providers/mastodon"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Mastodon({
 *       clientId: MASTODON_CLIENT_ID,
 *       clientSecret: MASTODON_CLIENT_SECRET,
 *       issuer: MASTODON_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Mastodon OAuth 文档](https://docs.joinmastodon.org/client/token/)
 *  - [Mastodon OAuth 配置](https://mastodon.social/settings/applications)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Mastodon 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * 由于 Mastodon 的基础设施是一个联邦宇宙（Fediverse），您必须定义您想要连接的 `issuer`。
 *
 * :::tip
 *
 * Mastodon 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/mastodon.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，您可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供者与规范的任何偏差，Auth.js 无法承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */

export default function Mastodon<P extends MastodonProfile>(
  options: OAuthUserConfig<P> & {
    issuer: string
  }
): OAuthConfig<P> {
  return {
    id: "mastodon",
    name: "Mastodon",
    type: "oauth",
    authorization: `${options.issuer}/oauth/authorize?scope=read`,
    token: `${options.issuer}/oauth/token`,
    userinfo: `${options.issuer}/api/v1/accounts/verify_credentials`,
    profile(profile) {
      return {
        id: profile.id,
        name: profile.username,
        image: profile.avatar_static,
        email: null,
      }
    },
    options,
  }
}
