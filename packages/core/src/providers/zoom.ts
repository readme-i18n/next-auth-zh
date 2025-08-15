/**
 * <div class="provider" style={{backgroundColor: "#000", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置 <b>Zoom</b> 集成。</span>
 * <a href="https://zoom.us/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/zoom.svg" height="48" />
 * </a>
 * </div>
 *
 * @module providers/zoom
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * 参见：https://developers.zoom.us/docs/integrations/oauth/#using-an-access-token
 */
export interface ZoomProfile extends Record<string, any> {
  id: string
  first_name: string
  last_name: string
  email: string
  type: number
  role_name: string
  pmi: number
  use_pmi: boolean
  vanity_url: string
  personal_meeting_url: string
  timezone: string
  verified: number
  dept: string
  created_at: string
  last_login_time: string
  last_client_version: string
  pic_url: string
  host_key: string
  jid: string
  group_ids: string[]
  im_group_ids: string[]
  account_id: string
  language: string
  phone_country: string
  phone_number: string
  status: string
}

/**
 * 向您的页面添加 Zoom 登录功能。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/zoom
 * ```
 *
 * #### 配置
 *```ts
 * import { Auth } from "@auth/core"
 * import Zoom from "@auth/core/providers/zoom"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Zoom({ clientId: ZOOM_CLIENT_ID, clientSecret: ZOOM_CLIENT_SECRET }),
 *   ],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Zoom OAuth 2.0 集成指南](https://developers.zoom.us/docs/integrations/oauth/)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Zoom 提供者基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Zoom 提供者附带了一个[默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/zoom.ts)。
 * 要根据您的使用情况覆盖默认值，请查看[自定义内置 OAuth 提供者](https://authjs.dev/guides/configuring-oauth-providers)。
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
export default function Zoom(
  config: OAuthUserConfig<ZoomProfile>
): OAuthConfig<ZoomProfile> {
  return {
    id: "zoom",
    name: "Zoom",
    type: "oauth",
    authorization: "https://zoom.us/oauth/authorize?scope",
    token: "https://zoom.us/oauth/token",
    userinfo: "https://api.zoom.us/v2/users/me",
    profile(profile) {
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        image: profile.pic_url,
      }
    },
    style: {
      bg: "#0b5cff",
      text: "#fff",
    },
    options: config,
  }
}
