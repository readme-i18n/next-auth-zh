/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Concept2</b> 集成。</span>
 * <a href="https://concept2.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/concept2.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/concept2
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

export interface Concept2Profile extends Record<string, any> {
  id: number
  username: string
  first_name: string
  last_name: string
  gender: string
  dob: string
  email: string
  country: string
  profile_image: string
  age_restricted: boolean
  email_permission: boolean | null
  max_heart_rate: number | null
  weight: number | null
  logbook_privacy: string | null
}

/**
 * 向您的页面添加 Concept2 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/concept2
 * ```
 *
 * #### 配置
 *```js
 * import { Auth } from "@auth/core"
 * import Concept2 from "@auth/core/providers/concept2"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Concept2({
 *       clientId: CONCEPT2_CLIENT_ID,
 *       clientSecret: CONCEPT2_CLIENT_SECRET
 *     }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 *  - [Concept2 OAuth 文档](https://log.concept2.com/developers/documentation/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Concept2 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Concept2 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/concept2.ts)。
 * 要覆盖默认配置以适应您的用例，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/providers/custom-provider#override-default-options)。
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
export default function Concept2(
  options: OAuthUserConfig<Concept2Profile>
): OAuthConfig<Concept2Profile> {
  return {
    id: "concept2",
    name: "Concept2",
    type: "oauth",
    authorization: {
      url: "https://log.concept2.com/oauth/authorize",
      params: {
        scope: "user:read,results:write",
      },
    },
    token: "https://log.concept2.com/oauth/access_token",
    userinfo: "https://log.concept2.com/api/users/me",
    profile(profile) {
      return {
        id: profile.data.id,
        name: profile.data.username,
        email: profile.data.email,
        image: profile.data.profile_image,
      }
    },
    options,
  }
}
