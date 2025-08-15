/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Strava</b> 集成。</span>
 * <a href="https://www.strava.com/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/strava.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/strava
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface StravaProfile extends Record<string, any> {
  id: string // this is really a number
  firstname: string
  lastname: string
  profile: string
}

/**
 * 为您的页面添加 Strava 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/strava
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Strava from "@auth/core/providers/strava"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Strava({ clientId: STRAVA_CLIENT_ID, clientSecret: STRAVA_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Strava API 文档](http://developers.strava.com/docs/reference/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Strava 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Strava 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/strava.ts)。
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
export default function Strava<P extends StravaProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "strava",
    name: "Strava",
    type: "oauth",
    authorization: {
      url: "https://www.strava.com/api/v3/oauth/authorize",
      params: {
        scope: "read",
        approval_prompt: "auto",
        response_type: "code",
      },
    },
    token: {
      url: "https://www.strava.com/api/v3/oauth/token",
    },
    userinfo: "https://www.strava.com/api/v3/athlete",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    profile(profile) {
      return {
        id: profile.id,
        name: `${profile.firstname} ${profile.lastname}`,
        email: null,
        image: profile.profile,
      }
    },
    options,
  }
}
