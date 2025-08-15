/**
 * <div class="provider" style={{backgroundColor: "#f05537", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>内置的 <b>Eventbrite</b> 集成。</span>
 * <a href="https://www.eventbrite.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/eventbrite.svg" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/eventbrite
 */

import type { OAuthConfig, OAuthUserConfig } from "./index.js"

/**
 * @see https://www.eventbrite.com/platform/api#/reference/user/retrieve-your-user/retrieve-your-user
 */
export interface EventbriteProfile extends Record<string, any> {
  id: string
  name: string
  first_name: string
  last_name: string
  emails: { email: string; verified: boolean; primary: boolean }[]
  image_id: string
}

/**
 * 向您的页面添加 Eventbrite 登录功能，并向 [Eventbrite APIs](https://www.eventbrite.com/platform/api) 发起请求。
 *
 * ### 设置
 *
 * #### 回调 URL
 * ```
 * https://example.com/api/auth/callback/eventbrite
 * ```
 *
 * #### 配置
 * ```ts
 * import { Auth } from "@auth/core"
 * import Eventbrite from "@auth/core/providers/eventbrite"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Eventbrite({ clientId: EVENTBRITE_CLIENT_ID, clientSecret: EVENTBRITE_CLIENT_SECRET })],
 * })
 * ```
 *
 * ### 资源
 *
 * - [Eventbrite OAuth 文档](https://www.eventbrite.com/platform/api#/introduction/authentication)
 * - [Eventbrite 应用管理](https://www.eventbrite.com/account-settings/apps)
 * - [了解更多关于 OAuth 的信息](https://authjs.dev/concepts/oauth)
 * - [源代码](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/eventbrite.ts)
 *
 * ### 注意事项
 *
 * 默认情况下，Auth.js 假设 Eventbrite 提供程序基于 [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) 规范。
 *
 * :::tip
 *
 * Eventbrite 提供程序附带了一个 [默认配置](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/eventbrite.ts)。
 * 要覆盖默认配置以适应您的用例，请查看 [自定义内置 OAuth 提供程序](https://authjs.dev/guides/configuring-oauth-providers)。
 *
 * :::
 *
 * :::info **免责声明**
 *
 * 如果您认为在默认配置中发现了错误，可以 [提交问题](https://authjs.dev/new/provider-issue)。
 *
 * Auth.js 严格遵守规范，对于提供程序与规范的任何偏差，Auth.js 不承担责任。您可以提交问题，但如果问题是不符合规范，
 * 我们可能不会寻求解决方案。您可以在 [讨论区](https://authjs.dev/new/github-discussions) 寻求更多帮助。
 *
 * :::
 */
export default function Eventbrite<P extends EventbriteProfile>(
  config: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "eventbrite",
    name: "Eventbrite",
    type: "oauth",
    authorization: {
      url: "https://www.eventbrite.com/oauth/authorize",
      params: { scope: "user.profile" },
    },
    token: "https://www.eventbrite.com/oauth/token",
    userinfo: "https://www.eventbriteapi.com/v3/users/me/",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.emails.find((e) => e.primary)?.email,
        image: profile.image_id
          ? `https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F${profile.image_id}%2F1%2Foriginal.jpg`
          : null,
      }
    },
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    style: { bg: "#f05537", text: "#fff" },
    options: config,
  }
}
