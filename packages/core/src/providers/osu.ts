/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>osu!</b> 集成。</span>
 * <a href="https://osu.ppy.sh/home">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/osu.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/osu
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface OsuUserCompact {
  avatar_url: string
  country_code: string
  default_group: string
  id: number
  is_active: boolean
  is_bot: boolean
  is_deleted: boolean
  is_online: boolean
  is_supporter: boolean
  last_visit: Date | null
  pm_friends_only: boolean
  profile_colour: string | null
  username: string
}

export interface OsuProfile extends OsuUserCompact, Record<string, any> {
  discord: string | null
  has_supported: boolean
  interests: string | null
  join_date: Date
  kudosu: {
    available: number
    total: number
  }
  location: string | null
  max_blocks: number
  max_friends: number
  occupation: string | null
  playmode: string
  playstyle: string[]
  post_count: number
  profile_order: string[]
  title: string | null
  title_url: string | null
  twitter: string | null
  website: string | null
  country: {
    code: string
    name: string
  }
  cover: {
    custom_url: string | null
    url: string
    id: number | null
  }
  is_restricted: boolean
}

/**
 * 向您的页面添加 osu! 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/osu
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Osu from "@auth/core/providers/osu"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Osu({ clientId: OSU_CLIENT_ID, clientSecret: OSU_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [osu! OAuth 文档](https://osu.ppy.sh/docs/index.html#authentication)
 *  - [osu! 应用控制台](https://osu.ppy.sh/home/account/edit#new-oauth-application)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Osu 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::note
 *
 * osu! 不提供用户邮箱。
 *
 * :::
 *
 * :::tip
 *
 * osu! 提供者附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/osu.ts)。
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
export default function Osu<P extends OsuProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "osu",
    name: "osu!",
    type: "oauth",
    token: "https://osu.ppy.sh/oauth/token",
    authorization: "https://osu.ppy.sh/oauth/authorize?scope=identify",
    userinfo: "https://osu.ppy.sh/api/v2/me",
    profile(profile) {
      return {
        id: profile.id.toString(),
        email: null,
        name: profile.username,
        image: profile.avatar_url,
      }
    },
    options,
  }
}
