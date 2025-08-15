/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Spotify</b> 集成。</span>
 * <a href="https://www.spotify.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/spotify.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/spotify
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface SpotifyImage {
  url: string
}

export interface SpotifyProfile extends Record<string, any> {
  id: string
  display_name: string
  email: string
  images: SpotifyImage[]
}

/**
 * 为您的页面添加 Spotify 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/spotify
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Spotify from "@auth/core/providers/spotify"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Spotify({
 *       clientId: SPOTIFY_CLIENT_ID,
 *       clientSecret: SPOTIFY_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Spotify OAuth 文档](https://developer.spotify.com/documentation/general/guides/authorization-guide)
 * - [Spotify 应用控制台](https://developer.spotify.com/dashboard/applications)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Spotify 提供商基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Spotify 提供商附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/spotify.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供商](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以[提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供商对规范的任何偏离，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在[讨论区](https://authjs.dev/new/github-discussions)寻求更多帮助。
 *
 * :::
 */
export default function Spotify<P extends SpotifyProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "spotify",
    name: "Spotify",
    type: "oauth",
    authorization:
      "https://accounts.spotify.com/authorize?scope=user-read-email",
    token: "https://accounts.spotify.com/api/token",
    userinfo: "https://api.spotify.com/v1/me",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.display_name,
        email: profile.email,
        image: profile.images?.[0]?.url,
      }
    },
    style: { brandColor: "#1db954" },
    options,
  }
}
